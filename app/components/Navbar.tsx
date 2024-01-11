'use client'

/*

All navbar components from the site are here.

There are different navigation panels for Patient and Provider portals.
This is because future iterations may require specialized nav UI for each role.

*/

import { Link, Button, Spinner, Card, CardHeader, Divider, CardBody, CardFooter } from "@nextui-org/react"
import { useEffect, useState } from "react";
import isUserLoggedIn, { logoutUser } from "../utils/account";
import { usePathname, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Navbar used on provider portal
export function ProviderNav() {
    const supabase = createClientComponentClient(); // Initializing supabase client for verifying signup/login
    const router = useRouter(); // Router for navigating to homepage after log out
    const [loading, setLoading] = useState(false);
    const pathname = usePathname(); // This is used to disable buttons if they match the current page URL

    const logoutCurrentUser = async () => {
        const { error } = await supabase.auth.signOut(); // Just in case, clearing user and session from client-side
        setLoading(true);
        await logoutUser(); // Logout user with server-side function
        await fetch('/auth/signout'); // Logout user by fetching auth route too
        setLoading(false);
        router.push('/');
    }

    return (
        <Card className='w-fit h-full'>
            <CardHeader className='flex justify-center'>
                <Link href='/'><img src='/logo.png' className='w-[100px]'/></Link>
            </CardHeader>
            <Divider/>
            <CardBody>
                <Button isDisabled={loading || pathname == '/provider'} className="flex justify-start" as={Link} href='/patient' color='primary' variant='light'>Portal Home</Button>
                <Button isDisabled={loading || pathname == '/provider/messages'} className="flex justify-start"  as={Link} href='/provider/messages' color='primary' variant='light'>Messages</Button>
                <Button isDisabled={loading || pathname == '/provider/account'} className="flex justify-start"  as={Link} href='/provider/account' color='primary' variant='light'>Account</Button>
            </CardBody>
            <CardFooter>
                <Button fullWidth isDisabled={loading} color="danger" variant='ghost' className='' onPress={logoutCurrentUser}>Logout</Button>
            </CardFooter>
        </Card>
    )
}

// Navbar used on patient portal
export function PatientNav() {
    const supabase = createClientComponentClient(); // Initializing supabase client for verifying signup/login
    const router = useRouter(); // Router for navigating to homepage after log out
    const [loading, setLoading] = useState(false);
    const pathname = usePathname(); // This is used to disable buttons if they match the current page URL

    const logoutCurrentUser = async () => {
        const { error } = await supabase.auth.signOut(); // Just in case, clearing user and session from client-side
        setLoading(true);
        await logoutUser(); // Logout user with server-side function
        await fetch('/auth/signout'); // Logout user by fetching auth route too
        setLoading(false);
        router.push('/');
    }

    return (
        <Card className='w-fit h-full'>
            <CardHeader className='flex justify-center'>
                <Link href='/'><img src='/logo.png' className='w-[100px]'/></Link>
            </CardHeader>
            <Divider/>
            <CardBody>
                <Button isDisabled={loading || pathname == '/patient'} className="flex justify-start" as={Link} href='/patient' color='primary' variant='light'>Portal Home</Button>
                <Button isDisabled={loading || pathname == '/patient/messages'} className="flex justify-start"  as={Link} href='/patient/messages' color='primary' variant='light'>Messages</Button>
                <Button isDisabled={loading || pathname == '/patient/account'} className="flex justify-start"  as={Link} href='/patient/account' color='primary' variant='light'>Account</Button>
            </CardBody>
            <CardFooter>
                <Button fullWidth isDisabled={loading} color="danger" variant='ghost' className='' onPress={logoutCurrentUser}>Logout</Button>
            </CardFooter>
        </Card>
    )
}

// Navbar used only on landing page/unauthorized pages.
// If user isn't logged in, then it shows the login/signup buttons.
// If user is logged in, then it shows the patient/provider portal buttons.
export default function LandingNavbar() {
    const supabase = createClientComponentClient(); // Initializing supabase client for verifying signup/login
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    // Calls server-side function to check if user is logged in
    const getCurrentUser = async () => {
        setLoading(true);
        const user = await isUserLoggedIn();
        setCurrentUser(user);
        setLoading(false);
    }

    const logoutCurrentUser = async () => {
        const { error } = await supabase.auth.signOut(); // Just in case, clearing user and session from client-side
        setLoading(true);
        await logoutUser(); // Logout user with server-side function
        await fetch('/auth/signout'); // Logout user by fetching auth route too
        setCurrentUser(null);
        setLoading(false);
        router.push('/');
    }

    // Called on first render, to make sure that the latest user status is there.
    useEffect(() => {
        getCurrentUser();
    },[])

    return (
        <section className='w-full fixed top-0 z-[40] bg-white text-6xl !min-h-[unset] flex flex-row justify-between p-5'>
            <Link href='/'><img src='/logo.png' className='w-[80px]'/></Link>
            
            {currentUser == 'patient' || currentUser == 'provider' ? 
            <div className='w-fit flex flex-row'>
                <Button disabled={loading} as={Link} color='primary' variant='bordered' className='mr-2' href={'/' + currentUser}>{currentUser == 'patient' ? 'Patient' : 'Provider'} Portal</Button>
                <Button disabled={loading} color="danger" variant='ghost' className='' onPress={logoutCurrentUser}>Logout</Button>
            </div> : 
            loading ? <Spinner/> :
            <div className='w-fit flex flex-row'>
                <Button as={Link} href='/provider' color='primary' variant="bordered" className='mr-2'>Providers</Button>
                <Button as={Link} href='/patient' color='primary' className='text-white'>Patients</Button>
            </div>}
        </section>
    )
}