export type CliErrorCode =
	| "USAGE"
	| "AUTH_REQUIRED"
	| "AUTH_FAILED"
	| "PROFILE_NOT_FOUND"
	| "PROFILE_EXISTS"
	| "PROFILE_INVALID"
	| "CONFIRMATION_REQUIRED"
	| "INTERACTIVE_REQUIRED"
	| "NOT_FOUND"
	| "TIMEOUT"
	| "CANCELED"
	| "LINEJS_ERROR"
	| "INTERNAL";

/**
 * An expected failure. `runCli` turns this into a stable message/exit code
 * instead of dumping a stack trace.
 */
export class CliError extends Error {
	readonly code: CliErrorCode;
	readonly exitCode: number;
	readonly details?: unknown;

	constructor(
		code: CliErrorCode,
		message: string,
		options: { exitCode?: number; details?: unknown; cause?: unknown } = {},
	) {
		super(message, { cause: options.cause });
		this.name = "CliError";
		this.code = code;
		this.exitCode = options.exitCode ?? 1;
		this.details = options.details;
	}
}

export class UsageError extends CliError {
	constructor(message: string, details?: unknown) {
		super("USAGE", message, { exitCode: 2, details });
		this.name = "UsageError";
	}
}

export function errorMessage(error: unknown): string {
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	try {
		return JSON.stringify(error);
	} catch {
		return String(error);
	}
}

export function toErrorPayload(error: unknown): {
	code: string;
	message: string;
	details?: unknown;
} {
	if (error instanceof CliError) {
		return {
			code: error.code,
			message: error.message,
			...(error.details === undefined ? {} : { details: error.details }),
		};
	}
	if (error instanceof Error) {
		return {
			code: "INTERNAL",
			message: error.message,
			details: {
				name: error.name,
				...(error.stack ? { stack: error.stack } : {}),
				...(error.cause === undefined ? {} : { cause: errorMessage(error.cause) }),
			},
		};
	}
	return { code: "INTERNAL", message: errorMessage(error) };
}
