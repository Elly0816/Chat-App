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
                await axios.get(`${props.endpoint}${request}/${id}`)
                .then(response => 
                {   setTitle(`${lodash.capitalize(request)}s`);
                    setPeople(response.data.users);
                    console.log(response.data);
                }
                )
                .catch(err => console.log(err));
            } else {
                await axios.get(`${props.endpoint}request/${id}`)
                .then(response => 
                {   setTitle('Pending Requests');
                    setPeople(response.data.pending);
                console.log(response.data);
                }
                )
                .catch(err => console.log(err));
            }
            
        }
        getPeople();
    }, [id, request, props.user, props.endpoint]);

    function handleClick(id, subUrl, method){
        if (method === 'patch'){
            axios.patch(`${props.endpoint}${subUrl}/${props.user.user._id}`, {id: id})
            .then(response => {
                props.setUser({auth: true, user: response.data.user})
                setPeople(people.filter((person) => person._id !== id));
                navigate(`/profile/${props.user.user._id}`);
            })
            .catch(err => console.log(err));
        }
    }

    return <div className='people'>
        <h2>{ title }</h2>
        <hr/>
        { people && people.map(person => <div style={{display:'flex'}} key={person._id} className='person'>
        <a style={{textDecoration:'none', color:'black'}} href={`/profile/${person._id}`}><h5>{ person.fullName}</h5></a>
        {title==='Pending Requests' && <Button
         onClick={() => handleClick(person._id, 'pending-requests', 'patch')} 
         style={{margin: '0 10px'}} variant='danger'>Cancel Request</Button>}
        {title === 'Requests' && <div>
                                    <Button style={{margin: '0 10px'}} variant='success'>Accept</Button>
                                    <Button style={{margin: '0 10px'}} variant='danger'>Decline</Button>
                                 </div>}
        {title === 'Connections' && <Button style={{margin: '0 10px'}} variant='danger'>Remove Connection</Button>}
    </div> )}
    </div>
}