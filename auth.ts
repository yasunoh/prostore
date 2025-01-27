import NextAuth from 'next-auth'
import {PrismaAdapter} from '@auth/prisma-adapter'
import {prisma} from '@/db/prisma'
import CredentialsProvider from "next-auth/providers/credentials"
import { compareSync } from 'bcrypt-ts-edge'
import type { NextAuthConfig } from 'next-auth'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const config = {
  pages: {
    signIn: '/sign-in',
    error: '/sign-in', 
    // signOut: '/auth/signout',
    // verifyRequest: '/auth/verify-request', // (used for check email message)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  },
  session: {
    strategy: "jwt",  
    // Seconds - How long until an idle session expires and is no longer valid.
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)
        // const res = await fetch("/your/endpoint", {
        //   method: 'POST',
        //   body: JSON.stringify(credentials),
        //   headers: { "Content-Type": "application/json" }
        // })
        // const user = await res.json()
        if (credentials == null) return null;

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string
          }
        });
        // console.log(user)
        // check if user exists and if the password matches
        if(user && user.password) {
          // console.log(user.password, credentials.password)
          const isMatch = compareSync(credentials.password as string, user.password);

          // If password is correct, return user
          if(isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            }
          }
        }
        // If user does not exists or password does not match return null
        // If no error and we have user data, return it
        return null
      }
    })    
  ],
  callbacks: {
    async session({ session, token, user, trigger }: any) {
      // Set the user ID from the token
      session.user.id = token.sub;
      session.user.role = token.role
      session.user.name = token.name

      // If there is an update, set the user name
      if(trigger === 'update') {
        session.user.name = user.name;
      }

      return session
    },
    async jwt({ token, user } :any) {
      // Assign user fields to token
      if(user) {
        token.role = user.role;

        // if user has no name then use the email
        if(user.name === 'NO_NAME') {
          token.name = user.email!.split('@')[0]

          // Update database to reflect the token name
          await prisma.user.update({
            where: {id: user.id},
            data: {name:token.name}
          })          
        }
      }
      return token
    }  ,
    authorized({ request, auth}: any) {
      // Check for session cart cookie
      if(!request.cookies.get('sessionCartId')) {
        // Generate new session cart id cookie
        const ssessionCartId = crypto.randomUUID()

        // Clone the req headers
        const newRequestHeaders = new Headers(request.headers);
        // Create new response and add the new headers
        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders
          }
        })

        // Set newly generated sessionCartId in the response cookies
        response.cookies.set('sessionCartId', ssessionCartId)

        return response;
      } else {
        return true;
      }

    }  
  }  
} satisfies NextAuthConfig;

export const {handlers, auth, signIn, signOut } = NextAuth(config)