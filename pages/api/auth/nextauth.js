import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import { MongoClient } from 'mongodb';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '../../../lib/mongodb';

export default NextAuth({
  providers: [
    Providers.Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        // Add logic here to look up the user from the credentials
        const user = { id: 1, name: 'John Doe' };
        return user ? user : null;
      },
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
});
