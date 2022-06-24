import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import { X } from 'react-bootstrap-icons';

export default function Search(props){

    const [ search, setSearch ] = useState('');

    const [ users, setUsers ] = useState([]);

    /*This searches for users in the database */
    // useEffect(() => {
    //     props.socket.emit('search', search);
    // }, [search]);

    function handleChange(e){
        setSearch(e.target.value);
        async function listenforUsers(){
            props.socket.emit('search', search);
            await props.socket.on('search', (arg) => {
                setUsers(arg);
                console.log(users);
            });
        }
        listenforUsers();
    }

    // props.socket.on('search', (arg)=>{
    //     setUsers(arg);
    //     console.log(arg);
    // });

    return <Form className="d-flex">
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
                return <option key={user._id}>
                {user.username}</option>
            })}
        </datalist> }
      </Form>
}