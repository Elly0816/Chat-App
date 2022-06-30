import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import React, { useState, useRef, useEffect } from 'react';
import Messages from './components/Messages';
import  io from 'socket.io-client';
import Entry from './components/Entry';
import Login from './components/Login';
import Info from './components/Info';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


function App() {

  let sendMessage;

  const endpoint = 'http://localhost:5000/';

  const [ socket, setSocket ] = useState();

  const [ messages, setMessages ] = useState([]);

  const [ user, setUser ] = useState({auth: false, user: {}});

  
  /*This checks if a user has previously logged in */
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    // console.log(JSON.stringify(loggedInUser));
    if (loggedInUser){
      const foundUser = JSON.parse(loggedInUser);
      setUser({auth: true, user: foundUser});
    }}, []);


  /*This handles the connection and disconnection to the socket */
  useEffect(() => {
    if ( user.auth ){
      if (!socket){
        const connectSocket = () => {setSocket(io.connect("http://localhost:5000"))};
        connectSocket();
      }
      
    }else {
      if (socket){
        socket.disconnect(true);
        setSocket();
      }
    }
  }, [user]);

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
   setUser(status);
  }

  // /*This changes the user.user whenever the user edits their account */
  // function newUser(user){
  //   setUser(user);
  // }


  return (
    <div className='app'>
      <Router>
        <Header logout={ authenticate } user={ user } socket={ socket }/>
        <Routes>
          {/* { user.auth ? <Route path="/profile/:id" element={ <Info endpoint={endpoint}/> }/> :
            <Navigate to="/login"/>} */}
          {/* <Route path="/profile/:id" element={user.auth ? <Info endpoint={ endpoint } /> :
                                   <Navigate to='/login'/>} /> */}
          <Route path="/profile/:id" element={<Info changeUser={ authenticate } user={ user } endpoint={ endpoint } /> } />
          <Route path="/login" element={ 
            !user.auth ? <Login endpoint={ endpoint }
                                authenticate={ authenticate }/> : <Navigate to="/" /> } />
          <Route path="/" element={ 
            user.auth ? <div> 
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
