'use client'

/*
app/signin/page.tsx

This is the core signup/login page for the web-app.
Fallback for unauthorized users accessing protected pages.
See /middleware.tsx to see how this redirects.

Combines patient and provider signup via searchParams property in URL.
i.e.
domain.com/signin?u=patient directs to patient portal
domain.com/signin?u=provider directs to provider portal
domain.com/signin directs to page that lets user choose between patient and provider signup
*/

import LandingNavbar from '../components/Navbar'
import { Button, Card, CardBody, CardFooter, CardHeader, Link } from '@nextui-org/react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react';
import SignupLoginModal from '../components/SignupLogin';

export default function SignInPage() {
    const searchParams = useSearchParams(); // Get URL search params
    const [userType, setUserType] = useState<string | null>(searchParams.get('u')); // Save the search param as userType. Should be patient or provider

    useEffect(() => {
        userType && !['patient','provider'].includes(userType) && setUserType(null); // Catch edge cases for userType that isn't 'patient' or 'provider', like the user manually setting ?u=random in the browser URL
    },[userType]) // Called whenever userType is updated

    return (
        <main>
        <LandingNavbar />
        <section className='flex h-screen items-center justify-center bg-simbie'>
            {!userType ? // If userType is null, show the option to choose between patient and provider signup, otherwise, proceed with signup modal
                (
                    <div className='grid grid-cols-2 gap-6 group min-w-[400px]'>
                        <Card isPressable className='col aspect-square hover:scale-[1.1] flex items-center justify-center' onPress={(e) => {setUserType('patient')}}>
                            Patient
                        </Card>
                        <Card isPressable className='col aspect-square hover:scale-[1.1] flex items-center justify-center' onPress={(e) => {setUserType('provider')}}>
                            Provider
                        </Card>
                    </div>
                ) : (<SignupLoginModal isPatient={userType === 'patient'}/>) // Modal accepts isPatient prop. By this point, userType must be either patient or provider – edge cases would be caught by useEffect above.
            }
        </section>
        </main>
    )
}
