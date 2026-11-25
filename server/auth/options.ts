import "server-only";
import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { serverConfig } from "@/server/config/env";
import { connectToDatabase } from "@/server/db";
import { User } from "@/models/User";
import { verifyPassword } from "@/server/utils/password";

export const authOptions: NextAuthOptions = {
  secret: serverConfig.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "AirAware Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Email address is required.");
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();

        try {
          await connectToDatabase();
          // Find user and explicitly select passwordHash
          const user = await User.findOne({ email: normalizedEmail })
            .select("+passwordHash")
            .exec();

          if (!user) {
            throw new Error("No account found with this email address.");
          }

          // If the account has a passwordHash, verify it
          if (user.passwordHash) {
            if (!credentials.password) {
              throw new Error("Password is required.");
            }
            const isValid = verifyPassword(credentials.password, user.passwordHash);
            if (!isValid) {
              throw new Error("Invalid password provided.");
            }
          } else {
            // For demo seed accounts without preset passwordHash, allow entry in development
            if (process.env.NODE_ENV === "production" && credentials.password) {
              throw new Error("Please reset your password to proceed.");
            }
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            avatar: user.avatar || "aero-avatar-default",
          };
        } catch (error) {
          console.error("Auth.js authorize error:", error);
          if (error instanceof Error) {
            throw error;
          }
          throw new Error("Authentication failed. Please verify your credentials.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.avatar = (user as { avatar?: string }).avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.avatar = token.avatar as string;
      }
      return session;
    },
  },
};
