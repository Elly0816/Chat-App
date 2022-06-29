import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { Button } from 'react-bootstrap';


export default function Info(props){

    const {id} = useParams();

    console.log(id);


    /*This keeps track of the profile returned from the api call */
    const [ profile, setProfile ] = useState({_id: null});

    /*Keeps track on if the current info page belogs to the logged in user */
    const [ isUser, setIsUser ] = useState(false);


    

    /*This gets the details of the user whose id matches the id of use params */
    useEffect(() => {
        async function getDetails(){
            await axios.get(`${props.endpoint}profile/${id}`)
            .then( response => {
                console.log(response.data.response);
                setProfile(response.data.response);
                if (id === props.user.user._id){
                    console.log("User's profile");
                    setIsUser(true);
                } else {
                    console.log("Not user's profile");
                    setIsUser(false);
                }
            })
            .catch(err => {
                console.log(err);
            });
        }
        getDetails();
        
    }, [id]);


    




    function handleChange(e){
        setProfile({...profile, [e.target.name]:e.target.value});
        console.log(profile[e.target.name]);
    }

    return <div>
                    <h2>{profile.fullName}</h2>
                    <div className='info'>
                    <div className='info-1'>
                        <Form.Group>
                                <Form.Label>First Name:</Form.Label>
                                <Form.Control disabled={!isUser} name='firstName' value={ profile.firstName ? profile.firstName : ""  } onChange={ handleChange }></Form.Control>
                                <Form.Label>Last Name:</Form.Label>
                                <Form.Control disabled={!isUser} name='lastName' value={ profile.lastName ? profile.lastName : ""  } onChange={ handleChange }></Form.Control>
                                <Form.Label>Email:</Form.Label>
                                <Form.Control disabled={!isUser} name='email' value={ profile.email ? profile.email : ""  } onChange={ handleChange }></Form.Control>
                                { isUser && <Button style={{margin: "10px 10px 10px 0"}} variant="primary" type="submit">Submit</Button> }
                        </Form.Group>
                    </div>
                        
                        <div className='info-2'>
                            <span>Connections:</span>
                            <h6>{ profile.connections && profile.connections.length }</h6>
                            <span>Requests:</span>
                            <h6>{ profile.requests && profile.requests.length }</h6>    
                        </div>  

                    </div>
                    
            </div>
}