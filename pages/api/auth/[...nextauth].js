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
      return null;
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        const db = (await clientPromise).db();
        const usersCollection = db.collection("users");
        const accountsCollection = db.collection("accounts");

        let existingUser = await usersCollection.findOne({ email: user.email });

        if (!existingUser) {
          const newUser = await usersCollection.insertOne({
            email: user.email,
            name: user.name,
            image: user.image,
            projects: [],
          });

          const userId = newUser.insertedId.toString();

          await accountsCollection.insertOne({
            userId,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            type: account.type,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            id_token: account.id_token,
            scope: account.scope,
          });

          existingUser = await usersCollection.findOne({
            _id: new ObjectId(userId),
          });
        }

        user.id = existingUser._id.toString();

        return true;
      } catch (error) {
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || user.sub;
      }
      return token;
    },

    async session({ session, token }) {
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
