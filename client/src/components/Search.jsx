import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import { X } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router';

export default function Search(props){

    const [ search, setSearch ] = useState('');

    const [ users, setUsers ] = useState([]);

/*Searches the database for the users matching the input in the form via websocket */
    function handleChange(e){
        setSearch(e.target.value);
        async function listenforUsers(){
            props.socket.emit('search', search);
            await props.socket.on('search', (arg) => {
                setUsers(arg);
            });
        }
        listenforUsers();
    }

    const navigate = useNavigate(); 
    
    /*This handles the submission of the form */
    function handleSubmit(e){
        e.preventDefault();
        if (users.length === 1 ){
            navigate(`/profile/${users[0]._id}`);
            props.close();
        }
    }


    return <Form className="d-flex" onSubmit={handleSubmit}>
        <Form.Control
          autoFocus={true} 
          onChange={handleChange}
          type="search"
          placeholder="Search"
          className="me-2"
          aria-label="Search"
          value={search}
          list="search-results"
        />
        <X onClick={props.close} style={{fontSize: '300%'}}/>
        { users.length > 0 && <datalist id='search-results'>
            { users.map(user => {
                return <option key={user._id}>{user.username}</option>
            })}
        </datalist> }
      </Form>
}