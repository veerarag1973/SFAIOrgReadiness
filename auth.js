// auth.js — Auth.js v5 root config
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'

const providers = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
]

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  pages: { signIn: '/signin' },
  providers,
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.plan = user.plan
      }

      return token
    },
    async session({ session, token }) {
      if (session.user && token?.sub) {
        session.user.id   = token.sub
        session.user.plan = token.plan ?? 'free'

        if (typeof EdgeRuntime === 'string') {
          return session
        }

        // Attach the user's first org membership to session for convenience
        const membership = await prisma.organisationMember.findFirst({
          where: { userId: token.sub },
          include: { org: { select: { id: true, name: true, slug: true, plan: true } } },
          orderBy: { createdAt: 'asc' },
        })

        if (membership) {
          session.user.orgId   = membership.org.id
          session.user.orgName = membership.org.name
          session.user.orgSlug = membership.org.slug
          session.user.orgPlan = membership.org.plan
          session.user.orgRole = membership.role
        }
      }
      return session
    },
  },
})
