import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import React, { useState } from 'react';
import Messages from './components/Messages';
import  io from 'socket.io-client';
import Entry from './components/Entry';

const socket = io.connect("http://localhost:5000");

function App() {

  const [ mesages, setMessages ] = useState([]);


  function sendMessage(message){
    socket.emit('send', message);
  }

  
  return (
    <div className='App'>
      <Header/>
      <Messages/>
      <Entry sendMessage={sendMessage}/>
    </div>
  );
}

export default App;
