import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import React, { useState, useRef } from 'react';
import Messages from './components/Messages';
import  io from 'socket.io-client';
import Entry from './components/Entry';

const socket = io.connect("http://localhost:5000");

function App() {

  const [ messages, setMessages ] = useState([]);


  function sendMessage(message){
    socket.emit('send', message);
  }

  socket.on('send', (arg) => {
    setMessages([...messages, arg])
  })



  return (
    <div className='app'>
      <Header/>
      <div className='message-container' ref='messages'>
        {messages.map((message, index) => 
          <Messages key={message+index} message={message}/>)}
      </div>
      
      <Entry sendMessage={sendMessage}/>
    </div>
  );
}

export default App;
