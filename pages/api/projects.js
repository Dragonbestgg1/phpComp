// pages/api/projects.js

import clientPromise from '../../utils/mongodb';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const email = session.user.email;
  const client = await clientPromise;
  const db = client.db();
  const projectsCollection = db.collection('projects');

  if (req.method === 'GET') {
    try {
      const userProjects = await projectsCollection.findOne({ email });
      const projects = userProjects ? userProjects.projects : {};
      res.status(200).json(projects);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch projects.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
