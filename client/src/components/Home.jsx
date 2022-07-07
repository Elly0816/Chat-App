import React, { useEffect, useRef, useState } from 'react';
import Entry from './Entry';


export default function Home(props){

    const messageContainer = useRef(null);

    useEffect(() => {
        const msgs = messageContainer.current;
        msgs.scrollTop = msgs.scrollHeight;
    }, [props.messages]);

    return <div className='home'>
            <div className='chats'>
                { props.user.connections?.map(connection =>  <div key={connection}> <p>{connection}</p></div> )}
                {/* <p>{props.user.connections}, {typeof(props.user.connections)}</p> */}
            </div>
            <div className='message-container-container'>
                <div className='message-container' ref={messageContainer}>
                    {props.messages.map((message, index) => <div key={index} className='messages'>
                                                        <h6>{ message }</h6>
                                                    </div>
                    )}
                    
                </div>
                <Entry sendMessage={ props.sendMessage }/>
            </div>
    </div>
}