const EMAIL_REGEX_PATTERN = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
const USERNAME_REGEX_PATTERN = /^([A-Za-z\d._-]{5,})$/;
const PASSWORD_REGEX_PATTERN = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[._*-])[A-Za-z\d._*-]{8,}$/;


export function validatePassword(value: string) {
    if (value === "") {
        return "Password is required";
    } else if (value.length < 8) {
        return "Password should be at least 8 characters in length"
    } else if (!PASSWORD_REGEX_PATTERN.test(value)) {
        return "Password should contain atleast one upper case one lower case and " + 
        "one of * _ - . characters";
    } else {
        return null;
    }
}

export function validateEmail(value: string) {
    if (value === "") {
        return "Email is required";
    } else if (value.length !== 0 && !EMAIL_REGEX_PATTERN.test(value)) {
        return "Email is not valid";
    } else {
        return null;
    }
}

export function validateUsername(value: string) {
    if (value === "") {
        return "Username is required";
    } else if (value.length < 5) {
        return "Username should be at least 5 characters in length"
    } else if (!USERNAME_REGEX_PATTERN.test(value)) {
        return "Username should contain only English letters, numbers and - _ . characters";
    } else {
        return null;
    }
}