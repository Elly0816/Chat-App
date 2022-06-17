import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

export default function Login(){


    const navigate = useNavigate();

    function handleSubmit(e){
        e.preventDefault();
        navigate('/home');
    }
    
    const [ register, setRegister ] = useState(false);


    function toggleForm(){
        if (register){
            setRegister(false);
        }
        else{
            setRegister(true);
        }
    }



    return <div className='login'>
        <Form onSubmit={ handleSubmit }>
            <Form.Group className="mb-3" controlId="formBasicEmail">
                
                { register && <div>
                <Form.Label>First Name</Form.Label>
                <Form.Control type="text" placeholder="Enter First Name" />
                <Form.Label>Last Name</Form.Label>
                <Form.Control type="text" placeholder="Enter Last Name" />
                </div>}

                <Form.Label>Email address</Form.Label>
                <Form.Control type="email" placeholder="Enter email" />
                <Form.Text className="text-muted">
                We'll never share your email with anyone else.
                </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" />

                { register && <div>
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Enter your password again" />
                </div>}
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicCheckbox">
                <Form.Check type="checkbox" label="Check me out" />
            </Form.Group>
            <Button variant="primary" type="submit">
                Submit
            </Button>
        </Form>
        <div className='form-action'>
            <Button onClick={toggleForm} variant="link" type="submit">
                    { register ? 'Register' : 'Login' }
            </Button>
        </div>
    </div>
}