import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import lodash from 'lodash';

export default function People(props){

    const [ people, setPeople ] = useState();

    const [ title, setTitle ] = useState();

    const { id, request } = useParams();

    const navigate = useNavigate();

    useEffect(() => {
        async function getPeople(){
            if (request !== 'pendingRequests') {
                await axios.get(`${props.endpoint}api/${request}/${id}`)
                .then(response => 
                {   
                    setTitle(`${lodash.capitalize(request)}s`);
                    setPeople(response.data.users);
                    //console.log(response.data);
                }
                )
                .catch(err => console.log(err));
            } else {
                await axios.get(`${props.endpoint}api/request/${id}`)
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
    }, [id, request, props.user, props.endpoint]);

    function handleClick(id, todo){
        switch (todo) {
            case "cancel sent request" :
                axios.patch(`${props.endpoint}api/pending-requests/${props.user.user._id}`, {id: id})
                .then(response => {
                props.setUser({...props.user, user: response.data.user})
                setPeople(people.filter((person) => person._id !== id));
                navigate(`/profile/${props.user.user._id}`);
                })
                .catch(err => console.log(err));
                break
            case "decline request":
                axios.patch(`${props.endpoint}request/${props.user.user._id}`, {id: id})
                .then(response => {
                props.setUser({...props.user, user: response.data.user})
                setPeople(people.filter((person) => person._id !== id));
                navigate(`/profile/${props.user.user._id}`);
                })
                .catch(err => console.log(err));
                break
            case "accept request":
                axios.post(`${props.endpoint}api/connection/${props.user.user._id}`, {id: id})
                .then(response => {
                props.setUser({...props.user, user: response.data.user})
                setPeople(people.filter((person) => person._id !== id));
                navigate(`/profile/${props.user.user._id}`);
                })
                .catch(err => console.log(err));
                break
            case "remove connection":
                axios.patch(`${props.endpoint}api/connection/${props.user.user._id}`, {id: id})
                .then(response => {
                    props.setUser({...props.user, user: response.data.user})
                    setPeople(people.filter(person => person._id !== id));
                    navigate(`/profile/${props.user.user._id}`);
                })
                .catch(err => console.log(err));
                break
            default:
                //pass
                break
                
        }
    }

    return <div className='people'>
        <h2>{ title }</h2>
        <hr/>
        { people && people.map(person => <div style={{display:'flex'}} key={person._id} className='person'>
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
        {props.user.user._id === id && title === 'Connections' && <div>
                                                                    <Button 
                                                                    onClick={() => handleClick(person._id, 'remove connection')} 
                                                                    style={{margin: '0 10px'}} variant='danger'>Remove Connection
                                                                    </Button>
                                                                    <Button
                                                                    style={{margin: '0 10px'}} variant='primary'>Chat
                                                                    </Button>
                                                                 </div>}
    </div> )}
    </div>
}