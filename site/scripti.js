var DEVICE;

async function LoginMP(mail, pw, dev, cert) {
	DEVICE = dev;
	let rsaKey = await getRSAKeyInfo();
	let keynm = rsaKey[1];
	let nvalue = rsaKey[2];
	let evalue = rsaKey[3];
	let sessionKey = rsaKey[4];
	let certificate = cert;
	let _req = await genReq(
		sessionKey,
		mail,
		pw,
		nvalue,
		evalue,
	);
	let secret = _req.other.secret;
	let pincode = _req.other.pincode;
	let res = await loginV2(
		keynm,
		_req.encData,
		_req.secret,
		"Remote1919",
		certificate,
		null,
		"LoginZ",
	);
	if (!res[1]) {
		let verifier = res[3];
		console.log("Enter Pincode: " + pincode);
		let e2eeInfo = await checkLoginV2PinCode(verifier)["metadata"];
		let blablabao = await genEncDevSec(e2eeInfo, secret);
		let e2eeLogin = await confirmE2EELogin(verifier, blablabao);
		res = await loginV2(
			keynm,
			_req.encData,
			_req.secret,
			"Remote1919",
			certificate,
			e2eeLogin,
			"LoginZ",
		);
		return [res[1], res[2]];
	}
	return [res[1]];
}

const mkSoc = (path, tok, dev, ex) => {
	return new Promise((resolve, reject) => {
		new LineTCompactSocket(path, tok, dev, resolve, ex);
	});
};

const getRSAKeyInfo = async () => {
	const params = [
		[8, 2, 1],
	];
	var soc = await mkSoc("/api/v3/TalkService.do", 0, DEVICE);
	const res = await soc.postCHRRequestAndGetResponse(params, "getRSAKeyInfo");
	soc.closeSocket();
	return res;
};

const genReq = async (
	sessionKey,
	email,
	pw,
	nvalue,
	evalue,
) => {
	let res = await fetch(
		"https://v-linelogin.vercel.app/genReq/?arg=" +
			enc(JSON.stringify({
				sessionKey: sessionKey,
				email: email,
				pw: pw,
				nvalue: nvalue,
				evalue: evalue,
			})),
	);
	return await res.json();
};

const genEncDevSec = async (e2eeInfo, secret) => {
	e2eeInfo["secret"] = secret;
	let res = await fetch(
		"https://v-linelogin.vercel.app/genEncDevSec/?" +
			new URLSearchParams({ arg: (JSON.stringify(e2eeInfo)) }).toString(),
	);
	return await res.text();
};

const loginV2 = async (
	keynm,
	encData,
	secret,
	deviceName = "Chrome",
	cert = null,
	verifier = null,
	calledName = "loginV2",
) => {
	let loginType = 2;
	if (!secret) loginType = 0;
	if (verifier) loginType = 1;
	const params = [
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
	];
	var soc = await mkSoc("/api/v3p/rs", 0, DEVICE);
	const res = await soc.postCHRRequestAndGetResponse(params, calledName);
	soc.closeSocket();
	return res;
};

const checkLoginV2PinCode = async (accessSession) => {
	var soc = await mkSoc("/LF1", 0, DEVICE, { "x-lhm": "GET", "x-line-access": accessSession });
	const res = await soc.postRRequestAndGetRResponse("");
	soc.closeSocket();
	return JSON.parse(new TextDecoder().decode(res))["result"];
};

