import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// import classes from "./RegistrationSuccessful.module.css";
function RegistrationSuccessfulPage() {
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage["userName"]) {
            navigate("/");
        }
    }, [navigate]);

    return <div className="common-container">
        <h1>Successfuly registered</h1>
    </div>
}

export default RegistrationSuccessfulPage;