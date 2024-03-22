import { FormEvent, useEffect, useRef, useState } from "react";
import classes from "./ForgotPasswordPage.module.css";
import FormElement, { FormElementRefAttributes } from "../../components/FormElement/FormElement";
import { validateEmail } from "../../utils/Validators";
import FormButton from "../../components/FormButton/FormButton";
import { forgotPassword } from "../../utils/HttpRequests";
import { formatSeconds } from "../../utils/TimeFormatters";
import { useNavigate } from "react-router-dom";

function ForgotPasswordPage() {
    const [formValidationErrors, setFormValidationErrors] = useState<(string | null)>();
    const [successfullySent, setSuccessfullySent] = useState<boolean>();
    const emailRef = useRef<FormElementRefAttributes>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage["userName"]) {
            navigate("/");
        }
    }, [navigate]);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const emailValidationMessage = emailRef.current?.triggerValidate();

        if (emailValidationMessage !== null) {
            console.log("There is validation error! Doesn't fetch data!");
            return;
        }
        
        const formData = new FormData(event.target as HTMLFormElement);
        const emailValue = formData.get("email")!.toString();
        
        const forgotPasswordAsync = async () => {
            try {
                const response = await forgotPassword(emailValue);
                if (response.status === 200) {
                    setSuccessfullySent(true);
                    setFormValidationErrors(null); 
                } else if (response.status === 400) { // Server-side validation errors
                    const problem = response.data;
                    console.error(problem);
                    setFormValidationErrors(problem.title); 
                } else if (response.status === 429) { // Reset password is lockout
                    const problem = response.data;
                    console.error(problem);
                    const seconds = problem.detail;
                    setFormValidationErrors(problem.title + ". Wait for " + formatSeconds(seconds)); 
                } else if (response.status === 404) {
                    const problem = response.data;
                    console.error(problem);
                    setFormValidationErrors(problem.title); 
                }
            } catch (error) {
                console.error(error);
            }
        }

        forgotPasswordAsync();
    }

    return <div className="common-container">
        <form className={classes.Form} onSubmit={handleSubmit} noValidate>
            <FormElement inputType="email" name="email" maxLength={100}
                validate={validateEmail} ref={emailRef} disabled={successfullySent} />
            <div className={classes.FormValidation}>{formValidationErrors}</div>
            <FormButton label="Send Reset Link" disabled={successfullySent}/>
            {successfullySent && 
                <div className={classes.FormMessage}>Successfully sent reset password link with email</div>
            }
        </form>
    </div>
}

export default ForgotPasswordPage;