const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { createServer } = require("http");
const next = require("next");
const url = require("url");

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3001;

const appNext = next({ dev });
const handle = appNext.getRequestHandler();

appNext.prepare().then(() => {
  const app = express();

  app.use(bodyParser.json());
  app.use(cors());

  const handleTempFile = (code, res) => {
    const tempFilePath = path.join(__dirname, "temp.php");
    fs.writeFile(tempFilePath, code, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to write to temporary file." });
      }

      exec(`php ${tempFilePath} 2>&1`, (error, stdout, stderr) => {
        fs.unlink(tempFilePath, (unlinkErr) => {
          if (unlinkErr) console.error(unlinkErr);
        });

        const output = stdout || stderr.replace(/in .*? on line/g, "on line");
        if (error) {
          console.error(error);
          return res.status(500).json({ error: output });
        }

        res.json({ output });
      });
    });
  };

  app.post("/api/run", (req, res) => handleTempFile(req.body.code, res));

  const handleJSONFile = (jsonFilePath, callback) => {
    fs.readFile(jsonFilePath, "utf8", (readErr, data) => {
      if (readErr) {
        if (readErr.code === "ENOENT") {
          return callback(404, { error: "User JSON file not found." });
        } else {
          console.error(readErr);
          return callback(500, { error: "Failed to read user JSON file." });
        }
      }

      const jsonData = data ? JSON.parse(data) : {};
      callback(null, jsonData);
    });
  };

  app.get("/api/projects", (req, res) => {
    const { email } = req.query;
    const jsonFilePath = path.join(__dirname, "pages", "api", "json", `${email}.json`);

    handleJSONFile(jsonFilePath, (err, data) => {
      if (err) return res.status(err).json(data);
      res.json(data);
    });
  });

  const saveJSONData = (jsonFilePath, userData, res, successMessage) => {
    fs.writeFile(jsonFilePath, JSON.stringify(userData, null, 2), (writeErr) => {
      if (writeErr) {
        console.error(writeErr);
        return res.status(500).json({ error: "Failed to write user JSON file." });
      }
      res.json({ message: successMessage });
    });
  };

  app.post("/api/save", (req, res) => {
    const { email, code, key } = req.body;
    const jsonFilePath = path.join(__dirname, "pages", "api", "json", `${email}.json`);

    handleJSONFile(jsonFilePath, (err, userData) => {
      if (err && err !== 404) return res.status(err).json(userData);

      userData = userData || {};
      const newEntry = { title: userData[key]?.title || "php code", code };
      userData[key || String(Object.keys(userData).length + 1)] = newEntry;

      saveJSONData(jsonFilePath, userData, res, "Code saved successfully!");
    });
  });

  app.post("/api/create", (req, res) => {
    const { email, code, key } = req.body;
    const jsonFilePath = path.join(__dirname, "pages", "api", "json", `${email}.json`);

    handleJSONFile(jsonFilePath, (err, userData) => {
      if (err && err !== 404) return res.status(err).json(userData);

      userData = userData || {};
      userData[key] = { title: "New Project", code: code || "<?php\n// Write your PHP code here...\n?>" };

      saveJSONData(jsonFilePath, userData, res, "New project created successfully!");
    });
  });

  app.post("/api/modify-title", (req, res) => {
    const { email, key, newTitle } = req.body;
    const jsonFilePath = path.join(__dirname, "pages", "api", "json", `${email}.json`);

    handleJSONFile(jsonFilePath, (err, userData) => {
      if (err) return res.status(err).json(userData);

      if (!userData[key]) return res.status(404).json({ error: "Project not found." });
      userData[key].title = newTitle;

      saveJSONData(jsonFilePath, userData, res, "Title updated successfully!");
    });
  });

  const server = createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;

    console.log("Incoming request for:", pathname); // Log incoming requests

    if (pathname.startsWith("/api/")) {
      app(req, res);
    } else {
      handle(req, res, parsedUrl);
    }
  });

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
