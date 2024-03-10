import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

//initialize NextAuth.js with the authConfig object and export the auth property
export default NextAuth(authConfig).auth;

export const config={
    matcher:['/((?!api|_next/static|_next/image|.*\\.png$).*) ']
};