import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

/*

This middleware function verifies the current user's authentication with Supabase.

It is loaded prior to the user loading any page:
    this includes when the user first visits the website '/'
    or if the user goes from '/' -> '/patients'

*/

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res }) // this is provided by supabase's auth-helpers as a middleware specifically for Next

  const {
    data: { user },
  } = await supabase.auth.getUser()


  // If the user is not logged in, and the current URL includes '/patient/' or '/provider/' then redirect to the login page
  if (!user && (req.nextUrl.pathname.includes('/patient') || req.nextUrl.pathname.includes('/provider'))) {
    return NextResponse.redirect(new URL('/signin', req.url))
  } else if (user) {
    const isPatient = user.user_metadata.is_patient;

    console.log(isPatient); // testing to see if user is patient, this should show up in the actual terminal you're running nextJS from, not client-side


    // if ispatient is true and the path includes '/provider/' then redirect to /patient/
    if (req.nextUrl.pathname.includes('/provider') && isPatient) {
      return NextResponse.redirect(new URL('/patient', req.url))
    } else if (req.nextUrl.pathname.includes('/patient') && !isPatient) {
      // if ispatient is false and the path includes '/patient/' then redirect to /provider/
      return NextResponse.redirect(new URL('/provider', req.url))
    }
  }

  return res
}

// This is all the subpages that trigger this middleware before load
export const config = {
  matcher: ['/', '/signin', '/patient/:path*', '/provider/:path*'],
}
