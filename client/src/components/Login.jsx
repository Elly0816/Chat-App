import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login(){


    const navigate = useNavigate();

    const endpoint = 'http://localhost:5000/';

    const [ passwordSame, setPasswordSame ] = useState(true);

    function handleSubmit(e){
        e.preventDefault();
        if (register){
            const { firstName, lastName, Email, Password, Password2 } = e.target;
            if ( Password.value === Password2.value ){
                axios.post(`${endpoint}register`, {
                    firstName: firstName.value,
                    lastName: lastName.value,
                    email: Email.value,
                    password: Password.value
                })
                .then(response => {
                    console.log(response);
                })
                .catch(err => console.log(err));
            }
            else {
                setPasswordSame(false);
                setTimeout(() => { setPasswordSame(true) }, 6000);
            }
        }
        else {
            const { Email, Password } = e.target;
            axios.post(`${endpoint}login`, {
                email: Email.value,
                password: Password.value
            })
            .then(response => { console.log(response);
             })
             .catch(err => console.log(err));
        }
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

            { register && <Form.Group className="mb-3" controlId="firstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control type="text" placeholder="Enter First Name" />
            </Form.Group> }

            { register && <Form.Group className="mb-3" controlId="lastName">      
                <Form.Label>Last Name</Form.Label>
                <Form.Control type="text" placeholder="Enter Last Name" />          
            </Form.Group> }

            <Form.Group className="mb-3" controlId="Email">
                <Form.Label>Email address</Form.Label>
                <Form.Control type="email" placeholder="Enter email" />
                <Form.Text className="text-muted">
                We'll never share your email with anyone else.
                </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="Password">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" />
            </Form.Group>

            { register && <Form.Group className="mb-3" controlId="Password2">
                <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Enter your password again" />
                    { !passwordSame && <span className="error">Passwords do not match!</span>}
            </Form.Group> }

            {/* <Form.Group className="mb-3" controlId="formBasicCheckbox">
                <Form.Check type="checkbox" label="Check me out" />
            </Form.Group> */}
            <Button variant="primary" type="submit">
                Submit
            </Button>
        </Form>

        <div className='form-action'>
            <span>{ register ? 'Already Registered?' : 'Not Registered?' }</span>
            <Button onClick={toggleForm} variant="link" type="submit">
                    { register ? 'Login' : 'Register' }
            </Button>
        </div>
    </div>
}