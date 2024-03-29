import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import lodash from 'lodash';
import Form from 'react-bootstrap/Form';
import { appContext } from '../App';
import {instance} from "../config/axiosConfig";
import { Buffer } from 'buffer';
import Picture from './Picture';


export default function People(props){

    const [ people, setPeople ] = useState();

    const [ title, setTitle ] = useState();

    const [toShow, setToShow ] = useState();

    const [ filter, setFilter ] = useState();

    const { id, request } = useParams();

    const navigate = useNavigate();

    const {user, endpoint} = useContext(appContext);

    useEffect(() => {
        const controller = new AbortController();
        const {signal} = controller;
        async function getPeople(){
            if (request !== 'pendingRequests') {
                await instance.get(`/api/${request}/${id}`, {signal})
                .then(response => 
                {   
                    setTitle(`${lodash.capitalize(request)}s`);
                    setPeople(response.data.users);
                    //console.log(response.data);
                }
                )
                .catch(err => console.log(err));
            } else {
                await instance.get(`/api/request/${id}`, {signal})
                .then(response => 
                {   setTitle('Pending Requests');
                    setPeople(response.data.pending);
                //console.log(response.data);
                }
                )
                .catch(err => console.log(err));
            }
            
        }
        getPeople();
        return () => controller.abort();
        
    }, [id, request, user, endpoint]);

    async function handleClick(id, todo){
        switch (todo) {
            case "cancel sent request" :
                await instance.patch(`/api/pending-requests/${user.user._id}`, {id: id})
                .then(response => {
                props.setUser({...user, user: response.data.user})
                setPeople(people.filter((person) => person._id !== id));
                navigate(`/profile/${user.user._id}`);
                })
                .catch(err => console.log(err));
                break
            case "decline request":
                await instance.patch(`/request/${user.user._id}`, {id: id})
                .then(response => {
                props.setUser({...user, user: response.data.user})
                setPeople(people.filter((person) => person._id !== id));
                navigate(`/profile/${user.user._id}`);
                })
                .catch(err => console.log(err));
                break
            case "accept request":
                await instance.post(`/api/connection/${user.user._id}`, {id: id})
                .then(response => {
                props.setUser({...user, user: response.data.user})
                setPeople(people.filter((person) => person._id !== id));
                navigate(`/profile/${user.user._id}`);
                })
                .catch(err => console.log(err));
                break
            case "remove connection":
                await instance.patch(`/api/connection/${user.user._id}`, {id: id})
                .then(response => {
                    props.setUser({...user, user: response.data.user})
                    setPeople(people.filter(person => person._id !== id));
                    navigate(`/profile/${user.user._id}`);
                })
                .catch(err => console.log(err));
                break
            case "create chat":
                await instance.get(`/chat/${user.user._id}/${id}`)
                .then(response => {
                    navigate('/');
                })
                .catch(err => console.log(err));
                break
            default:
                //pass
                break
                
        }
    };

    useEffect(() => {
        setToShow(people);
    }, [people])


    function handleChange(e){
        setFilter(e.target.value);
        if (e.target.value.length > 0){
            let filteredPeople = people.filter(user => user.fullName.toLowerCase().includes(e.target.value.toLowerCase()));
            setToShow(filteredPeople);
        } else {
            setToShow(people);
        }
    };

    return <div className='people'>
        
        <h2>{ title }</h2>
        <hr/>
        {/*When text is typed in the form, the target username is filtered from the names on the page*/}
        <Form style={{width: '60%'}}>
            <Form.Control value={filter} 
                          onChange={handleChange}
                          type='text'
                          placeholder={`search for the name of a ${request}...`}  
                          />
        </Form>
        <hr/>
        { toShow && toShow.map(person => <div style={{display:'grid', margin: '10px', gridAutoColumns: '3fr', gridAutoFlow: 'column'}} key={person._id} className='person'>
        <Picture 
        divClassName="icon"
        src={person?.img && `data:${person.img.contentType};base64,${Buffer.from(person.img.data.data).toString('base64')}`}
        handleClick={() => {navigate(`/profile/${person._id}`)}}
        />
        <a style={{textDecoration:'none', color:'black'}} href={`/#/profile/${person._id}`}><h5>{ person.fullName}</h5></a>
        {title==='Pending Requests' && <Button
         onClick={() => handleClick(person._id, 'cancel sent request')} 
         style={{margin: '0 10px'}} variant='danger'>Cancel Request</Button>}
        {title === 'Requests' && <div>
                                    <Button 
                                    onClick={() => handleClick(person._id, 'accept request')}
                                    style={{margin: '0 10px'}} variant='success'>Accept</Button>
                                    <Button 
                                    onClick={() => handleClick(person._id, 'decline request')}
                                    style={{margin: '0 10px'}} variant='danger'>Decline</Button>
                                 </div>}
        {user.user._id === id && title === 'Connections' && <div>
                                                                    <Button 
                                                                    onClick={() => handleClick(person._id, 'remove connection')} 
                                                                    style={{margin: '0 10px'}} variant='danger'>Remove Connection
                                                                    </Button>
                                                                    <Button
                                                                    onClick={() => handleClick(person._id, 'create chat')}
                                                                    style={{margin: '0 10px'}} variant='primary'>Chat
                                                                    </Button>
                                                                 </div>}
    </div> )}
    </div>
}