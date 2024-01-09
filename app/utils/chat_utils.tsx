'use server' // This is the only line that needs to be added to use server-side functions
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

/*

This file contains all the functions related to chat, specifically Supabase functionality. Also includes types shared between server function and chat UI.

Functions:
provderAcceptsChat() - Provider accepts chat request from patient
getChatLog() - Pulls latest chat log from chat (key is providerID and patientID)
getLatestChats() - Pulls the user's latest chat to populate the chat_list section of patient/provider nav
newChatMessage() - Creates a new message within existing conversation
createNewChat() - Creates entirely new chat from provider to patient in Supabase DB

*/

// All necessary information to at least generate a preview of the chat
// Need to move this to a dedicated types folder, but here for now to simplify editing chat code
export type ChatPreview = {
    providerID: string,
    providerName: string,
    patientID: string,
    patientName: string,
    firstMessage: boolean,
}

// By tracking senderID for chat message, we can compare if it was sent from providerID or patientID
// Need to move this to a dedicated types folder, but here for now to simplify editing chat code
export type ChatMessage = {
    senderID: string,
    timestamp: string,
    message: string,
}

// Provider approves chat request from patient
// We don't need to take a providerID because we can get it from the current user
// This function should only be called by providers, so patientID is the only string we need.
export async function providerAcceptsChat(providerID: string, patientID: string) {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

    const { data, error, status } = await supabase.from('chats').update({first_request: false}).eq('patient_id', patientID).eq('provider_id', providerID)

    console.log(data, error, status)
    
    return null;
}

// Pulls latest chat log from chat (key is providerID and patientID)
export async function getChatLog(providerID: string, patientID: string) {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

    const { data, error, status } = await supabase.from('chats').select('messages').eq('patient_id', patientID).eq('provider_id', providerID)

    if (data) {
        if (data[0].messages) {
            return data[0].messages as ChatMessage[];
        }
    }

    return null;
}

// Pulls the user's latest chat to populate the chat_list section of patient/provider nav
export async function getLatestChats(isPatient: boolean = true) {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

    const { data: {user} } = await supabase.auth.getUser();

    // Makes sure user is valid with an ID we can use
    if (user) {
        const { data, error, status } = await supabase.from('chats').select('provider_id, patient_id, first_request').eq(isPatient ? 'patient_id' : 'provider_id', user.id)

        if (data) {
            return data.map((chat): ChatPreview => {
                return {
                    providerID: chat.provider_id,
                    providerName: isPatient ? 'Provider' : user.user_metadata.first_name + ' ' + user.user_metadata.last_name,
                    patientID: chat.patient_id,
                    patientName: isPatient ? user.user_metadata.first_name + ' ' + user.user_metadata.last_name : 'Patient',
                    firstMessage: chat.first_request || false,
                }
            })
        }
    }
    
    return null;
}

// Creates a new message within existing conversation
// Presumes row already exists in table 'chats' with [provider_id, patient_id] keypair, Supabase server will automatically reject the row if it doesn't exist
export async function newChatMessage(providerID: string, patientID: string, message: string, isPatient: boolean) {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

    // get latest chat log and append new message
    const chatLog = await getChatLog(providerID, patientID);
    if (chatLog) {
        const newMessage: ChatMessage = {
            senderID: isPatient ? patientID : providerID, // if 
            timestamp: new Date().toISOString(),
            message: message,
        }
        const newChatLog: ChatMessage[] = [...chatLog, newMessage]
        console.log(newChatLog);
        const { data, error, status } = await supabase.from('chats').update({messages: newChatLog}).eq('patient_id', patientID).eq('provider_id', providerID)

        console.log(data, error, status)
    }

    return null;
}

// Creates entirely new chat from provider to patient in Supabase DB
// This creates a new row in chats
// Presumes that a chat doesn't already exist between provider and patient
// Presumes only patient can initiate new chat, so we only need to pass providerID
// Don't need to add additional logic for determining if conversation (row) already exists
// Each row in table 'chats' is unique by combination of provider_id and patient_id, so new rows cannot be paid with an existing [provider_id, patient_id] keypair, Supabase server will automatically reject the row
export async function createNewChat(message: string, providerID: string) {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const {data: {user}} = await supabase.auth.getUser() // Get current user

    // Makes sure current user (patient) is valid with an ID we can use
    if (user) {
        const firstMessage: ChatMessage = {
            senderID: user.id,
            timestamp: new Date().toISOString(),
            message: message,
        }
        // Added SQL policy to Supabase, rows can be inserted if patient_id matches user.id
        const { data, error, status } = await supabase.from('chats').insert([{first_request: true, patient_id: user.id, provider_id: providerID, messages: [firstMessage]}])

        console.log(data, error, status)
        return null;

    }

    return null;
}