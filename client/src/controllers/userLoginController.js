import axios from 'axios';


export default async function loginController(endpoint, form) {
    const { email, password } = form;
    return await axios.post(`${endpoint}api/login`, {
            email: email,
            password: password
        })
        // .then(response => (response))
        // .catch(err => (err))
}