const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post("/api/run", (req, res) => {
  const { code } = req.body; // No need to handle email or key
  const tempFilePath = path.join(__dirname, "temp.php");

  fs.writeFile(tempFilePath, code, (err) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: "Failed to write to temporary file." });
    }

    exec(`php ${tempFilePath} 2>&1`, (error, stdout, stderr) => {
      // Clean up the temporary file
      fs.unlink(tempFilePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error(unlinkErr);
        }
      });

      let output = stdout || stderr;

      // Filter out the file path from the error messages
      output = output.replace(/in .*? on line/g, "on line");

      if (error) {
        console.error(error);
        return res.status(500).json({ error: output });
      }

      res.json({ output });
    });
  });
});

app.get("/api/projects", (req, res) => {
  const { email } = req.query;
  const jsonFilePath = path.join(__dirname, "json", `${email}.json`);

  fs.readFile(jsonFilePath, "utf8", (readErr, data) => {
    if (readErr) {
      if (readErr.code === "ENOENT") {
        // File not found
        return res
          .status(404)
          .json({ error: `User JSON file for ${email} not found.` });
      } else {
        console.error(readErr);
        return res
          .status(500)
          .json({ error: "Failed to read user JSON file." });
      }
    }

    const projects = data ? JSON.parse(data) : {};
    res.json(projects);
  });
});

app.post("/api/save", (req, res) => {
  const { email, code, key } = req.body; // Include key
  const jsonFilePath = path.join(__dirname, "json", `${email}.json`);

  fs.readFile(jsonFilePath, "utf8", (readErr, data) => {
    if (readErr && readErr.code !== "ENOENT") {
      console.error(readErr);
      return res.status(500).json({ error: "Failed to read user JSON file." });
    }

    let userData = data ? JSON.parse(data) : {};
    const existingProject = userData[key];

    // Only set the title if it isn't already set
    const newEntry = {
      title: existingProject ? existingProject.title : "php code",
      code: code,
    };

    // Use the provided key or find the next available key
    const entryKey = key || String(Object.keys(userData).length + 1);
    userData[entryKey] = newEntry;

    fs.writeFile(
      jsonFilePath,
      JSON.stringify(userData, null, 2),
      (writeErr) => {
        if (writeErr) {
          console.error(writeErr);
          return res
            .status(500)
            .json({ error: "Failed to write user JSON file." });
        }

        res.json({ message: "Code saved successfully!" });
      }
    );
  });
});

app.post('/api/create', (req, res) => {
  const { email, code, key } = req.body;
  const jsonFilePath = path.join(__dirname, 'json', `${email}.json`);

  fs.readFile(jsonFilePath, 'utf8', (readErr, data) => {
    if (readErr && readErr.code !== 'ENOENT') {
      console.error(readErr);
      return res.status(500).json({ error: 'Failed to read user JSON file.' });
    }

    let userData = data ? JSON.parse(data) : {};
    const newEntry = {
      title: 'New Project', 
      code: code || '<?php\n// Write your PHP code here...\n?>'
    };

    const entryKey = key; // Use the provided key
    userData[entryKey] = newEntry;

    fs.writeFile(jsonFilePath, JSON.stringify(userData, null, 2), (writeErr) => {
      if (writeErr) {
        console.error(writeErr);
        return res.status(500).json({ error: 'Failed to write user JSON file.' });
      }

      res.json({ message: 'New project created successfully!', key: entryKey });
    });
  });
});

// New endpoint to modify the title of a project
app.post('/api/modify-title', (req, res) => {
  const { email, key, newTitle } = req.body;
  const jsonFilePath = path.join(__dirname, 'json', `${email}.json`);

  fs.readFile(jsonFilePath, 'utf8', (readErr, data) => {
    if (readErr) {
      console.error(readErr);
      return res.status(500).json({ error: 'Failed to read user JSON file.' });
    }

    let userData = data ? JSON.parse(data) : {};

    if (!userData[key]) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    userData[key].title = newTitle;

    fs.writeFile(jsonFilePath, JSON.stringify(userData, null, 2), (writeErr) => {
      if (writeErr) {
        console.error(writeErr);
        return res.status(500).json({ error: 'Failed to write user JSON file.' });
      }

      res.json({ message: 'Title updated successfully!' });
    });
  });
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
