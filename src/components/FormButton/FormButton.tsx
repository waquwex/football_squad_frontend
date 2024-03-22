import classes from "./FormButton.module.css";

interface Props {
    label: string,
    onClick?: () => void,
    className?: string,
    disabled?: boolean
}

function FormButton(props: Props) {
    return <button type="submit" className={classes.Button + " " + props.className}
        onClick={props.onClick} disabled={props.disabled}>
        {props.label}
    </button>;
}

export default FormButton;