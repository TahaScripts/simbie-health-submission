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
    conversationID: string, // this ID will be used to get the messages for the specific chat
    lastUpdated: string, // this timestamp will be used to sort chats by most recent
    patient_last_viewed: string, // this timestamp will be used to determine if the chat has been viewed by the current user
    provider_last_viewed: string | null, // this timestamp will be used to determine if the chat has been viewed by the current user
}

// By tracking senderID for chat message, we can compare if it was sent from providerID or patientID
// Need to move this to a dedicated types folder, but here for now to simplify editing chat code
export type ChatMessage = {
    senderID: string,
    timestamp: string,
    message: string,
}

// Returns all profiles from provider_profiles table
export async function getAllProviderProfiles() {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

    const { data, error, status } = await supabase.from('provider_profiles').select()

    if (data) {
        console.log(data)
        return data;
    } else {
        return null;
    }
}

// function that returns corresponding row from provider_profiles table
export async function getProviderProfile(providerID: string) {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

    const { data, error, status } = await supabase.from('provider_profiles').select('first_name, last_name').eq('id', providerID)

    if (data) {
        return data[0].first_name + ' ' + data[0].last_name;
    } else {
        return 'Provider name not found'
    }
}

// Function that returns corresponding row from patient_profiles table
export async function getPatientProfile(patientID: string) {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

    const { data, error, status } = await supabase.from('patient_profiles').select('first_name, last_name').eq('id', patientID)

    if (data) {
        return data[0].first_name + ' ' + data[0].last_name;
    } else {
        return 'Patient name not found'
    }
}

// Create new message in existing conversation (finds them by primary key pair [providerID, patientID] in DB table 'chats')
// Previously, message JSON was created server-side, but now its packaged with timestamp on client-side and sent to server function, this lets us match what time the user sent it on their own device
export async function addNewChatMessage(providerID: string, patientID: string, message: ChatMessage, isPatient: boolean) {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

    // get latest chat log and append new message
    const chatLog = await getChatLog(providerID, patientID);

    if (chatLog) {
        const newChatLog: ChatMessage[] = [...chatLog, message]
        console.log(newChatLog);
        const { data, error, status } = await supabase.from('chats').update({messages: newChatLog, last_updated: message.timestamp}).eq('patient_id', patientID).eq('provider_id', providerID)

        console.log(data, error, status)
    }

    return null;
}

// presuming that only patients can start new chats
export async function startNewChat(providerID: string, message: string) {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

    // get current user ID, this is patient ID
    const {data: {user}} = await supabase.auth.getUser() // Get current user
    if (user) {
        const patientID = user.id;
        const {data, error, status} = await supabase.from('chats').insert({provider_id: providerID, patient_id: patientID, first_request: true, messages: [{senderID: patientID, timestamp: new Date().toISOString(), message: message}]})
        console.log(data, error, status);
    }

}

export async function getChatMessages(conversationID: string) {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

    const {data, error, status} = await supabase.from('chats').select('messages').eq('conversation_id', conversationID)

    if (data) {
        return data[0].messages as ChatMessage[];
    }

    return null;
}

// Pulls all chats for user by their current ID
export async function getChatPreviews(isPatient: boolean = true) {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

    const { data: {user} } = await supabase.auth.getUser();

    // Makes sure user is valid with an ID we can use
    if (user) {
        const { data, error, status } = await supabase.from('chats').select('provider_id, patient_id, first_request, last_updated, provider_last_read, patient_last_read, conversation_id').eq(isPatient ? 'patient_id' : 'provider_id', user.id).order('last_updated', {ascending: false})

        if (data) {
            
            return Promise.all(data.map(async (chat): Promise<ChatPreview> => {
                return {
                    providerID: chat.provider_id,
                    providerName: isPatient ? await getProviderProfile(chat.provider_id) : user.user_metadata.first_name + ' ' + user.user_metadata.last_name,
                    patientID: chat.patient_id,
                    patientName: isPatient ? user.user_metadata.first_name + ' ' + user.user_metadata.last_name : await getPatientProfile(chat.patient_id),
                    firstMessage: chat.first_request || false,
                    conversationID: chat.conversation_id,
                    lastUpdated: chat.last_updated,
                    patient_last_viewed: chat.patient_last_read,
                    provider_last_viewed: chat.provider_last_read,
                };
            }));
        }
    }
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
