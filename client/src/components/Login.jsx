import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';

export default function Login(props){


    const navigate = useNavigate();

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
    
    
    /*This keeps track of whether the user already exists */
    const [ exists, setExists ] = useState(false);

    /*This checks if the login attempt was unsuccessful */
    const [ loginFailure, setLoginFailure ] = useState(false);


    /*This toogles the form state between register and login */
    // useEffect(() => {
    //     if (register){
    //         setForm({firstName:"",
    //              lastName:"",
    //               email:"",
    //                password:"",
    //                 password2:""});        
    //     }else{
    //         setForm({email:"",
    //         password:""});
    //     }
    // }, [register]);


    /*Handles the submission of the register/login form */
    async function handleSubmit(e){
        e.preventDefault();
        /*This handles registeration */
        if (register){
            const { firstName, lastName, email, password, password2 } = form;
            if ( password === password2 ){
                await axios.post(`${props.endpoint}api/register`, {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: password
                })
                .then(response => {
                    //console.log(response.data);
                    if (response.data.response === 'login'){
                        setRegister(false);
                        setExists(true);
                        setTimeout(() => {setExists(false)}, 6000);
                    } else if (response.data.response === 'register'){
                        setRegister(true);
                    } else {
                        //console.log(response.data.user);
                        /*This saves the user to the local storage for login persistence*/
                        localStorage.setItem('user', JSON.stringify(response.data.user));
                        axios.defaults.headers.common['Authorization'] = 
                        'Bearer'+response.data.token;
                        props.authenticate({auth: true, user: response.data.user});
                        navigate("/");
                    }
                })
                .catch(err => console.log(err));
            }
            else {
                setPasswordSame(false);
                setTimeout(() => { setPasswordSame(true) }, 6000);
            }
        }
        else {
            /*This handles login */
            const { email, password } = form;
            await axios.post(`${props.endpoint}api/login`, {
                email: email,
                password: password
            })
            .then(response => { 
                //console.log(response);
                if (response.data.response === 'login'){
                    setRegister(false);
                } else if (response.data.response === 'Incorrect Credentials'){
                    setLoginFailure(true);
                } else {
                    //console.log(response.data.user);
                    /*This saves the user to the local storage for login persistence*/
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    axios.defaults.headers.common['Authorization'] =
                    'Bearer'+response.data.token;
                    props.authenticate({auth: true, user: response.data.user});
                    navigate('/');
                }
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

    return <div className='loginPage'>
        <section className='loginSide'>
            <h4>Welcome to Hi-Chat!</h4>
            { register ? <h1> Sign Up </h1> : <h1> Login </h1>}
            <div className='sideText'>
                <p>Find your friends, make connections and send messages on Hi-Chat!</p>
            </div>
            <Footer/>
        </section>
        <section className='loginForm'>
            <Form onSubmit={ handleSubmit }>
                { loginFailure && <div>
                                <span className='error'>
                                    Invalid username or password!
                                </span>
                            </div> }

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

                { exists && <div>
                                <span className='error'>
                                    This User already exists. Login instead.
                                </span>
                            </div> }

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
        </section>
    </div>
}