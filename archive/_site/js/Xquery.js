/**
 * @Copyright @amex2189 | @EdamAme-x / Free
 * https://github.com/EdamAme-x/XueryJS
 */
"use strict";

const Tags = [
	"a",
	"abbr",
	"address",
	"area",
	"article",
	"aside",
	"audio",
	"b",
	"base",
	"bdi",
	"bdo",
	"blockquote",
	"body",
	"br",
	"button",
	"canvas",
	"caption",
	"cite",
	"code",
	"col",
	"colgroup",
	"data",
	"datalist",
	"dd",
	"del",
	"details",
	"dfn",
	"dialog",
	"div",
	"dl",
	"dt",
	"em",
	"embed",
	"fieldset",
	"figcaption",
	"figure",
	"footer",
	"form",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"head",
	"header",
	"hr",
	"html",
	"i",
	"iframe",
	"img",
	"input",
	"ins",
	"kbd",
	"label",
	"legend",
	"li",
	"link",
	"main",
	"map",
	"mark",
	"meta",
	"meter",
	"nav",
	"noscript",
	"object",
	"ol",
	"optgroup",
	"option",
	"output",
	"p",
	"param",
	"picture",
	"pre",
	"progress",
	"q",
	"rp",
	"rt",
	"ruby",
	"s",
	"samp",
	"script",
	"section",
	"select",
	"small",
	"source",
	"span",
	"strong",
	"style",
	"sub",
	"summary",
	"sup",
	"table",
	"tbody",
	"td",
	"template",
	"textarea",
	"tfoot",
	"th",
	"thead",
	"time",
	"title",
	"tr",
	"track",
	"u",
	"ul",
	"var",
	"video",
	"wbr",
	"applet",
	"basefont",
	"big",
	"blink",
	"center",
	"command",
	"content",
	"dir",
	"element",
	"font",
	"frame",
	"frameset",
	"image",
	"isindex",
	"keygen",
	"listing",
	"marquee",
	"menu",
	"menuitem",
	"multicol",
	"nextid",
	"nobr",
	"noembed",
	"noframes",
	"plaintext",
	"shadow",
	"spacer",
	"strike",
	"tt",
	"xmp",
	"acronym",
	"bgsound",
	"dir",
	"frameset",
	"noframes",
	"tt",
	"video",
	"audio",
	"button",
	"details",
	"dialog",
	"summary",
	"template",
	"figcaption",
	"mark",
	"wbr",
	"svg",
	"g",
	"path",
	"defs",
	"clipPath",
	"circle",
];
//globalThis.X = {};

for (let e = 0; e < Tags.length; e++) {
	globalThis[Tags[e]] = (t, ...i) => {
		let r = document.createElement(Tags[e]);
		if (
			Tags[e] == "g" || Tags[e] == "path" || Tags[e] == "svg" ||
			Tags[e] == "defs" || Tags[e] == "clipPath" || Tags[e] == "circle"
		) {
			r = document.createElementNS("http://www.w3.org/2000/svg", Tags[e]);
		}
		if (t) {
			for (let n in t) {
				if ("raw" === n) {
					r.innerHTML = t[n];
					continue;
				}
				if ("style" === n && "object" == typeof t[n]) {
					for (let o in t[n]) r.style[o] = t[n][o];
				}
				if ("$" === n.slice("")[0]) {
					let x = (...arg) => {
						t[n](r, ...arg);
					};
					r.addEventListener(n.slice(1), x);
					continue;
				}
				r.setAttribute(n, t[n]);
			}
		}
		for (let a = 0; a < i.length; a++) {
			"string" == typeof i[a] || "number" == typeof i[a] ||
				"boolean" == typeof i[a] || void 0 === i[a] || null === i[a]
				? r.appendChild(document.createTextNode(i[a]))
				: r.appendChild(i[a]);
		}
		return r;
	};
}
globalThis.$ = (t) => {
	let i = document.querySelectorAll(t);
	if (0 === i.length) {
		return {
			in() {
				throw Error("Element not found");
			},
		};
	}
	let r = {};
	for (let n = 0; n < i.length; n++) {
		r[n] = {
			in(...t) {
				for (; i[n].firstChild;) i[n].removeChild(i[n].firstChild);
				if (!t) {
					i[n].innerHTML = "";
					return;
				}
				t.forEach((e) => {
					i[n].appendChild(e);
				});
			},
			out: i[n],
			outX() {
				return genX(i[n]);
			},
		},
			r.in = r[0].in,
			r.out = r[0].out,
			r.length = i.length;
	}
	return r;
};

function genX(elm) {
	function ToStr(str = "") {
		return str.replaceAll("\n", "\\n").replaceAll("\t", "\\t").replaceAll(
			'"',
			'\\"',
		);
	}
	if (!elm.localName) {
		if (!elm.data) {
			return;
		}
		let txt = elm.data.replaceAll(" ", "").replaceAll("\n", "");
		if (txt == "") {
			return;
		}
		return '"' + ToStr(elm.data) + '"';
	}
	if (elm.localName.indexOf("-") != -1) {
		let prms = "";
		elm.shadowRoot.childNodes.forEach((e) => {
			let g = genX(e);
			if (g) {
				prms += g + ",";
			}
		});
		return prms;
	}
	let ops = {};
	let prms = [];
	let innerText;
	let nochild = false;
	try {
		let opsN = elm.getAttributeNames();
		for (const i in opsN) {
			let tmp = elm.getAttribute(opsN[i]);
			if (
				"string" == typeof tmp || "number" == typeof tmp ||
				"boolean" == typeof tmp
			) {
				ops[opsN[i]] = tmp;
			}
		}
	} catch (error) {
		console.log(elm);
	}

	if (elm.childNodes.length == 0) {
		innerText = elm.innerText;
	} else if (elm.innerHTML.indexOf("<") == -1) {
		innerText = elm.innerText;
		nochild = true;
	}

	if (innerText) {
		prms.push('"' + ToStr(innerText) + '"');
	}
	if (!nochild) {
		let child = [...elm.childNodes];
		child.forEach((e) => {
			let g = genX(e);
			if (g) {
				prms.push(g);
			}
		});
	}

	let prmsTxt = "";
	prms.forEach((e) => {
		prmsTxt += `${e},
`;
	});
	return `${elm.localName}(
${JSON.stringify(ops, null, 1)},
${prms}
)`;
}
