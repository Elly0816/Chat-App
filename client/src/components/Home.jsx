import React, { useEffect, useState } from 'react';
import Entry from './Entry';
import axios from 'axios';
import Messages from './Messages';
import Chats from './Chats';


export default function Home(props){


    const [ items, setItems ] = useState();
    const [ messages, setMessages ] = useState();
    const [ currentChatId, setCurrentChatId ] = useState();
    const [ otherUserName, setOtherUserName ] = useState();    
    const [ otherUserId, setOtherUserId ] = useState();

    

    useEffect(()=>{
        async function getChats(){
            //console.log(`${props.endpoint}chats/${props.user._id}`);
            await axios.get(`${props.endpoint}api/chats/${props.user._id}`)
            .then(response => {
                //console.log(response.data);
                const chats = response.data.chats;
                const people = response.data.otherUsers;
                const peopleAndChats = people.map((person, index) => [person, chats[index]]);
                setItems(peopleAndChats);
            })
            .catch(err => console.log(err));
        }
        getChats()
    }, [])


    //Function to set the other user's id for socket identification
    function setUserId(id){
        setOtherUserId(id);
    }

    //Socket passed down from app
    if(props.socket){
        props.socket.on('receive', (arg) => {
            //console.log(arg);
            setMessages(arg);
            // setMessages([...messages, arg])
        

        props.socket.on('deleted', (arg) => {
            //console.log(arg);
            setMessages(arg);
        })
          })
    }


    //Delete message
    function deleteMessage(id){
        if(props.socket){
            props.socket.emit('delete', {id: id,
                 otherUser: otherUserId,
                chatId: currentChatId});
        }
    }
    

    //This initally loads up the messages chat from the database
    function getMessages(id, otherUserName) {
        axios.get(`${props.endpoint}api/messages/${id}`)
        .then(response => {
            if (!response.data.messages){
                //console.log(response.data);
                setMessages([{text: `Start a chat with ${otherUserName}`}]);
            } else {
                //console.log(response.data.messages)
                setMessages(response.data.messages);
            }
        })
        .catch(err => console.log(err));
    }

    //This sets the id of the chat to load messages from in the Entry component
    function setId(id){
        setCurrentChatId(id);
    }

    return <div className='home not-header'>
                    <Chats setUserName={setOtherUserName} setUserId={setUserId} setId={setId} getMessages={getMessages} items={items}/>
                    {!messages ? <h5>Your chats are on the left. Click on one to view the messages.</h5> 
                    : <div className='message-container-container'>
                    <div><a href={`#/profile/${otherUserId}`} style={{
                        textDecoration: 'None',
                        color: 'black',
                        width: 'min-content'}}><h6>{otherUserName}</h6></a></div>
                    <Messages deleteMessage={deleteMessage} userId={props.user._id} messages={messages}/>
                        <Entry otherUserId={otherUserId} chatId={currentChatId} sendMessage={ props.sendMessage } userId={props.user._id}/>
            </div>}            
    </div>
}