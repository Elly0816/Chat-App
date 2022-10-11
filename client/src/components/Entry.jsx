import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { ArrowRight } from 'react-bootstrap-icons';



export default function Entry(props){

    const [ message, setMessage ] = useState("");

    function handleChange(e){
        setMessage(e.target.value);
    }

    function handleSubmit(e){
        e.preventDefault();
        if (!(message && message.trim())){ //This does not allow just spaces to be sent
            //pass
        } else {
            props.sendMessage({message: message,
             chatId: props.chatId,
             senderId: props.userId,
             otherUserId: props.otherUserId});
            setMessage("");
        }
    }


    return <div className='entry'>
        <Form className='entry-form' onSubmit={handleSubmit}>
            <Form.Group className="mb-12" controlId="exampleForm.ControlTextarea1">
                <Form.Control autoComplete='off' value={message} onChange={handleChange} rows={3} placeholder="Write a message..."/>
            </Form.Group>
        </Form>
        <Button onClick={handleSubmit} className='button' variant='primary' type='submit' ><ArrowRight /></Button>
    </div>
}