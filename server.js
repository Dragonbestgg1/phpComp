const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

app.post('/run', (req, res) => {
    const code = req.body.code;
    exec(`php -r "${code}"`, (error, stdout, stderr) => {
      if (error) {
        // Type narrow error to an instance of Error
        if (error instanceof Error) {
          return res.status(500).send(error.message);
        }
        return res.status(500).send('An unknown error occurred.');
      }
      if (stderr) {
        return res.status(500).send(stderr);
      }
      res.send(stdout);
    });
  });
  

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
