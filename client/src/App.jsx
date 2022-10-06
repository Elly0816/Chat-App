import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import  io from 'socket.io-client';
import axios from 'axios';
import Login from './components/Login';
import Info from './components/Info';
import People from './components/People';
import Footer from './components/Footer';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


function App() {

  let sendMessage;

  const development = 'http://localhost:5000/';
  const production = 'https://full-chat-app.herokuapp.com/';

  const endpoint = process.env.NODE_ENV === 'production' ? production : development;


  const [ socket, setSocket ] = useState();

  const [ user, setUser ] = useState({auth: null, user: {}});


  
  /*This checks if a user has previously logged in */
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser){
      const userInStorage = JSON.parse(loggedInUser);
      if (userInStorage){
      function getUser(){
        axios.get(`${endpoint}api/user/${userInStorage._id}`)
        .then(response => {
          if (response.data.user){
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setUser({auth: true, user: response.data.user});
          } else {
            setUser({auth: false});
          }
          
        });
      }
      getUser();
    } else {
      setUser({auth: false, user: {}});
    }} else {
      setUser({auth: false, user: {}});
    }}, []);


  /*This handles the connection and disconnection to the socket */
  useEffect(() => {
    if ( user.auth ){
      if (!socket){
        setSocket(io.connect(endpoint));
      }
    }
  }, [user]);



  //This handles the sending of the socket id and the user id to the server
  useEffect(()=>{
    if(socket){
      //Emit an event to add the socket id to the user's socket field
      const add = {userId: user.user._id}
      socket.emit('add', add);
    }
  }, [socket])

  /*Handles the sending of messages through the socket */
  if (socket){
    sendMessage = (toSend) => {
      socket.emit('send',toSend);
    }
  }


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
        { user.auth && <Header endpoint={endpoint} logout={ authenticate } user={ user } socket={ socket }/>}
        <Routes>
          {/* { user.auth ? <Route path="/profile/:id" element={ <Info endpoint={endpoint}/> }/> :
            <Navigate to="/login"/>} */}
          {/* <Route path="/profile/:id" element={user.auth ? <Info endpoint={ endpoint } /> :
                                   <Navigate to='/login'/>} /> */}
          <Route path="/profile/:id" element={<Info changeUser={ authenticate } user={ user } endpoint={ endpoint } /> } />
          <Route path="/login" element={ 
            !user.auth ? <Login endpoint={ endpoint }
                                authenticate={ authenticate }/> : <Navigate to="/" /> } />
          {user.auth !== null && <Route path="/" element={ user.auth ? <Home 
                                                  endpoint={ endpoint } 
                                                  socket={ socket } 
                                                  sendMessage={ sendMessage } 
                                                  user={ user.user }/> : <Navigate to="/login" /> }/>}
          {user.auth && <Route path="/:request/:id" element={ <People setUser={ setUser } user={ user } endpoint={ endpoint }/> } />}
        </Routes>
        {/* <Footer/> */}
      </Router>
    </div>
  );
}

export default App;
