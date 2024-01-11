'use client'
import { useState, useEffect } from "react";
import { getAllProviderProfiles, ChatMessage, ChatPreview, getChatLog, getChatPreviews, startNewChat, providerAcceptsChat, addNewChatMessage } from "../utils/chat_utils";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Modal, User, Card, CardHeader, Button, Spinner, CardBody, Divider, Avatar, CardFooter, Textarea, Accordion, Autocomplete, AutocompleteItem, useDisclosure, ModalContent, ModalHeader, ModalBody, ModalFooter, ScrollShadow } from "@nextui-org/react";
import { Database } from "@/types/supabase";

type ProviderProfile = Database['public']['Tables']['provider_profiles']['Row'] // getting profile type from Supabase DB

function RealtimeChatView({chat, isPatient=true, currentChatMessages}: {chat: ChatPreview | null, currentChatMessages: ChatMessage[] | null, isPatient?: boolean}) {
    const [loading ,setLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[] | null>(currentChatMessages);
    const [newMessage, setNewMessage] = useState<string>('');

    const sendMessage = async () => {
        setLoading(true);
        if (chat) {
            await addNewChatMessage(chat.providerID, chat.patientID, {senderID: isPatient ? chat.patientID : chat.providerID, message: newMessage,timestamp: new Date().toISOString()}, isPatient);
        }
        setLoading(false);
    }

    const providerAcceptance = async () => {
        setLoading(true);
        if (chat) {
            await providerAcceptsChat(chat.providerID, chat.patientID);
        }
        setLoading(false);
    }

    useEffect(() => {
        setMessages(currentChatMessages);
    }, [currentChatMessages])

    return chat ? (
        <Card shadow="none" className='grow z-[10]' radius="none">
            <CardHeader>
                <div className='w-fit flex flex-row items-center justify-center gap-2'>
                    <Avatar name={isPatient ? chat.providerName : chat.patientName}/>
                    <div className='flex flex-col'>
                        <h1 className='text-xl'>{isPatient ? chat.providerName : chat.patientName}</h1>
                        <p className='text-sm'>{isPatient ? 'Care Provider' : 'Patient'}</p>
                    </div>
                </div>
            </CardHeader>
            <Divider/>
            <CardBody>
            <ScrollShadow className='flex flex-col gap-3 p-4'>
                {messages && messages.map((message) => {
                    const selfID = isPatient ? chat.patientID : chat.providerID;
                    const selfName = isPatient ? chat.patientName : chat.providerName;
                    const otherName = selfName == chat.patientName ? chat.providerName : chat.patientName;
                    // messages should render on left or right depending on if it was sent by current user
                    return (
                        <div className={`w-full flex justify-end gap-3 ${selfID == message.senderID ? ' flex-row' : 'flex-row-reverse'}`}>
                            <div className={selfID == message.senderID ? 'text-right' : 'text-left'}>
                                <h3 className='text-sm font-[600]'>{selfID == message.senderID ? selfName : otherName}</h3>
                                <p className='max-w-[400px] font-[400]'>{message.message}</p>
                            </div>
                            <Avatar name={selfID == message.senderID ? selfName : otherName} className=''/>
                        </div>
                    )
                })}
                { // here we are checking if this is an "initial message" that the provider has not accepted yet
                chat.firstMessage && (isPatient ? (
                    <div className='rounded-md bg-secondary bg-opacity-[0.8] w-fit mx-auto p-4 text-white text-center'>
                        You cannot continue the conversation until the provider accepts your request.
                    </div>
                ) : 
                <div className='rounded-md flex flex-col bg-secondary bg-opacity-[0.8] w-fit mx-auto p-4 text-white text-center'>
                    You have not chosen to accept this patient's request.
                    <Button onPress={() => {providerAcceptance()}} variant='solid' className='mt-3'>Accept Patient</Button>
                </div>)}
            </ScrollShadow>
            </CardBody>
            <CardFooter>
                <div className='flex flex-row items-center justify-center gap-2 w-full items-'>
                    <Textarea isDisabled={loading} value={newMessage} onChange={(e) => {setNewMessage(e.target.value)}} className='grow' size="sm" variant="bordered" placeholder={chat.firstMessage ? '' : 'Type a message...'}/>
                    <Button onPress={(e) => {sendMessage()}} isDisabled={loading || newMessage.length < 10} color='primary' className='py-7' variant='flat'>Send</Button>
                </div>
            </CardFooter>
        </Card>
    ) : (
        <Card shadow="none" className='grow h-full z-[10] flex items-center justify-center' radius="none">
            Select a chat to get started!
        </Card>
    )
}

// UI Component for rendering list of chats
function RealtimeChatList({chatList, isPatient=true, currentChat, updateChat}: {chatList: ChatPreview[], isPatient?: boolean, currentChat: ChatPreview | null, updateChat: (chat: ChatPreview) => void}) {
    return (
        <Card shadow="md" radius="none" className='w-fit min-w-[200px] z-[20]'>
            <CardHeader>
                Chat List
            </CardHeader>
            <Divider/>
            <div className='flex flex-col gap-2'>
                {chatList.map((chat) => {
                    const chatLastUpdated = new Date(chat.lastUpdated)
                    const patientLastViewed = new Date(chat.patient_last_viewed)
                    const providerLastViewed = chat.provider_last_viewed ? new Date(chat.provider_last_viewed) : null
                    const chatUnread = isPatient ? patientLastViewed < chatLastUpdated : providerLastViewed ? providerLastViewed < chatLastUpdated : true;
                    return (
                        <Button radius="none" key={chat.conversationID} isDisabled={chat == currentChat} onPress={(e) => {updateChat(chat)}} className='text-left flex flex-row gap-4 justify-between py-8' color='secondary' variant='flat'>
                            <User name={isPatient ? chat.providerName : chat.patientName} description={new Intl.DateTimeFormat('default', { hour: 'numeric', minute: 'numeric' }).format(chatLastUpdated)}/>
                        </Button>
                    )})}
            </div>
        </Card>
    )
}

// Presuming that new chats are only started by patients
export function NewChatModal({isOpen, onOpenChange}: {isOpen: boolean, onOpenChange: (isOpen: boolean) => void}) {
    const [loading, setLoading] = useState(true);
    const [availableProviders, setAvailableProviders] = useState<ProviderProfile[] | null>([]); // List of available providers to choose from
    const [chosenProfileID, setChosenProfileID] = useState<string | null>(null); // ID of chosen provider
    const [message, setMessage] = useState<string>(''); // Message to send to provider

    // Gets list of latest provider
    const findProviders = async () => {
        setLoading(true);
        const providers = await getAllProviderProfiles();
        if (providers) {
            setAvailableProviders(providers); // server-side function to get providers
        } else {
            setAvailableProviders(null);
        }
        setLoading(false);
    }

    const packAndStartChat = async () => {
        setLoading(true);
        if (chosenProfileID && availableProviders) {
            // find profile by ID and get name
            const {first_name, last_name} = availableProviders.filter((provider) => provider.id == chosenProfileID)[0];
            const name = first_name + ' ' + last_name
            await startNewChat(chosenProfileID, message);
        }
        setLoading(false);
    }

    useEffect(() => {
        findProviders();
    }, [])

    useEffect(() => {console.log(chosenProfileID)},[chosenProfileID])

    return (
        <Modal className='w-fit !min-h-[unset]' isDismissable={false} hideCloseButton isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>New Chat</ModalHeader>
                        <ModalBody className=''>
                            {availableProviders && <Autocomplete isDisabled={loading} isLoading={loading} onSelectionChange={(e) => {return setChosenProfileID(e ? e.toString() : null)}} label="Search providers by name...">
                                {availableProviders.map((provider) => (
                                    <AutocompleteItem key={provider.id} value={provider.first_name + provider.last_name}>
                                        {provider.first_name + ' ' + provider.last_name}
                                    </AutocompleteItem>
                                ))}
                            </Autocomplete>}
                            <Textarea isDisabled={loading} value={message} onChange={(e) => {setMessage(e.target.value)}}size="sm" variant="flat" placeholder='How can the doctor help?'/>
                        </ModalBody>
                        <ModalFooter className='grid grid-cols-2'>
                            <Button isDisabled={loading} color="danger" variant="bordered" onClick={onClose}>Cancel</Button>
                            <Button isDisabled={loading || message.length < 10 || !chosenProfileID} color="secondary" onClick={packAndStartChat}>Send</Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

export function RealtimeChat({isPatient=true}: {isPatient?: boolean}) {
    /* 
    This is the parent UI component of everything related to chat.
    Fetching the latest database and chats, saving them to user selection, and listening to updates ia all handled within React state in this function

    All sub-UI-components (i.e. chatlist, chatmessageviews) are passed the latest state as props, and rendered accordingly in functions above
    */

    const [loading, setLoading] = useState(true);
    const [chatList, setChatList] = useState<ChatPreview[]>([]); // Saves all user chats as a list of ChatPreview objects
    const [currentChat, setCurrentChat] = useState<ChatPreview | null>(null); // Saves the current chat that the user is viewing
    const [currentChatMessages, setCurrentChatMessages] = useState<ChatMessage[] | null>(null); // Saves the current chat's messages as a list of Message objects
    const supabase = createClientComponentClient(); // Initializing supabase client for real-time chats

    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const fetchChats = async () => {
        setLoading(true)
        const chats = await getChatPreviews(isPatient);
        if (chats) {
            const tempChatID = currentChat ? currentChat.conversationID : null;
            setChatList(chats);
            // find same chat in updated chatlist via conversationID and set that to currentchat
            if (tempChatID) {
                const newChat = chats.filter((chat) => chat.conversationID == tempChatID)[0];
                setCurrentChat(newChat);
            }
        }
        setLoading(false);

        await getCurrentChatMessages();
    }

    const getCurrentChatMessages = async () => {
        setLoading(true);
        if (currentChat) {
            const data = await getChatLog(currentChat.providerID, currentChat.patientID);
            if (data) {
                setCurrentChatMessages(data);
            } else {
                setCurrentChatMessages(null);
            }
        } else {
            setCurrentChatMessages(null);
        }
        setLoading(false);
    }

    // Should check for chats on first load + trigger update mechanism
    useEffect(() => {
        setLoading(true); // Make sure we're still in loading state for fetching chats
        
        const chat_channel = supabase
            .channel('new_chats')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'chats'},
                (payload) => {
                    // Here, I can filter by events depending on whether a row is inserted (new chat initiated) or if row is updated (likely message viewed)
                    console.log(payload);
                    // for now, there are some glitches with the chat preview updating, so we will just do a full refetch and chatMessage refresh
                    fetchChats();
                }
            )
            .subscribe();

        setLoading(false);
        return () => {
            supabase.removeChannel(chat_channel);
        }
    }, [supabase, chatList, setChatList])

    // Triggered whenever currentChat is changed, meaning that messages should be updated
    useEffect(() => {
        getCurrentChatMessages();
    }, [currentChat])
    
    // On first load, we will pull the latest chat previews from DB
    useEffect(() => {
        fetchChats();
    }, [])

    // 2d2c4a8c-a59d-46ba-84fa-1a76a896c391
    // 6fd7366e-b254-4852-9398-e126c1442388

    return (
        <Card className='flex grow h-full'>
            <NewChatModal isOpen={isOpen} onOpenChange={onOpenChange}/>
            <CardHeader className='bg-primary text-white flex gap-6 items-center'>
                {isPatient ? 'Patient' : 'Provider'} Messages
                {isPatient && // only patients can create new messages
                <Button onPress={(e) => {onOpen()}} className=''>💬 New Message</Button>}
            </CardHeader>
            {loading ? <div className='flex flex-row items-center justify-center w-full h-full'><Spinner/></div> :
            <CardBody className='w-full h-full flex flex-col p-0'>
                
                <Divider/>
                <div className='w-full h-full grow flex flex-row'>
                    <RealtimeChatList currentChat={currentChat} updateChat={setCurrentChat} isPatient={isPatient} chatList={chatList}/>
                    <RealtimeChatView currentChatMessages={currentChatMessages} isPatient={isPatient} chat={currentChat}/>
                </div>
                
            </CardBody>}
            
        </Card>
    )
}