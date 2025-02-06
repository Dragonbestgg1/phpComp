import { getToken } from 'next-auth/jwt';
import clientPromise from '../../utils/mongodb';

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const email = token.email;

  if (req.method === 'POST') {
    const { key, newTitle } = req.body;
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
    } catch {
      res.status(500).json({ error: 'Failed to update title.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
