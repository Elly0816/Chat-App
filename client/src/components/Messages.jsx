import React from 'react';


export default function Messages(props){
    // const [ response, setResponse ] = useState();
    
    
    // useEffect(() => {
    // const socket = io.connect('http://localhost:5000/');
    // socket.on('FromAPI', (data) => {
    //     setResponse(data);
    // });
    // }, []);


    return <div>
        <h6>{ props.message }</h6>
    </div>
}