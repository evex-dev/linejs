const EMAIL_REGEX =
	/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const PASSWORD_REGEX = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
const AUTH_TOKEN_REGEX = /^.*$/;
const PRIMARY_TOKEN_REGEX = /^[a-z0-9]+?\:.*$/;

export { AUTH_TOKEN_REGEX, EMAIL_REGEX, PASSWORD_REGEX, PRIMARY_TOKEN_REGEX };
