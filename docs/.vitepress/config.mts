import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "LINEJS Documentation",
	titleTemplate: ":title | LINEJS",
	description:
		"Documentation of LINEJS | LINEJS is a JavaScript library for LINE SelfBot.",
	sitemap: {
		hostname: "https://linejs.evex.land",
	},
	locales: {
		root: {
			label: "English",
			lang: "en",
			link: "/",
		},
		ja: {
			label: "日本語",
			lang: "ja",
			link: "/ja",
		},
	},
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		siteTitle: "LINEJS Docs",
		search: {
			provider: "local",
		},

		nav: [
			{ text: "Home", link: "/" },
			{ text: "Docs", link: "/docs/start" },
			{
				text: "Examples",
				link: "https://github.com/evex-dev/linejs/tree/main/examples",
			},
		],

		sidebar: {
			"/docs/": [
				{
					text: "Docs",
					items: [
						{ text: "Getting Started", link: "/docs/start" },
						{ text: "Next Steps", link: "/docs/start-2" },
						{ text: "Message Event", link: "/docs/message-event" },
						{ text: "Client Options", link: "/docs/client-options" },
						// { text: "Utils", link: "/docs/utils" },
						{ text: "Client Methods", link: "/docs/methods" },
					],
				},
				{
					text: "Guides",
					items: [
						{ text: "Authors", link: "/docs/authors" },
						{ text: "Question", link: "/docs/question" },
					],
				},
			],
			"/ja/docs/": [
				{
					text: "ドキュメント",
					items: [
						{ text: "はじめに", link: "/ja/docs/start" },
						{ text: "次のステップ", link: "/ja/docs/start-2" },
						{ text: "メッセージイベント", link: "/ja/docs/message-event" },
						{ text: "オプション", link: "/ja/docs/client-options" },
						// { text: "ユーティリティ", link: "/ja/docs/utils" },
						{ text: "メソッド", link: "/ja/docs/methods" },
					],
				},
				{
					text: "ガイド",
					items: [
						{ text: "作成者", link: "/ja/docs/authors" },
						{ text: "質問", link: "/ja/docs/question" },
					],
				},
			],
		},

		editLink: {
			pattern: "https://github.com/evex-dev/linejs/edit/main/docs/:path",
			text: "Edit this page on GitHub",
		},

		footer: {
			message: "Released under the MIT License.",
			copyright: "Copyright © " + new Date().getFullYear() +
				"-present Evex Developers.",
		},

		socialLinks: [
			{ icon: "github", link: "https://github.com/evex-dev/linejs" },
			{ icon: "discord", link: "https://evex.land" },
		],
	},
	head: [
		["link", { rel: "icon shortcut", href: "/favicon.png" }],
		["link", { rel: "apple-touch-icon", href: "/favicon.png" }],
		["meta", { name: "og:title", content: "LINEJS Documentation" }],
		["meta", {
			name: "og:image",
			content: "https://linejs.evex.land/favicon.png",
		}],
		["meta", {
			name: "og:description",
			content:
				"LINEJS Documentation | LINEJS is a JavaScript library for LINE SelfBot.",
		}],
		["meta", { name: "og:url", content: "https://linejs.evex.land" }],
		["meta", { name: "twitter:title", content: "LINEJS Documentation" }],
		["meta", {
			name: "twitter:description",
			content:
				"LINEJS Documentation | LINEJS is a JavaScript library for LINE SelfBot.",
		}],
		["meta", { name: "twitter:card", content: "summary_large_image" }],
		["meta", { name: "twitter:site", content: "@amex2189" }],
		["meta", { name: "twitter:creator", content: "@amex2189" }],
		["meta", {
			name: "twitter:image",
			content: "https://linejs.evex.land/favicon.png",
		}],
	],

	cleanUrls: true,
});
