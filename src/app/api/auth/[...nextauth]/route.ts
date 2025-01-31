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
                  scope : ['openid', "https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email","https://www.googleapis.com/auth/gmail.readonly" , "https://www.googleapis.com/auth/gmail.send"].join(" ")
                }
            }
        })
    ],

    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            // console.log("SignIn called : ", user, account, profile, email, credentials)
          return true
        },
        // async redirect({ url, baseUrl }) {
        //   return baseUrl
        // },
        async jwt({ token, user, account, profile, isNewUser }) {

          console.log("User : ", user , "Profile : ", profile , "Account : ", account)
            // Initial sign in
            if (account && user) {
              return {
                ...token,
                access_token: account.access_token,
                issued_at: Date.now(),
                expires_at: Date.now() + Number(account.expires_in) * 1000, // 3600 seconds
                refresh_token: account.refresh_token,
                email: user.email || account.email,
              };
            } else if (Date.now() < Number(token.expires_at)) {
              return token;
            } else {
              console.log('Access token expired getting new one');
              try {
                const response = await fetch('https://oauth2.googleapis.com/token', {
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                  body: new URLSearchParams({
                    client_id: process.env.GOOGLE_CLIENT_ID as string, // Type assertion
                    client_secret: process.env.GOOGLE_CLIENT_SECRET as string, // Type assertion
                    grant_type: 'refresh_token',
                    refresh_token: token.refresh_token as string, // Type assertion
                  }),
                  method: 'POST',
                });
      
                const tokens = await response.json();
      
                if (!response.ok) throw tokens;
      
                const ret =  {
                  ...token, // Keep the previous token properties
                  access_token: tokens.access_token,
                  expires_at: Date.now() + Number(tokens.expires_in) * 1000,
                  // Fall back to old refresh token, but note that
                  // many providers may only allow using a refresh token once.
                  refresh_token: tokens.refresh_token ?? token.refresh_token,
                }; // updated inside our session-token cookie

                console.log("JWT called : ", ret)
                return ret;
                
              } catch (error) {
                console.error('Error refreshing access token', error);
                // The error property will be used client-side to handle the refresh token error
                return { ...token, error: 'RefreshAccessTokenError' as const };
              }
            }
          },
        async session({ session, token, user }) {
            const ret=  {
                ...session,
                username: token.username,
                email: token.email,
                picture: token.picture,
            }
            console.log("Session called : ", ret)
            return ret;
        },
      }
})

export { handler as GET, handler as POST }