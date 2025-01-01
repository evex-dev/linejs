// For Auth (login, refresh, etc)

import { LINEStruct, type ProtocolKey } from "../../thrift/mod.ts";
import type * as LINETypes from "@evex/linejs-types";
import { type BaseClient, InternalError } from "../../core/mod.ts";
import type { BaseService } from "../types.ts";

export class AuthService implements BaseService {
	client: BaseClient;
	protocolType: ProtocolKey = 4;
	requestPath = "/AS4";
	errorName = "AuthServiceError";
	constructor(client: BaseClient) {
		this.client = client;
	}

	/**
	 * @description Try to refresh token.
	 */
	public async tryRefreshToken() {
		const refreshToken = await this.client.storage.get("refreshToken");
		if (typeof refreshToken === "string") {
			const RATR = await this.refresh({ request: { refreshToken } });
			this.client.authToken = RATR.accessToken;
			this.client.emit("update:authtoken", RATR.accessToken);
			await this.client.storage.set(
				"expire",
				(RATR.tokenIssueTimeEpochSec as number) +
				(RATR.durationUntilRefreshInSec as number) as number,
			);
		} else {
			throw new InternalError("refreshError", "refreshToken not found");
		}
	}

	async refresh(
		...param: Parameters<typeof LINEStruct.refresh_args>
	): Promise<LINETypes.refresh_result["success"]> {
		return await this.client.request.request(
			LINEStruct.refresh_args(...param),
			"refresh",
			this.protocolType,
			true,
			"/EXT/auth/tokenrefresh/v1",
		);
	}

	async reportRefreshedAccessToken(
		...param: Parameters<typeof LINEStruct.reportRefreshedAccessToken_args>
	): Promise<LINETypes.reportRefreshedAccessToken_result["success"]> {
		return await this.client.request.request(
			LINEStruct.reportRefreshedAccessToken_args(...param),
			"reportRefreshedAccessToken",
			this.protocolType,
			true,
			this.requestPath,
		);
	}
	//
	async connectEapAccount(
		...param: Parameters<typeof LINEStruct.connectEapAccount_args>
	): Promise<LINETypes.connectEapAccount_result["success"]> {
		return await this.client.request.request(
			LINEStruct.connectEapAccount_args(...param),
			"connectEapAccount",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async disconnectEapAccount(
		...param: Parameters<typeof LINEStruct.disconnectEapAccount_args>
	): Promise<LINETypes.disconnectEapAccount_result["success"]> {
		return await this.client.request.request(
			LINEStruct.disconnectEapAccount_args(...param),
			"disconnectEapAccount",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async openSession(
		...param: Parameters<typeof LINEStruct.openSession_args>
	): Promise<LINETypes.openSession_result["success"]> {
		return await this.client.request.request(
			LINEStruct.openSession_args(...param),
			"openSession",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async verifyEapLogin(
		...param: Parameters<typeof LINEStruct.verifyEapLogin_args>
	): Promise<LINETypes.verifyEapLogin_result["success"]> {
		return await this.client.request.request(
			LINEStruct.verifyEapLogin_args(...param),
			"verifyEapLogin",
			this.protocolType,
			true,
			this.requestPath,
		);
	}
	//
	async updatePassword(
		...param: Parameters<typeof LINEStruct.updatePassword_args>
	): Promise<LINETypes.updatePassword_result["success"]> {
		return await this.client.request.request(
			LINEStruct.updatePassword_args(...param),
			"updatePassword",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async establishE2EESession(
		...param: Parameters<typeof LINEStruct.establishE2EESession_args>
	): Promise<LINETypes.establishE2EESession_result["success"]> {
		return await this.client.request.request(
			LINEStruct.establishE2EESession_args(...param),
			"establishE2EESession",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async issueTokenForAccountMigrationSettings(
		...param: Parameters<
			typeof LINEStruct.issueTokenForAccountMigrationSettings_args
		>
	): Promise<
		LINETypes.issueTokenForAccountMigrationSettings_result["success"]
	> {
		return await this.client.request.request(
			LINEStruct.issueTokenForAccountMigrationSettings_args(...param),
			"issueTokenForAccountMigrationSettings",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async openAuthSession(
		...param: Parameters<typeof LINEStruct.openAuthSession_args>
	): Promise<LINETypes.openAuthSession_result["success"]> {
		return await this.client.request.request(
			LINEStruct.openAuthSession_args(...param),
			"openAuthSession",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async getAuthRSAKey(
		...param: Parameters<typeof LINEStruct.getAuthRSAKey_args>
	): Promise<LINETypes.getAuthRSAKey_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getAuthRSAKey_args(...param),
			"getAuthRSAKey",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async setIdentifier(
		...param: Parameters<typeof LINEStruct.setIdentifier_args>
	): Promise<LINETypes.setIdentifier_result["success"]> {
		return await this.client.request.request(
			LINEStruct.setIdentifier_args(...param),
			"setIdentifier",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async updateIdentifier(
		...param: Parameters<typeof LINEStruct.updateIdentifier_args>
	): Promise<LINETypes.updateIdentifier_result["success"]> {
		return await this.client.request.request(
			LINEStruct.updateIdentifier_args(...param),
			"updateIdentifier",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async resendIdentifierConfirmation(
		...param: Parameters<
			typeof LINEStruct.resendIdentifierConfirmation_args
		>
	): Promise<LINETypes.resendIdentifierConfirmation_result["success"]> {
		return await this.client.request.request(
			LINEStruct.resendIdentifierConfirmation_args(...param),
			"resendIdentifierConfirmation",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async confirmIdentifier(
		...param: Parameters<typeof LINEStruct.confirmIdentifier_args>
	): Promise<LINETypes.confirmIdentifier_result["success"]> {
		return await this.client.request.request(
			LINEStruct.confirmIdentifier_args(...param),
			"confirmIdentifier",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async removeIdentifier(
		...param: Parameters<typeof LINEStruct.removeIdentifier_args>
	): Promise<LINETypes.removeIdentifier_result["success"]> {
		return await this.client.request.request(
			LINEStruct.removeIdentifier_args(...param),
			"removeIdentifier",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async issueV3TokenForPrimary(
		...param: Parameters<typeof LINEStruct.issueV3TokenForPrimary_args>
	): Promise<LINETypes.issueV3TokenForPrimary_result["success"]> {
		return await this.client.request.request(
			LINEStruct.issueV3TokenForPrimary_args(...param),
			"issueV3TokenForPrimary",
			this.protocolType,
			true,
			this.requestPath,
		);
	}
}
