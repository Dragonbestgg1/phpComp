// pages/api/projects.js
import { getToken } from 'next-auth/jwt';
import clientPromise from '../../utils/mongodb';

export default async function handler(req, res) {
  // Retrieve the token from the request
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No token found' });
  }

  // If token is found, use it to fetch user's email
  const email = token.email;

  const client = await clientPromise;
  const db = client.db();
  const projectsCollection = db.collection('projects');

  if (req.method === 'GET') {
    try {
      const userProjects = await projectsCollection.findOne({ email });
      const projects = userProjects ? userProjects.projects : {};
      res.status(200).json({ projects });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch projects.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
