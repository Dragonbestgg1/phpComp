// pages/api/modify-title.js

import clientPromise from '../../utils/mongodb';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const { key, newTitle } = req.body;
    const email = session.user.email;
    const client = await clientPromise;
    const db = client.db();
    const projectsCollection = db.collection('projects');

    try {
      const userProjects = await projectsCollection.findOne({ email });
      const projects = userProjects ? userProjects.projects : {};

      if (!projects[key]) {
        return res.status(404).json({ error: 'Project not found.' });
      }

      projects[key].title = newTitle;

      await projectsCollection.updateOne(
        { email },
        { $set: { projects } }
      );

      res.status(200).json({ message: 'Title updated successfully!' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update title.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
