const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post('/run', (req, res) => {
  const code = req.body.code;
  const tempFilePath = path.join(__dirname, 'temp.php');

  fs.writeFile(tempFilePath, code, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Failed to write to temporary file.');
    }

    exec(`php ${tempFilePath}`, (error, stdout, stderr) => {
      // Clean up the temporary file
      fs.unlink(tempFilePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error(unlinkErr);
        }
      });

      if (error) {
        console.error(error);
        return res.status(500).send(error instanceof Error ? error.message : String(error));
      }
      if (stderr) {
        console.error(stderr);
        return res.status(500).send(stderr);
      }
      res.send(stdout);
    });
  });
});

module.exports = app;
