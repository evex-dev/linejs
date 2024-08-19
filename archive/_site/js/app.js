class LINEAPP {
	constructor() {
	}
	initByToken(authToken, device) {
		this.LINE = new LineClient({ authToken, device });
		this.initHTML();
		this.start();
	}
	initByMPLogin(email, pw, device) {
		this.LINE = new LineClient({
			device,
			email,
			pw,
			pincall: (pin) => this.enterPinCode(pin),
		});
		this.initHTML();
		this.start();
	}
	start() {
		//this.LINE.squareEvent()
	}
}
LINEAPP.prototype.initHTML = INIT_HTML;
