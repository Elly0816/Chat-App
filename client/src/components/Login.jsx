import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

export default function Login(props){


    const endpoint = 'http://localhost:5000/';

    /*Checks if the user wants to register or login */
    const [ register, setRegister ] = useState(false);

    /*Checks if the passwords are the same for the register form */
    const [ passwordSame, setPasswordSame ] = useState(true);

    /*Set state for the values of the fields in the form and make them required */
    const [ form, setForm ] = useState({firstName:"",
                                        lastName:"",
                                        email:"",
                                        password:"",
                                        password2:""});

    useEffect(() => {
        if (register){
            setForm({firstName:"",
                 lastName:"",
                  email:"",
                   password:"",
                    password2:""});        
        }else{
            setForm({email:"",
            password:""});
        }
    }, [register]);


    /*Handles the submission of the register/login form */
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
                    props.authenticate(true);
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
            .then(response => { 
                console.log(response);
                props.authenticate(true);
             })
             .catch(err => console.log(err));
        }
    }
    
    /*Toggles between registeration and login */
    function toggleForm(){
        if (register){
            setRegister(false);
        }
        else{
            setRegister(true);
        }
    }

    /*Handles the change of input from the form */
    function handleChange(e){
        setForm({...form, [e.target.name]: e.target.value});
    }

    return <div className='login'>
        <Form onSubmit={ handleSubmit }>

            { register && <Form.Group className="mb-3" controlId="firstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control onChange={handleChange} name='firstName' value={form.firstName} type="text" placeholder="Enter First Name" />
            </Form.Group> }

            { register && <Form.Group className="mb-3" controlId="lastName">      
                <Form.Label>Last Name</Form.Label>
                <Form.Control onChange={handleChange} name='lastName' value={form.lastName} type="text" placeholder="Enter Last Name" />          
            </Form.Group> }

            <Form.Group className="mb-3" controlId="Email">
                <Form.Label>Email address</Form.Label>
                <Form.Control onChange={handleChange} name='email' value={form.email} type="email" placeholder="Enter email" />
                <Form.Text className="text-muted">
                We'll never share your email with anyone else.
                </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="Password">
                <Form.Label>Password</Form.Label>
                <Form.Control onChange={handleChange} name='password' value={form.password} type="password" placeholder="Password" />
            </Form.Group>

            { register && <Form.Group className="mb-3" controlId="Password2">
                <Form.Label>Password</Form.Label>
                    <Form.Control onChange={handleChange} name='password2' value={form.password2} type="password" placeholder="Enter your password again" />
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