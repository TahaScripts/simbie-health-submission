import React from "react"
import { PatientNav, ProviderNav } from "../components/Navbar"

// This layout makes sure that providers have their own nav, different from patients
// Allows us to change provider interface in future iterations without disturbing patient experience

export default async function ProviderLayout({children}: {
    children: React.ReactNode
  }) {
    return (
        <section className="w-screen h-screen flex items-center justify-center gap-2 p-2">
            <ProviderNav/>
            {children}
        </section>
      )
}