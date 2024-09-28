// pages/api/auth/[...nextauth].ts
import { AccountDatabase } from "./account";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const db = new AccountDatabase();
        await db.open();
        const users = await db.getAllAccounts();
        await db.close();

        const user = users.find(
          (u: { email: string | undefined; password: string | undefined }) =>
            u.email === credentials?.email && u.password === credentials?.password,
        );
        if (user) {
          return { id: user.account_id, email: user.email };
        } else {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
	newUser: "/auth/signup"
  },
});
