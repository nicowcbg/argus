import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
// import Email from "next-auth/providers/email" // Disabled - requires nodemailer
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { verifyPassword, getUserByEmail } from "@/lib/auth-helpers"
// import { Resend } from "resend" // Disabled for now

// const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const providers = []

// Add Google provider only if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Use adapter only for OAuth providers, Credentials uses JWT
  adapter: providers.length > 0 ? PrismaAdapter(prisma) : undefined,
  providers: [
    ...providers,
    // Email provider disabled for now - requires nodemailer
    // Uncomment when Resend is configured:
    // Email({
    //   from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    //   sendVerificationRequest: async ({ identifier, url, provider }) => {
    //     if (!resend) {
    //       console.error("Resend API key not configured. Magic links will not work.")
    //       throw new Error("Email service not configured")
    //     }
    //     
    //     try {
    //       await resend.emails.send({
    //         from: provider.from as string,
    //         to: identifier,
    //         subject: "Sign in to Argus",
    //         html: `
    //           <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    //             <h1>Sign in to Argus</h1>
    //             <p>Click the link below to sign in to your account:</p>
    //             <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px; margin: 16px 0;">
    //               Sign in
    //             </a>
    //             <p>Or copy and paste this URL into your browser:</p>
    //             <p style="word-break: break-all; color: #666;">${url}</p>
    //             <p style="color: #666; font-size: 14px; margin-top: 32px;">
    //               This link will expire in 24 hours.
    //             </p>
    //           </div>
    //         `,
    //       })
    //     } catch (error) {
    //       console.error("Error sending email:", error)
    //       throw new Error("Failed to send email")
    //     }
    //   },
    // }),
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await getUserByEmail(credentials.email as string)

        if (!user || !user.password) {
          return null
        }

        const isValid = await verifyPassword(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login?verifyRequest=true",
  },
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        // For database sessions (OAuth providers with adapter)
        if (user) {
          session.user.id = user.id
        }
        // For JWT sessions (Credentials provider)
        else if (token?.sub) {
          session.user.id = token.sub as string
        }
      }
      return session
    },
    async jwt({ token, user }) {
      // For Credentials provider, store user ID in token
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  session: {
    strategy: "jwt", // JWT works for both Credentials and OAuth
  },
})
