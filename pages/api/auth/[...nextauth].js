import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "../../../utils/mongodb";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { ObjectId } from "mongodb"; // Ensure ObjectId is imported

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
      console.log("Skipping automatic user creation:", user);
      return null; // Prevents NextAuth from inserting user automatically
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log("SignIn callback executed:", user);

      try {
        const db = (await clientPromise).db();
        const usersCollection = db.collection("users");
        const accountsCollection = db.collection("accounts");

        let existingUser = await usersCollection.findOne({ email: user.email });

        if (!existingUser) {
          console.log("Manually inserting user:", user.email);
          const newUser = await usersCollection.insertOne({
            email: user.email,
            name: user.name,
            image: user.image,
            projects: [], // Ensure projects is an array but starts empty
          });

          const userId = newUser.insertedId.toString(); // Convert ObjectId to string

          console.log("Manually linking account for user ID:", userId);
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

          console.log("Account linked successfully.");

          // Retrieve the inserted user and return it for NextAuth
          existingUser = await usersCollection.findOne({
            _id: new ObjectId(userId),
          });
        }

        // Ensure NextAuth recognizes the user and adds the user.id to the user object
        user.id = existingUser._id.toString(); // Convert ObjectId to string for NextAuth
        console.log("Returning user to NextAuth:", user);

        return true;
      } catch (error) {
        console.error("Error inserting user manually:", error);
        return false; // Prevent sign-in on error
      }
    },

    async jwt({ token, user }) {
      console.log("JWT callback executed. Token before:", token, "User:", user);
    
      // On first sign-in, user is available → Store user.id in the token
      if (user) {
        token.id = user.id || user.sub; // Ensure user ID is stored
      }
    
      console.log("JWT callback returning token:", token);
      return token;
    },    
  
    async session({ session, token }) {
      console.log("Session callback executed. Token received:", token);
    
      if (token?.id) {
        session.user.id = token.id; // Attach the user ID from the token
      } else {
        console.error("Token ID is missing in session callback!");
      }
    
      console.log("Updated session:", session);
      return session;
    },    
  },
  session: {
    strategy: "jwt",
    jwt: true,
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token', // default cookie name
      options: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production', 
        path: '/',
      },
    },
  },
});
