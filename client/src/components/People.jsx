import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Button } from 'react-bootstrap';

export default function People(props){

    const [ people, setPeople ] = useState();

    const { id } = useParams();

    useEffect(() => {
        async function getPeople(){
            await axios.get(`${props.endpoint}${props.request}/${id}`)
            .then(response => 
                {setPeople(response.data.users);
                console.log(response.data);
                }
                )
                .catch(err => console.log(err));
        }
        getPeople();
    }, [props.request, id]);

    return <div className='people'>
        { people && people.map(person => <div key={person._id} className='person'>
        <h5>{ person.fullName }</h5>
        <Button variant='primary'>Accept</Button>
        </div>) }
    </div>
}