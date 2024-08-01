const voom = (elm, data) => {
	elm.appendChild(article(
		{
			"class": "generalPostLayout_feed_post__9CnYc",
			"data-mid": data.mid,
			"data-rmid": data.rmid,
			"data-id": data.id,
		},
		div(
			{
				"class": "postHeaderLayout_post_header__jc8wg",
			},
			div(
				{
					"class": "writerInfoLayout_writer_info_wrap__IV9NI",
					"$click": (...arg) => {
						buttonEvent("voom-profile", arg);
					},
				},
				a(
					{
						"class": "profileLayout_thumbnail_wrap__tAvs2",
					},
					span(
						{
							"class": "userProfileThumbnail_thumbnail__PANhF",
							"style": "width: 100%; height: 100%;",
						},
						img(
							{
								"src": data.icon,
								"class": "userProfileThumbnail_image__A5Afu",
								"width": "64",
								"height": "64",
							},
						),
					),
				),
				span(
					{
						"class": "linkText_text_area__eG4IS",
					},
					a(
						{
							"class": "linkText_link__pMHBf",
						},
						strong(
							{
								"class": "linkText_text__QJFNU",
							},
							data.name,
						),
					),
				),
			),
			div(
				{
					"class": "postButtonLayout_post_button_wrap__hbU8V",
				},
				div(
					{
						"class": "postMenuLayout_post_menu_wrap__LXysY",
					},
					button(
						{
							"type": "button",
							"class": "postMenuLayout_button_menu__A5gwf",
						},
						i(
							{
								"class": "postMenuLayout_icon_menu__SawF4",
							},
							svg(
								{
									"height": "1em",
									"fill": "currentColor",
									"viewBox": "0 0 20 20",
									"xmlns": "http://www.w3.org/2000/svg",
									"data-laicon-version": "15.0",
								},
								g(
									{
										"transform": "translate(-2 -2)",
									},
									path(
										{
											"d": "M12 10.5c-.829 0-1.5.671-1.5 1.5s.671 1.5 1.5 1.5 1.5-.671 1.5-1.5-.671-1.5-1.5-1.5Zm0-2.9722c.829 0 1.5-.671 1.5-1.5 0-.828-.671-1.5-1.5-1.5s-1.5.672-1.5 1.5c0 .829.671 1.5 1.5 1.5Zm0 8.9444c-.829 0-1.5.671-1.5 1.5 0 .311.094.599.256.838.054.08.116.155.183.223.272.271.647.439 1.061.439.414 0 .789-.168 1.061-.439.067-.068.129-.143.183-.223.162-.239.256-.527.256-.838 0-.829-.671-1.5-1.5-1.5Z",
										},
									),
								),
							),
							span(
								{
									"class": "blind",
								},
								"Menu",
							),
						),
					),
				),
			),
		),
		div(
			{
				"class": "postContentLayout_post_content__bYnAD",
				"style": "--full-viewer-text-bottom: 24px; --full-viewer-inner-height: 54px;",
			},
			div(
				{
					"class": "viewer_trigger",
				},
				div(
					{},
					div(
						{
							"class": "voomEditor-layout",
						},
						div(
							{},
							div(
								{
									"class": "media_layout type_single",
								},
								div(
									{
										"class": "media_inner",
										"style": "padding-top: 100%;",
									},
									div(
										{
											"role": "button",
											"tabindex": "0",
											"class": "media_box_layout",
										},
										div(
											{
												"class": "media_item type_viewer",
											},
											img(
												{
													"src": data.img,
													"class": "media_image",
													"alt": "",
													"style": "object-position: 50% 50%;",
												},
											),
										),
									),
								),
							),
						),
						div(
							{
								"class": "post_text post_text_margin",
							},
							div(
								{
									"class": "text_layout",
								},
								div(
									{
										"class": "text_area",
									},
									div(
										{
											"class": "text_inner",
										},
										div(
											{
												"class": "text_viewer page_feed",
											},
											pre(
												{},
												data.text,
											),
										),
									),
								),
							),
						),
					),
				),
			),
		),
		section(
			{
				"class": "reactionLayout_reaction_group__B1CXz",
			},
			div(
				{
					"class": "likeButtonLayout_like_button_wrap__qJwig",
				},
				button(
					{
						"type": "button",
						"class": "likeButton_button_like__WwN6d",
						"id": "",
						"$click": (...arg) => {
							buttonEvent("voom-like", arg);
						},
					},
					i(
						{
							"class": "likeButton_icon___PUSz",
						},
						svg(
							{
								"height": "1em",
								"fill": "currentColor",
								"viewBox": "0 0 20 20",
								"xmlns": "http://www.w3.org/2000/svg",
								"data-laicon-version": "15.0",
							},
							g(
								{
									"transform": "translate(-2 -2)",
								},
								path(
									{
										"d": "M8.6233 13.1151a.65.65 0 0 1 .8882.237c.4976.8597 1.4261 1.4359 2.4887 1.4359 1.0626 0 1.9911-.5762 2.4887-1.4359a.65.65 0 0 1 1.1252.6512c-.7206 1.2449-2.0689 2.0847-3.6139 2.0847s-2.8932-.8398-3.6138-2.0847a.65.65 0 0 1 .237-.8882ZM14.7773 9.2964c-.5522 0-1 .4477-1 1s.4478 1 1 1c.5523 0 1-.4477 1-1s-.4477-1-1-1Zm-5.5546 0c-.5523 0-1 .4477-1 1s.4477 1 1 1c.5522 0 1-.4477 1-1s-.4478-1-1-1Z",
									},
								),
								path(
									{
										"d": "M12 4.05c-4.3907 0-7.95 3.5593-7.95 7.95 0 4.3907 3.5593 7.95 7.95 7.95 4.3907 0 7.95-3.5593 7.95-7.95 0-4.3907-3.5593-7.95-7.95-7.95ZM2.75 12c0-5.1086 4.1414-9.25 9.25-9.25s9.25 4.1414 9.25 9.25-4.1414 9.25-9.25 9.25S2.75 17.1086 2.75 12Z",
									},
								),
							),
						),
					),
					span(
						{
							"class": "blind",
						},
						"Like",
					),
				),
			),
			button(
				{
					"type": "button",
					"class": "commentButton_button_comment__gjMIk",
					"id": "",
					"$click": (...arg) => {
						buttonEvent("voom-comment", arg);
					},
				},
				i(
					{
						"class": "commentButton_icon__2elZ8",
					},
					svg(
						{
							"height": "1em",
							"fill": "currentColor",
							"viewBox": "0 0 20 20",
							"xmlns": "http://www.w3.org/2000/svg",
							"data-laicon-version": "15.0",
						},
						g(
							{
								"transform": "translate(-2 -2)",
							},
							path(
								{
									"d": "M5.412 5.412C7.1288 3.695 9.4172 2.75 11.839 2.75s4.7102.945 6.4272 2.662c2.8754 2.8753 3.4863 7.2297 1.5648 10.7585l1.2894 4.136a.65.65 0 0 1-.8108.815l-4.1492-1.2705a9.1125 9.1125 0 0 1-4.332 1.0983c-2.4226 0-4.7002-.9455-6.4166-2.6619C3.6946 16.5701 2.75 14.2816 2.75 11.8497c0-2.4332.9454-4.71 2.6604-6.4363l.0015-.0015Zm.92.9184C4.8575 7.8148 4.05 9.7626 4.05 11.8497c0 2.0886.8087 4.046 2.2812 5.5185 1.4733 1.4734 3.4206 2.2811 5.4973 2.2811 1.3838 0 2.7393-.3703 3.9296-1.063a.6504.6504 0 0 1 .5173-.0598l3.2376.9915-1.0066-3.2289a.6499.6499 0 0 1 .0597-.5221c1.7939-3.0613 1.3074-6.9094-1.219-9.4358-1.4728-1.4728-3.4304-2.2812-5.508-2.2812-2.0773 0-4.0345.8081-5.5072 2.2804Z",
								},
							),
							path(
								{
									"d": "M15.5501 11.05c-.5235 0-.95.4265-.95.95 0 .5234.4265.95.95.95.5234 0 .95-.4266.95-.95 0-.5235-.4266-.95-.95-.95Zm-3.5503 0c-.5235 0-.95.4265-.95.95 0 .5234.4265.95.95.95.5234 0 .95-.4266.95-.95 0-.5235-.4169-.95-.95-.95Zm-3.5996 0c-.5235 0-.95.4265-.95.95 0 .5234.4265.95.95.95s.95-.4266.95-.95c0-.5235-.4265-.95-.95-.95Z",
								},
							),
						),
					),
				),
				span(
					{
						"class": "commentButton_count__rX03b",
					},
					data.comment,
				),
				span(
					{
						"class": "blind",
					},
					"Comment",
				),
			),
			div(
				{
					"class": "shareButton_share_button_wrap__3ksAj",
				},
				button(
					{
						"type": "button",
						"class": "shareButton_button_share__a21_m",
						"id": "",
					},
					i(
						{
							"class": "shareButton_icon__6Sa8Y",
						},
						svg(
							{
								"height": "1em",
								"fill": "currentColor",
								"viewBox": "0 0 20 20",
								"xmlns": "http://www.w3.org/2000/svg",
								"data-laicon-version": "15.0",
							},
							g(
								{
									"transform": "translate(-2 -2)",
								},
								path(
									{
										"d": "M4.4263 19.0055v-7.967h1.3V18.85h12.5461v-7.8115h1.3v7.967c0 .6321-.5124 1.1445-1.1445 1.1445H5.5708c-.6321 0-1.1445-.5124-1.1445-1.1445Zm7.5731-15.4009 4.1008 3.885-.894.9438-3.2068-3.038-3.2069 3.038-.894-.9438 4.1009-3.885Z",
									},
								),
								path(
									{
										"d": "m11.3457 14.4995.0071-10 1.3.001-.0071 10-1.3-.001Z",
									},
								),
							),
						),
					),
					span(
						{
							"class": "shareButton_count___ItWD",
						},
						"",
					),
					span(
						{
							"class": "blind",
						},
						"Share",
					),
				),
			),
		),
		div(
			{
				"class": "commentList_comment_list__6XUED",
			},
		),
		div(
			{
				"class": "postFooter_post_footer__V0Dfl",
			},
			i(
				{
					"class": "iconPrivacy_icon_privacy__X1zsb",
				},
				svg(
					{
						"height": "1em",
						"fill": "currentColor",
						"viewBox": "0 0 20 20",
						"xmlns": "http://www.w3.org/2000/svg",
						"data-laicon-version": "15.0",
					},
					g(
						{
							"transform": "translate(-2 -2)",
						},
						path(
							{
								"d": "M21.25 12c0-5.1-4.15-9.25-9.25-9.25S2.75 6.9 2.75 12 6.9 21.25 12 21.25h.06c5.07-.04 9.19-4.17 9.19-9.25ZM10.33 4.23c-.03.22-.12.46-.39.53-.43.12-.65.05-.88-.14.41-.16.83-.3 1.27-.39ZM4.05 12c0-.84.14-1.66.38-2.42.31.53.64 1.04.98 1.5.89 1.2 2.09 1.86 3.16 2.43.03.02.07.03.1.04.37.13.74.35 1 .6.04.06.09.1.14.14.12.14.2.27.21.39.02.18.01.36 0 .55-.01.35-.03.75.1 1.16.13.42.39.72.6.96.13.15.25.28.31.42.16.33.24.73.25 1.2 0 .38 0 .68.02.95-4.06-.36-7.25-3.77-7.25-7.91V12Zm10.08 7.65c0-.05.01-.1.02-.11.1-.29.33-.88.34-.92.11-.34.33-.99.49-1.26.08-.14.21-.29.34-.44.2-.22.42-.47.58-.8.2-.42.44-1.47.22-1.96-.36-1.34-1.87-1.61-2.7-1.55 0 0-1.25.07-1.77.09-.33.01-.64.17-.93.31-.05.02-.11.05-.16.08-.13-.25-.33-.57-.82-.95-.21-.16-.41-.25-.58-.32-.2-.09-.26-.12-.3-.18 0-.09.02-.24.03-.29.03-.07.32-.16.45-.19l.1-.03c.17-.05.22-.04.26-.01.74.8 1.68.1 2.04-.17.19-.14.31-.34.34-.57.06-.42-.2-.75-.43-1.05a.6257.6257 0 0 1-.09-.12c.17-.11.42-.22.57-.29.41-.18.76-.33.89-.71.14-.39-.04-.71-.21-.91.42-.43 1.18-1.22.81-2.47-.1-.26-.25-.49-.41-.7 2.39.37 4.43 1.8 5.62 3.8-.08 0-.16.02-.21.03h-.03c-.85.21-1.57.89-1.97 1.65-.4.76-.56 1.78.02 2.63.5.74 1.32 1.04 1.92 1.22.1.03.55.15.94.25l.23.06c-.65 2.84-2.83 5.09-5.61 5.87l.01.01Z",
							},
						),
					),
				),
				span(
					{
						"class": "blind",
					},
					"Public",
				),
			),
			span(
				{
					"class": "postFooter_time__dTT6T",
					"id": "dateTime",
				},
				data.time,
			),
		),
		div(
			{
				"class": "commentWriter_comment_writer__KKGfj",
			},
			div(
				{
					"class": "commentWriter_thumbnail_wrap__Sg3o0",
				},
				span(
					{
						"class": "userProfileThumbnail_thumbnail__PANhF",
						"style": "width: 100%; height: 100%;",
					},
					img(
						{
							"src": "",
							"class": "userProfileThumbnail_image__A5Afu",
							"width": "64",
							"height": "64",
						},
					),
				),
			),
			div(
				{
					"class": "commentWriter_writer_wrap__yJMVg",
				},
				div(
					{
						"class": "commentWriter_writer_area__71gGR",
					},
					div(
						{
							"class": "voomEditor-layout",
						},
						div(
							{
								"class": "comment_writer_layout",
							},
							div(
								{
									"class": "comment_content",
									"data-name": "comment_content",
								},
								div(
									{
										"class": "voomEditor-layout",
									},
									div(
										{
											"class": "post_writer_text_card",
										},
										div(
											{
												"class": "text_layout animation_0",
											},
											div(
												{
													"class": "text_area",
												},
												div(
													{
														"class": "text_inner",
													},
													label(
														{
															"class": "text_editor",
														},
														textarea(
															{
																"class": "input_text",
																"placeholder": "コメントしてみよう",
																"maxlength": "1000",
																"data-feedid": "1168769285681398053",
															},
														),
														span(
															{
																"class": "label_text",
																"aria-hidden": "true",
															},
															"コメントしてみよう",
														),
													),
													div(
														{
															"class": "text_viewer page_editor",
														},
													),
												),
											),
										),
									),
								),
							),
							div(
								{
									"class": "comment_tool_group",
								},
								label(
									{
										"class": "tool_button",
										"title": "写真を追加",
									},
									input(
										{
											"type": "file",
											"class": "blind",
											"accept": "image/*",
										},
									),
									i(
										{
											"class": "icon_photo",
										},
										svg(
											{
												"height": "1em",
												"fill": "currentColor",
												"viewBox": "0 0 20 20",
												"xmlns": "http://www.w3.org/2000/svg",
												"data-laicon-version": "15.0",
											},
											g(
												{
													"transform": "translate(-2 -2)",
												},
												path(
													{
														"d": "M15.5519 8.5134c-.5769 0-1.0446.4678-1.0446 1.0447 0 .577.4677 1.0447 1.0446 1.0447s1.0446-.4677 1.0446-1.0447c0-.5769-.4677-1.0447-1.0446-1.0447ZM8.6929 10.2734l8.5795 8.5796a.6498.6498 0 0 1 0 .9192.6498.6498 0 0 1-.9192 0l-7.6603-7.6604-4.4334 4.4335a.65.65 0 1 1-.9192-.9192l5.3526-5.3527Z",
													},
												),
												path(
													{
														"d": "M4.4499 5.3375v13.3251h15.1V5.3375h-15.1Zm-1.3-.15c0-.6353.515-1.15 1.15-1.15h15.4c.635 0 1.15.5147 1.15 1.15v13.6251c0 .6353-.515 1.15-1.15 1.15h-15.4c-.635 0-1.15-.5149-1.15-1.15V5.1875Z",
													},
												),
											),
										),
									),
									span(
										{
											"class": "blind",
										},
										"photo",
									),
								),
								button(
									{
										"type": "button",
										"class": "tool_button",
										"title": "スタンプを追加",
									},
									i(
										{
											"class": "icon_sticker",
										},
										svg(
											{
												"height": "1em",
												"fill": "currentColor",
												"viewBox": "0 0 20 20",
												"xmlns": "http://www.w3.org/2000/svg",
												"data-laicon-version": "15.0",
											},
											g(
												{
													"transform": "translate(-2 -2)",
												},
												path(
													{
														"d": "M8.6233 13.1151a.65.65 0 0 1 .8882.237c.4976.8597 1.4261 1.4359 2.4887 1.4359 1.0626 0 1.9911-.5762 2.4887-1.4359a.65.65 0 0 1 1.1252.6512c-.7206 1.2449-2.0689 2.0847-3.6139 2.0847s-2.8932-.8398-3.6138-2.0847a.65.65 0 0 1 .237-.8882ZM14.7773 9.2964c-.5522 0-1 .4477-1 1s.4478 1 1 1c.5523 0 1-.4477 1-1s-.4477-1-1-1Zm-5.5546 0c-.5523 0-1 .4477-1 1s.4477 1 1 1c.5522 0 1-.4477 1-1s-.4478-1-1-1Z",
													},
												),
												path(
													{
														"d": "M12 4.05c-4.3907 0-7.95 3.5593-7.95 7.95 0 4.3907 3.5593 7.95 7.95 7.95 4.3907 0 7.95-3.5593 7.95-7.95 0-4.3907-3.5593-7.95-7.95-7.95ZM2.75 12c0-5.1086 4.1414-9.25 9.25-9.25s9.25 4.1414 9.25 9.25-4.1414 9.25-9.25 9.25S2.75 17.1086 2.75 12Z",
													},
												),
											),
										),
									),
									span(
										{
											"class": "blind",
										},
										"sticker",
									),
								),
							),
						),
					),
				),
			),
		),
	));
};
