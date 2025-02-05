// pages/api/run.js

import { getSession } from 'next-auth/react';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (req.method === 'POST') {
    const { code } = req.body;

    try {
      // Use an external API to execute PHP code securely
      const response = await fetch('https://api.jdoodle.com/v1/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: code,
          language: 'php',
          versionIndex: '0',
          clientId: process.env.JDOODLE_CLIENT_ID,
          clientSecret: process.env.JDOODLE_CLIENT_SECRET,
        }),
      });

      const data = await response.json();

      if (data.error) {
        res.status(500).json({ error: data.error });
      } else {
        res.status(200).json({ output: data.output });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to execute code.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
