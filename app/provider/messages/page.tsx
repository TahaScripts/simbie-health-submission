/*
  This is the provider-messages section of the application.
*/

import { RealtimeChat } from "@/app/components/RealtimeChat";

export default function ProviderMessages() {
  return (
      <RealtimeChat isPatient={false}/>
  )
}
