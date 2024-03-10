import type { NextAuthConfig } from "next-auth";

export const authConfig={
    pages:{
        signIn:'/login',
        //signOut:'/logout',
        //error:'/_error'
    },
    callbacks:{
        //auth prop is user's session 
        //request prop is incoming request
        authorized({auth,request:{nextUrl}}){
            const isLoggedIn=!!auth?.user;
            const isOnDashboard=nextUrl.pathname.startsWith('/dashboard');
            if (isOnDashboard){
                if (isLoggedIn) return true;
                return false;
            } else if(isLoggedIn){
                return Response.redirect(new URL('/dashboard',nextUrl));
            }
            return true;
            },
        },
        providers:[],//array that lists different login options
    }satisfies NextAuthConfig;
