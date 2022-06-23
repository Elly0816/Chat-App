import React from 'react';
import Button from 'react-bootstrap/Button';

export default function Header(props) {

    function logout(){
        props.logout(false);
    }

    return <div className='header'>
        <div className='title'>
            <h2>HiChat!</h2>
            { props.user.auth && <h2>Welcome {props.user.user.firstName}</h2>}
        </div>
        { props.user.auth && <div className='logout'>
            <Button className='button' variant="light" onClick={ logout }>Logout</Button>
        </div> }
    </div>
}