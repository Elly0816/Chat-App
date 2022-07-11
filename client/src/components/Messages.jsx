import React, { useEffect, useRef } from 'react';

export default function Messages(props){


    const messageContainer = useRef(null);

    //This auto scrolls down to the end of the div
    useEffect(() => {
        if (props.messages){
            const msgs = messageContainer.current;
            msgs.scrollTop = msgs.scrollHeight;
        }
        
    }, [props.messages]);




    return <div className='message-container' ref={messageContainer}>{props.messages.map((message, index) => <div key={index} className='messages'>
    <h6>{ message.text }</h6>
    <p>{ new Date(message.time).getHours() }:{new Date(message.time).getMinutes()}:{new Date(message.time).getSeconds()}</p>
</div> )} 
</div>
}