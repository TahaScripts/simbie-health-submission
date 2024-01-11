'use client'
import { Card, CardBody, CardHeader, Spinner } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { Database } from "@/types/supabase";
import { getUserProfile } from "../utils/account";

type ProviderProfile = Database['public']['Tables']['provider_profiles']['Row']

// This pulls all the profile elements needed. Now it just needs to be placed in inputs.
export function ProviderProfileView() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ProviderProfile | null>(null);

    const pullProfile = async () => {
        setLoading(true);
        const pulledProfile = await getUserProfile(false);
        if (pulledProfile) {
            const profile = pulledProfile as ProviderProfile; // gets profile from server function and makes sure it's in providerprofile format
            setProfile(profile);
        }
        setLoading(false)    
    }

    useEffect(() => {
        pullProfile()
    }, [])
    return (
        <Card className='flex grow h-full'>
            <CardHeader className='bg-primary text-white'>
                <h1>Provider Profile</h1>
            </CardHeader>
            {loading ?
            <CardBody>
                <Spinner/>
            </CardBody> :
            profile ? 
            <CardBody>
                
            </CardBody> : 'Error getting user profile.'}
        </Card>
    )
}