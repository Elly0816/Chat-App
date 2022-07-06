import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import React, { useState, useRef, useEffect } from 'react';
import Home from './components/Home';
import  io from 'socket.io-client';
import Login from './components/Login';
import Info from './components/Info';
import People from './components/People';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


function App() {

  let sendMessage;

  const endpoint = 'http://localhost:5000/';

  const [ socket, setSocket ] = useState();

  const [ messages, setMessages ] = useState([]);

  const [ user, setUser ] = useState({auth: null, user: {}});

  
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
        setSocket(io.connect("http://localhost:5000"));
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
        <Header endpoint={endpoint} logout={ authenticate } user={ user } socket={ socket }/>
        <Routes>
          {/* { user.auth ? <Route path="/profile/:id" element={ <Info endpoint={endpoint}/> }/> :
            <Navigate to="/login"/>} */}
          {/* <Route path="/profile/:id" element={user.auth ? <Info endpoint={ endpoint } /> :
                                   <Navigate to='/login'/>} /> */}
          <Route path="/profile/:id" element={<Info changeUser={ authenticate } user={ user } endpoint={ endpoint } /> } />
          <Route path="/login" element={ 
            !user.auth ? <Login endpoint={ endpoint }
                                authenticate={ authenticate }/> : <Navigate to="/" /> } />
          <Route path="/" element={ user.auth ? <Home sendMessage={ sendMessage } user={ user.user }/> : <Navigate to="/login" /> }/>
          {user.auth && <Route path="/:request/:id" element={ <People setUser={ setUser } user={ user } endpoint={ endpoint }/> } />}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
