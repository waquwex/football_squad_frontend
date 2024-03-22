import { FormEvent, useEffect, useRef, useState } from "react";
import classes from "./LoginPage.module.css";
import FormElement, { FormElementRefAttributes } from "../../components/FormElement/FormElement";
import { validateEmail, validatePassword } from "../../utils/Validators";
import FormButton from "../../components/FormButton/FormButton";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserName } from "../../store/userSlice";
import { login } from "../../utils/HttpRequests";
import { formatSeconds } from "../../utils/TimeFormatters";

function LoginPage() {
    const navigate = useNavigate();
    const [formValidationErrors, setFormValidationErrors] = useState<(string | null)>();
    const emailRef = useRef<FormElementRefAttributes>(null);
    const passwordRef = useRef<FormElementRefAttributes>(null);
    const dispatch = useDispatch();

    useEffect(() => {
        if (localStorage["userName"]) {
            navigate("/");
        }
    }, [navigate]);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const emailValidationMessage = emailRef.current?.triggerValidate();
        const passwordValidationMessage = passwordRef.current?.triggerValidate();

        if (emailValidationMessage !== null || passwordValidationMessage !== null) {
            console.log("There is validation error! Doesn't fetch data!");
            return;
        }

        const formData = new FormData(event.target as HTMLFormElement);
        const loginAsync = async () => {
            try {
                const response = await login(formData.get("email")?.toString()!,
                    formData.get("password")?.toString()!);
                if (response.status === 200) {
                    const tokenResponse = response.data; 
                    console.log(tokenResponse);
                    localStorage.setItem("token", tokenResponse.token);
                    localStorage.setItem("refreshToken", tokenResponse.refreshToken);
                    localStorage.setItem("userName", tokenResponse.userName);
                    const userName = tokenResponse.userName as string;
                    dispatch(setUserName(userName));
                    navigate("/");
                } else if (response.status === 400) { // Server-side validation errors
                    const problem = response.data;
                    console.error(problem);
                    setFormValidationErrors(problem.title);
                } else if (response.status === 417) { // Credentials check
                    const problem = response.data;
                    console.error(problem);
                    setFormValidationErrors(problem.title); 
                } else if (response.status === 404) { // User existence check
                    const problem = response.data;
                    console.error(problem);
                    setFormValidationErrors(problem.title); 
                } else if (response.status === 429) { // Account is lockout
                    const problem = response.data;
                    console.error(problem);
                    const seconds = problem.detail;
                    setFormValidationErrors(problem.title + ". Wait for " + formatSeconds(seconds)); 
                }
            } catch (error) {
                console.error(error);
            }
        }
        // try to login
        loginAsync();
    }

    return <div className="common-container">
        <form className={classes.Form} onSubmit={handleSubmit} noValidate>
            <FormElement inputType="email" name="email" maxLength={100} validate={validateEmail} ref={emailRef} />
            <FormElement inputType="password" name="password" maxLength={50}
                validate={validatePassword} ref={passwordRef} />
            <div className={classes.FormValidation}>{formValidationErrors}</div>
            <div className={classes.ForgotPasswordLink}><Link to="/forgot_password">Forgot password?</Link></div> 
            <FormButton label="Login" />
        </form>
    </div>
}

export default LoginPage;