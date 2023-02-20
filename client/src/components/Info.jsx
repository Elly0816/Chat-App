import React, { useEffect, useState, useContext, useRef } from 'react';
// import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { appContext } from '../App';
import Picture from './Picture';
import { Buffer } from 'buffer';
import {instance } from "../config/axiosConfig";



export default function Info(props){
    const {setUser, user, profileImage} = useContext(appContext);


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

    //Keeps track on if the profile user sent a request
    const [ requestSent, setRequestSent ] = useState(false);

    //This is the image to upload
    const [imageToUpload, setImageToUpload] = useState(null);

    //This shows the image for the user
    const [imageToShow, setImageToShow] = useState({image: null});

    //This state shows an upload button
    const [toUpload, setToUpload] = useState(null);


    /*This gets the details of the user whose id matches the id of use params */
    useEffect(() => {
        const controller = new AbortController();
        const {signal} = controller;
        async function getDetails(){
            await instance.get(`/api/profile/${id}`, {signal})
            .then( response => {
                //console.log(response.data.response);
                setProfile(response.data.response);
                console.log(`The id is: ${id}`);
                if (id === user.user._id){
                    setIsUser(true);
                    // props.changeUser({...user.user, auth: user.auth, user: response.data.response});
                } else {
                    setIsUser(false);
                }
                })
                .then(() => {
                    if (!isUser){
                        if (profile.img?.data?.data){
                            const image = `data:${profile.img.contentType};base64,${Buffer.from(profile.img.data.data).toString('base64')}`;
                            console.log(profile.img.contentType);
                            setImageToShow({image: image});
                        }
                        if(profile._id){
                            if ((profile.connections.includes(user.user._id)) || 
                            (profile.requests.includes(user.user._id))) {
                            setReqDisabled(true);
                            } else {
                                setReqDisabled(false);
                            }
                            if (profile.connections.includes(user.user._id)) {
                                setConnected(true);
                            } else {
                                setConnected(false);
                            }
                            if (profile.pendingRequests.includes(user.user._id)){
                                setRequestSent(true);
                            } else {
                                setRequestSent(false);
                            }
                        }
                    } else {
                        setImageToShow({image: profileImage});
                    }
                })
            .catch(err => {
                console.log(err);
                // props.changeUser(false);
            });
        }
        getDetails()
        return () => controller.abort();
    }, [id, profile._id, user.user._id]);

    

    /*Function to change the details of the user */
    function handleSubmit(e){
        //console.log('submit clicked');
        e.preventDefault();
        async function changeDetails(){
            await instance.patch(`/api/profile/${id}`, {
                firstName: profile.firstName,
                lastName: profile.lastName,
                fullName: `${profile.firstName} ${profile.lastName}`,
                email: profile.email
            })
            .then( response => {
                console.log(response.data.response);
                setUser({...user, user: response.data.response});
            })
            .catch(err => {
                console.log(err);
            })
        }
        changeDetails();
        

    }

    function handleChange(e){
        setProfile({...profile, [e.target.name]:e.target.value});
        //console.log(profile[e.target.name]);
    }

    /*Function to send requests to another user*/
    function sendRequest(e){
        async function requestSender(){
            await instance.post(`/api/request/${user.user._id}`, {id: id})
            .then( response => {
                //console.log(response);
                // props.changeUser({...user.user, user: response.data.user});
                setReqDisabled(true);
            })
            .catch(err => console.log(err));
        }
        requestSender(); 
    }

    function getRequests(request){
        navigate(`/${request}/${profile._id}`);
    }

    function acceptRequest(){
        async function accept(){
            await instance.post(`/api/connection/${user.user._id}`, {id: id})
                .then(response => {
                setUser({...user, user: response.data.user})
                setConnected(true);
                })
                .catch(err => console.log(err));
        }
        accept();
    }

    function removeConnection(){
        async function remove(){
            await instance.patch(`/api/connection/${user.user._id}`, {id: id})
                .then(response => {
                    setUser({...user, user: response.data.user})
                    setConnected(false);
                    profile.connections.filter(connection => connection !== user.user._id);
                })
                .catch(err => console.log(err));
        }
        remove();
    }
    
    //Creates or returns chat between two users
    async function createChat(){
        await instance.get(`/api/chat/${user.user._id}/${profile._id}`)
        .then(response => {
            //console.log(response);
            navigate("/");
        })
    }

    //helps with uploading images to the server
    function pickImage(e){
        if (e.target.files.length !== 0){
            setImageToShow({image: URL.createObjectURL(e.target.files[0])});
            // console.log(e.target.files);
            const formData = new FormData();
            formData.append('image', e.target.files[0]);
            setImageToUpload(formData);
            setToUpload(true);
        }
            };

    //This uploads the image to the server
    async function uploadImage(){
        console.log(imageToUpload.values());
        await instance.post(`/api/profImgUpload/${user.user._id}`, imageToUpload, 
        {headers: {'Content-Type': 'multipart/form-data'}})
        .then(res => {
            console.log(res.data.response);
            const userResponse = res.data.response;
            setUser({...user, user: userResponse});
            navigate(`/profile/${user.user._id}`);
        })
        setToUpload(false);
    }

    //this helps with picking the image
    const inputRef = useRef(null);

    function clickInput(){
        inputRef.current.click();
    };


    return <div className='infoPage not-header'>
                    <Picture
                    inputRef={inputRef}
                    handleClick={isUser && clickInput} 
                    divClassName='p-p-div'
                    src={imageToShow.image}
                    alt={profile.fullName}
                    canInput = {isUser && true} 
                    mine={isUser ? 'profile-img mine' : 'profile-img'}
                    handleChange={pickImage}
                    title={isUser ? 'change profile picture' : `${profile.fullName}'s profile picture`}
                    />
                    {toUpload && <button onClick={uploadImage} className='upload-button'>Upload Image</button>}
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
                                <h6>{ profile.pendingRequests.length }</h6>
                            </div> }
                            
                            {!requestSent && !connected && user.auth &&  !isUser && <Button type="button" onClick={sendRequest} disabled={reqDisabled} variant='primary'>{reqDisabled ? 'Request Sent' : 'Send Request'}</Button>}
                            {!requestSent && connected && !isUser && user.auth && <div>
                                                                                            <Button style={{margin:"0.2em"}} type="button" onClick={removeConnection} variant='danger'>Remove</Button>
                                                                                            <Button style={{margin:"0.2em"}} type="button" onClick={createChat} variant='primary'>Chat</Button>
                                                                                        </div>}    
                            {requestSent && !connected && user.auth &&  !isUser && <Button type="button" onClick={acceptRequest} variant='success'>Accept Request</Button>}
                        </div>  

                    </div>
                    
            </div>
}