import { FormEvent, useEffect, useRef, useState } from "react";
import classes from "./RegisterPage.module.css";
import FormElement, { FormElementRefAttributes } from "../../components/FormElement/FormElement";
import { validateEmail, validateUsername } from "../../utils/Validators";
import FormButton from "../../components/FormButton/FormButton";
import { useNavigate } from "react-router-dom";
import CompoundPasswordElements, { CompoundPasswordRefAttributes } from "../../components/CompoundPasswordElements/CompoundPasswordElements";
import { register } from "../../utils/HttpRequests";


function RegisterPage() {
    const emailRef = useRef<FormElementRefAttributes>(null);
    const usernameRef = useRef<FormElementRefAttributes>(null);
    const compoundPasswordsRef = useRef<CompoundPasswordRefAttributes>(null);

    const [formValidationErrors, setFormValidationErrors] = useState<(string | null)>();
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage["userName"]) {
            navigate("/");
        }
    }, [navigate]);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const emailValidationMessage = emailRef.current?.triggerValidate();
        const usernameValidationMessage = usernameRef.current?.triggerValidate();
        const passwordsValidationMessages = compoundPasswordsRef.current?.triggerValidate();

        if (emailValidationMessage !== null || usernameValidationMessage !== null ||
            passwordsValidationMessages?.[0] !== null || passwordsValidationMessages?.[1] !== null) {

            console.log("There is validation error! Doesn't fetch data!");
            return;
        }

        const registerAsync = async () => {
            const formData = new FormData(event.target as HTMLFormElement);
            try {
                const response = await register(formData.get("username")?.toString()!, formData.get("email")?.toString()!,
                    formData.get("password")?.toString()!, formData.get("confirm_password")?.toString()!);
                if (response.status === 200) {
                    navigate("/registration_successful");
                } else if (response.status === 400) {
                    const problem = response.data;
                    console.log(problem);
                    setFormValidationErrors(problem.detail);
                } else if (response.status === 500) {
                    const problem = response.data;
                    console.log(problem);
                    setFormValidationErrors(problem.title);
                }
            } catch (error) {
                console.error(error);
            }
        }
        registerAsync();
    }

    return <div className="common-container">
        <form className={classes.Form} onSubmit={handleSubmit} noValidate>
            <FormElement inputType="email" name="email" maxLength={100} validate={validateEmail} ref={emailRef} />
            <FormElement inputType="text" name="username" maxLength={50} validate={validateUsername} ref={usernameRef} />
            <CompoundPasswordElements name="password" maxLength={64} ref={compoundPasswordsRef} />
            <div className={classes.FormValidation}>{formValidationErrors}</div>
            <FormButton label="Register" />
        </form>
    </div>
}

export default RegisterPage;