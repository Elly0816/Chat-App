import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';


export default function Chats(props){

   const navigate = useNavigate;

   const inside = {
      color: "white",
      backgroundColor: "#0984e3"
   };

   const outside = {
      color: "black",
      backgroundColor: "white"
   };


   const [ style, setStyle] = useState(outside);

   // useEffect(() => {
   //    setStyle(outside);
   // }, []);

   function mouseInside() {
      setStyle(inside);
   }

   function mouseOutside(){
      setStyle(outside);
   }

   return <div className='chats'>
   <div className='chatshead'>
   <h3>Chats</h3>
   <h6>{props.items?.length} chats</h6>
   </div>
   { props.items?.map((item) =>  
   <div key={item[0]._id} className='buttonContainer'>
      <hr/>
      <button onClick={
                     () => {props.getMessages(item[1]._id, item[0].fullName);
                              props.setId(item[1]._id);
                              props.setUserId(item[0]._id);
                              props.setUserName(item[0].fullName)
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
}