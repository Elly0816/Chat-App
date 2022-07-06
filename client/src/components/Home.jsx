import React from 'react';
import Entry from './Entry';


export default function Messages(props){


    return <div className='home'>
            <div className='chats'>
                { props.user.connections.map(connection =>  <div> <h5>connection</h5></div> )}
            </div>
            <div className='message-container-container'>
                <div className='message-container'>
                    <div className='messages'>
                        <h6>{ props.message }</h6>
                    </div>
                </div>
                <Entry sendMessage={ props.sendMessage }/>
            </div>
            
    </div>
}