import './App.css';
import Header from './components/Header';
import React from 'react';
import Messages from './components/Messages';
import  io from 'socket.io-client';

const socket = io.connect("http://localhost:5000");

function App() {

  

  
  return (
    <div className='App'>
      <Header/>
    </div>
  );
}

export default App;
