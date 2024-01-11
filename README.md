# Simbie Health Submission Project

This project, created by Taha Mohamad, is for the take-home assignment given by Simbie Health's team for their Product Engineering role.

This branch contains a v2 update for the chat system, which uses real-time update for chats, so messages come in live.

This also includes an updated supabase instance with a new `seed.sql` that pre-populates local DB with test provider and profile accounts.

Database is also updated with a few role policies and additional tables.

## Project Details

**Frontend packages:** NextJS, NextUI, React, Supabase-Auth-Helpers

**Backend packages:** Supabase CLI, Docker Desktop

**HOW TO RUN**
1. Run `npm install`
    2. Install supabase CLI globally (https://supabase.com/docs/guides/cli)
    3. Install Docker Desktop (https://docs.docker.com/desktop/)
    4. Run `npx supabase start` to launch Supabase instance on local DB. This should provide you with credentials for connecting to your local Supabase instance. Save those credentials.
    5. Create a .env.local file and paste in two environment variables. (NEXT_PUBLIC_SUPABASE_URL = API_URL) (NEXT_PUBLIC_SUPABASE_ANON_KEY = anon_key)
    6. Make sure your supabase instance is properly running without error via `npx supabase start`.
    7. Run npm run dev
    8. See `/supabase/seed.sql` for pre-generated account name, email, and passwords. Password for all pre-generated acounts are `testing1234`

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

## Version 2.0

Task/Goal List, first-depth is categories of updates, second depth is actual tasks listed by priority / necessary order

- [x] Chat realtime update
  - [x] Chat messages UI updates in real time
  - [x] Track read v. unread messages in database
  - [ ] Reflect read v. unread messages in UI
- [ ] User profile
  - [x] Create unique tables for patient v. provider profiles
    - [x] Patient table w/ name, DoB, json for health data, location, insurance provider
    - [x] Provider table w/ name, education/licensing, specialties, bio, states practiced in
  - [ ] UI for viewing and editing profile
    - [x] View pulls profile data from Supabase DB
    - [ ] Edit updates existing row of profile data from Supabase DB
  - [ ] Automatically guide new users to profile update after signup/first login
- [x] Revamped chat UI
  - [x] Patients can view providers and select one before initiating new chat
    - [x] Provider search functions that pull latest list of providers from DB
    - [x] Reusable UI component
  - [x] Chat previews (in list) show peer's name (not ID) and most recent message
- [ ] Scaffolding more features
  - [ ] Appointments page
    - [ ] Schedule a new appointment UI component
    - [ ] Calendar/list of appointments
