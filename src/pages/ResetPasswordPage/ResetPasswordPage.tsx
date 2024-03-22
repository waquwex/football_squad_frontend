import { FormEvent, useEffect, useRef, useState } from "react";
import classes from "./ResetPasswordPage.module.css";
import FormButton from "../../components/FormButton/FormButton";
import { resetPassword } from "../../utils/HttpRequests";
import CompoundPasswordElements, { CompoundPasswordRefAttributes } from "../../components/CompoundPasswordElements/CompoundPasswordElements";
import { useNavigate, useSearchParams } from "react-router-dom";

function ForgotPasswordPage() {
    const [formValidationErrors, setFormValidationErrors] = useState<(string | null)>();
    const [successfullyChanged, setSuccessfullyChanged] = useState<boolean>();
    const compoundPasswordsRef = useRef<CompoundPasswordRefAttributes>(null);
    const [searchParams, _] = useSearchParams();
    const token = searchParams.get("token") as string;
    const email = searchParams.get("email") as string;
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage["userName"]) {
            navigate("/");
        }
    }, [navigate]);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        
        const passwordsValidationMessages = compoundPasswordsRef.current?.triggerValidate();
        
        if (passwordsValidationMessages?.[0] !== null || passwordsValidationMessages?.[1] !== null) {
            console.log("There is validation error! Doesn't fetch data!");
            return;
        }

        const formData = new FormData(event.target as HTMLFormElement);
        
        const passwordValue = formData.get("password") as string;
        const confirmPasswordValue = formData.get("confirm_password") as string;

        const resetPasswordAsync = async () => {
            try {
                const response = await resetPassword(email, passwordValue, confirmPasswordValue, token);
                if (response.status === 200) {
                    setSuccessfullyChanged(true);
                    setFormValidationErrors(null);
                } else if (response.status === 400) { // Server-side validation errors
                    const problem = response.data;
                    setFormValidationErrors(problem.title);
                } else if (response.status === 406) { // Invalid token or user is not exists
                    const problem = response.data;
                    setFormValidationErrors(problem.title);
                }
            } catch (error) {
                console.error(error);
            }
        }

        resetPasswordAsync();
    }

    return <div className="common-container">
        <form className={classes.Form} onSubmit={handleSubmit} noValidate>
            <CompoundPasswordElements maxLength={64} name="password" ref={compoundPasswordsRef} 
            disabled={successfullyChanged}/>
            <FormButton label="Confirm New Password" disabled={successfullyChanged}/>
            <div className={classes.FormValidation}>{formValidationErrors}</div>
            {successfullyChanged && 
                <div className={classes.FormMessage}>Successfully changed password</div>
            }
        </form>
    </div>
}

export default ForgotPasswordPage;