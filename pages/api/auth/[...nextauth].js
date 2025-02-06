import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "../../../utils/mongodb";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: {
    ...MongoDBAdapter(clientPromise),
    async createUser() {
      return null; // Prevent automatic user creation
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        const db = (await clientPromise).db();
        const usersCollection = db.collection("users");
        const accountsCollection = db.collection("accounts");

        // Use upsert for creating or updating the user (and prevent unnecessary find)
        const { upsertedId, matchedCount } = await usersCollection.updateOne(
          { email: user.email }, 
          {
            $setOnInsert: { // Only set these values if the user is inserted
              email: user.email,
              name: user.name,
              image: user.image,
              projects: [],
            }
          },
          { upsert: true } // If no user is found, insert a new one
        );

        // Fetch the user data if they were just inserted (or already exists)
        const existingUser = await usersCollection.findOne({
          _id: upsertedId || (matchedCount > 0 && user.email),
        });

        if (!existingUser) return false; // Handle cases where user is neither inserted nor found

        // Insert the account data (if user was inserted or updated)
        const accountData = {
          userId: existingUser._id.toString(),
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          type: account.type,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          id_token: account.id_token,
          scope: account.scope,
        };

        // Use bulkWrite to insert the account data only if the account does not already exist
        await accountsCollection.bulkWrite([
          {
            updateOne: {
              filter: { userId: existingUser._id.toString(), providerAccountId: account.providerAccountId },
              update: { $set: accountData },
              upsert: true, // Insert if no matching account found
            },
          },
        ]);

        user.id = existingUser._id.toString();
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      // Attach user ID to the JWT token
      if (user) {
        token.id = user.id || user.sub;
      }
      return token;
    },

    async session({ session, token }) {
      // Add the user ID to the session
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
