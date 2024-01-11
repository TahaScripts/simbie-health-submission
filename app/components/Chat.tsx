'use client';
/*
This file contains all of the UI components and functions necessary for chat.

See /app/chat_utils.tsx for all of the server-side functions interacting with Supabase.

Currently, the chatUI pulls chats in one-time functions from the database, it does not live update.
That means the refreshChats() function needs to be called to get the latest chats.
However, messages are properly sent and received in real-time to the database.

Next steps include implementing real-time updates from the chats DB to client-side.

*/

/*

Code commented out, see RealTimeChat.tsx for current implementation

import { Button, Card, CardHeader, CardBody, CardFooter, Input, Textarea, Divider, Modal, ModalHeader, ModalBody, ModalFooter, useDisclosure, ModalContent, Spinner, ScrollShadow } from '@nextui-org/react'
import { useEffect, useState } from 'react';
import { providerAcceptsChat, ChatPreview, ChatMessage, getChatLog, createNewChat, getLatestChats, newChatMessage } from '../utils/chat_utils';
import { Database } from '@/types/supabase';
import { User, createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Modal for creating new chat
function NewChatModal({isPatient, isOpen, onOpenChange} : {isPatient: boolean, isOpen: boolean, onOpenChange: (open: boolean) => void}) {
    const [loading, setLoading] = useState(false);
    const [providerID, setProviderID] = useState<string>(''); // this is set as providerID because conversations are started from patient only, so we already have patientID for creating this conversation/message
    const [message, setMessage] = useState<string>('');

    // Attempts to push c hat to database
    const pushChat = async () => {
        setLoading(true);
        const data = await createNewChat(message, providerID); // server-side function
        setLoading(false);
    }

    return (
        <Modal className='w-fit !min-h-[unset]' isDismissable={false} hideCloseButton isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
            {(onClose) => ( // this is a nextUI specific thing for using ModalContent, don't remove
                <>
                <ModalHeader>
                    New Chat
                </ModalHeader>
                <ModalBody className=''>
                    <Input isDisabled={loading} label='Provider ID' placeholder='Enter provider ID' onChange={(e) => {setProviderID(e.target.value)}}/>
                    <Textarea isDisabled={loading} label='Message' placeholder='Enter message' onChange={(e) => {setMessage(e.target.value)}}/>
                </ModalBody>
                <ModalFooter className='flex flex-row items-center justify-center'>
                    <Button onPress={onClose} isDisabled={loading} color='danger' variant='bordered'>Cancel</Button>
                    <Button onPress={pushChat} isDisabled={loading || providerID.length < 10 || message.length < 10} color='primary' variant='bordered'>Send</Button>
                </ModalFooter>
                </>
            )}
            </ModalContent>
        </Modal>
    )
}

// Individual component for showing all chats for users to select from
function ChatList({openMessageModal, chatList, currentChat, updateCurrentChat, isPatient} : {openMessageModal: () => void, chatList : ChatPreview[],currentChat: ChatPreview | null, updateCurrentChat: Function, isPatient: boolean}) {
    return (
        <Card className='w-fit min-w-[200px] h-full' radius="none">
            <CardHeader className=''>
                {
                    // Under current user specs, new conversations can only be initiated from patient side, so this should not be visible for provider nav
                    isPatient && <Button onPress={openMessageModal} fullWidth color='primary' variant='bordered'>New Message</Button>
                }
            </CardHeader>
            {isPatient && <Divider/>}
            <CardBody className='flex flex-col gap-2'>
                {chatList.map((chat) => (
                    <Button isDisabled={currentChat == chat} key={isPatient ? chat.providerID : chat.patientID} className='text-left justify-start p-8' color='primary' variant='faded' onPress={() => {updateCurrentChat(chat)}}>
                        <a className='text-lg'>{isPatient ? chat.providerName : chat.patientName}<br/><span className='text-sm'>{(isPatient ? chat.providerID : chat.patientID).slice(0, 5)}</span></a>
                    </Button>
                ))}
            </CardBody>
        </Card>
    )
}

// Individual component that renders a chat, if chosen.
// Only needs ChatPreview item to fetch chat log and user info from server.
function ChatView({chat, isPatient} : {chat: ChatPreview | null, isPatient: boolean}) {
    const [loading, setLoading] = useState(false);
    const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState<string>('');

    // gets the most recent log of a specific chat
    const refreshChatLog = async () => {
        if (chat) {
            setLoading(true);
            const data = await getChatLog(chat.providerID, chat.patientID); // chats can only be identified by providerID + patientID combo
            if (data) {
                setChatLog(data);
            }
            setLoading(false);
        }
    }

    // For providers only, if the chat is marked as first in database, meaning the provider hasn't accepted it, then the UI will show them buttons to try to accept it.
    const providerAccept = async () => {
        setLoading(true);
        if (chat && !isPatient) {
            const data = await providerAcceptsChat(chat.providerID, chat.patientID);
            if (data) {
                refreshChatLog();
            }
        }
        setLoading(false);
    }

    // Sends message to database
    const sendMessage = async () => {
        setLoading(true);
        if (chat) {
            const data = await newChatMessage(chat.providerID, chat.patientID, inputMessage, isPatient);
        }
        setLoading(false);
        refreshChatLog();
    }

    // Update the chat log on first load/render
    useEffect(() => {
        refreshChatLog();
    }, [chat])

    // user may not have selected a chat, so there is a fallback
    return chat ? (
        <div className='grow h-full p-3 flex items-center justify-center'>
            <Card className='grow h-full'>
                <CardHeader className='bg-white'>
                    {chat.providerName}
                </CardHeader>
                {loading ? <div className='flex flex-row items-center justify-center w-full h-full'><Spinner/></div> :
                <ScrollShadow className='h-full bg-simbie flex flex-col w-full p-4'>
                    { // Mapping out all the chats from chatLogs here
                    chatLog.map((message, key) => {
                        // Conditional rendering based on whether message sender is the patient or provider, and whether current user is patient or provider
                        const senderIsPatient = message.senderID == chat.patientID;
                        const name = senderIsPatient ? chat.patientName : chat.providerName;
                        const time = new Date(message.timestamp);
                        return (
                            <div key={key} className={`w-full flex flex-col ${(senderIsPatient && isPatient) || (!senderIsPatient && !isPatient) ? 'items-end' : 'items-start'}`}>
                                <a className='text-sm font-[700]'>{name}</a>
                                <p className='text-md'>{message.message}</p>
                                <a className='text-xs'>{time.toLocaleDateString()} {time.toLocaleTimeString()}</a>
                            </div>
                        )
                    })}
                    {chat.firstMessage && // If this is the first message (provider needs to approve request), then the UI will display that depending on whether provider or patient.
                    <Card className='mt-10 w-full bg-primary text-white flex items-center justify-center p-4'>
                        {isPatient ? <p className=''>You must wait until the provider has approved your request.</p> : 
                        <p className=''>
                            To begin chatting with the patient, accept or deny the request.    
                        </p>}
                        {!isPatient && 
                        <CardFooter className='flex items-center justify-center flex-row gap-2'>
                            <Button onClick={(e) => {providerAccept()}} isDisabled={loading} color='default' variant='solid'>Accept</Button>
                            <Button isDisabled={loading} color='danger' variant='solid'>Deny</Button>
                        </CardFooter>}
                        
                    </Card>}
                </ScrollShadow>}
                <CardFooter className='bg-white flex flex-row gap-2'>
                    <Textarea isDisabled={(chat.firstMessage && isPatient) || loading} value={inputMessage} onChange={(e) => {setInputMessage(e.target.value)}} variant="bordered" placeholder={chat.firstMessage ? isPatient ? 'You cannot add anymore messages until the provider accepts your request.' : 'You must accept the request before messaging this patient.' : 'Type your message...'} className='grow'/>
                    <Button onPress={(e) => {sendMessage()}} isDisabled={chat.firstMessage || inputMessage.length < 10 || loading} className='h-full' color='primary' variant='bordered'>Send</Button>
                </CardFooter>
            </Card>
        </div>
        
    ) :
    // If chat isn't available/hasn't loaded yet, this is the fallback
    (
        <div className='grow h-full flex items-center justify-center'>
            Begin a chat to start messaging!
        </div>
    
    )
}

function RealtimeChatList({openMessageModal, chatList, currentChat, updateCurrentChat, isPatient} : {openMessageModal: () => void, chatList : ChatPreview[],currentChat: ChatPreview | null, updateCurrentChat: Function, isPatient: boolean}) {
    return (
        <Card className='w-fit min-w-[200px] h-full' radius="none">
            {isPatient && <Divider/>}
            <CardBody className='flex flex-col gap-2'>
                {chatList.map((chat) => (
                    <Button isDisabled={currentChat == chat} key={isPatient ? chat.providerID : chat.patientID} className='text-left justify-start p-8' color='primary' variant='faded' onPress={() => {updateCurrentChat(chat)}}>
                        <a className='text-lg'>{isPatient ? chat.providerName : chat.patientName}<br/><span className='text-sm'>{(isPatient ? chat.providerID : chat.patientID).slice(0, 5)}</span></a>
                    </Button>
                ))}
            </CardBody>
        </Card>
    )
}

// While PatientChat and ProviderChat are very similar, they are separate components because they are rendered on different pages.
// On top of that, this allows for implementing different features between Provider and Patients
export function PatientChat() {
    const isPatient = true; // main functional difference between PatientChat and ProviderChat
    const [currentChat, setCurrentChat] = useState<ChatPreview | null>(null);
    const [chatList, setChatList] = useState<ChatPreview[]>([]);
    const [loading, setLoading] = useState(false); // Loading state for fetching chats

    const {isOpen, onOpen, onOpenChange} = useDisclosure(); // Necessary for smooth modal management in NextUI

    const refreshChats = async () => {
        setLoading(true);
        const data = await getLatestChats();
        setCurrentChat(null);
        if (data) {
            setChatList(data);
        }
        setLoading(false);
    }

    // Get latest chat list on first load.
    useEffect(() => {
        refreshChats();
    }, [])

    return (
        <Card className='flex grow h-full'>
            <NewChatModal isOpen={isOpen} onOpenChange={onOpenChange} isPatient={isPatient}/>
            <CardHeader className='bg-primary text-white flex justify-between'>
                Patient Messages
                <Button onPress={refreshChats} className='ml-2' color='danger' variant='solid'>Refresh</Button>
            </CardHeader>
            {loading ? <div className='flex flex-row items-center justify-center w-full h-full'><Spinner/></div> : 
            <div className='flex flex-row w-full h-full'>
                <ChatList openMessageModal={onOpen} chatList={chatList} currentChat={currentChat} updateCurrentChat={setCurrentChat} isPatient={isPatient}/>
                <ChatView chat={currentChat} isPatient={isPatient}/>
            </div>
            }
            
        </Card>
    )
}

// As previously stated, ProviderChat is currently almost the same, but they are separated in for future-proofing user-type-specific features
export function ProviderChat() {
    const isPatient = false; // main functional difference between PatientChat and ProviderChat
    const [currentChat, setCurrentChat] = useState<ChatPreview | null>(null);
    const [chatList, setChatList] = useState<ChatPreview[]>([]);
    const [loading, setLoading] = useState(false); // Loading state for fetching chats

    const {isOpen, onOpen, onOpenChange} = useDisclosure(); // Necessary for smooth modal management in NextUI

    const refreshChats = async () => {
        setLoading(true);
        const data = await getLatestChats(false);
        setCurrentChat(null); // If the chats are different, we don't want our "current_chat" object to be something that isn't in the updated array.
        if (data) {
            setChatList(data);
        }
        setLoading(false);
    }

    // Get latest chat list on first load.
    useEffect(() => {
        refreshChats();
    }, [])

    return (
        <Card className='flex grow h-full'>
            <NewChatModal isOpen={isOpen} onOpenChange={onOpenChange} isPatient={isPatient}/>
            <CardHeader className='bg-primary text-white flex justify-between'>
                Provider Messages
                <Button onPress={refreshChats} className='ml-2' color='danger' variant='solid'>Refresh</Button>
            </CardHeader>
            {loading ? <div className='flex flex-row items-center justify-center w-full h-full'><Spinner/></div> : 
            <div className='flex flex-row w-full h-full'>
                <ChatList openMessageModal={onOpen} chatList={chatList} currentChat={currentChat} updateCurrentChat={setCurrentChat} isPatient={isPatient}/>
                <ChatView chat={currentChat} isPatient={isPatient}/>
            </div>
            }
            
        </Card>
    )
}
*/
