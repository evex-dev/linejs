const EMAIL_REGEX =
	/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const PASSWORD_REGEX = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
const AUTH_TOKEN_REGEX = /^.*$/;

export { AUTH_TOKEN_REGEX, EMAIL_REGEX, PASSWORD_REGEX };
