import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "../../../utils/mongodb";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { ObjectId } from "mongodb";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: {
    ...MongoDBAdapter(clientPromise),
    async createUser(user) {
      return null; // Prevent automatic user creation
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        // Connect to MongoDB only once
        const db = (await clientPromise).db();
        const usersCollection = db.collection("users");
        const accountsCollection = db.collection("accounts");

        // Find the user by email
        let existingUser = await usersCollection.findOne({ email: user.email });

        // If the user doesn't exist, create a new user and account
        if (!existingUser) {
          // Use a single insert operation to create both user and account
          const userData = {
            email: user.email,
            name: user.name,
            image: user.image,
            projects: [],
          };
          
          const { insertedId } = await usersCollection.insertOne(userData);

          const userId = insertedId.toString();

          // Insert account details for the new user in parallel
          const accountData = {
            userId,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            type: account.type,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            id_token: account.id_token,
            scope: account.scope,
          };

          await accountsCollection.insertOne(accountData);

          // Fetch the newly created user
          existingUser = { _id: insertedId, ...userData }; // Simulate the fetched user
        }

        // Assign user ID to the user object
        user.id = existingUser._id.toString();

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      // Ensure user ID is attached to the JWT token when a user signs in
      if (user) {
        token.id = user.id || user.sub;
      }
      return token;
    },

    async session({ session, token }) {
      // Add the user ID to the session object
      if (token?.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    jwt: true,
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      },
    },
  },
});
