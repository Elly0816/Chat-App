import React from 'react';



export default function Chats(props){


    return <div className='chats'>
    { props.items?.map((item) =>  
    <div onClick={
                    () => {props.getMessages(item[1]._id, item[0].fullName);
                            props.setId(item[1]._id);
                            props.setUserId(item[0]._id)
                            }
                         } 
                         className='chat-tile' 
                         key={item[0]._id}>
        <p><a style={{textDecoration: 'None', color: 'black'}} href={`/#/profile/${item[0]._id}`}>{item[0].fullName}</a></p><hr/>
     </div> )}
</div>
}