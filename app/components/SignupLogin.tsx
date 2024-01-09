'use client'
/* .../components/SignupLogin.tsx

Returns SignupLogin UI modal component, which can be called from anywhere in the application if user isn't signed in.
For example, this is used in app/signin/page.tsx depending on whether the user chooses patient or provider

Signup and login is consolidated into one card, letting users choose between them easily

This can be converted into a modal, so it appears as a modal above all the existing content on the page
*/

import { Button, Card, CardBody, CardFooter, CardHeader, Checkbox, Input, Spinner, Tab, Tabs } from "@nextui-org/react";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function SignupLoginModal({ isPatient = true }: { isPatient?: boolean}) {
    const router = useRouter(); // Next.js router for redirecting after signup/login

    const supabase = createClientComponentClient(); // Initializing supabase client for verifying signup/login

    const [userType, setUserType] = useState<boolean>(isPatient); // If isPatient is true, then the user is a patient. Otherwise, they are a provider.
    const [loading, setLoading] = useState<boolean>(false); // Loading state for signup/login form

    const [currentTab, setCurrentTab] = useState<string>('signup'); // Current tab state for signup/login form
    
    const [firstName, setFirstName] = useState<string>(''); // First name state for signup/login form
    const [lastName, setLastName] = useState<string>(''); // Last name state for signup/login form
    const [email, setEmail] = useState<string>(''); // Email state for signup/login form
    const [confirmEmail, setConfirmEmail] = useState<string>(''); // Confirm email state for signup/login form
    const [password, setPassword] = useState<string>(''); // Password state for signup/login form
    const [confirmPassword, setConfirmPassword] = useState<string>(''); // Confirm password state for signup/login form
    const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false); // Agree to terms state for signup/login form

    // Simple regex function for validating email addresses, returns true or false
    const validateEmail = (email: string) => {return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}

    const trySignup = async () => {
        setLoading(true); // Pauses UI interaction while signup is processing

        // Using supabase to try creating a new user.
        // Email verification is disabled by default, so accounts are automatically logged in on signup success.
        const {data, error} = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    is_patient: userType
                }
            }
          })
          
          if (error) {
              console.error(error)
          } else {
            console.log(data);
            router.push('/' + (userType ? 'patient' : 'provider'))
          }
          setLoading(false);
    }

    const tryLogin = async() => {
        setLoading(true); // Pauses UI interaction while login is processing

        // Using supabase to try logging in with email and password
        const {data, error} = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            console.error(error)
        } else {
            console.log(data);
            router.push('/' + (data.user.user_metadata.is_patient ? 'patient' : 'provider'));
        }
        setLoading(false);
    }

    return (
        <div className='w-fit flex flex-col items-center justify-center gap-3'>
            <Button onPress={(e) => {setUserType(!userType)}} color='primary' size="sm" variant='ghost'>⬅️ I'm actually a {userType ? 'provider' : 'patient'}</Button>
            <Card className='w-fit min-w-[400px]'>
            <CardHeader className="bg-primary text-white">
                <h1 className='font-[600] w-full text-center'>{userType ? 'Patient' : 'Provider'}</h1>
            </CardHeader>
            <CardBody>
                <Tabs isDisabled={loading} selectedKey={currentTab} onSelectionChange={(key) => setCurrentTab(key.toString())} color='secondary' fullWidth>
                    <Tab key='signup' title='Signup' className='flex flex-col gap-2'>
                        <div className='grid grid-cols-2 gap-2'>
                            <Input isDisabled={loading} variant="bordered" label='First Name' value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            <Input isDisabled={loading} variant="bordered" label='Last Name' value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        </div>
                        <Input isDisabled={loading} isInvalid={email.length > 2 && !validateEmail(email)} errorMessage={email.length > 2 && !validateEmail(email) && 'You must provide a valid email.'} variant="bordered" label='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
                        <Input isDisabled={loading} isInvalid={confirmEmail.length > 0 && confirmEmail != email} errorMessage={confirmEmail.length > 0 && confirmEmail != email && "Please retype your email exactly."} variant="bordered" label='Confirm Email' value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} />
                        <Input isDisabled={loading} variant="bordered" label='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
                        <Input isDisabled={loading} isInvalid={confirmPassword.length > 0 && confirmPassword != password} errorMessage={confirmPassword.length > 0 && confirmPassword != password && "Please retype your password exactly."} variant="bordered" label='Confirm Password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        <Checkbox isDisabled={loading} color="default" checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)}>I agree to the <a target='_blank' className='text-primary'>Terms of Service</a> and <a target='_blank' className='text-primary'>Privacy Policy</a>.</Checkbox>
                    </Tab>
                    <Tab key='login' title='Login' className='flex flex-col gap-2'>
                        <Input isDisabled={loading} isInvalid={email.length > 2 && !validateEmail(email)} errorMessage={email.length > 2 && !validateEmail(email) && 'You must provide a valid email.'} variant="bordered" label='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
                        <Input isDisabled={loading} variant="bordered" label='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
                    </Tab>
                </Tabs>
            </CardBody>
            <CardFooter>
                {currentTab === 'signup' ? // The footer button depends on whether the user wants to signup or login. Additional isDisabled parameters prevent login/signups with invalid inputs.
                <Button color='primary' variant='bordered' isDisabled={!validateEmail(email) || loading || !email.includes('@') || email != confirmEmail || password.length < 6 || password != confirmPassword || firstName.length < 3 || lastName.length < 3 || !agreeToTerms} fullWidth onClick={() => {trySignup()}}>{loading ? <Spinner/> : 'Signup'}</Button> :
                <Button color='primary' variant='bordered' isDisabled={!validateEmail(email) || loading || !email.includes('@') || password.length < 3} fullWidth onClick={() => {tryLogin()}}>{loading ? <Spinner/> : 'Login'}</Button>
                }
            </CardFooter>

        </Card>
        </div>
        
    )
}