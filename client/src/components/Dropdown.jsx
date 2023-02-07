import {Dropdown as MyDropdown}  from 'react-bootstrap';
import { useNavigate } from 'react-router';


export default function Dropdown(props){

    const navigate = useNavigate();

    function ShowConnections(){
        navigate(`/connection/${props.id}`);
    }

    function ShowRequests(){
        navigate(`/request/${props.id}`);
    }


    return  <MyDropdown className='dropdown-container'>
        <MyDropdown.Toggle variant='outline-light' id='dropdown-basic'>
            {props.placeholder}
        </MyDropdown.Toggle>

        <MyDropdown.Menu>
            <MyDropdown.Item onClick={props.profile}>Profile</MyDropdown.Item>
            <MyDropdown.Item onClick={ShowRequests}>Requests</MyDropdown.Item>
            <MyDropdown.Item onClick={ShowConnections}>Connections</MyDropdown.Item>
            <MyDropdown.Item onClick={props.logout}>Logout</MyDropdown.Item>
        </MyDropdown.Menu>
    </MyDropdown>
}