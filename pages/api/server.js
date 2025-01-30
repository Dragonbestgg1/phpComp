import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post('/api/run', (req, res) => {
  const code = req.body.code;
  const tempFilePath = path.join(__dirname, 'temp.php');

  fs.writeFile(tempFilePath, code, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to write to temporary file.' });
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
      output = output.replace(/in .*? on line/g, 'on line');

      if (error) {
        console.error(error);
        return res.status(500).json({ error: output });
      }

      res.json({ output });
    });
  });
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
