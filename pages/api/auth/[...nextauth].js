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
            projects: [
              { title: "New Project", code: '<?php\necho "lohi";\n?>' },
              {
                title: "Potato",
                code: "<?php\n//Your php code goes here...\npotato\n?>",
              },
              { title: "New Project", code: '<?php\necho "debils";\n?>' },
            ],
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
      if (user && user.id) {
        console.log("Setting token.id in jwt callback:", user.id);
        // Store user.id in token only when user is present (during the initial sign-in)
        token.id = user.id; // Save user ID in the token
      } else if (!token.id) {
        console.log(
          "Token does not have an ID. Retrying token.id from session..."
        );
        // On subsequent requests, fallback to use existing token.id if not set
        token.id = token.id || null;
      }
      return token;
    },

    async session({ session, token }) {
      console.log("Session callback executed:", session, token); // For debugging purposes

      if (token?.id) {
        console.log("Setting session.user.id from token:", token.id);
        session.user.id = token.id; // Retrieve user ID from token
      } else {
        console.error("Token ID is missing in session callback!");
      }

      return session;
    },
  },

  debug: true,
});
