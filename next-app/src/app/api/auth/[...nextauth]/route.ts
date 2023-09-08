import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import NextAuth, {
  DefaultSession,
  NextAuthOptions,
  AuthOptions,
} from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { env } from '@/env.mjs';

type UserRole = 'ADMIN' | 'USER';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession['user'];
  }
}

export const nextAuthOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  secret: env.NEXTAUTH_SECRET,

  // Configure one or more authentication providers
  providers: [
    GitHubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
    // ...add more providers here
  ],

  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role as UserRole;
        session.user.image = token.picture;
      }

      return session;
    },
    async jwt({ token, user }) {
      // console.log(token);
      const dbUser = await prisma.user.findFirst({
        where: {
          email: token.email,
        },
      });

      if (!dbUser) {
        if (user) {
          token.id = user.id;
        }
        return token;
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        picture: dbUser.image,
      };
    },

    signIn: async ({ user }) => {
      if (!user.email) return false;

      const dbUser = await prisma.allowedSignInEmail.findFirst({
        where: {
          email: user.email,
        },
      });

      if (!dbUser) return false;

      return true;
    },
  },
  cookies: {
    sessionToken: {
      name:
        (env.NODE_ENV === 'production' ? '__Secure-' : '') +
        `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: env.API_DOMAIN,
      },
    },
  },
} satisfies AuthOptions;

const handler = NextAuth(nextAuthOptions);

export { handler as GET, handler as POST };
