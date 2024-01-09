import React from "react"
import { PatientNav } from "../components/Navbar"

// This layout makes sure that patients have their own nav, different from providers
// Allows us to change patient interface in future iterations without disturbing provider experience


export default async function PatientLayout({children}: {
    children: React.ReactNode
  }) {
    return (
        <section className="w-screen h-screen flex items-center justify-center gap-2 p-2">
            <PatientNav/>
            {children}
        </section>
      )
}