import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';


export default function Info(props){

    const {id} = useParams();

    console.log(id);

    const [ name, setName ] = useState({});

    useEffect(() => {
        async function getDetails(){
            await axios.get(`${props.endpoint}profile/${id}`)
            .then( response => {
                console.log(response);
                setName(response.data.response);
            })
            .catch(err => {
                console.log(err);
            });
        }
        getDetails();
    }, [id]);


    return <div className='info'>
            <h2>{ name.fullName }</h2>
    </div>
}