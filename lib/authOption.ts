import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import User from "@/models/User";
import { comparePassword, hashPassword } from "@/lib/password-utils";
import { connectToDB } from "@/lib/dbConnect";
import toast from "react-hot-toast";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Ensure database connection
        await connectToDB();

        // Validate credentials
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user by email
        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
        }).select("+password");

        if (!user) {
          return null;
        }

        // Verify password
        const isValidPassword = await comparePassword(
          credentials.password,
          user.password,
        );

        if (!isValidPassword) {
          return null;
        }

        // Check email verification (optional)
        if (!user.emailVerified) {
          throw new Error("Please verify your email first");
        }

        // Return user object for session
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          profilePicture: user.profilePicture,
          userId: user.userId,
          status: user.status,
          customerType: user.customerType,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Optional: Handle Google sign-in
      async profile(profile) {
        await connectToDB();

        // Check if user exists
        let user = await User.findOne({ email: profile.email });

        // If not, create a new user
        if (!user) {
          user = await User.create({
            name: profile.name,
            email: profile.email,
            emailVerified: true,
            role: "user",
            status: "active",
            customerType: "regular",
            // Use a placeholder password or generate a random one
            password: await hashPassword(Math.random().toString(36).slice(-8)),
          });
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          userId: user.userId,
          status: user.status,
          customerType: user.customerType,
        };
      },
    }),
  ],

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.profilePicture = user.profilePicture;
        token.userId = user.userId;
        token.status = user.status;
        token.customerType = user.customerType;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.profilePicture = token.profilePicture;
        session.user.userId = token.userId;
        session.user.status = token.status;
        session.user.customerType = token.customerType;
      }
      return session;
    },
  },

  events: {
    async signIn() {
      toast.success("Successfully signed in");
    },
    async createUser() {
      toast.success("User account created successfully");
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};
