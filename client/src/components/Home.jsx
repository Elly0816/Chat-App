import React, { useEffect, useRef, useState } from 'react';
import Entry from './Entry';
import axios from 'axios';
import Messages from './Messages';
import Chats from './Chats';


export default function Home(props){


    const [ items, setItems ] = useState();
    const [ messages, setMessages ] = useState();

    

    useEffect(()=>{
        async function getChats(){
            console.log(`${props.endpoint}chats/${props.user._id}`);
            await axios.get(`${props.endpoint}chats/${props.user._id}`)
            .then(response => {
                console.log(response.data);
                const chats = response.data.chats;
                const people = response.data.otherUsers;
                const peopleAndChats = people.map((person, index) => [person, chats[index]]);
                setItems(peopleAndChats);
            })
            .catch(err => console.log(err));
        }
        getChats()
    }, [])

    function getMessages(id, otherUserId) {
        axios.get(`${props.endpoint}messages/${id}`)
        .then(response => {
            if (!response.data.message){
                setMessages([`Start a chat with ${otherUserId}`])
            } else {
                setMessages(response.data.messages)
            }
        })
        .catch(err => console.log(err));
    }

    return <div className='home'>
                    <Chats getMessages={getMessages} items={items}/>
                    {!messages ? <h5>Your chats are on the left. Click on one to view the messages.</h5> 
                    : <div className='message-container-container'><Messages messages={messages}/><Entry sendMessage={ props.sendMessage }/>
            </div>}            
    </div>
}