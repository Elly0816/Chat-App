import React from 'react';
import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';



export default function Chats(props){

  const [chats, setChats] = useState();

  const [toShow, setToShow] = useState();
  
  const [filter, setFilter] = useState();

  const [unread, setUnread] = useState(0);

  
  useEffect(() => {
   setChats(props.items)
  });

  useEffect(() => {
   setToShow(chats);
  }, [chats])
  
  
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
                        () => {props.getMessages(item[1]._id, item[0].fullName);
                                 props.setChatId(item[1]._id);
                                 props.setOtherUserId(item[0]._id);
                                 props.setUserName(item[0].fullName);
                                 console.log(`The chatid of the current chat clicked: ${item[1]._id}`);
                                 }
                              } 
                              className='chat-tile'

                           type='submit'>
            {/* <a href={`#/profile/${item[0]._id}`}></a> */}
            <h6>{item[0].fullName}</h6>
         </button>
      </div>
      )}
   </div>
</div>
}