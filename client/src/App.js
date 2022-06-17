import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import React, { useState, useRef, useEffect } from 'react';
import Messages from './components/Messages';
import  io from 'socket.io-client';
import Entry from './components/Entry';
import Login from './components/Login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const socket = io.connect("http://localhost:5000");

function App() {

  const [ messages, setMessages ] = useState([]);


  function sendMessage(message){
    socket.emit('send', message);
  }

  socket.on('send', (arg) => {
    setMessages([...messages, arg])
  })

  const messageContainer = useRef(null);

  useEffect (() => {
    const msgs = messageContainer.current;
    if (msgs){
      msgs.scrollTop = msgs.scrollHeight;
    }
  }, [messages]);



  return (
    <div className='app'>
      <Header/>
      <Router>
        <Routes>
          <Route path="/" element={ <Login/> } />
          <Route path="/home" element={ <div> <div className='message-container' ref={ messageContainer }>
            {messages.map((message, index) => 
              <Messages key={message+index} message={message}/>)}
          </div> <Entry sendMessage={sendMessage}/> </div>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
