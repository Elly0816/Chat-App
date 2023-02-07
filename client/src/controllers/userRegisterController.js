import axios from "axios";

export default async function registerController(endpoint, form) {
    const { firstName, lastName, email, password } = form;
    return await axios.post(`${endpoint}api/register`, {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password
        })
        // .then(response => ({ response }))
        // .catch(err => ({ err }))
}