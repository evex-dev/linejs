class PinVerifier {
	constructor(message) {
		this.message = message;
	}

	getRSACrypto(json) {
		const message = this.message;
		const rsa = new RSAKey();
		console.log(rsa);
		rsa.setPublic(json[2], json[3]);
		const credentials = rsa.encrypt(message);
		const keyname = json[1];
		return { keyname, credentials, message };
	}
}
class LoginAPI {
	certs = {};
	async requestEmailLogin(
		email,
		pw,
		pin = (p) => console.log(`Enter Pincode:`, p),
		e2ee = false,
	) {
		const rsaKey = await this.getRSAKeyInfo();
		const keynm = rsaKey[1];
		const nvalue = rsaKey[2];
		const evalue = rsaKey[3];
		const sessionKey = rsaKey[4];
		const message = String.fromCharCode(sessionKey.length) +
			sessionKey +
			String.fromCharCode(email.length) +
			email +
			String.fromCharCode(pw.length) +
			pw;
		const crypto = new PinVerifier(message).getRSACrypto(rsaKey).credentials;
		let secret;
		if (e2ee) { //ß
			secret =
				"0\x8aEH\x96\xa7\x8d#5<\xfb\x91c\x12\x15\xbd\x13H\xfa\x04d\xcf\x96\xee1e\xa0]v,\x9f\xf2";
		}
		const res = await this.loginV2(
			keynm,
			crypto,
			secret,
			this.device,
			null, //"0697765bf509fed4ab1de69aae623212bdd1bd875bee9db071e7d413e9d84f90", //this.certs[email],
			null,
			"loginZ",
		);
		if (res[1]) {
			this.authToken = res[1];
			return res;
		} else {
			pin(res[4]);
			const headers = {
				"Host": "gw.line.naver.jp",
				"accept": "application/x-thrift",
				"user-agent": this.ua,
				"x-line-application": this.type,
				"x-line-access": res[3],
				"x-lal": "ja_JP",
				//'x-le': '18', 'x-lap': '5',
				"x-lpv": "1",
				"x-lhm": "GET",
				//"x-lcs":'0005svgBAiJMiGMJdzBkKqR/78GAZEMOQ6E0p3FJkMBZA/NXe10zfYnVQDufzNaRMEW1nvYJYsLWZaWb4ww7EsebLNXGbuhmyAT2V4Fr3tA23xzvvbOaLjCahQK/4qrha2gC54XuPRbtSFNzALjs3rAyfWyczSnlenV/KFv06iqMmt1v+l3KBQdBkN9uLqGRTXzII0Y/rXtkw1wTYvMZZB7b6KunfzHf9AbFOMCqyveInGhYAetFN9Ly9x3kf2uC2czTSlynvelkYn4qn2VeGmAWOLqZrbQelyh/rRIFPttCILbOrWNEwv71Y7Pa1C0MTGFGlWWQQKlBHj0lcK+kJL13Ww==',
				"accept-encoding": "gzip",
			};
			const verifier = await this.proxyFetch(
				"https://gw.line.naver.jp/Q",
				headers,
			).then((res) => res.json());
			const login_res = await this.loginV2(
				keynm,
				crypto,
				secret,
				this.deviceName,
				null,
				verifier.result.verifier,
				"loginZ",
			);
			this.certs[email] = login_res[2];
			this.authToken = login_res[1];
			return login_res;
		}
	}
	async loginV2(
		keynm,
		encData,
		secret,
		deviceName = this.device,
		cert,
		verifier,
		calledName = "loginV2",
	) {
		let loginType = 2;
		if (!secret) loginType = 0;
		if (verifier) {
			loginType = 1;
		}
		return await this.direct_request(
			[
				[
					12,
					2,
					[
						[8, 1, loginType],
						[8, 2, 1],
						[11, 3, keynm],
						[11, 4, encData],
						[2, 5, 0],
						[11, 6, ""],
						[11, 7, deviceName],
						[11, 8, cert],
						[11, 9, verifier],
						[11, 10, secret],
						[8, 11, 1],
						[11, 12, "System Product Name"],
					],
				],
			],
			calledName,
			3,
			true,
			"/api/v3p/rs",
		);
	}
	async getRSAKeyInfo(provider = 0) {
		return await this.request(
			[
				[8, 2, provider],
			],
			"getRSAKeyInfo",
			3,
			true,
			"/api/v3/TalkService.do",
		);
	}
}
