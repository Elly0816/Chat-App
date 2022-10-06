import {Dropdown as MyDropdown}  from 'react-bootstrap';


export default function Dropdown(props){



    return  <MyDropdown className='dropdown-container'>
        <MyDropdown.Toggle variant='outline-light' id='dropdown-basic'>
            {props.placeholder}
        </MyDropdown.Toggle>

        <MyDropdown.Menu>
            <MyDropdown.Item onClick={props.profile}>Profile</MyDropdown.Item>
            <MyDropdown.Item href="#/action-2">Requests</MyDropdown.Item>
            <MyDropdown.Item href="#/action-3">Connections</MyDropdown.Item>
            <MyDropdown.Item onClick={props.logout}>Logout</MyDropdown.Item>
        </MyDropdown.Menu>
    </MyDropdown>
}