import { ChangeEvent, HTMLInputTypeAttribute, forwardRef, useImperativeHandle, useState } from "react";
import classes from "./FormElement.module.css";

type FormElementState = {
    value: string,
    validationMessage: string | null
};

interface Props {
    name: string,
    inputType: HTMLInputTypeAttribute,
    validate: (value: string) => (string | null), // if not valid return validation message, if valid return null
    maxLength: number,
    disabled?: boolean
}

export interface FormElementRefAttributes {
    triggerValidate: () => (string | null)
}

const FormElement = forwardRef<FormElementRefAttributes, Props>((props, ref) => {
    const [formElement, setFormElement] = useState<FormElementState>({value: "", validationMessage: null});

    useImperativeHandle(ref, () => ({
        getValue: () => formElement?.value,
        triggerValidate: triggerValidate
    }));

    function triggerValidate(): (string | null) {
        const validationMessage = props.validate(formElement.value);
        setFormElement(prev => {
            return {
                ...prev,
                validationMessage
            }
        });

        return validationMessage;
    }

    function handleElementChange(event: ChangeEvent<HTMLInputElement>) {
        const enteredValue = event.target.value;
        const validationMessage = props.validate(enteredValue);
        setFormElement({ value: enteredValue, validationMessage: validationMessage });
    }

    function calculateLabel() {
        const arr = props.name.split("_");
        const newArr = arr.map(a => a[0].toUpperCase() + a.substring(1));
        return newArr.join(" ");
    }

    return <div className={classes.FormElement}>
        <label htmlFor={props.name}>{calculateLabel()}</label>
        <div className={classes.ValidationMessage}>
            {formElement?.validationMessage}
        </div>
        <input id={props.name} type={props.inputType} value={formElement?.value}
            onChange={handleElementChange} maxLength={props.maxLength} name={props.name} disabled={props.disabled}
        />
    </div>
})


export default FormElement;