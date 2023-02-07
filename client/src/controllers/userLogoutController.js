import { instance } from "../config/axiosConfig.js"


export default async function logoutController(navigate = null, propsLogout = null) {
    await instance.post(`/api/logout`)
        .then(response => {
            if (response.data.response === 'logged out') {
                propsLogout && propsLogout({ auth: false });
                localStorage.clear();
                navigate && navigate("/login");
                // setAuthHeader(null);
            };
        })
        .catch(err => console.log(err));
};