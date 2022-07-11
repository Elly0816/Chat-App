import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';



export default function Entry(props){

    const [ message, setMessage ] = useState("");

    function handleChange(e){
        setMessage(e.target.value);
    }

    function handleSubmit(e){
        e.preventDefault();
        props.sendMessage({message: message, chatId: props.chatId, senderId: props.userId});
        setMessage("");

    }


    return <div className='entry'>
        <Form className='entry-form' onSubmit={handleSubmit}>
            <Form.Group className="mb-12" controlId="exampleForm.ControlTextarea1">
                <Form.Control autoComplete='off' value={message} onChange={handleChange} rows={3} placeholder="Message"/>
            </Form.Group>
        </Form>
        <Button onClick={handleSubmit} className='button' variant='success' type='submit' >Send</Button>
    </div>
}