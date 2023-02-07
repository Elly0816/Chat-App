import axios from 'axios';


export default async function logoutController(endpoint, navigate = null, propsLogout = null) {
    await axios.post(`${endpoint}api/logout`)
        .then(response => {
            if (response.data.response === 'logged out') {
                propsLogout && propsLogout(false);
                localStorage.clear();
                navigate && navigate("/login");
                axios.defaults.headers.common['Authorization'] = null;
            }
        })
        .catch(err => console.log(err));
};