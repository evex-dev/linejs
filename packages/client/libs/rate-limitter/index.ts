import type { LooseType } from "../../entities/common.ts";
import { RateLimitError } from "./error.ts";

interface CallStack {
	call: () => LooseType;
	time: number;
}

export class RateLimitter {
	private previousCallTime: number = 0;
	private callStacks: CallStack[] = [];
	private isLocked: boolean = false;

	constructor(
		private readonly limitCallCount: number = 9,
		private readonly betweenCallTime: number = 2000,
	) {
		if (this.limitCallCount < 1) {
			throw new RateLimitError("limitCallCount must be greater than 0");
		}

		if (this.betweenCallTime < 0) {
			throw new RateLimitError("betweenCallTime must be greater than 0");
		}
	}

	public appendCall(call: CallStack["call"]) {
		this.callStacks.push({
			call,
			time: Date.now(),
		});
	}

	public async callPolling() {
		if (this.isLocked) {
			return;
		}

		this.isLocked = true;

		try {
			const now = Date.now();
			let processedCalls = 0;

			if (
				this.previousCallTime > 0 &&
				now - this.previousCallTime < this.betweenCallTime
			) {
				await this.sleep(this.betweenCallTime - (now - this.previousCallTime));
				throw new RateLimitError(
					`Exceeded ${this.betweenCallTime} ms between calls`,
				);
			}

			while (
				this.callStacks.length > 0 &&
				processedCalls < this.limitCallCount
			) {
				const callStack = this.callStacks.shift();
				console.log(callStack);
				if (callStack) {
					this.previousCallTime = Date.now();
					callStack.call();
					processedCalls++;
				}

				await this.sleep(this.betweenCallTime / this.limitCallCount);
			}
		} catch (e) {
			console.log(e);
			this.pollingBack();
		} finally {
			this.pollingBack();
		}
	}

	private async pollingBack() {
		this.isLocked = false;
		await this.sleep(this.betweenCallTime / this.limitCallCount + 4);
		await this.callPolling();
	}

	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	public clear() {
		this.callStacks = [];
		this.previousCallTime = 0;
		this.isLocked = false;
	}
}
