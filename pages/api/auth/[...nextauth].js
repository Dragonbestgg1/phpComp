import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import fs from 'fs';
import path from 'path';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.accessToken = user.accessToken;

        // Create the JSON file
        const email = user.email; // Assuming user object has an email property
        console.log('Email retrieved:', email);

        if (!email) {
          console.error('Email is missing from user object.');
          throw new Error('Email is required.');
        }

        const jsonFilePath = path.join(process.cwd(), 'pages/api/json', `${email}.json`);
        const data = {
          userId: user.id,
          token: user.accessToken,
        };

        try {
          // Ensure the directory exists
          console.log('Ensuring directory exists:', path.dirname(jsonFilePath));
          await fs.promises.mkdir(path.dirname(jsonFilePath), { recursive: true });

          // Write the JSON file
          console.log('Writing JSON file:', jsonFilePath);
          await fs.promises.writeFile(jsonFilePath, JSON.stringify(data, null, 2), 'utf-8');
          console.log(`JSON file created: ${jsonFilePath}`);
        } catch (error) {
          console.error('Error creating JSON file:', error);
          throw new Error('Internal Server Error');
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.userId = token.userId;
      session.accessToken = token.accessToken;
      return session;
    },
    async redirect({ baseUrl }) {
      return baseUrl;
    },
  },
});
