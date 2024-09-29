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
    // Redirect to a specific page after sign in
    async redirect({ url, baseUrl }) {
      // You can use a switch or if condition to redirect based on the url or other conditions
      return baseUrl + '/dashboard'; // Redirect to the dashboard page after sign in
    },
    async session({ session, token }) {
      // Add properties to the session object here if needed
      return session;
    },
  },
    pages: {
        signIn: '/', // Custom sign-in page
    }
});
