import Image from 'next/image'
import { Card } from '@nextui-org/react'

/*
  This is the patient-home of the application.
*/

export default function PatientHome() {
  return (
      <Card className='flex grow h-full p-4'>
        <h1 className=''>Welcome to Simbie Health.</h1>
        <h3 className=''>You are currently logged in as a patient.</h3>
      </Card>
  )
}
