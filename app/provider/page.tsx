import Image from 'next/image'
import { Card } from '@nextui-org/react'

/*
  This is the provider-home of the application.
*/

export default function ProviderHome() {
  return (
      <Card className='flex grow h-full p-4'>
        <h1 className=''>Welcome to Simbie Health.</h1>
        <h3 className=''>You are currently logged in as a provider.</h3>
      </Card>
  )
}
