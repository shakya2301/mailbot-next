import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
export { default } from "next-auth/middleware"
import { getToken } from 'next-auth/jwt'

 
// See "Matching Paths" below to learn more
export const config = { matcher: ["/chat"] }

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = await getToken({req : request});
  // const session = getSession();
  if(!token) return NextResponse.redirect(new URL('/', request.url))
  return NextResponse.next()
}
 
