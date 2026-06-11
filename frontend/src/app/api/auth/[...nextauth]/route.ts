import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    const response = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/token`,
                        {
                            username: credentials?.email || "",
                            password: credentials?.password || "",
                        },
                        {
                            headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        }
                    );

                    const data = response.data;

                    if (response.status === 200 && data.access_token) {
                        return {
                            id: data.user_id,
                            email: credentials?.email,
                            name: data.user_name,
                            accessToken: data.access_token,
                        };
                    }
                    return null;
                } catch (error) {
                    // في حال حدوث خطأ من الباك إند (مثل 401 أو 400)
                    console.error("Auth Error:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = (user as any).accessToken;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                (session as any).accessToken = token.accessToken;
                (session as any).user.id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };