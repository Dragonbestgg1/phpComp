import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post('/api/run', (req, res) => {  // Ensure the endpoint is /api/run
  const code = req.body.code;
  const tempFilePath = path.join(__dirname, 'temp.php');

  fs.writeFile(tempFilePath, code, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Failed to write to temporary file.');
    }

    exec(`php ${tempFilePath}`, (error, stdout, stderr) => {
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

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});

export default app;
