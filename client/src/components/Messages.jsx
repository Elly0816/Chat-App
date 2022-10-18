import React, { useEffect, useRef } from 'react';
import Button from 'react-bootstrap/Button';

export default function Messages(props){


    const messageContainer = useRef(null);

    //This auto scrolls down to the end of the div
    useEffect(() => {
        if (props.messages){
            const msgs = messageContainer.current;
            msgs.scrollTop = msgs.scrollHeight;
        }
        
    }, [props.messages, props.chatId]);

   
    // console.log(props);

    return <div className='message-container' ref={messageContainer}>
    {props.messages.map((message, index) => <div key={index} className={message.sender.toString() === props.userId ? 'my-messages': 'other-messages'}>
    <h6>{ message.text }</h6>
    <div className='message-bottom'>
        <p className='message-time'>{ new Date(message.time).getHours() }:{new Date(message.time).getMinutes()}</p>
        { message.text !== '***This message was deleted***' && message.sender.toString() === props.userId && <Button title='delete this message' onClick={() => {props.deleteMessage(message._id)}} variant='outline' style={{fontSize: 'x-small', position: 'absolute', right: '20px'}}>X</Button>}
    </div>
    
</div> )} 
</div>
}