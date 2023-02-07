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
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createContext } from 'react';
import { Buffer } from 'buffer';
import logoutController from './controllers/userLogoutController';



function App() {

  let sendMessage;

  const development = 'http://localhost:5000/';
  const production = 'https://full-chat-app.herokuapp.com/';

  const endpoint = process.env.NODE_ENV === 'production' ? production : development;


  const [ socket, setSocket ] = useState();

  const [ user, setUser ] = useState({auth: null, user: {}});
  

  //This state stores the user's profile image
  const [profileImage, setProfileImage] = useState();

  //The sound that plays for incoming messages
  const ringtone = new Audio('sounds/new message notification.wav');

  /*
    Something needs to be done with the token gotten
    from the request from the server


    Check online for details on how it works

  */
  
  /*This checks if a user has previously logged in */
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser){
      const userInStorage = JSON.parse(loggedInUser);
      if (userInStorage){
      function getUser(){
        axios.get(`${endpoint}api/user/${userInStorage._id}`)
        .then(response => {
          console.log("Response is: ");
          console.log(response);
          if (response.data.user){
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setUser({auth: true, user: response.data.user});
          } else {
            setUser({auth: false});
          }
          
        }).catch((err) => {
          console.log(err);
          logoutController(endpoint);
          setUser({auth: false});
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
        setSocket(io.connect(endpoint, {transports:['websocket'], upgrade:false}));
      }
    }
    if (user.user?.img?.data?.data){
      const image = `data:${user.user.img.contentType};base64,${Buffer.from(user.user.img.data.data).toString('base64')}`;
      setProfileImage(image);
    } else {
      setProfileImage('def-prof-pic.jpg');
    }
  }, [user]);



  //This handles the sending of the socket id and the user id to the server
  useEffect(()=>{
    if(socket){
      console.log('This is the socket');
      console.log(socket);
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


    socket.on('play', () => {
      ringtone.play();
    });
  }


  function authenticate(status){
   setUser(status);
  };


  return (
    <div className='app'>
      <Router>
        <appContext.Provider value={{socket, user, endpoint, setUser, profileImage}}>
          { user.auth && <Header logout={ authenticate }/>}
          <Routes>
            <Route path="/profile/:id" element={<Info changeUser={ authenticate } /> } />
            <Route path="/login" element={ 
              !user.auth ? <Login authenticate={ authenticate }/> : <Navigate to="/" /> } />
            {user.auth !== null && <Route path="/" element={ user.auth ? <Home
                                                            sendMessage={ sendMessage } /> : <Navigate to="/login" /> }/>}
            {user.auth && <Route path="/:request/:id" element={ <People setUser={ setUser } user={ user } endpoint={ endpoint }/> } />}
          </Routes>
          {/* { user.auth && <Footer/>} */}  
        </appContext.Provider>
      </Router>
    </div>
  );
}

export default App;

export const appContext = createContext(null);
