import Image from 'next/image'
import { Card } from '@nextui-org/react'
import { Database } from '@/types/supabase'

/*
  This is the provider-home of the application.
*/

type ProviderProfile = Database['public']['Tables']['provider_profiles']['Row']

export default function ProviderAccount() {
  return (
      <Card className='flex grow h-full p-4'>
        <h1 className=''>Welcome to Simbie Health.</h1>
        
      </Card>
  )
}
