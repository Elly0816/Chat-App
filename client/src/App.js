import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import React, { useState, useRef, useEffect } from 'react';
import Messages from './components/Messages';
import  io from 'socket.io-client';
import Entry from './components/Entry';
import Login from './components/Login';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


function App() {

  let sendMessage;

  const [ socket, setSocket ] = useState();

  const [ messages, setMessages ] = useState([]);

  const [ isAuthenticated, setIsAuthenticated ] = useState(false);

  
  /*This handles the connection and disconnection to the socket */
  useEffect(() => {
    if ( isAuthenticated ){
      const connectSocket = () => {setSocket(io.connect("http://localhost:5000"))};
      connectSocket();
    }else {
      if (socket){
        socket.disconnect(true);
      }
    }
  }, [isAuthenticated])

  /*Handles the sending of messages through the socket */
  if (socket){
    sendMessage = (message) => {
      socket.emit('send', message);
    }
  
    socket.on('send', (arg) => {
      setMessages([...messages, arg])
    })
  }


/*Enables auto focus on the bottom of the messages div */
  const messageContainer = useRef(null);

  useEffect (() => {
    const msgs = messageContainer.current;
    if (msgs){
      msgs.scrollTop = msgs.scrollHeight;
    }
  }, [messages]);


  function authenticate(status){
   setIsAuthenticated(status);
  }


  return (
    <div className='app'>
      <Header logout={ authenticate } isLogged={ isAuthenticated }/>
      <Router>
        <Routes>
          <Route path="/login" element={ 
            !isAuthenticated ? <Login 
                                authenticate={ authenticate }/> : <Navigate to="/" /> } />
          <Route path="/" element={ 
            isAuthenticated ? <div> 
                                <div className='message-container' ref={ messageContainer }>
                                  {messages.map((message, index) => <Messages 
                                  key={message+index} 
                                  message={message}/>)}
                                </div> 
                                <Entry sendMessage={sendMessage}/> 
                              </div> : <Navigate to="/login" /> }/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
