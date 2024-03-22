import { Outlet } from "react-router-dom";
import Header from "./components/Header/Header";
import classes from "./RootLayout.module.css";
import { useEffect } from "react";
import { establishSquad } from "./store/footballersSlice";
import { useDispatch } from "react-redux";
import { setUserName } from "./store/userSlice";

function RootLayout() {
    const dispatch = useDispatch();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refreshToken");
        const userName = localStorage.getItem("userName");
        if (token !== null && refreshToken !== null && userName !== null) {
            dispatch(setUserName(userName));
        }

        dispatch(establishSquad());
    }, [dispatch]);

    return (
            <div className={classes.RootLayout}>
                <Header />
                <div className={classes.RootLayoutBody}>
                    <Outlet />
                </div>
                <div className={classes.RootLayoutFooter}>
                    created by waquwex
                </div>
            </div>
    );
}

export default RootLayout;