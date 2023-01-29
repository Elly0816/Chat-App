import React from 'react';
import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Unread from './Unread';
import {Buffer} from 'buffer';



export default function Chats(props){

  const [chats, setChats] = useState();

  const [toShow, setToShow] = useState();
  
  const [filter, setFilter] = useState("");

//   const [unread, setUnread] = useState();

  
  useEffect(() => {
   if (props.items){
      const chatsToShow = props.items.sort((a, b) =>  
            Date.parse(b[1].lastMessageTime) - Date.parse(a[1].lastMessageTime)
         )
      setChats(chatsToShow);
      setToShow(chatsToShow);
   }
  }, [props.items]);


//   useEffect(() => {
      // const chatsToShow = chats.sort((a, b) =>  
      //    Date.parse(b[1].lastMessageTime) - Date.parse(a[1].lastMessageTime)
      // )
      // setToShow(chats);
//   }, [chats])

  
  
  function handleChange(e){
   setFilter(e.target.value);
   if (e.target.value.length > 0){
      let filteredNames = chats.filter(item => item[0].fullName.toLowerCase().includes(e.target.value.toLowerCase()));
      setToShow(filteredNames);
   } else {
      setToShow(chats);
   }
  }


  return <div className='chats'>
   <div className='chatshead'>
   <h3>Chats</h3>
   {/* <h6>{chats?.length}</h6>{chats?.length > 1? <h6>chats</h6> : <h6>chat</h6>} */}
   {chats?.length > 1 ? <h6>{chats?.length} chats</h6> : <h6>{chats?.length} chat</h6>}
   </div>
   <div>
      <Form>
         <Form.Control value={filter}
                       placeholder='search for a name...'
                       onChange={handleChange} />
      </Form>
   </div>
   <div className='buttons'>
      { toShow?.map((item) =>  
      <div key={item[0]._id} className='buttonContainer'>
         <hr/>
         <button onClick={
                        () => {props.getMessages(item[1]._id, item[0].fullName, item[0]._id);
                                 props.setChatId(item[1]._id);
                                 props.setOtherUserId(item[0]._id);
                                 props.setUserName(item[0].fullName);
                                 console.log(`The chatid of the current chat clicked: ${item[1]._id}`);
                                 }
                              } 
                              className='chat-tile'

                           type='submit'>
            {/* <a href={`#/profile/${item[0]._id}`}></a> */}
            {/* <span className='insideButton'>
              
            </span> */}
            <h6>{item[0].fullName}</h6>
            <img className='chat-image' src={item[0]?.img ? 
            `data:${item[0].img.contentType};base64,${Buffer.from(item[0].img.data.data).toString('base64')}` : 
            'def-prof-pic.jpg'
            } alt="" />
            { item[2] > 0 && <Unread unread={item[2]}/>}
         </button>
      </div>
      )}
   </div>
</div>
}