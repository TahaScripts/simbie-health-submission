import Image from 'next/image'
import SignupLoginModal from './components/SignupLogin'
import LandingNavbar from './components/Navbar'

/*
  This is the landing page '/'
  This and /signup are the only pages that do not require authentication.
  This page (and navbar) will show at '/' regardless of the user's authentication.
*/

export default function Home() {
  return (
    <main>
      <LandingNavbar />
      <section className='flex h-screen items-center justify-center bg-simbie'>
        <div className='w-[500px] h-[500px] border border-5 border-black'>
          Insert landing page content here 
        </div>
      </section>
    </main>
  )
}
