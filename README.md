# Simbie Health Submission Project

This project, created by Taha Mohamad, is for the take-home assignment given by Simbie Health's team for their Product Engineering role.

Version 2 has significant QoL improvements from the basic requirements of V1, details below.

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

## Version 2.0

Task/Goal List, first-depth is categories of updates, second depth is actual tasks listed by priority / necessary order

- [ ] Chat realtime update
  - [ ] Chat messages UI updates in real time
  - [ ] Track read v. unread messages in database
  - [ ] Reflect read v. unread messages in UI
- [ ] User profile
  - [ ] Create unique tables for patient v. provider profiles
    - [ ] Patient table w/ name, DoB, json for health data, location, insurance provider
    - [ ] Provider table w/ name, education/licensing, specialties, bio, states practiced in
  - [ ] UI for viewing and editing profile
    - [ ] View pulls profile data from Supabase DB
    - [ ] Edit updates existing row of profile data from Supabase DB
  - [ ] Automatically guide new users to profile update after signup/first login
- [ ] Revamped chat UI
  - [ ] Patients can view providers and select one before initiating new chat
    - [ ] Provider search functions that pull latest list of providers from DB
    - [ ] Reusable UI component
  - [ ] Chat previews (in list) show peer's name (not ID) and most recent message
- [ ] Scaffolding more features
  - [ ] Appointments page
    - [ ] Schedule a new appointment UI component
    - [ ] Calendar/list of appointments
