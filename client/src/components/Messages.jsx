import React, { useEffect, useRef } from 'react';

export default function Messages(props){


    const messageContainer = useRef(null);


    useEffect(() => {
        if (props.messages){
            const msgs = messageContainer.current;
            msgs.scrollTop = msgs.scrollHeight;
        }
        
    }, [props.messages]);




    return <div className='message-container' ref={messageContainer}>{props.messages.map((message, index) => <div key={index} className='messages'>
    <h6>{ message }</h6>
</div> )} 
</div>
}