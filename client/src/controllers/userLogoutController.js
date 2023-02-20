import { instance } from "../config/axiosConfig.js"


export default async function logoutController(navigate = null, propsLogout = null, socket = null) {
    await instance.post(`/api/logout`)
        .then(response => {
            if (response.data.response === 'logged out') {
                propsLogout && propsLogout({ auth: false });
                localStorage.clear();
                navigate && navigate("/login");
                // setAuthHeader(null);
                socket && socket(null);

            };
        })
        .catch(err => console.log(err));
};