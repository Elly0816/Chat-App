import React, { useEffect, useState } from 'react';
import Entry from './Entry';
import axios from 'axios';
import Messages from './Messages';
import Chats from './Chats';
import { appContext } from '../App';
import { useContext } from 'react';


export default function Home(props){


    const [ items, setItems ] = useState();
    const [ messages, setMessages ] = useState();
    const [ currentChatId, setCurrentChatId ] = useState();
    const [ otherUserName, setOtherUserName ] = useState();    
    const [ otherUserId, setOtherUserId ] = useState();
    const [receivedMessages, setReceivedMessages] = useState();

    const {socket, user, endpoint } = useContext(appContext);

    useEffect(()=>{
        async function getChats(){
            //console.log(`${endpoint}chats/${user.user._id}`);
            await axios.get(`${endpoint}api/chats/${user.user._id}`)
            .then(response => {
                //console.log(response.data);
                const chats = response.data.chats;
                const people = response.data.otherUsers;
                const peopleAndChats = people.map((person, index) => [person, chats[index]]);
                setItems(peopleAndChats);
            })
            .catch(err => console.log(err));
        }
        getChats();
    }, []);


    //Function to set the other user's id for socket identification
    // function setUserId(id){
    //     setOtherUserId(id);
    // }

    //Socket passed down from app
    if(socket){
        socket.on('receive', (arg) => {
            setReceivedMessages(arg)
        })
        socket.on('deleted', (arg) => {
            //console.log(arg);
            setMessages(arg);
        });
    };

    useEffect(()=>{
                //if the chat id of the last message is the same as the current chat in view, 
                //Show the messages
                if(receivedMessages){
                    let lastMessage = receivedMessages[receivedMessages.length -1];
                    console.log(lastMessage);
                    if (lastMessage.chatId === currentChatId){
                        console.log(`currentChatId: ${currentChatId}`);
                        console.log(`last message chat Id: ${lastMessage.chatId}`);
                        setMessages(receivedMessages);
                        console.log(`The chat is in view`);
                    } else {
                        console.log(`The current chat is not in view`);
                    }
                }
               
    },[receivedMessages]);
    


    


    //Delete message
    function deleteMessage(id){
        if(socket){
            socket.emit('delete', {id: id,
                 otherUser: otherUserId,
                chatId: currentChatId});
        }
    }
    

    //This initally loads up the messages chat from the database
    function getMessages(id, otherUserName) {
        axios.get(`${endpoint}api/messages/${id}`)
        .then(response => {
            if (!response.data.messages){
                //console.log(response.data);
                setMessages([{text: `Start a chat with ${otherUserName}`}]);
            } else {
                //console.log(response.data.messages)
                console.log('This is in the get messages function');
                setMessages(response.data.messages);
            }
        })
        .catch(err => console.log(err));
    }

    //This sets the id of the chat to load messages from in the Entry component
    // function setChatId(id){
    //     setCurrentChatId(id);
    // }

    return <div className='home not-header'>
                <Chats setUserName={setOtherUserName}
                        setOtherUserId={setOtherUserId}
                        setChatId={setCurrentChatId}
                        getMessages={getMessages}
                        items={items}/>
                {!messages ? <h5>Your chats are on the left. Click on one to view the messages.</h5> 
                : <div className='message-container-container'>
                    <div className='message-name'><h6 style={{width: 'fit-content'}}><a href={`#/profile/${otherUserId}`} style={{
                    textDecoration: 'None',
                    color: '#984e3'}}>{otherUserName}</a></h6></div>
                    <Messages chatId={currentChatId} deleteMessage={deleteMessage} userId={user.user._id} messages={messages}/>
                    <Entry otherUserId={otherUserId} chatId={currentChatId} sendMessage={ props.sendMessage } userId={user.user._id}/>
                </div>}            
    </div>
} 

