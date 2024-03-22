import { ChangeEvent, forwardRef, useImperativeHandle, useState } from "react";
import classes from "./CompoundPasswordElements.module.css";
import { validatePassword } from "../../utils/Validators";

type Password = {
    value: string,
    validationMessage: string | null
};

interface Props {
    maxLength: number,
    name: string,
    disabled?: boolean
}

export interface CompoundPasswordRefAttributes {
    triggerValidate: () => (string | null)[]
}

const CompoundPasswordElements = forwardRef<CompoundPasswordRefAttributes, Props>((props, ref) => {
    const [passwords, setPasswords] = useState<{ password: Password, confirmPassword: Password }>({
        password: {
            value: "",
            validationMessage: null
        },
        confirmPassword: {
            value: "",
            validationMessage: null
        }
    });

    useImperativeHandle(ref, () => ({
        triggerValidate: triggerValidate
    }));

    function validateConfirmPassword(confirmPassword: string, password: string) {
        if (confirmPassword === "") {
            return "Confirm password is required!";
        } else if (confirmPassword !== password) {
            return "Passwords doesn't match!";
        } else {
            return null;
        }
    }

    function triggerValidate(): (string | null)[] {
        const passwordValidationMessage = validatePassword(passwords.password.value);
        const confirmPasswordValidationMessage = validateConfirmPassword(passwords.confirmPassword.value,
            passwords.password.value);

        setPasswords(prev => {
            return {
                password: {
                    ...prev.password,
                    validationMessage: passwordValidationMessage
                },
                confirmPassword: {
                    ...prev.confirmPassword,
                    validationMessage: confirmPasswordValidationMessage
                }
            }
        });

        return [passwordValidationMessage, confirmPasswordValidationMessage];
    }

    function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
        const enteredValue = event.target.value;
        const passwordValidationMessage = validatePassword(enteredValue);
        const confirmPasswordValidationMessage = validateConfirmPassword(passwords.confirmPassword.value,
            event.target.value);

        setPasswords(prev => {
            return {
                password: {
                    value: enteredValue,
                    validationMessage: passwordValidationMessage
                },
                confirmPassword: {
                    ...prev.confirmPassword,
                    validationMessage: confirmPasswordValidationMessage
                }
            }
        });
    }

    function handleConfirmPasswordChange(event: ChangeEvent<HTMLInputElement>) {
        const enteredValue = event.target.value;
        const confirmPasswordValidationMessage = validateConfirmPassword(event.target.value,
            passwords.password.value);

        setPasswords(prev => {
            return {
                password: {
                    ...prev.password,
                },
                confirmPassword: {
                    value: enteredValue,
                    validationMessage: confirmPasswordValidationMessage
                }
            }
        });
    }

    function calculateLabel() {
        const arr = props.name.split("_");
        const newArr = arr.map(a => a[0].toUpperCase() + a.substring(1));
        return newArr.join(" ");
    }

    return <>
        <div className={classes.FormElement}>
            <label htmlFor={props.name}>{calculateLabel()}</label>
            <div className={classes.ValidationMessage}>
                {passwords.password.validationMessage}
            </div>
            <input id="password" type="password" value={passwords.password.value}
                onChange={handlePasswordChange} maxLength={props.maxLength} name={props.name}
                disabled={props.disabled}
            />
        </div>
        <div className={classes.FormElement}>
            <label htmlFor={"confirm_" + props.name}>Confirm {calculateLabel()}</label>
            <div className={classes.ValidationMessage}>
                {passwords.confirmPassword.validationMessage}
            </div>
            <input id="confirm_password" type="password" value={passwords.confirmPassword.value}
                onChange={handleConfirmPasswordChange} maxLength={props.maxLength} name={"confirm_" + props.name}
                disabled={props.disabled}
            />
        </div>
    </>
})

export default CompoundPasswordElements;