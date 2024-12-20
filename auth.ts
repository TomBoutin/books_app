'use server';

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { db } from '@/app/lib/db';
import { User } from '@/app/lib/types';
import bcrypt from 'bcrypt';

async function getUser(email: string): Promise<User | undefined> {
  try {
    const client = await db.connect();
    const result = await client.query('SELECT * FROM public.users WHERE email = $1', [email]);
    const data = result.rows[0] as User;
    client.release();
    return data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
            // Retournez un objet de type User attendu par NextAuth
            return {
              id: user.id.toString(),
              email: user.email,
            }
          } else {
            console.log('Email ou mot de passe incorrect');
            return null;
          }
        }

        console.log('Email ou mot de passe incorrect');
        return null;
      },
    }),
  ],
});