const confirmE2EELogin = async (verifier, deviceSecret) => {
	const params = [
		[11, 1, verifier],
		[11, 2, deviceSecret],
	];
	var soc = await mkSoc("/api/v3p/rs", 0, DEVICE);
	const res = await soc.postCHRRequestAndGetResponse(params, "confirmE2EELogin");
	soc.closeSocket();
	return res;
};
class LineTCompactSocket {
	constructor(gwPath, authToken, device, resolve, extraH) {
		this.socket = {};
		this.socketInfo = {};
		let appVer, sysName, sysVer, UA, appName;
		sysVer = "12.1.4";
		switch (device) {
			case "DESKTOPWIN":
				appVer = "7.16.1.3000";
				sysName = "WINDOWS";
				sysVer = "10.0.0-NT-x64";
				break;
			case "DESKTOPMAC":
				appVer = "7.16.1.3000";
				sysName = "MAC";
				break;
			case "CHROMEOS":
				appVer = "3.0.3";
				sysName = "Chrome_OS";
				sysVer = "1";
				break;
			case "ANDROID":
				appVer = "13.4.1";
				sysName = "Android OS";
				break;
			case "IOS":
				appVer = "13.3.0";
				sysName = "iOS";
				break;
			case "IOSIPAD":
				appVer = "13.3.0";
				sysName = "iOS";
				break;
			case "WATCHOS":
				appVer = "13.3.0";
				sysName = "Watch OS";
				break;
			case "WEAROS":
				appVer = "13.4.1";
				sysName = "Wear OS";
				break;
			default:
				return new Error("device name is wrong");
				break;
		}
		appName = device + "\t" + appVer + "\t" + sysName + "\t" + sysVer;
		UA = "Line/" + appVer;
		let account = { path: gwPath, auth: authToken, ua: UA, type: appName };
		if (extraH) {
			account["ex"] = JSON.stringify(extraH);
		}
		//this.socket.post = new WebSocket("wss://line-selfbot.deno.dev/post?" + new URLSearchParams(account).toString())
		this.socket.post = new WebSocket("ws://localhost:8000/post?" + new URLSearchParams(account).toString());
		this.socket.post.onopen = (e) => {
			try {
				resolve(this);
			} catch (e) {
			}
			this.socketInfo.post = { status: "open", waitFunc: {} };
		};
		this.socket.post.onclose = (e) => {
			this.socketInfo.post.status = false;
		};
		this.socket.post.onmessage = null;
		this.socket.post.onclose = (e) => {
			this.socketInfo.post = { status: false };
		};
	}
	closeSocket() {
		try {
			this.socket.post.close();
		} catch (e) {
		}
	}
	post(data) {
		return new Promise((resolve, reject) => {
			data.id = Date.now();
			this.send(this.socket.post, this.socketInfo.post.waitFunc, data, resolve);
		});
	}
	postr(data) {
		return new Promise((resolve, reject) => {
			data.id = Date.now();
			this.sendr(this.socket.post, this.socketInfo.post.waitFunc, data, resolve);
		});
	}
	postAndCheckResponse(data) {
		return new Promise((resolve, reject) => {
			this.post(data).then((r) => {
				if (r.err) {
					throw new Error(r.err);
				} else {
					resolve(r);
				}
			});
		});
	}
	sendr(socket, FuncMap, data, returnFunc) {
		if (socket.readyState === socket.OPEN) {
			socket.send(JSON.stringify(data));
			FuncMap[data.id] = (e) => {
				returnFunc(e.data);
			};
			socket.onmessage = (e) => {
				try {
					let j = new Uint8Array(e.data);
					let id = 0;
					for (let index = 0; index < j[2]; index++) {
						const element = j[3 + index];
						id += element * (0xff ** index);
					}
					FuncMap[id](j.slice(3 + j[2]));
					delete FuncMap[id];
				} catch (error) {
				}
			};
		} else throw new Error("socket not open");
	}

