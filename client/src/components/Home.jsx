import React, { useEffect, useRef, useState } from 'react';
import Entry from './Entry';
import axios from 'axios';


export default function Home(props){

    const messageContainer = useRef(null);

    const [ items, setItems ] = useState();
    const [ messages, setMessages ] = useState();

    useEffect(() => {
        const msgs = messageContainer.current;
        msgs.scrollTop = msgs.scrollHeight;
    }, [props.messages]);

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

    return <div className='home'>
            <div className='chats'>
                { items?.map((item) =>  <div key={item[0]._id}>
                    <a style={{textDecoration: 'None', color: 'black'}} href={`/profile/${item[0]._id}`}><p>{item[0].fullName}</p></a><hr/>
                 </div> )}
            </div>
            <div className='message-container-container'>
                <div className='message-container' ref={messageContainer}>
                    {!messages ? <h5>Your chats are on the right. Click on one to view the messages.</h5> 
                    : props.messages.map((message, index) => <div key={index} className='messages'>
                                                        <h6>{ message }</h6>
                                                    </div>
                    )}
                    
                    
                </div>
                <Entry sendMessage={ props.sendMessage }/>
            </div>
    </div>
}