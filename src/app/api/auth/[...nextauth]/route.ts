import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { NextApiRequest, NextApiResponse } from "next"

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                  prompt: "consent",
                  access_type: "offline",
                  response_type: "code",
                  scope : ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/gmail.readonly" , "https://www.googleapis.com/auth/gmail.send"].join(" ")
                }
            }
        })
    ],

    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            console.log("SignIn called : ", user, account, profile, email, credentials)
          return true
        },
        // async redirect({ url, baseUrl }) {
        //   return baseUrl
        // },
        async jwt({ token, user, account, profile, isNewUser }) {
            console.log("JWT called : ", token, user, account, profile, isNewUser)
            return {
                ...token,
                username : user?.name,
                email : user?.email,
                picture : user?.image,
                accessToken : account?.access_token,
                accessTokenExpires : account?.expires_at,
                refreshToken : account?.refresh_token,
                idToken : account?.id_token,
            }
        //   return token
        },
        async session({ session, token, user }) {
            console.log("Session called : ", token)
          return {
            ...session,
            user: {
              ...session.user,
              username: token.username,
              email: token.email,
              picture: token.picture,
            },
          }
        },
      }
})

export { handler as GET, handler as POST }