	async postParseThrift(data) {
		let reqJson, resJson;
		reqJson = data;
		resJson = JSON.parse(await this.postAndCheckResponse(reqJson));
		return resJson;
	}
	async postRRequestAndGetRResponse(data, isBuf = false) {
		let request = { value: data, type: 5 };
		if (isBuf) {
			request.name = "b64";
			request.value = btoa([...data].map((n) => String.fromCharCode(n)).join(""));
		}
		let response = await this.postr(request);
		return response;
	}
	async postCHRRequestAndGetResponse(data, methodName) {
		let request = { value: data, name: methodName, type: 3 };
		let response = await this.postParseThrift(request);
		return response.value;
	}
	async postRequestAndGetResponse(data, methodName) {
		let request = { value: data, name: methodName, type: 1 };
		let response = await this.postParseThrift(request);
		return response.value;
	}
	async postRequestAndGetContinueResponse(data, methodName) {
		let responseList = [];
		let addKeys = [];
		let noAddKeys = [];
		let request = { value: data, name: methodName, type: 1 };
		let response = await this.postParseThrift(request);
		responseList.push(response.value);
		while (response.value.continuationToken) {
			request.value.continuationToken = response.value.continuationToken;
			request.value.syncToken = response.value.syncToken;
			response = await this.postParseThrift(request);
			responseList.push(response.value);
		}
		Object.keys(responseList[0]).forEach((e) => {
			if ((typeof responseList[0][e]) == "object") {
				addKeys.push(e);
			} else {
				noAddKeys.push(e);
			}
		});
		let returnjson = {};
		responseList.forEach((e) => {
			noAddKeys.forEach((f) => {
				returnjson[f] = e[f];
			});
			addKeys.forEach((g) => {
				if (e[g].forEach) {
					if (returnjson[g]) {
						returnjson[g] = [...returnjson[g], ...e[g]];
					} else {
						returnjson[g] = e[g];
					}
				} else {
					if (returnjson[g]) {
						returnjson[g] = { ...returnjson[g], ...e[g] };
					} else {
						returnjson[g] = e[g];
					}
				}
			});
		});
		return returnjson;
	}
	send(socket, FuncMap, data, returnFunc) {
		if (socket.readyState === socket.OPEN) {
			socket.send(JSON.stringify(data));
			FuncMap[data.id] = (e) => {
				returnFunc(e.data);
			};
			socket.onmessage = (e) => {
				try {
					let j = JSON.parse(e.data);
					FuncMap[j.id](e);
					delete FuncMap[j.id];
				} catch (error) {
				}
			};
		} else throw new Error("socket not open");
	}
}

class LineSquareClient {
	constructor(authToken, device, resolve) {
		this.SQ1 = new LineTCompactSocket("/SQ1", authToken, device, resolve);
	}
	async findSquareByInvitationTicket(ticket) {
		let v = { invitationTicket: ticket };
		let n = "findSquareByInvitationTicket";
		return await this.SQ1.postRequestAndGetResponse(v, n);
	}
	async getJoinedSquares() {
		let v = { limit: 100 };
		let n = "getJoinedSquares";
		return await this.SQ1.postRequestAndGetContinueResponse(v, n);
	}
	async searchSquareMembers(squareMid, searchOption = {}) {
		let v = {
			squareMid: squareMid,
			searchOption: searchOption,
			limit: 200,
		};
		let n = "searchSquareMembers";
		return await this.SQ1.postRequestAndGetContinueResponse(v, n);
	}
	async getBannedMembers(squareMid) {
		return await this.searchSquareMembers(squareMid, { "membershipState": 6 });
	}
	async sendTxtMessage(squareChatMid, text, contentMetadata = {}, reqSeq = 1) {
		let v = {
			reqSeq: reqSeq,
			squareChatMid: squareChatMid,
			squareMessage: {
				message: {
					to: squareChatMid,
					contentType: 0,
					text: text,
					contentMetadata: contentMetadata,
				},
			},
		};
		let n = "sendMessage";
		return await this.SQ1.postRequestAndGetResponse(v, n);
	}
	async fetchMyEvents(syncToken) {
		let v = {
			syncToken: syncToken,
			limit: 200,
		};
		if (!v.syncToken) {
			delete v.syncToken;
		}
		let n = "fetchMyEvents";
		return await this.SQ1.postRequestAndGetContinueResponse(v, n);
	}
	async fetchSquareChatEvents(squareChatMid, syncToken) {
		let v = {
			squareChatMid: squareChatMid,
			limit: 200,
		};
		if (syncToken) {
			v.syncToken = syncToken;
		}
		let n = "fetchSquareChatEvents";
		return await Account.postRequestAndGetResponse(v, n);
	}
}
