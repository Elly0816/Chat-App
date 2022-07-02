import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { Button } from 'react-bootstrap';


export default function Info(props){

    const {id} = useParams();

    const navigate = useNavigate();

    /*This keeps track of the profile returned from the api call */
    const [ profile, setProfile ] = useState({_id: null});

    /*Keeps track on if the current info page belogs to the logged in user */
    const [ isUser, setIsUser ] = useState(false);

    /*Keeps track of the button for sending requests */
    const [ reqDisabled, setReqDisabled ] = useState(false);

    //Keeps track on if you're connected to the user
    const [ connected, setConnected ] = useState(false);


    /*This gets the details of the user whose id matches the id of use params */
    useEffect(() => {
        async function getDetails(){
            await axios.get(`${props.endpoint}profile/${id}`)
            .then( response => {
                console.log(response.data.response);
                setProfile(response.data.response);
                console.log(`The id is: ${id}`);
                if (id === props.user.user._id){
                    setIsUser(true);
                    props.changeUser({...props.user, user: response.data.response});
                } else {
                    setIsUser(false);
                }
                if ((profile.connections.includes(props.user.user._id)) || 
                (profile.requests.includes(props.user.user._id))) {
                    setReqDisabled(true);
                }
                if (profile.connections.includes(props.user.user._id)) {
                    setConnected(true);
                }
                })
            .catch(err => {
                console.log(err);
            });
        }
        getDetails();
        
    }, [id, profile._id]);


    /*Function to change the details of the user */
    function handleSubmit(e){
        console.log('submit clicked');
        e.preventDefault();
        async function changeDetails(){
            await axios.patch(`${props.endpoint}profile/${id}`, {
                firstName: profile.firstName,
                lastName: profile.lastName,
                fullName: `${profile.firstName} ${profile.lastName}`,
                email: profile.email
            })
            .then( response => {
                console.log(response.data.response);
                props.changeUser({...props.user, user: response.data.response});
            })
            .catch(err => {
                console.log(err);
            })
        }
        changeDetails();
        navigate(`/profile/${id}`);

    }

    function handleChange(e){
        setProfile({...profile, [e.target.name]:e.target.value});
        console.log(profile[e.target.name]);
    }

    /*Function to send requests to another user*/
    function sendRequest(e){
        async function requestSender(){
            await axios.post(`${props.endpoint}request/${props.user.user._id}`, {id: id})
            .then( response => {
                console.log(response);
                props.changeUser({...props.user, user: response.data.user});
                setReqDisabled(true);
            })
            .catch(err => console.log(err));
        }
        requestSender(); 
    }

    function getRequests(request){
        navigate(`/${request}/${profile._id}`);
    }

    return <div>
                    <h2>{profile.fullName}</h2>
                    <div className='info'>
                    <div className='info-1'>
                        <Form onSubmit={ handleSubmit }>
                            <Form.Group>
                                    <Form.Label>First Name:</Form.Label>
                                    <Form.Control disabled={!isUser} name='firstName' value={ profile.firstName ? profile.firstName : ""  } onChange={ handleChange }></Form.Control>
                                    <Form.Label>Last Name:</Form.Label>
                                    <Form.Control disabled={!isUser} name='lastName' value={ profile.lastName ? profile.lastName : ""  } onChange={ handleChange }></Form.Control>
                                    <Form.Label>Email:</Form.Label>
                                    <Form.Control disabled={!isUser} name='email' value={ profile.email ? profile.email : ""  } onChange={ handleChange }></Form.Control>
                                    
                            </Form.Group>
                            { isUser && <Button style={{margin: "10px 10px 10px 0"}} variant="primary" type="submit">Submit</Button> }
                        </Form>
                    </div>
                        
                        <div className='info-2'>
                            { profile.connections && <div onClick={ () => getRequests('connection')}>
                                <span>Connections:</span>
                                <h6>{ profile.connections.length }</h6>
                            </div> }

                            { (isUser && profile.requests) && <div onClick={ () => getRequests('request') }>
                                <span>Requests:</span>
                                <h6>{ profile.requests.length }</h6>
                            </div> }

                            { isUser && <div onClick={ () => getRequests('pendingRequests') }>
                                <span>Pending Requests:</span>
                                <h6>{ props.user.user.pendingRequests.length }</h6>
                            </div> }
                            
                            {!connected && props.user.auth &&  !isUser && <Button onClick={(sendRequest)} disabled={reqDisabled} type='primary'>{reqDisabled ? 'Request Sent' : 'Send Request'}</Button>}
                            {connected && <Button variant='danger'>Remove from Connections</Button>}    
                        </div>  

                    </div>
                    
            </div>
}