import Image from 'next/image'
import { Card } from '@nextui-org/react'
import { Database } from '@/types/supabase'
import { ProviderProfileView } from '@/app/components/AccountViewEdit'

/*
  This is the provider-home of the application.
*/

type ProviderProfile = Database['public']['Tables']['provider_profiles']['Row']

export default function ProviderAccount() {
  return (
    <ProviderProfileView/>
  )
}
