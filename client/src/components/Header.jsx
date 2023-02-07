import React, { useState } from 'react';
// import Button from 'react-bootstrap/Button';
import Search from './Search';
import { Search as SearchIcon } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
import Dropdown from './Dropdown';
import { appContext } from '../App';
import { useContext } from 'react';
import logoutController from '../controllers/userLogoutController';



export default function Header(props) {

    const navigate = useNavigate();
    const {user, endpoint} = useContext(appContext);

    function logout(){
        logoutController(endpoint, navigate, props.logout);  
    }

    const [ openSearch, setOpenSearch ] = useState(false);

    function toggleSearch(){
        setOpenSearch(!openSearch);
    };


    function goToProfile(){
        //console.log(user.user);
        navigate(`/profile/${user.user._id}`);
    };



    return <div className='header'>
                <div className='title'>
                    <a href='/' style={{textDecoration: 'None', color:'white'}}><h2>HiChat!</h2></a>
                    {/* { user.auth && <h6>Welcome {user.user.fullName}</h6>} */}
                </div>

                <div className='search'>
                    { openSearch ? <Search
                    close={toggleSearch}/> 
                    : <div style={{display: 'flex',
                        justifyContent:'center',
                        padding:'10px'}} onClick={() => { setOpenSearch(true); }}>
                        <h6>Search</h6>
                        <SearchIcon style={{fontSize: "100%",
                        marginLeft: '20px'}}/>
                        </div> }
                </div>

                <Dropdown placeholder={user.user.fullName}
                          profile={goToProfile}
                          logout={logout}
                          id={user.user._id}
                />


        
        {/* { user.auth && <div className='logout'>
            <Button variant="light" onClick={goToProfile}>Profile</Button>
            <Button className='button' variant="light" onClick={ logout }>Logout</Button>
        </div> } */}
    </div>
}