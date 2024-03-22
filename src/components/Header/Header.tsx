import { Link, useLocation, useNavigate } from "react-router-dom";
import classes from "./Header.module.css";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useDispatch } from "react-redux";
import { setUserName } from "../../store/userSlice";
import { useCallback } from "react";

function Header() {
    const location = useLocation();
    const userName: (string | null) = useSelector((state: RootState) => state.user.name);     
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userName");
        dispatch(setUserName(null));
        navigate("/");
    }, [dispatch, navigate]);

    // If auth show logout button and username
    return <header className={classes.Header}>
        <Link className={classes.RootLink + 
            (location.pathname !== "/" ? (" " + classes.Underline) : "")} to="/">
                Football Squad
        </Link>
        { !userName ? 
        <>
            <Link className={classes.Link} to="/login">Login</Link>
            <Link className={classes.Link} to="/register">Register</Link>
        </>
         :
        <>
            <Link className={classes.UserName} to="/user">{userName}</Link>
            <button className={classes.Link} type="button" onClick={handleLogout}>Logout</button>
        </>
    }

    </header>
}

export default Header;