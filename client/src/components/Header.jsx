import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Search from './Search';
import { Search as SearchIcon } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';



export default function Header(props) {

    const navigate = useNavigate();

    function logout(){
        async function out(){
            await axios.post(`${props.endpoint}logout`)
            .then(response => {
                props.logout(false);
                localStorage.clear();
                navigate("/login");
            })
            .catch(err => console.log(err));
        }
        out();     
    }

    const [ openSearch, setOpenSearch ] = useState(false);

    function toggleSearch(){
        setOpenSearch(!openSearch);
    }


    function goToProfile(){
        //console.log(props.user.user);
        navigate(`profile/${props.user.user._id}`);
    }


    return <div className='header'>
        <div className='title'>
            <a href='/' style={{textDecoration: 'None', color:'white'}}><h2>HiChat!</h2></a>
            { props.user.auth && <h6>Welcome {props.user.user.fullName}</h6>}
        </div>

        { props.user.auth && <div className='search'>
                                { openSearch ? <Search
                                                 socket={props.socket}
                                                 close={toggleSearch}/> 
                                : <div style={{display: 'flex',
                                 justifyContent:'center',
                                 padding:'20px'}} onClick={() => { setOpenSearch(true); }}>
                                    <h6>Search</h6>
                                    <SearchIcon style={{fontSize: "100%",
                                    marginLeft: '20px'}}/>
                                  </div> }
                            </div> }
        
        { props.user.auth && <div className='logout'>
            <Button variant="light" onClick={goToProfile}>Profile</Button>
            <Button className='button' variant="light" onClick={ logout }>Logout</Button>
        </div> }
    </div>
}