'use server' // Required to make sure these are all server functions, equivalent of fetching an API route in /pages/ version of NextJS

/*
Contains auth-related functions for Supabase server-side use

isUserLoggedIn() - Simple function that returns patient or provider if the user is logged in, null otherwise
getUserDetails() - Function that returns the metadata of users entirely
logoutUser() - Calls supabase logout functions from server side
*/

import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

export async function getUserProfile(isPatient: boolean) {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

    const { data: {user} } = await supabase.auth.getUser();

    if (user) {
        const { data, error, status } = await supabase.from(isPatient ? 'patient_profiles' : 'provider_profiles').select().eq('id', user.id)
        console.log(data, error, status);
        if (data) {
            return data[0]
        }
    }
    return null
}

// Simple function that returns patient or provider if the user is logged in, null otherwise
export default async function isUserLoggedIn() {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const { data: {user} } = await supabase.auth.getUser();

    if (!user) {
        return null
    } else {
        // I could make this more efficient by handling isPatient = null or true/false on client side.
        // For now, client will just get the string and use that to determine if patient or provider.
        return user.user_metadata.is_patient ? 'patient' : 'provider' // returns patient or provider as string
    }
}

// Function that returns the metadata of users entirely
// By default this records their name and whether they are a patient or provider
// Returns (if user logged in) user.user_metadata = {first_name: string, last_name: string, is_patient: boolean}
export async function getUserDetails() {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const { data: {user} } = await supabase.auth.getUser();

    if (!user) {
        return null // returning null should be caught by whichever client-side element calls this function
    } else {
        return user.user_metadata
    }
}

// Calls supabase logout functions from server side
// This is called just in-case by client logout button in tandem with Supabase ClientComponent logout to ensure cookies are fully deleted
export async function logoutUser() {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const { error } = await supabase.auth.signOut()

	if (error) {
        // Need to add further handling here for logging out user if error
        // What cases would an error actually occur?
		console.log({ error });
	} else {
        // Actual redirects and UI changes handled client-side
        // But maybe should add return to confirm that there was no error
        console.log('logged out')
    }
}