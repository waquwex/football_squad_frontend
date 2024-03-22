import { FormEvent, useEffect, useRef, useState } from "react";
import FormElement, { FormElementRefAttributes } from "../../components/FormElement/FormElement";
import CompoundPasswordElements, { CompoundPasswordRefAttributes } from "../../components/CompoundPasswordElements/CompoundPasswordElements";
import FormButton from "../../components/FormButton/FormButton";
import { validatePassword } from "../../utils/Validators";
import { useNavigate } from "react-router-dom";
import classes from "./AccountPage.module.css";
import { changePassword, deleteAccount } from "../../utils/HttpRequests";
import { useDispatch } from "react-redux";
import { setUserName } from "../../store/userSlice";


function AccountPage() {
    const currentPasswordRef = useRef<FormElementRefAttributes>(null);
    const compoundPasswordsRef = useRef<CompoundPasswordRefAttributes>(null);
    const formRef = useRef(null!);
    const [formValidationErrors, setFormValidationErrors] = useState<(string | null)>();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (!localStorage["userName"]) {
            dispatch(setUserName(null));
            navigate("/");
        }
    }, [navigate, dispatch]);

    function handleFormSubmit(event: FormEvent) {
        event.preventDefault();
        const currentPasswordValidationMessage = currentPasswordRef.current?.triggerValidate();
        const passwordsValidationMessages = compoundPasswordsRef.current?.triggerValidate();

        if (currentPasswordValidationMessage !== null ||
            passwordsValidationMessages?.[0] !== null || passwordsValidationMessages?.[1] !== null) {

            console.log("There is validation error! Doesn't fetch data!");
            return;
        }

        const formData = new FormData(formRef.current);

        const changePasswordAsync = async () => {
            try {
                const response = await changePassword(formData.get("current_password")?.toString()!,
                    formData.get("new_password")?.toString()!, formData.get("confirm_new_password")?.toString()!);
                if (response.status === 200) {
                    navigate("/");
                } else if (response.status === 400) { // server-side validation errors
                    response.data.json().then((value: any) => {
                        console.log(value);
                        setFormValidationErrors(value.detail);
                    });
                } else if (response.status === 406) { // password is incorrect
                    setFormValidationErrors("Password is incorrect!");
                } else if (response.status === 511) {
                    console.log("can't get new token! refresh token is expired!");
                    localStorage.removeItem("token");
                    localStorage.removeItem("refreshToken");
                    localStorage.removeItem("userName");
                    dispatch(setUserName(null));
                    navigate("/");
                } else {
                    console.error(response);
                }
            } catch (error) {
                console.error(error);
            }
        }

        changePasswordAsync();
    }

    function handleDeleteAccount() {
        let promptInput = prompt("Type DELETE for deleting account");
        if (promptInput !== "DELETE") {
            return;
        }

        const deleteAccountAsync = async () => {
            try {
                const response = await deleteAccount();
                if (response.status === 200) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("refreshToken");
                    localStorage.removeItem("userName");
                    dispatch(setUserName(null));
                    navigate("/");
                } else {
                    alert("Can't delete account! Server error!");
                }
            } catch (error) {
                console.error(error);
                alert("Can't delete account!");
            }
        }

        deleteAccountAsync();
    }

    return <div className="common-container">
        <FormButton label="Delete Account" onClick={handleDeleteAccount}
            className={classes.DeleteAccount} />
        <form onSubmit={handleFormSubmit} noValidate className={classes.Form} ref={formRef}>
            <FormElement inputType="password" name="current_password" maxLength={64} validate={validatePassword}
                ref={currentPasswordRef} />
            <CompoundPasswordElements name="new_password" maxLength={64} ref={compoundPasswordsRef} />
            <div className={classes.FormValidation}>{formValidationErrors}</div>
            <FormButton label="Change Password" />
        </form>
    </div>
}

export default AccountPage;