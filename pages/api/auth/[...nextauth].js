import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {

      // console.log('JWT Callback - Token:', token);
      // console.log('JWT Callback - User:', user);

      if (user) {
        
        token.userId = user.id;
        token.accessToken = user.accessToken;

        // console.log('JWT Callback - Updated Token:', token);
      }

      return token;
    },
    async session({ session, token }) {
      // console.log('Session Callback - Session:', session);
      // console.log('Session Callback - Token:', token);

      session.userId = token.userId;
      session.accessToken = token.accessToken;

      // console.log('Session Callback - Updated Session:', session);

      return session;
    },
    async redirect({ url, baseUrl }) {
      // console.log('Redirect Callback - URL:', url);
      // console.log('Redirect Callback - Base URL:', baseUrl);

      return baseUrl;
    },
  },
});