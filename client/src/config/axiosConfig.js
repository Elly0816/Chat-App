import axios from 'axios';


const development = 'http://localhost:5000';
const production = 'https://full-chat-app.herokuapp.com';

const endpoint = process.env.NODE_ENV === 'production' ? production : development;


export const instance = axios.create({
    baseURL: endpoint
});


//This intercepts every request that is made and returns the config
instance.interceptors.request.use(async(config) => {
    // console.log("This is the token from local storage");
    // console.log(localStorage.getItem('token'));
    localStorage.getItem('token') && (config.headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    return config;
});

instance.interceptors.response.use(async(response) => {
    console.log("This is the response in axiosConfig");
    console.log(response);
    if (response.status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        instance.post("/logout");
    }
    return response;
});