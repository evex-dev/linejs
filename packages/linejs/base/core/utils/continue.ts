export type Continuable = { continuationToken?: string; [k: string]: any };

export async function continueRequest<
	P extends Continuable,
	R extends Continuable,
	H extends (param: P) => Promise<R>,
>(options: {
	handler: H;
	arg: P;
}): Promise<ReturnType<H>> {
	function objectSum<O>(base: O, add: O): O {
		for (const key in add) {
			if (Object.prototype.hasOwnProperty.call(add, key)) {
				const value = add[key];
				if (typeof value === "object") {
					if (!base[key]) {
						base[key] = value;
					} else {
						if (Array.isArray(value)) {
							(base[key] as any) = [
								...value,
								...base[key] as any,
							] as any;
						} else {
							base[key] = objectSum(base[key], value);
						}
					}
				} else {
					base[key] = value;
				}
			}
		}
		return base;
	}
	let responseSum: R | undefined;
	let continuationToken: string | undefined;
	while (true) {
		options.arg.continuationToken = continuationToken;
		const _response = await options.handler(options.arg);
		if (!responseSum) {
			responseSum = _response;
		} else {
			objectSum(responseSum, _response);
		}
		if (!_response.continuationToken) {
			return responseSum as any;
		}
		continuationToken = _response.continuationToken;
	}
}
