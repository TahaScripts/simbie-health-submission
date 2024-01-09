# Simbie Health Submission Project

This project, created by Taha Mohamad, is for the take-home assignment given by Simbie Health's team for their Product Engineering role.

## Project Details
**Frontend packages:** NextJS, NextUI, React, Supabase-Auth-Helpers

**Backend packages:** Supabase CLI, Docker Desktop

<details>
<summary>Folder Structure</summary>
<ul>
    <li>
    <details><summary><code>/app</code></summary>
    <ul>
        <li><code>/auth</code> <em>NOT A PAGE</em>
            <ul>
                <li><code>callback</code>: api route used for supabase-auth via magic-links or verification links/codes</li>
                <li><code>signout</code>: api route used for supabase logout</li>
            </ul>
        </li>
        <li><code>/components</code> <em>NOT A PAGE</em>
            <ul>
                <li>Reusable UI components for chat, navbar, and signup/login</li>
            </ul>
        </li>
        <li><code>/patient</code>
            <ul>
                <li>Protected pages for patient UI. Homepage features dashboard, has subsequent pages like /messages</li>
            </ul>
        </li>
        <li><code>/provider</code>
            <ul>
                <li>Protected pages for provider UI. Homepage features dashboard, has subsequent pages like /messages</li>
            </ul>
        </li>
        <li><code>/signin</code>
            <ul>
                <li>Single page portal for providers and patients to signup/login</li>
            </ul>
        </li>
        <li><code>utils</code> <em>NOT A PAGE</em>
            <ul>
                <li>Server-sided functions for interacting with Supabase, categorized by product function (i.e. account.tsx, chat_utils.tsx)</li>
            </ul>
        </li>
    </ul>
    </details>
    </li>
    <li><code>/supabase</code>: All configs for running supabase instance locally **(you shouldn't have to touch this)**</li>
    <li><code>/types</code>: Types from supabase database **(you shouldn't have to touch this)**</li>
    <li><code>middleware.ts</code>: verifies user auth before page-load and redirects accordingly, standard with NextJS</li>
</ul>
</details>

<details>
    <summary>How to Install + Run</summary>
    1. env variables
    2. npm add packages
    3. start Supabase local server
    4. start NextJS project
</details>

## Version 1.0
This is the first branch of my submission for Simbie Health. While a more details task/goal list is provided below, the summarized core product features completed are available below.

- Users can create and login as patients or providers.
- Patients can initiate a conversation with provider.
- Providers can choose to accept or reject a conversation with patient(s) before sending a message.
- Chat database accurately stores latest conversation and messages for each user.

<details>
<summary>Task/Goal List</summary>
<ul>
    <li><input type="checkbox" checked disabled> Landing page for anyone who visits the website</li>
    <li><input type="checkbox" checked disabled> Account creation/signup pages, separated by Provider or Patient</li>
    <li><input type="checkbox" checked disabled> Supabase project setup</li>
    <li><input type="checkbox" disabled> Supabase auth
        <ul>
            <li><input type="checkbox" checked disabled> Middleware.tsx that verifies user's auth w/ Supabase project</li>
            <li><input type="checkbox" checked disabled> Middleware.tsx properly redirects users from protected pages depending on auth and provider/patient role</li>
            <li><input type="checkbox" checked disabled> Account creation and login properly verifies with Supabase and stores session in browser client</li>
            <li><input type="checkbox" checked disabled> User can logout + session cookies fully removed from client side</li>
            <li><input type="checkbox" disabled> Forgot password</li>
            <li><input type="checkbox" disabled> Verify email on account creation</li>
        </ul>
    </li>
    <li><input type="checkbox" disabled> Supabase Database
        <ul>
            <li><input type="checkbox" checked disabled> Created 'chat' table for storing conversations between provider and patient</li>
            <li><input type="checkbox" disabled> Implemented separate profile tables for patients and providers</li>
            <li><input type="checkbox" disabled> Implemented actual roles between providers and patients for RLS (currently just checks if user metadata for patient/provider status)</li>
        </ul>
    </li>
    <li><input type="checkbox" disabled> Chat UI & functions
        <ul>
            <li><input type="checkbox" checked disabled> Patient can create chat with provider with providerID
                <ul>
                    <li><input type="checkbox" checked disabled> New chat is successfully created in database</li>
                    <li><input type="checkbox" checked disabled> Patients can view all chats in the database such that their user_id matches column 'patient_id'</li>
                    <li><input type="checkbox" checked disabled> After first patient message, conversation cannot continue without approval/response from provider</li>
                </ul>
            </li>
            <li><input type="checkbox" checked disabled> Providers can view chats and message requests
                <ul>
                    <li><input type="checkbox" checked disabled> Providers can 'accept' message requests, initiating full conversation UI between patient and provider</li>
                    <li><input type="checkbox" checked disabled> New patient and provider messages in existing conversations are properly reflected in database</li>
                </ul>
            </li>
            <li><input type="checkbox" checked disabled> On load or refresh, messages UI updates with latest convos and messages from users
                <ul>
                    <li><input type="checkbox" checked disabled> User can switch between conversations via UI</li>
                    <li><input type="checkbox" checked disabled> UI updates with latest conversation messages as selected by UI</li>
                    <li><input type="checkbox" disabled> Messages UI has real-time link with chats database.
                        <ul>
                            <li><input type="checkbox" disabled> New chats and messages load instantly on user application, do not require refresh</li>
                        </ul>
                    </li>
                </ul>
            </li>
        </ul>
    </li>
    <li><input type="checkbox" disabled> Quality of life upgrades (these will be the goals for version 2.0)
        <ul>
            <li><input type="checkbox" disabled> First-time login - profile updates
                <ul>
                    <li><input type="checkbox" disabled> Patients can update their profile with medical information
                        <ul>
                            <li><input type="checkbox" disabled> Supabase profile table updated to reflect this</li>
                        </ul>
                    </li>
                    <li><input type="checkbox" disabled> Providers can update their profile with specialties (i.e. Mental health, hormonal, reproductive, etc.)
                        <ul>
                            <li><input type="checkbox" disabled> Supabase provider profile table updates to reflect this</li>
                        </ul>
                    </li>
                </ul>
            </li>
            <li><input type="checkbox" disabled> New UI for starting conversations
                <ul>
                    <li><input type="checkbox" disabled> Patients first categorize/choose an issue</li>
                    <li><input type="checkbox" disabled> Patients can choose from live-updated list of providers whose profiles match that category/specialty/issue</li>
                    <li><input type="checkbox" disabled> Additional filtering by state/insurances accepted</li>
                </ul>
            </li>
            <li><input type="checkbox" disabled> Real-time conversation and chat updates
                <ul>
                    <li><input type="checkbox" disabled> UI reflects messages or conversations unread by user</li>
                </ul>
            </li>
            <li><input type="checkbox" disabled> Additional formats for conversation
                <ul>
                    <li><input type="checkbox" disabled> Update message format table to enable additional formats</li>
                    <li><input type="checkbox" disabled> Implement Supabase storage API for saving media</li>
                    <li><input type="checkbox" disabled> Users can attach images/items</li>
                    <li><input type="checkbox" disabled> Voice messages
                        <ul>
                            <li><input type="checkbox" disabled> Voice messages are auto transcribed</li>
                        </ul>
                    </li>
                </ul>
            </li>
            <li><input type="checkbox" disabled> Additional sections for a 'full platform'
                <ul>
                    <li><input type="checkbox" disabled> UI for patients to make appointments with providers</li>
                    <li><input type="checkbox" disabled> Provider availability stored in database (linked to appointment creation UI)</li>
                    <li><input type="checkbox" disabled> Providers can see all their upcoming appointments and accept/deny appointment requests</li>
                </ul>
            </li>
        </ul>
    </li>
</ul>

</details>