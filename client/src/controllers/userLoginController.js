import { instance } from '../config/axiosConfig.js';

export default async function loginController(form) {
    const { email, password } = form;
    return await instance.post(`/api/login`, {
            email: email,
            password: password
        })
        // .then(response => (response))
        // .catch(err => (err))
}