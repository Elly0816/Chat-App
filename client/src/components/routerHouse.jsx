import { useEffect, useContext } from "react";
import { appContext } from "../App";
import { useLocation, useNavigate } from "react-router-dom";
import logoutController from "../controllers/userLogoutController";

export default function RouterHouse({header, page}){

    const {user, setUser, setSocket} = useContext(appContext);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(()=> {
        if (!(localStorage.getItem('token') && localStorage.getItem('user')) && user.auth) {
            logoutController(navigate, setUser, setSocket);
            // setSocket(null);
        };
      }, [location]);

    return <div>
        {header}
        {page}
    </div>
}