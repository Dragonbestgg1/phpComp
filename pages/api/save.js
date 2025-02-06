// pages/api/save.js
import { getToken } from 'next-auth/jwt';
import clientPromise from '../../utils/mongodb';

export default async function handler(req, res) {
  // Get the token from the request
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const email = token.email;

  if (req.method === 'POST') {
    const { code, key } = req.body;
    const client = await clientPromise;
    const db = client.db();
    const projectsCollection = db.collection('projects');

    try {
      // Fetch the user's projects from the database
      const userProjects = await projectsCollection.findOne({ email });
      const projects = userProjects ? userProjects.projects : {};

      // Check if the project with the provided key exists
      if (!projects[key]) {
        return res.status(404).json({ error: 'Project not found.' });
      }

      // Update the project code
      projects[key].code = code;

      // Save the updated project back to the database
      await projectsCollection.updateOne(
        { email },
        { $set: { projects } }
      );

      res.status(200).json({ message: 'Code saved successfully!' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save project.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
