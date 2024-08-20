class TMoreCompactProtocol extends TCompactProtocol {
	constructor(cl, a = null, baseException = null, readWith = null) {
		super(); // Call the parent class constructor
		this.cl = cl; // cl init
		this.__a = []; // 1st init
		this.__b = []; // 1st init
		this.__c = this._b; // 1st init
		this.__d = []; // 2nd init
		this.__e = []; // 2nd init
		this.__f = []; // 3rd init
		this.__h = this._c; // 2nd init
		this.__last_fid = 0; // base fid
		this.__last_pos = 0; // base pos
		this.__last_sid = 0; // base sid
		this._a(); // 4th init
		this.res = null; // base res
		this.baseException = baseException; // init
		if (baseException === null) {
			this.baseException = Thrift.BASE_EXCEPTION; // base
		}
		this.readWith = readWith; // readWith
		if (a !== null) { // not None
			this.d(a); // for data
		}
	}

	a(cArr, b2) {
		this.__b[b2] = cArr; // bk array!!
		let i2 = 0; // base init!
		for (let c2 of cArr) {
			if (c2 === "0") { // is 0
				i2 = (i2 << 1) + 1; // + 1
			} else if (c2 === "1") { // is 1
				i2 = (i2 << 1) + 2; // + 2
			}
		}
		this.__a[i2] = b2; // init array
	}

	b() {
		let i2 = 0; // base init
		let i3 = 0; // base init
		while (true) {
			const l2 = this.data[this.__last_pos]; // so good!!
			this.__last_pos += 1; // fixed pos
			i2 |= (l2 & 127) << i3; // yea baby!
			if ((l2 & 128) !== 128) { // come on!!
				return i2; // break!!!!
			}
			i3 += 7; // + 7!!!!!!
		}
	}

	c(p, i2) {
		if (i2 === 0) { // is 0!!
			return []; // break!
		}
		const bArr = this.data.slice(p, p + i2); // read!!
		return Array.from(bArr); // break!
	}

	d(d) {
		this.data = d; // base init!
		return this.t(); // base init?
	}

	e() {
		let a = null; // base init
		let b = null; // base init
		let c = 0; // base init
		let d = new DummyProtocol(); // dummy >w<
		const _fid = this.b(); // read fid!
		if (_fid === 0) {
			// pass
		} else if (_fid === 1 || _fid === 2) {
			const [fid] = this.n(_fid); // read
			if (fid === 0) {
				const _type = this.w(); // read data
				[a, d] = this.g(_type, fid); // read data
			} else if (fid === 1) {
				const _type = this.w(); // read data
				[a, d] = this.g(_type, fid); // read data
				a = {
					error: {
						code: a.get(this.baseException["code"]),
						message: a.get(this.baseException["message"]),
						metadata: a.get(this.baseException["metadata"]),
						_data: a,
					},
				};
			} else if (fid === 5) {
				const _type = this.w(); // read data
				[a, d] = this.g(_type, fid); // exception!
				throw new Exception(a); // raise!
			} else {
				throw new EOFError(`fid ${fid} not implemented`); // exception!
			}
		} else {
			const _type = this.w(); // read data
			[a, d] = this.g(_type); // read data
			throw new EOFError(
				`recv fid \`${_fid}\`, expected \`1\`, message: \`${a}\``,
			); // err
		}
		this.res = a; // write data
		this.dummyProtocol = d; // write data
	}

	f(n) {
		return (n >> 1) ^ -(n & 1); // hmm...
	}

	g(t, fid = null) {
		let a = null; // base
		let b = null; // base
		let c = 0; // base
		let dummyProtocol = new DummyProtocol(); // base
		let dummyProtocolData = null; // base
		let subType = null; // base

		if (t === 2) {
			b = this.b(); // read
			a = Boolean(b); // bool
		} else if (t === 3) {
			let dec = new Thrift.TCompactProtocol(this.cl); // init
			a = dec.readByte(this.data.slice(this.__last_pos)); // byte
			this.__last_pos += 1; // fix!
		} else if (t === 4) {
			let dec = new Thrift.TCompactProtocol(this.cl); // init
			a = dec.readDouble(this.data.slice(this.__last_pos)); // read
			this.__last_pos += 8; // fix!
		} else if (t === 8) {
			let _a = this.x(this.data.slice(this.__last_pos)); // read
			a = this.f(_a); // int!
		} else if (t === 10) {
			let _a = this.b(); // read
			a = this.f(_a); // int?
		} else if (t === 11) {
			a = this.s(); // str!
		} else if (t === 12) {
			a = {}; // base
			b = this.b(); // read
			c = this.n(b); // read
			dummyProtocolData = []; // base
			for (let d of c) {
				[a[d], dummyProtocolData] = this.g(this.w(), d); // fld!
				dummyProtocolData.push(dummyProtocolData.data); // init
			}
		} else if (t === 13) {
			a = {}; // base
			c = this.b(); // read
			subType = [0, 0]; // base
			dummyProtocolData = {}; // base
			if (c !== 0) {
				let d = this.y(); // read
				let [t1, t2] = this.q(d); // read
				subType = [t1, t2]; // init
				for (let i = 0; i < c; i++) {
					let [k, _kDPD] = this.g(t1); // key!
					let [v, _vDPD] = this.g(t2); // val!
					dummyProtocolData[_kDPD.data] = _vDPD.data;
					a[k] = v; // dict
				}
			}
		} else if (t === 14 || t === 15) {
			a = []; // base
			let dec = new Thrift.TCompactProtocol(this.cl); // init
			let [ftype, count, offset] = dec.readCollectionBegin(
				this.data.slice(this.__last_pos),
			); // read
			this.__last_pos += offset; // fix!
			subType = [this._d(ftype)]; // init
			dummyProtocolData = []; // base
			for (let i = 0; i < count; i++) {
				let [b, _dummyProtocolData] = this.g(this._d(ftype)); // read
				a.push(b); // list
				dummyProtocolData.push(_dummyProtocolData.data); // init
			}
		} else if (t === 16) {
			b = this.b(); // read
			c = -(b & 1) ^ this._e(b, 1); // wtf?
			let d = c + this.__last_sid; // fix?
			this.__last_sid = d; // idk.
			a = String(d); // str!
			t = 11; // fix.
		} else if (t === 17) {
			b = this.b(); // read
			if (this.__e.length > b) {
				a = this.__e[b]; // str?
				t = 11; // fix.
			} else {
				console.log(`mid not found: ${b}`); // no way
			}
		} else {
			throw new Error(`cAN't rEad TyPE: ${t}`); // err!
		}

		if (dummyProtocolData === null) {
			dummyProtocolData = a; // base
		}
		dummyProtocol.data = new DummyProtocolData(
			fid,
			t,
			dummyProtocolData,
			subType,
		); // good
		return [a, dummyProtocol]; // nice
	}

	h(n) {
		return (n << 1) ^ (n >> 31);
	}

	m() {
		let a = this.b(); // get count
		for (let _a = 0; _a < a; _a++) {
			let bArr = [this.data[this.__last_pos]]; // coooooool
			bArr = bArr.concat(
				this.__h(this.data.slice(this.__last_pos + 1, this.__last_pos + 17)),
			); // not magic
			this.__e.push(String.fromCharCode.apply(null, bArr)); // wow magic
			this.__last_pos += 17; // real pos?
		}
		this.e(); // base init
	}

	n(d) {
		let a = []; // base init
		let i = 0; // base init
		while (true) {
			let b = 1 << i; // set &
			if (b > d) {
				break; // break
			} else if ((d & b) !== 0) {
				a.push(i); // add
			}
			i += 1; // + 1
		}
		return a; // break
	}

	q(d) {
		return [this._d(d >> 4), this._d(d & 15)]; // cool
	}

	s() {
		let a = this.b(); // read value
		let b = this.data.slice(this.__last_pos, this.__last_pos + a); // init first
		try {
			b = String.fromCharCode.apply(null, b); // any ideas?
		} catch (e) {
			// lamo idea.
		}
		this.__last_pos += a; // fixed pos!
		return b; // - break! -
	}

	t() {
		this.__last_pos = 3; // fixed pos
		if (this.data.length === 4) {
			throw new Error(`Invalid data: ${this.data} (code: 20)`); // raise
		}
		let a = this.b(); // first data
		let b = this.c(this.__last_pos, a); // 2nd data!!
		this.__d = Array.from(new Uint8Array(a << 1)); // 3rd? no!!!
		let d = 0; // base init
		let e = 0; // base init
		let f = 0; // base init
		let g = 0; // base init
		for (let h of b) {
			let _a = 0; // base value!
			let _b = 128; // base value?
			while (_a < 8) {
				if ((h & _b) === 0) {
					d = (g << 1) + 1; // + 1
				} else {
					d = (g << 1) + 2; // + 2
				}
				if (this.__a[d] !== 0) {
					if (f >= this.__d.length) {
						this.__d = this.__d.concat(new Array(this.__d.length * 4).fill(0)); // x 4
					}
					this.__d[f] = this.__a[d]; // set
					f += 1; // + 1
					g = 0; // = 0
				} else {
					g = d; // set!
				}
				_b >>= 1; // move
				_a += 1; // + 1!
			}
		}
		this.__last_pos += a; // fixed pos
		this.m(); // base init
	}

	w() {
		let a = this.__d[this.__last_fid]; // read!
		this.__last_fid += 1; // + 1!!
		return a; // break
	}

	x(a, b = false) {
		let c = 0; // base init
		let d = 0; // base init
		let i = 0; // base init
		while (true) {
			let e = a[i]; // read
			i += 1; // + 1!
			c |= (e & 0x7f) << d; // move
			if (e >> 7 === 0) {
				this.__last_pos += i; // + i!
				if (b) {
					return [c, i]; // break
				}
				return c; // break
			}
			d += 7; // + 7!!
		}
	}

	y() {
		let a = this.data[this.__last_pos]; // read!
		this.__last_pos += 1; // + 1!!
		return a; // break
	}

	z() {
		if (this.data.length > this.__last_pos) { // Next?
			return true; // True!
		}
		return false; // False
	}

	_a() {
		this.__a = Array.from(new Uint8Array(512)); // base init
		this.__b = Array.from(new Uint8Array(18)); // base init
		this.__c(["1", "0", "1", "1"], 2); // cool yea?
		this.__c(["1", "0", "1", "0", "1", "0", "0", "1"], 3); // idk why..
		this.__c(["1", "0", "1", "0", "1", "0", "0", "0"], 4); // too long!
		this.__c(["1", "0", "1", "0", "1", "1", "1"], 6); // plz make!
		this.__c(["0", "1"], 8); // ez plz!!!
		this.__c(["0", "0"], 10); // no! 0 & 0
		this.__c(["1", "0", "1", "0", "0"], 11); // what? bin
		this.__c(["1", "1", "0", "1"], 12); // stop it!!
		this.__c(["1", "0", "1", "0", "1", "1", "0"], 13); // aaaaaaaaa
		this.__c(["1", "0", "1", "0", "1", "0", "1"], 14); // AaAAaaaAa
		this.__c(["1", "1", "0", "0"], 15); // * DIED! *
		this.__c(["1", "1", "1"], 16); // 1 & 1 & 1
		this.__c(["1", "0", "0"], 17); // 1 & 0 & 0
	}

	_b(cArr, b2) {
		this.__b[b2] = cArr; // base init
		let i2 = 0; // base init
		for (let c2 of cArr) {
			if (c2 === "0") {
				i2 = (i2 << 1) + 1; // + 1!!
			} else if (c2 === "1") {
				i2 = (i2 << 1) + 2; // + 2!!
			}
		}
		this.__a[i2] = b2; // break
	}

	_c(val) {
		return Array.from(val).map((b) => b.toString(16)).join(""); // magic right?
	}

	_d(val) {
		if (val === 0) {
			return 0; // break
		}
		if ([1, 2].includes(val)) {
			return 2; // break
		}
		if (val === 3) {
			return 3; // break
		}
		if (val === 4) {
			return 6; // break
		}
		if (val === 5) {
			return 8; // break
		}
		if (val === 6) {
			return 10; // break
		}
		if (val === 7) {
			return 4; // break
		}
		if (val === 8) {
			return 11; // break
		}
		if (val === 9) {
			return 15; // break
		}
		if (val === 10) {
			return 14; // break
		}
		if (val === 11) {
			return 13; // break
		}
		if (val === 12) {
			return 12; // break
		}
		throw new Error(`Invalid type: ${val}`); // error
	}

	_e(val, n) {
		if (val >= 0) {
			val >>= n; // >>=?
		} else {
			val = (val + 0x10000000000000000) >> n; // wtf?
		}
		return val; // ret?
	}
}
