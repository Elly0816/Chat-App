import {useState} from 'react';

export default function Unread(props){

    return <div className='unread'>
        {props.unread}
    </div>
}