import { instance } from "../config/axiosConfig.js"

export default async function registerController(form) {
    const { firstName, lastName, email, password } = form;
    return await instance.post(`/api/register`, {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password
    });
    // .then(response => ({ response }))
    // .catch(err => ({ err }))
};