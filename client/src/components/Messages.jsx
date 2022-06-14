import React, { useState, useEffect } from 'react';
import { io } from "socket.io-client";


export default function Messages(){
    const [ response, setResponse ] = useState();
    
    
    useEffect(() => {
    const socket = io.connect('http://localhost:5000/');
    socket.on('FromAPI', (data) => {
        setResponse(data);
    });
    }, []);


    return response;
}