import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Search from './Search';
import { Search as SearchIcon } from 'react-bootstrap-icons';

export default function Header(props) {

    function logout(){
        props.logout(false);
        localStorage.clear();
    }

    const [ openSearch, setOpenSearch ] = useState(false);

    function toggleSearch(){
        setOpenSearch(!openSearch);
    }

    return <div className='header'>
        <div className='title'>
            <h2>HiChat!</h2>
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
            <Button className='button' variant="light" onClick={ logout }>Logout</Button>
        </div> }
    </div>
}