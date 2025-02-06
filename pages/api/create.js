import clientPromise from '../../utils/mongodb';
import { getToken } from "next-auth/jwt";

export default async function handler(req, res) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method === "POST") {
      const { code, key, title } = req.body;
      const email = token.email;
      const client = await clientPromise;
      const db = client.db();
      const projectsCollection = db.collection('projects');

      try {
        const userProjects = await projectsCollection.findOne({ email });
        const projects = userProjects ? userProjects.projects : {};

        projects[key] = { title, code };

        await projectsCollection.updateOne(
          { email },
          { $set: { projects } },
          { upsert: true }
        );

        res.status(200).json({ message: 'New project created successfully!', key });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create project.' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
