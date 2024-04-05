var chatData = {    //チャットリストのデータを入れる
    chatList: []
}

async function updateChat() {
    if (roomData.roomMid) {
        let isTooLate = false
        setTimeout(() => {
            isTooLate = true
            updateChat()
        }, 2000)
        let data = await LINE.timeOutWith(LINE, "fetchSquareChatEvents", 2100, roomData.roomMid, roomData.syncToken)
        if (!data) {
            return
        }
        if (isTooLate) {
            return
        }
        if (data.syncToken && !Number(data.syncToken)) {
            roomData.syncToken = data.syncToken
        }

        let chats = []
        let reading = []
        for (let i = 0; i < data.events.length; i++) {
            const e = data.events[i];
            if (e.type == 1) {
                chats.push(e.payload.sendMessage.squareMessage.message)
            } else if (e.type == undefined) {
                chats.push(e.payload.receiveMessage.squareMessage.message)
            } else if (e.type == 6) {
                reading.push(await getProfile(e.payload.notifiedMarkAsRead.sMemberMid))
            }

        }
        if (isTooLate) {
            return
        }
        let readingTxt = "浮上中: "
        reading.forEach(e => {
            readingTxt += e.name + " "
        })
        genNewMessage({
            text: readingTxt,
            by: "",
            call: () => { notify(readingTxt, "#fff", "#333") }
        })
        appendMsgs(chats, roomData.roomMid)
    } else {
        setTimeout(() => {
            isTooLate = true
            updateChat()
        }, 2000)
    }
}

function genNewMessage(data) {
    roomData.notifyMsg.innerHTML = ""
    roomData.notifyMsg.appendChild(div(
        {
            "class": "newMessage-module__new_message__7AimN "
        },
        button(
            {
                "type": "button",
                "class": "newMessage-module__button_new_message__4lxeN",
                "$click": (...arg) => { data.call(arg) }
            },
            strong(
                {
                    "class": "newMessage-module__name__i7cy-"
                },
                pre(
                    {},
                    data.by)
            )
            , p(
                {
                    "class": "newMessage-module__description__Bp-zX"
                },
                span(
                    {}, data.text
                )
            )
        )
    ))
}

var defaltIMG = "data:image/png;base64,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"
async function chatMembersList(mid) {
    notify("Loading...", "#FFF", "#333")
    let member = (await LINE.getSquareChatMembers(mid)).squareChatMembers
    let members = []
    for (let i = 0; i < member.length; i++) {
        const e = member[i];
        let data = {
            mid: e.squareMemberMid,
            name: e.displayName
        }
        if (e.profileImageObsHash) {
            data.img = await getObsUrl(e.profileImageObsHash + "/preview")
        }
        if (!data.img) {
            data.img = defaltIMG
        }
        members.push(data)
    }
    let data = {
        mid: mid,
        members: members
    }
    __("#root > div > div > div:nth-child(4)").in(genMemberList(data))
}

function genMemberList(data) {
    function memberButton(data, index) {
        return div(
            {
                "class": "friendlistItem-module__item__1tuZn ",
                "data-mid": data.mid,
                "style": "position: absolute; left: 0px; top: " + (index * 57 + 20) + "px; height: 57px; width: 100%;",
                "$click": (...arg) => { buttonEvent("openProfileM", arg) }
            },
            div(
                {
                    "class": "profileImage-module__thumbnail_wrap__0bK7m ",
                    "data-mid": data.mid,
                    "data-profile-image": "true",
                    "style": "width: 43px; height: 43px; border-radius: 50%;"
                },
                button(
                    {
                        "type": "button",
                        "class": "profileImage-module__button_profile__GqKue"
                    },
                    div(
                        {
                            "class": "profileImage-module__thumbnail_area__nqIpB"
                        },
                        span(
                            {
                                "class": "profileImage-module__thumbnail__Q6OsR"
                            },
                            img(
                                {
                                    "src": data.img,
                                    "class": "",
                                    "loading": "lazy",
                                    "alt": "",
                                    "draggable": "false"
                                },

                            )
                        )
                    )
                )
            ), div(
                {
                    "class": "friendlistItem-module__info__89Stz"
                },
                strong(
                    {
                        "class": "friendlistItem-module__name_box__fUKhX",
                        "role": ""
                    },
                    span(
                        {
                            "class": "friendlistItem-module__text__YxSko"
                        },
                        pre(
                            {},
                            span(
                                {},
                                data.name
                            )
                        )
                    )
                )
            )
        )
    }
    let members = []
    data.members.forEach((e, i) => {
        members.push(memberButton(e, i))
    })
    return div(
        {
            "class": "memberPopup-module__popup__KtCXP ",
            "style": "min-width:300;"
        },
        div(
            {
                "class": "memberPopup-module__contents__7scEN"
            },
            div(
                {
                    "class": "friendlist-module__list_wrap__IeJXY",
                    "data-type": "invite"
                },
                div(
                    {
                        "class": "searchInput-module__input_box__vp6NF"
                    },
                    label(
                        {
                            "class": "searchInput-module__label__40CWI"
                        },
                        i(
                            {
                                "class": "icon searchInput-module__icon_search__amOMA"
                            },
                            svg(
                                {
                                    "xmlns": "http://www.w3.org/2000/svg",
                                    "width": "24",
                                    "height": "24",
                                    "viewBox": "0 0 24 24"
                                },
                                g(
                                    {
                                        "fill": "none",
                                        "fill-rule": "evenodd"
                                    },
                                    g(
                                        {},
                                        g(
                                            {},
                                            g(
                                                {},
                                                g(
                                                    {},
                                                    g(
                                                        {},
                                                        path(
                                                            {
                                                                "d": "M0 0H20V20H0z",
                                                                "transform": "translate(-261.000000, -95.000000) translate(181.000000, 54.000000) translate(74.000000, 34.000000) translate(6.000000, 7.000000) translate(2.000000, 2.000000)"
                                                            },

                                                        ), g(
                                                            {
                                                                "stroke": "#B7B7B7",
                                                                "stroke-width": "1.5",
                                                                "transform": "translate(-261.000000, -95.000000) translate(181.000000, 54.000000) translate(74.000000, 34.000000) translate(6.000000, 7.000000) translate(2.000000, 2.000000) translate(4.000000, 4.000000)"
                                                            },
                                                            circle(
                                                                {
                                                                    "cx": "4.5",
                                                                    "cy": "4.5",
                                                                    "r": "4.5",
                                                                    "fill-rule": "nonzero"
                                                                },

                                                            ), path(
                                                                {
                                                                    "stroke-linecap": "square",
                                                                    "d": "M8 8L11 11"
                                                                },

                                                            )
                                                        )
                                                    )
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        ), input(
                            {
                                "class": "searchInput-module__input__ekGp7 ",
                                "placeholder": "名前で検索",
                                "maxlength": "20",
                                "data-chatmid": data.mid,
                                "value": "",
                                "$input": (...arg) => { buttonEvent("searchMember", arg) }
                            },

                        ), button(
                            {
                                "type": "button",
                                "class": "searchInput-module__button_reset__l2-td",
                                "aria-label": "reset",
                                "$click": (...arg) => { }
                            },
                            i(
                                {
                                    "class": "icon searchInput-module__icon_reset__bPtuX"
                                },
                                svg(
                                    {
                                        "xmlns": "http://www.w3.org/2000/svg",
                                        "width": "24",
                                        "height": "24",
                                        "viewBox": "0 0 24 24"
                                    },
                                    g(
                                        {
                                            "fill": "none",
                                            "fill-rule": "evenodd"
                                        },
                                        g(
                                            {},
                                            g(
                                                {},
                                                g(
                                                    {},
                                                    g(
                                                        {},
                                                        path(
                                                            {
                                                                "d": "M0 0H24V24H0z",
                                                                "transform": "translate(-1216.000000, -227.000000) translate(928.000000, 162.000000) translate(14.000000, 58.000000) translate(274.000000, 7.000000)"
                                                            },

                                                        ), path(
                                                            {
                                                                "fill": "#C8C8C8",
                                                                "d": "M12 5c3.866 0 7 3.134 7 7s-3.134 7-7 7-7-3.134-7-7 3.134-7 7-7zm2.413 3.5L12 10.912 9.587 8.5 8.5 9.587 10.912 12 8.5 14.413 9.587 15.5 12 13.087l2.413 2.413 1.087-1.087L13.087 12 15.5 9.587 14.413 8.5z",
                                                                "transform": "translate(-1216.000000, -227.000000) translate(928.000000, 162.000000) translate(14.000000, 58.000000) translate(274.000000, 7.000000)"
                                                            },

                                                        )
                                                    )
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                ), div(
                    {
                        "class": "friendlist-module__list__Z-8nt"
                    },
                    div(
                        {
                            "class": "friendlist-module__inner__d3xFH",
                            "style": "position: relative; overflow: hidden;"
                        },
                        div(
                            {
                                "style": "position: absolute; width: 100%; height: 100%;"
                            },
                            div(
                                {
                                    "style": "position: relative; height: 558px; width: 100%; overflow: overlay; will-change: transform; direction: ltr;"
                                },
                                div(
                                    {
                                        "style": "height: " + (data.members.length * 57 + 60) + "px; width: 100%;"
                                    },
                                    div(
                                        {
                                            "class": "categoryLayout-module__category_wrap__31191 ",
                                            "style": "position: absolute; left: 0px; top: 0px; height: 20px; width: 100%;"
                                        },
                                        button(
                                            {
                                                "class": "categoryLayout-module__button_category__nqIZM",
                                                "aria-expanded": "true"
                                            },
                                            span(
                                                {
                                                    "class": "categoryLayout-module__title__iV725"
                                                },
                                                span(
                                                    {
                                                        "class": "categoryLayout-module__text__crUcb"
                                                    },
                                                    "メンバー"
                                                ), span(
                                                    {
                                                        "class": "categoryLayout-module__count__8h25Q"
                                                    },
                                                    data.members.length
                                                )
                                            ), i(
                                                {
                                                    "class": "icon categoryLayout-module__icon_arrow__kdyor"
                                                },
                                                svg(
                                                    {
                                                        "xmlns": "http://www.w3.org/2000/svg",
                                                        "width": "20",
                                                        "height": "20",
                                                        "viewBox": "0 0 20 20"
                                                    },
                                                    g(
                                                        {
                                                            "fill": "none",
                                                            "fill-rule": "evenodd"
                                                        },
                                                        path(
                                                            {
                                                                "d": "M0 0H20V20H0z"
                                                            },

                                                        ), path(
                                                            {
                                                                "fill-rule": "nonzero",
                                                                "stroke": "#C8C8C8",
                                                                "stroke-linecap": "square",
                                                                "stroke-width": "1.4",
                                                                "d": "M7 11L7 5 13 5",
                                                                "transform": "rotate(-135 10 8)"
                                                            },

                                                        )
                                                    )
                                                )
                                            )
                                        )
                                    ), ...members
                                )
                            )
                        )
                    )
                )
            )
        )
    )
}
async function memberPopup(pid) {
    let data = await refreshProfile(pid)
    let data2 = await getProfile(pid, true)
    data.desc = JSON.stringify(data2, null, 2)
    let member = genProfilePopup(data)
    __("#modal-root").in(member)
    member.scrollIntoView()

}
function genProfilePopup(data) {
    return div(
        {
            "class": "profileModal-module__modal__QRrnT ",
            "role": "dialog",
            "aria-labelledby": "profile modal",
            "style": "position: absolute;z-index: 28;left: 0px;top: 0px;width: 100%;height: 100%;text-align: center;"
        },
        div(
            {
                "class": "profileModal-module__content__qKTEy",
                "style": "width: 300px;height: 400px;margin-right: auto;margin-left: auto;margin-top: 100;border: solid;background-color: #fff;border-color: black;"
            },
            button({
                "type": "button",
                "style": "margin-right: auto;font-size: 18px;margin-left: 10px;margin-top: 10px;",
                "$click": () => { document.querySelector("#modal-root").innerHTML = "" }
            }
                , "X"
            ),
            div(
                {
                    "class": "profileModal-module__info_area__VRAIt",
                    "style": "height:100px"
                },
                div(
                    {
                        "class": "profileImage-module__thumbnail_wrap__0bK7m ",
                        "data-mid": data.mid,
                        "data-profile-image": "true",
                        "style": "border-radius: 50%;cursor: default;margin: 0 0 0 0;"
                    },
                    div(
                        {
                            "class": "profileImage-module__thumbnail_area__nqIpB",
                            "$click": (...arg) => { buttonEvent("openProfileImg", arg) }
                        },
                        span(
                            {
                                "class": "profileImage-module__thumbnail__Q6OsR"
                            },
                            img(
                                {
                                    "src": data.img,
                                    "class": "",
                                    "loading": "lazy",
                                    "alt": "",
                                    "draggable": "false"
                                },
                            )
                        )
                    )
                )
                , div(
                    {
                        "class": "profileModal-module__name_box__vJfbr"
                    },
                    button(
                        {
                            "class": "editButton-module__button_edit__GA02s ",
                            "type": "button",
                            "aria-pressed": "false",
                            "data-ellipsis": "1"
                        },
                        span(
                            {
                                "class": "editButton-module__name__uQ-y5"
                            },
                            pre(
                                {},
                                span(
                                    {},
                                    data.name)
                            )
                        )
                    )
                    ,
                )
                , div(
                    {
                        "class": "profileModal-module__description_box__Jb6O2",
                        "style": "max-height:300;"
                    },
                    pre(
                        {
                            "class": "profileModal-module__description__hSNDU",
                            "data-tooltip": "87f15f9f-0c36-4796-bf4e-f74d9f10fef5",
                            "style": "text-align: left;user-select:text;"
                        }, data.desc
                    )
                )
            )
            , div(
                {
                    "class": "profileModal-module__action_area__gN4d-",
                    "data-mid": data.mid
                },
                button(
                    {
                        "type": "button",
                        "class": "profileModal-module__button_action__SmB4T",
                        "$click": (...arg) => { buttonEvent("reportMember", arg) }
                    }, "通報"
                )
                , button(
                    {
                        "type": "button",
                        "class": "profileModal-module__button_action__SmB4T",
                        "$click": (...arg) => { buttonEvent("kickoutMember", arg) }
                    }, "強制退会"
                )
            )
        )
    )

}

function notify(text, color, bcolor, time = 5000) {
    let noti = li(
        {}, div(
            {
                style: "background-color:" + bcolor + ";border-radius: 17.5px;user-select:text;",
                "$click": () => { __("#root > div > ul").out.innerHTML = "" }
            },
            pre(
                {
                    style: "font-size:20px;padding:5px;color:" + color + ";"
                },
                text
            )
        )
    )
    __("#root > div > ul").out.appendChild(noti)
    setTimeout(() => {
        __("#root > div > ul").out.removeChild(noti)
    }, time)
}

async function buildChatButton(squareChatResponseList = []) {   //[getSquareChatResponse]からチャットリストのボタンを生成追加
    function list(inElm) {
        return div({ style: "height: " + 71 * squareChatResponseList.length + "px; width: 100%;" }, ...inElm)
    }
    let elms = []
    for (let index = 0; index < squareChatResponseList.length; index++) {
        const element = squareChatResponseList[index];
        let elm = await squareChat2chatButton(element, index)
        observer.observe(elm)
        elms.push(elm)
    }
    let res = list(elms)
    __("#root > div > div > div.chatlist-module__chatlist_wrap__KtTpq > div.chatlist-module__chatlist__qruAE > div > div > div").in(res)
    setInterval(() => {
        try {
            fetchEventUpdate()
            //更新開始
        } catch (error) {

        }
    },
        2000)
    updateChat()
    return res
}
async function buildChatButtonC(dataList = []) {   //dataListからチャットリストのボタンを生成追加
    function list(inElm) {
        return div({ style: "height: " + 71 * dataList.length + "px; width: 100%;" }, ...inElm)
    }
    let elms = []
    for (let index = 0; index < dataList.length; index++) {
        const element = await LINE.getSquareChat(dataList[index]);
        let elm = await squareChat2chatButton(element)
        if (!elm) {
            continue
        }
        observer.observe(elm)
        elms.push(elm)
    }
    let res = list(elms)
    __("#root > div > div > div.chatlist-module__chatlist_wrap__KtTpq > div.chatlist-module__chatlist__qruAE > div > div > div").in(res)
    setInterval(() => {
        try {
            fetchEventUpdate()  //更新開始
        } catch (error) {

        }
    },
        2000)
    updateChat()
    return res
}
function fetchEventUpdate() {   //fetchMyEvents fetchSquareChatEvents から表示を更新
    if (LINE.SQ1.socket.post.readyState !== LINE.SQ1.socket.post.OPEN) {
        LINE.SQ1.reOpenSocket()
        notify("Network Error", "#fff", "#f00")
        return
    }
    let mids = []
    chatData.chatList.forEach((e, i) => {
        let is1 = true
        mids.forEach((f) => {
            if (e.mid == f) {
                is1 = false
            }
        })
        if (is1) {
            mids.push(e.mid)
        } else {
            chatData.chatList.splice(i, 1)
        }
    })

    UserCashe.setItem(LINE.mid + ":chatsList", mids);
    //myEvent
    (async () => {
        function list(inElm) {
            return div({ style: "height: " + 71 * inElm.length + "px; width: 100%;" }, ...inElm)
        }
        let elms = []
        if (!chatData.syncToken) {
            chatData.syncToken = (await LINE.fetchMyEvents()).syncToken
        }
        let res = await LINE.timeOutWith(LINE, "fetchMyEvents", 3500, chatData.syncToken)
        chatData.syncToken = res.syncToken
        res.events.forEach(async (e) => {
            let chat
            switch (e.type) {
                case 29:
                    chat = await getChatdata(e.payload.notificationMessage.squareChatMid)
                    let date = e.payload.notificationMessage.squareMessage.message.deliveredTime
                    date = new Date(date)
                    date = date.getMonth() + 1 + "/" + date.getDate()
                    chat.timeInt = e.payload.notificationMessage.squareMessage.message.deliveredTime
                    if (e.payload.notificationMessage.squareMessage.message.text) {
                        chat.lastText = e.payload.notificationMessage.squareMessage.message.text
                    }

                    if (e.payload.notificationMessage.unreadCount) {
                        let unread = e.payload.notificationMessage.unreadCount
                        chat.unread = span({ class: "chatlistItem-module__message_count__FRt4s" }, unread)
                    } else {
                        chat.unread = ""
                    }
                    break;
                case 13:
                    chat = await getChatdata(e.payload.notifiedUpdateSquareChatStatus.squareChatMid)
                    chat.member = e.payload.notifiedUpdateSquareChatStatus.statusWithoutMessage.memberCount
                    if (e.payload.notifiedUpdateSquareChatStatus.statusWithoutMessage.unreadCount) {
                        let unread = e.payload.notifiedUpdateSquareChatStatus.statusWithoutMessage.unreadCount
                        chat.unread = span({ class: "chatlistItem-module__message_count__FRt4s" }, unread)
                    } else {
                        chat.unread = ""
                    }
                default:
                    break;
            }
        })
        chatData.chatList.sort((a, b) => {
            return b.timeInt - a.timeInt;
        })
        chatData.chatList.forEach((e, i) => {
            e.index = i
            elms.push(genChatButton(e))
        })
        let elm = list(elms)
        __("#root > div > div > div.chatlist-module__chatlist_wrap__KtTpq > div.chatlist-module__chatlist__qruAE > div > div > div").in(elm)

        async function getChatdata(id) {
            for (let index = 0; index < chatData.chatList.length; index++) {
                const e = chatData.chatList[index];
                if (e.mid == id) {
                    return e
                }
            }
            let chat = await LINE.getSquareChat(id)
            await squareChat2chatButton(chat, 0)
            return await getChatdata(id)
        }
    })()
}

async function squareChat2chatButton(squareChatResponse, index) {   //getSquareChatと上からの順番からボタンを生成
    let lastText = ""
    let date = ""
    let unread = ""
    if (!squareChatResponse.squareChatStatus) {
        return
    }
    if (squareChatResponse.squareChatStatus.lastMessage) {
        date = new Date(squareChatResponse.squareChatStatus.lastMessage.message.createdTime)
        date = date.getMonth() + 1 + "/" + date.getDate() + " " + date.toLocaleTimeString().substring(0, 5)
        if (squareChatResponse.squareChatStatus.lastMessage.message.text) {
            lastText = squareChatResponse.squareChatStatus.lastMessage.message.text
        }
    }
    if (squareChatResponse.squareChatStatus.otherStatus.unreadMessageCount) {
        unread = squareChatResponse.squareChatStatus.otherStatus.unreadMessageCount
        unread = span({ class: "chatlistItem-module__message_count__FRt4s" }, unread)
    }
    let data = {
        mid: squareChatResponse.squareChat.squareChatMid,
        name: squareChatResponse.squareChat.name,
        member: squareChatResponse.squareChatStatus.otherStatus.memberCount,
        img: await getObsUrl(squareChatResponse.squareChat.chatImageObsHash),
        index: index,
        date: date,
        timeInt: squareChatResponse.squareChatStatus.lastMessage.message.createdTime,
        lastText: lastText,
        unread: unread
    }
    chatData.chatList.push(data)
    return genChatButton(data)

}

function genChatButton(data) { //html生成部分
    return div(
        {
            "class": "chatlistItem-module__chatlist_item__MOwxh ",
            "aria-selected": "false",
            "aria-busy": "false",
            "aria-current": "true",
            "data-mid": data.mid,
            "style": "position: absolute; left: 0px; top: " + data.index * 71 + "px; height: 71px; width: 100%;"
        },
        div(
            {
                "class": "profileImage-module__thumbnail_wrap__0bK7m ",
                "data-mid": data.mid,
                "data-profile-image": "true",
                "style": "width: 53px; height: 53px; border-radius: 50%;"
            },
            button(
                {
                    "type": "button",
                    "class": "profileImage-module__button_profile__GqKue",
                },
                div(
                    {
                        "class": "profileImage-module__thumbnail_area__nqIpB"
                    },
                    span(
                        {
                            "class": "profileImage-module__thumbnail__Q6OsR"
                        },
                        img(
                            {
                                "src": data.img,
                                "class": "",
                                "loading": "lazy",
                                "alt": "",
                                "draggable": "false"
                            },
                        )
                    )
                )
            )
        )
        , div(
            {
                "class": "chatlistItem-module__info__nHGhi"
            },
            strong(
                {
                    "class": "chatlistItem-module__title_box__aDNJD"
                },
                span(
                    {
                        "class": "chatlistItem-module__text__daDD3"
                    },
                    pre(
                        {},
                        span(
                            {},
                            data.name)
                    )
                )
                , span(
                    {
                        "class": "chatlistItem-module__member_count__MbL2c"
                    },
                    "(" + data.member + ")")
            )
            , time(
                {
                    "datetime": "Tue Mar 26 2024 14:20:07 GMT+0900 (日本標準時)",
                    "class": "chatlistItem-module__date__tG-MV"
                },
                data.date)
            , div(
                {
                    "class": "chatlistItem-module__description__JH3NE"
                },
                p(
                    {
                        "class": "chatlistItem-module__text__daDD3"
                    },
                    span(
                        {
                            "data-message-id": "500966165850882385"
                        },
                        data.lastText)
                )
            ), data.unread
        )
        , button(
            {
                "role": "link",
                "type": "button",
                "aria-label": "Go chatroom",
                "class": "chatlistItem-module__button_chatlist_item__pcmtA",
                "$click": (...arg) => { buttonEvent("goChat", arg) }
            },
        )
    )

}

var roomData = {    //chat
    messageView: {
        dataList: [],
        elmList: []
    },
    mymid: null,
    roomMid: null,
    followLatest: false
}

var URLcashe = localforage.createInstance({
    name: "URLcashe"
});
var MDataCashe = localforage.createInstance({
    name: "MDataCashe"
});
var ThriftCashe = localforage.createInstance({
    name: "ThriftCashe"
});
var UserCashe = localforage.createInstance({
    name: "UserCashe"
});
async function getMDataUrl(id) {
    let url = "https://obs-jp.line-apps.com/r/g2/m/" + id
    let data = await MDataCashe.getItem(url)
    if (data) {
        return URL.createObjectURL(data)
    } else {
        let res
        try {
            res = await LINE.proxyFetch(url, { "x-line-access": LINE.authToken, "x-line-application": LINE.SQ1.config.appName })
        } catch (error) {

        }
        if (!res || !res.ok) {
            console.error("Error response at " + url)
            return ""
        }
        data = await res.blob()
        MDataCashe.setItem(url, data)
        return URL.createObjectURL(data)
    }
}
async function getMPDataUrl(id) {
    let url = "https://obs-jp.line-apps.com/r/g2/m/" + id + "/preview"
    let data = await MDataCashe.getItem(url)
    if (data) {
        return URL.createObjectURL(data)
    } else {
        let res
        try {
            res = await LINE.proxyFetch(url, { "x-line-access": LINE.authToken, "x-line-application": LINE.SQ1.config.appName })
        } catch (error) {

        }
        if (!res || !res.ok) {
            console.error("Error response at " + url)
            return ""
        }
        data = await res.blob()
        MDataCashe.setItem(url, data)
        return URL.createObjectURL(data)
    }
}
async function getMsgById(id, isElm) {
    let data = { txt: "このメッセージはありません" }
    if (isElm) {
        for (let index = 0; index < roomData.messageView.elmList.childNodes.length; index++) {
            const e = roomData.messageView.elmList.childNodes[index];
            if (e.dataset.id == id) {
                return e
            }
        }
        return null
    }
    for (let index = 0; index < roomData.messageView.dataList.length; index++) {
        const e = roomData.messageView.dataList[index];
        if (e.id == id) {
            if (e.contentType == 0) {
                data.txt = e.text
                data.profile = await getProfile(e._from)
            } else {
                data.txt = ""
                data.profile = await getProfile(e._from)
            }
            return data
        }
    }


    if (!data.profile) {
        data.profile = { img: "", mid: "", name: "" }
    }
    return data
}
async function getObsUrl(obs) {
    let url = "https://obs.line-scdn.net/" + obs
    let data = await URLcashe.getItem(url)
    if (data) {
        return URL.createObjectURL(data)
    } else {
        let res
        try {
            res = await fetch(url)
        } catch (error) {

        }
        if (!res || !res.ok) {
            console.error("Error response at " + url)
            res = await fetch(defaltIMG)
        }
        data = await res.blob()
        URLcashe.setItem(url, data)
        return URL.createObjectURL(data)
    }
}
async function getSquareChatHistory(mid) {
    let prot = "squareChatHistory:" + mid
    let data = await ThriftCashe.getItem(prot)
    if (data) {
        return data
    } else {
        return null
    }
}
async function setSquareChatHistory(mid, sync, history = []) {
    let prot = "squareChatHistory:" + mid
    let data = await getSquareChatHistory(mid)
    if (data) {
        data = {
            syncToken: sync,
            history: [...data.history, ...history]
        }
    } else {
        data = {
            syncToken: sync,
            history: history
        }
    }
    await ThriftCashe.setItem(prot, data)
}
async function refreshProfile(mid) {
    let prot = "squareMember:" + mid
    await ThriftCashe.removeItem(prot)
    return await getProfile(mid)
}
async function getProfile(mid, raw) {
    if (mid.substring(0, 1) == "v") {
        return { name: "Auto-reply", img: defaltIMG, mid: mid }
    }
    let prot = "squareMember:" + mid
    let data = await ThriftCashe.getItem(prot)
    if (data) {
    } else {
        let res = (await LINE.getSquareMember(mid))[1]
        if (res.length == 1) {
            console.error("Error response at " + prot)
            return ""
        }
        let member = new lineType.SquareMember({
            squareMemberMid: res[1],
            squareMid: res[2],
            displayName: res[3],
            profileImageObsHash: res[4],
            ableToReceiveMessage: res[5],
            membershipState: res[7],
            role: res[8],
            revision: res[9],
        })
        data = member
        ThriftCashe.setItem(prot, data)
    }
    if (raw) {
        return data
    }
    let img = defaltIMG
    if (data.profileImageObsHash) {
        img = await getObsUrl(data.profileImageObsHash + "/preview")
    }
    return { name: data.displayName, img: img, mid: data.squareMemberMid }
}
async function getStkDataUrl(id) {
    let url = "https://stickershop.line-scdn.net/stickershop/v1/sticker/" + id + "/android/sticker.png"
    let data = await URLcashe.getItem(url)
    if (data) {
        return URL.createObjectURL(data)
    } else {
        let res
        try {
            res = await fetch(url)
        } catch (error) {

        }
        if (!res || !res.ok) {
            console.error("Error response at " + url)
            return ""
        }
        data = await res.blob()
        URLcashe.setItem(url, data)
        return URL.createObjectURL(data)
    }
}
async function buttonEvent(n, arg) {

    if (n == "goChat") {
        if (roomData.roomMid == arg[0].parentElement.dataset.mid) {
            notify("すでに開いています", "red", "#fff")
            return
        }
        roomData.roomMid = arg[0].parentElement.dataset.mid
        await squareChat2chatroom(await LINE.getSquareChat(arg[0].parentElement.dataset.mid))
        await getAndBuildMessages(arg[0].parentElement.dataset.mid)
        return
    }
    if (n == "send") {
        if (roomData.command) {
            cRequest(arg[0].parentElement.parentElement.childNodes[0].childNodes[0].value)
            cResponse(await runCommand(" " + arg[0].parentElement.parentElement.childNodes[0].childNodes[0].value))
        }
        if (arg[0].parentElement.parentElement.childNodes[0].childNodes[0].value.substring(0, 4) == "$cmd") {
            notify(await runCommand(arg[0].parentElement.parentElement.childNodes[0].childNodes[0].value.substring(4)), "#fff", "#222", 7000)
            return
        }
        LINE.sendTxtMessage(roomData.roomMid, arg[0].parentElement.parentElement.childNodes[0].childNodes[0].value)
        arg[0].parentElement.parentElement.childNodes[0].childNodes[0].value = ""
        return
    }
    if (n == "viewReply") {
        let res = await getMsgById(arg[0].parentElement.dataset.messageId, true)
        if (res) {
            res.scrollIntoView()
        }
        return
    }
    if (n == "chatScroll") {
        var scroll = arg[0].scrollTop;
        if (scroll > -1) {
            arg[0].parentElement.childNodes[1].dataset.hidden = "true"
            roomData.followLatest = true
        } else {
            roomData.followLatest = false
            arg[0].parentElement.childNodes[1].dataset.hidden = "false"
        }
        return
    }
    if (n == "chatDown") {
        roomData.followLatest = true
        arg[0].parentElement.childNodes[2].scrollTop = 0
        return
    }
    if (n == "openProfileM") {
        memberPopup(arg[0].dataset.mid)
        return
    }
    if (n == "openProfile") {
        memberPopup(arg[0].parentElement.dataset.mid)
        return
    }
    if (n == "closeChat") {
        roomData.roomMid = null
        __("#root > div > div > div:nth-child(4)").out.innerHTML = ""
        return
    }
    if (n == "memberView") {
        roomData.roomMid = null
        chatMembersList(arg[0].parentElement.parentElement.parentElement.parentElement.dataset.mid)
        return
    }
    if (n == "imgMsgView") {
        notify("画像を読み込み中...", "#fff", "green")
        open(await getMDataUrl(arg[0].parentElement.parentElement.dataset.messageId), "image", "popup,width=400,height=400")
        return
    }
    if (n == "videoMsgView") {
        notify("動画を読み込み中...", "#fff", "green")
        open(await getMDataUrl(arg[0].parentElement.parentElement.dataset.messageId), "video", "popup,width=400,height=400")
        return
    }
    if (n == "stkView") {
        open("https://store.line.me/stickershop/product/" + arg[0].dataset.stkPkgId)
        return
    }
    if (n == "openProfileImg") {
        open("https://obs.line-scdn.net/" + (await getProfile(arg[0].parentElement.dataset.mid, true)).profileImageObsHash, "image", "popup,width=400,height=400")
        return
    }
    if (n == "openConsole") {
        consoleRoom()
        return
    }
    console.log(n, arg)
}
async function runCommand(command) {
    console.log(command)
    if (command == "") {
        consoleRoom()
        return "consoleを開きました"
    }
    command = command.split(" ")
    switch (command[1]) {
        case "allkick":
            return "👿"
        case "silent":
            return `${command[2]} : mode = Silent`
        case "normal":
            return `${command[2]} : mode = Normal`
        case "status":
            return `OpenChat-Web-Client : ${window.version} / ${window.versionCode}
User-Name : ${LINE.name}
User-Mid : ${LINE.mid}
User-Device : ${LINE.deviceName}
SquareChatMid : ${roomData.commandMid}
MySquareMemberMid : ${roomData.mymid}`
        case "cd":
            roomData.commandMid = command[2]
            roomData.mymid = null
            return `SquareChatMid : ${roomData.commandMid}`
        default:
            return "unknown command : " + command[1]
    }
}
function consoleRoom() {
    let data = {
        mymid: roomData.mymid,
        mid: roomData.roomMid,
        name: "Console",
        member: "^^",
        img: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QBoRXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAMAAAExAAIAAAARAAAATgAAAAAAAJOjAAAD6AAAk6MAAAPocGFpbnQubmV0IDUuMC4xMwAA/+ICKElDQ19QUk9GSUxFAAEBAAACGAAAAAAEMAAAbW50clJHQiBYWVogAAAAAAAAAAAAAAAAYWNzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAPbWAAEAAAAA0y0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJZGVzYwAAAPAAAAB0clhZWgAAAWQAAAAUZ1hZWgAAAXgAAAAUYlhZWgAAAYwAAAAUclRSQwAAAaAAAAAoZ1RSQwAAAaAAAAAoYlRSQwAAAaAAAAAod3RwdAAAAcgAAAAUY3BydAAAAdwAAAA8bWx1YwAAAAAAAAABAAAADGVuVVMAAABYAAAAHABzAFIARwBCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9wYXJhAAAAAAAEAAAAAmZmAADypwAADVkAABPQAAAKWwAAAAAAAAAAWFlaIAAAAAAAAPbWAAEAAAAA0y1tbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAIBAQEBAQIBAQECAgICAgQDAgICAgUEBAMEBgUGBgYFBgYGBwkIBgcJBwYGCAsICQoKCgoKBggLDAsKDAkKCgr/2wBDAQICAgICAgUDAwUKBwYHCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgr/wAARCAABAAEDARIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+f+igD//Z",
        inputName: "コマンド ",
    }
    let res = genChatroom(data)
    __("#root > div > div > div:nth-child(4)").in(res)
    if (!roomData.commandMid) {
        roomData.commandMid = roomData.roomMid
    }
    roomData.command = true
    roomData.roomMid = null
    data = {
        isSelected: false,
        timeInt: new Date().getTime(),
        timeStr: new Date()
            .toLocaleTimeString()
            .substring(0, 5)
        ,
        profile: { img: defaltIMG, name: "console", mid: "vconsole" },
        mid: "vconsole",
        msgId: new Date().getTime(),
        contentType: 0,
        direction: "",//reverse
        msgGroup: "item",
        text: `chatCommand
OpenChat-Web-Client : ${window.version} / ${window.versionCode}
User-Name : ${LINE.name}
User-Mid : ${LINE.mid}
User-Device : ${LINE.deviceName}
SquareChatMid : ${roomData.commandMid}
MySquareMemberMid : ${roomData.mymid}`
    }
    appendMsgByData(data)

}
function cResponse(text) {
    data = {
        isSelected: false,
        timeInt: new Date().getTime(),
        timeStr: new Date()
            .toLocaleTimeString()
            .substring(0, 5)
        ,
        profile: { img: defaltIMG, name: "console", mid: "vconsole" },
        mid: "vconsole",
        msgId: new Date().getTime(),
        contentType: 0,
        direction: "",//reverse
        msgGroup: "item",
        text: text
    }
    appendMsgByData(data)
}
function cRequest(text) {
    data = {
        isSelected: false,
        timeInt: new Date().getTime(),
        timeStr: new Date()
            .toLocaleTimeString()
            .substring(0, 5)
        ,
        profile: { img: defaltIMG, name: "console", mid: "vconsole" },
        mid: "vconsole",
        msgId: new Date().getTime(),
        contentType: 0,
        direction: "reverse",//
        msgGroup: "item",
        text: text
    }
    appendMsgByData(data)
}
function appendMsgByData(data) {
    let dom = genMsg(data)
    roomData.messageView.elmList.prepend(dom)
    if (roomData.followLatest) {
        dom.scrollIntoView()
    }
    observer.observe(dom)
}
async function squareChat2chatroom(squareChatResponse) {
    roomData.messageView.dataList = []
    roomData.commandMid = null
    roomData.command = false
    roomData.roomMid = squareChatResponse.squareChat.squareChatMid
    let data = {
        mymid: squareChatResponse.squareChatMember.squareMemberMid,
        mid: squareChatResponse.squareChat.squareChatMid,
        name: squareChatResponse.squareChat.name,
        member: squareChatResponse.squareChatStatus.otherStatus.memberCount,
        img: await getObsUrl(squareChatResponse.squareChat.chatImageObsHash),
        inputName: (await getProfile(squareChatResponse.squareChatMember.squareMemberMid)).name + "として",
    }
    let res = genChatroom(data)
    __("#root > div > div > div:nth-child(4)").in(res)
    return res
}
function genChatroom(data) {
    let mlist = div(
        {
            "class": "message_list",
            "role": "log",
            "data-mymid": data.mymid,
            "$scroll": (...arg) => { buttonEvent("chatScroll", arg) }
        },
    )
    roomData.mymid = data.mymid
    roomData.messageView.elmList = mlist
    let notifyMsg = div({})
    roomData.notifyMsg = notifyMsg
    return div(
        {
            "class": "chatroom-module__chatroom__eVUaK ",
            "data-mid": data.mid,
            "data-font-size": "normal",
            "data-is-dropzone": "true"
        },
        div(
            {
                "class": "chatroomHeader-module__header__ihDT2"
            },
            div(
                {
                    "class": "chatroomHeader-module__inner__0P5fp"
                },
                div(
                    {
                        "class": "chatroomHeader-module__info__2my0W"
                    },
                    button(
                        {
                            "type": "button",
                            "class": "chatroomHeader-module__button_name__US7lb",
                            "aria-controls": "member_popup",
                            "aria-haspopup": "false",
                            "aria-expanded": "false",
                            "$click": (...arg) => { buttonEvent("memberView", arg) }
                        },
                        strong(
                            {
                                "class": "chatroomHeader-module__name__t-K11"
                            },
                            pre(
                                {},
                                span(
                                    {},
                                    data.name)
                            )
                        )
                        , span(
                            {
                                "class": "chatroomHeader-module__member_count__s6hqu"
                            },
                            "(" + data.member + ")")
                    )
                    , button(
                        {
                            "class": "chatroomHeader-module__button_alarm__dBqwP",
                            "data-tooltip": "通知オフ",
                            "$click": (...arg) => { buttonEvent("chatNotiDisable", arg) }
                        },
                        i(
                            {
                                "class": "icon chatroomHeader-module__icon_alarm__tgjw2"
                            },
                            svg(
                                {
                                    "height": "1em",
                                    "fill": "currentColor",
                                    "viewBox": "0 0 20 20",
                                    "xmlns": "http://www.w3.org/2000/svg",
                                    "data-laicon-version": "7.0"
                                },
                                g(
                                    {
                                        "transform": "translate(-2 -2)"
                                    },
                                    path(
                                        {
                                            "d": "m8.377 7.845 5.004-4.665c.419-.391 1.119-.103 1.119.46v16.72c0 .563-.699.851-1.119.46l-5.004-4.665H2.661a.654.654 0 0 1-.654-.545L2 15.515v-7.03a.65.65 0 0 1 .661-.64h5.716zm9.37 1.243a4.185 4.185 0 0 0-.725-.57l-.702 1.09.175.118A2.793 2.793 0 0 1 16.819 14c-.153.15-.32.281-.498.392l.701 1.09.192-.127c.19-.133.368-.28.533-.443a4.068 4.068 0 0 0 0-5.824zM18.637 6c.452.28.87.61 1.25.983a7.008 7.008 0 0 1 0 10.034c-.305.3-.634.57-.983.809L18.64 18l-.704-1.09c.37-.23.712-.5 1.023-.805a5.735 5.735 0 0 0 0-8.21 5.874 5.874 0 0 0-.753-.626l-.27-.179.701-1.09z"
                                        },
                                    )
                                )
                            )
                        )
                    )
                    , button(
                        {
                            "class": "chatroomHeader-module__button_popup__tcF1V",
                            "data-tooltip": "閉じる",
                            "$click": (...arg) => { buttonEvent("closeChat", arg) }
                        }, "X"
                    )
                )
                , div(
                    {
                        "class": "chatroomHeader-module__action_group__k8w1P"
                    }, button(
                        {
                            "type": "button",
                            "aria-label": "more button",
                            "data-tooltip": "ノート",
                            "class": "chatroomHeader-module__button_more__9rz-2",
                            "aria-haspopup": "true",
                            "$click": (...arg) => { buttonEvent("noteView", arg) }
                        },
                        i(
                            {
                                "class": "icon chatroomHeader-module__icon_more__Q8OVO"
                            },
                            svg(
                                {
                                    "xmlns": "http://www.w3.org/2000/svg",
                                    "height": "2em",
                                    "fill": "#fff",
                                    "viewBox": "0 0 20 20"
                                },
                                g(
                                    {
                                        "stroke": "#000",
                                        "stroke-width": "1.5"
                                    },
                                    path(
                                        {
                                            "d": "M3.75 4c0-.69.56-1.25 1.25-1.25h13c.69 0 1.25.56 1.25 1.25v14.004c0 .69-.56 1.25-1.25 1.25H5c-.69 0-1.25-.56-1.25-1.25V4zM8.523 8.026h5.954M8.523 10.979h5.954M8.523 13.979h5.954"
                                        },

                                    )
                                ), defs(
                                    {},
                                    clipPath(
                                        {
                                            "id": "bcclip0_1_5447"
                                        },
                                        path(
                                            {
                                                "fill": "currentColor",
                                                "transform": "translate(3 2)",
                                                "d": "M0 0h17v18H0z"
                                            },

                                        )
                                    )
                                )
                            )
                        )
                    ),
                    button(
                        {
                            "type": "button",
                            "aria-label": "more button",
                            "class": "chatroomHeader-module__button_more__9rz-2",
                            "aria-haspopup": "true",
                            "$click": (...arg) => { buttonEvent("chatAction", arg) }
                        },
                        i(
                            {
                                "class": "icon chatroomHeader-module__icon_more__Q8OVO"
                            },
                            svg(
                                {
                                    "height": "1em",
                                    "fill": "currentColor",
                                    "viewBox": "0 0 20 20",
                                    "xmlns": "http://www.w3.org/2000/svg",
                                    "data-laicon-version": "5.0"
                                },
                                g(
                                    {
                                        "transform": "translate(-2 -2)"
                                    },
                                    path(
                                        {
                                            "d": "M12 16.4722c.829 0 1.5.671 1.5 1.5 0 .311-.094.599-.256.838-.054.08-.116.155-.183.223a1.499 1.499 0 0 1-1.061.439c-.414 0-.789-.168-1.061-.439a1.5739 1.5739 0 0 1-.183-.223 1.487 1.487 0 0 1-.256-.838c0-.829.671-1.5 1.5-1.5ZM12 10.5c.829 0 1.5.671 1.5 1.5s-.671 1.5-1.5 1.5-1.5-.671-1.5-1.5.671-1.5 1.5-1.5Zm0-5.9722c.829 0 1.5.672 1.5 1.5 0 .829-.671 1.5-1.5 1.5s-1.5-.671-1.5-1.5c0-.828.671-1.5 1.5-1.5Z"
                                        },
                                    )
                                )
                            )
                        )
                    )
                )
            )
        )
        , div(
            {
                "class": "chatroomContent-module__content_area__gK6db ",
                "style": "background-image:url(" + data.img + ");background-size: 100% auto;background-position: center;height:50vh;"
            },
            ul(
                {
                    "class": "ToastContainer-module__toast-list__QAniw",
                    "style": "z-index: 100;"
                },
            )
            , button(
                {
                    "type": "button",
                    "aria-label": "Scroll down",
                    "class": "scrollDownButton-module__button_scroll_down__-XrLT",
                    "data-hidden": "true",
                    "$click": (...arg) => { buttonEvent("chatDown", arg) }
                },
                i(
                    {
                        "class": "icon scrollDownButton-module__icon_arrow__6We-I"
                    },
                    svg(
                        {
                            "height": "1em",
                            "fill": "currentColor",
                            "viewBox": "0 0 20 20",
                            "xmlns": "http://www.w3.org/2000/svg",
                            "data-laicon-version": "5.0"
                        },
                        g(
                            {
                                "transform": "translate(-2 -2)"
                            },
                            path(
                                {
                                    "d": "m13 3.6245-.0002 13.046 5.7122-5.4163 1.3762 1.4512L12 20.3754l-8.0882-7.67 1.3762-1.4512 5.7118 5.4163L11 3.6245h2Z"
                                },
                            )
                        )
                    )
                )
            )
            , mlist, notifyMsg
        )
        ,
        div(
            {
                "class": "chatroomEditor-module__editor_area__1UsgR"
            }, div({
                "data-is-empty": "true", "class": "text chatroomEditor-module__textarea__yKTlH", spellcheck: "false", autofocus: "", maxlength: "10000", placeholder: "メッセージを入力"
            }, textarea(
                {
                    "part": "input",
                    "class": "input ",
                    "placeholder": data.inputName + "メッセージを入力",
                    "maxlength": "10000",
                    "autofocus": "",
                    "style": "max-width: 100%; min-width: 100%;max-height:150%;--inherited-font-family: -apple-system, BlinkMacSystemFont, \"Helvetica Neue\", helvetica, \"Hiragino Sans\", arial, \"MS PGothic\", sans-serif; --webfont-family: F2607980855;",
                    "$input": (...arg) => { buttonEvent("msgInput", arg) }
                },
            )
                , div(
                    {
                        "class": "cover",
                        "part": "cover",
                        "style": "--inherited-font-family: -apple-system, BlinkMacSystemFont, \"Helvetica Neue\", helvetica, \"Hiragino Sans\", arial, \"MS PGothic\", sans-serif; --webfont-family: F2607980855;"
                    },
                )
            )

            , div(
                {
                    "class": "actionGroup-module__action_box__-HA8N "
                },
                button(
                    {
                        "type": "button",
                        "aria-label": "Send file",
                        "class": "actionGroup-module__button_action__VwNgx",
                        "data-type": "file",
                        "data-tooltip": "ファイル送信",
                        "data-tooltip-placement": "top-start",
                        "$click": (...arg) => { buttonEvent("sendFile", arg) }
                    },
                    i(
                        {
                            "class": "icon"
                        },
                        svg(
                            {
                                "width": "24",
                                "height": "24",
                                "viewBox": "0 0 24 24",
                                "fill": "none",
                                "xmlns": "http://www.w3.org/2000/svg"
                            },
                            path(
                                {
                                    "d": "M11.479 4.971c1.664-1.925 4.658-2.24 6.686-.702.988.749 1.603 1.823 1.73 3.021a4.32 4.32 0 0 1-.908 3.123l-.156.19-8.75 10.125-1.1-.834 8.78-10.158c.566-.655.828-1.47.74-2.3A3.009 3.009 0 0 0 17.3 5.341c-1.382-1.049-3.414-.88-4.615.352l-.134.147-6.762 7.828a1.86 1.86 0 0 0-.458 1.421c.054.513.316.971.744 1.295a2.16 2.16 0 0 0 1.54.418 2.17 2.17 0 0 0 1.296-.597l.123-.131 6.763-7.83a.707.707 0 0 0-.109-1.042.885.885 0 0 0-1.098.046l-.078.078-5.367 6.213-1.043-.954 5.34-6.128a2.316 2.316 0 0 1 3.113-.326 2.034 2.034 0 0 1 .415 2.854l-.102.127-6.763 7.83a3.579 3.579 0 0 1-2.348 1.21 3.578 3.578 0 0 1-2.55-.696 3.192 3.192 0 0 1-1.269-2.22 3.176 3.176 0 0 1 .638-2.26l.142-.176 6.762-7.829z",
                                    "fill": "#303030"
                                },
                            )
                        )
                    )
                )
                , button(
                    {
                        "type": "button",
                        "aria-label": "Select sticker",
                        "class": "actionGroup-module__button_action__VwNgx",
                        "data-type": "sticker",
                        "data-tooltip": "スタンプ",
                        "data-tooltip-placement": "top-end",
                        "$click": (...arg) => { buttonEvent("sendStk", arg) }
                    },
                    i(
                        {
                            "class": "icon"
                        },
                        svg(
                            {
                                "width": "24",
                                "height": "24",
                                "viewBox": "0 0 24 24",
                                "fill": "none",
                                "xmlns": "http://www.w3.org/2000/svg"
                            },
                            g(
                                {
                                    "opacity": "0.01",
                                    "fill": "#fff"
                                },
                                path(
                                    {
                                        "d": "M0 0h24v24H0z"
                                    },
                                )
                                , path(
                                    {
                                        "opacity": "0.7",
                                        "d": "M2 2h20v20H2z"
                                    },
                                )
                            )
                            , path(
                                {
                                    "d": "M14.843 13.17a.624.624 0 0 0-.853.228 2.76 2.76 0 0 1-4.78 0 .624.624 0 1 0-1.08.625 4.008 4.008 0 0 0 6.94 0 .624.624 0 0 0-.227-.852z",
                                    "fill": "#303030"
                                },
                            )
                            , circle(
                                {
                                    "cx": "14.266",
                                    "cy": "10.464",
                                    "r": "0.96",
                                    "fill": "#303030"
                                },
                            )
                            , circle(
                                {
                                    "cx": "8.934",
                                    "cy": "10.464",
                                    "r": "0.96",
                                    "fill": "#303030"
                                },
                            )
                            , path(
                                {
                                    "fill-rule": "evenodd",
                                    "clip-rule": "evenodd",
                                    "d": "M11.6 3.22a8.88 8.88 0 1 0 8.88 8.88 8.89 8.89 0 0 0-8.88-8.88zm0 16.512a7.632 7.632 0 1 1 7.632-7.632 7.64 7.64 0 0 1-7.632 7.632z",
                                    "fill": "#303030"
                                },
                            )
                            , path(
                                {
                                    "d": "M11.6 3.22v-.1.1zm8.88 8.88h.1-.1zm-8.88 7.632v.1-.1zm7.632-7.632h.1-.1zM11.6 3.12a8.98 8.98 0 0 0-8.98 8.98h.2a8.78 8.78 0 0 1 8.78-8.78v-.2zM2.62 12.1a8.98 8.98 0 0 0 8.98 8.98v-.2a8.78 8.78 0 0 1-8.78-8.78h-.2zm8.98 8.98a8.98 8.98 0 0 0 8.98-8.98h-.2a8.78 8.78 0 0 1-8.78 8.78v.2zm8.98-8.98a8.99 8.99 0 0 0-8.98-8.98v.2a8.79 8.79 0 0 1 8.78 8.78h.2zm-8.98 7.532a7.532 7.532 0 0 1-6.96-4.649l-.184.077a7.732 7.732 0 0 0 7.144 4.772v-.2zm-6.96-4.649a7.532 7.532 0 0 1 1.633-8.209l-.142-.141a7.732 7.732 0 0 0-1.675 8.427l.185-.077zm1.633-8.209a7.532 7.532 0 0 1 8.209-1.633l.076-.185a7.732 7.732 0 0 0-8.427 1.677l.142.141zm8.209-1.633a7.532 7.532 0 0 1 4.65 6.959h.2a7.732 7.732 0 0 0-4.774-7.144l-.076.185zm4.65 6.959a7.54 7.54 0 0 1-7.532 7.532v.2a7.74 7.74 0 0 0 7.731-7.732h-.2z",
                                    "fill": "#303030"
                                },
                            )
                        )
                    )
                ),
                button(
                    {
                        "type": "button",
                        "aria-label": "Select sticker",
                        "class": "actionGroup-module__button_action__VwNgx",
                        "data-type": "send",
                        "data-tooltip": "送信",
                        "data-tooltip-placement": "top-end",
                        "$click": (...arg) => { buttonEvent("send", arg) }
                    },
                    i(
                        {
                            "class": "icon"
                        },
                        svg(
                            {
                                "width": "24",
                                "height": "24",
                                "viewBox": "0 0 24 24",
                                "fill": "none",
                                "xmlns": "http://www.w3.org/2000/svg"
                            },
                            path(
                                {
                                    "class": "sendButton",
                                    "d": "M9.00967 5.12761H11.0097C12.1142 5.12761 13.468 5.89682 14.0335 6.8457L16.5089 11H21.0097C21.562 11 22.0097 11.4477 22.0097 12C22.0097 12.5523 21.562 13 21.0097 13H16.4138L13.9383 17.1543C13.3729 18.1032 12.0191 18.8724 10.9145 18.8724H8.91454L12.4138 13H5.42485L3.99036 15.4529H1.99036L4.00967 12L4.00967 11.967L2.00967 8.54712H4.00967L5.44417 11H12.5089L9.00967 5.12761Z",
                                    "fill": "currentColor"
                                },

                            )
                        )
                    )
                )
            )
        )
    )

}


const observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
        if (e.isIntersecting) {
            e.target.setAttribute("style", "")
        } else {
            e.target.setAttribute("style", "visibility:hidden;")
        }
    }
});

var fileMenu = ""
async function getAndBuildMessages(mid, sync, t = 20000) {
    let data
    if (sync) {
        data = await LINE.timeOutWith(LINE, "fetchSquareChatEvents", t, mid, sync)
    } else {
        data = await LINE.timeOutWith(LINE, "fetchSquareChatEvents", t, mid)
    }
    if (data.syncToken && !Number(data.syncToken)) {
        //setSquareChatHistory(mid, data.syncToken)
        roomData.syncToken = data.syncToken
    }

    let chats = []
    let reading = []
    for (let i = 0; i < data.events.length; i++) {
        const e = data.events[i];
        if (roomData.roomMid == mid) {
            if (e.type == 1) {
                chats.push(e.payload.sendMessage.squareMessage.message)
            } else if (e.type == undefined) {
                chats.push(e.payload.receiveMessage.squareMessage.message)
            } else if (e.type == 6) {
                reading.push(await getProfile(e.payload.notifiedMarkAsRead.sMemberMid))
            }
        }
    }
    let readingTxt = "浮上中: "
    reading.forEach(e => {
        readingTxt += e.name + " "
    })
    genNewMessage({
        text: readingTxt,
        by: "",
        call: () => { notify(readingTxt, "#fff", "#333") }
    })
    appendMsgs(chats, mid)
}
async function appendMsgs(messages = [], mid) {
    for (let index = 0; index < messages.length; index++) {
        if (roomData.roomMid != mid) {
            squareChat2chatroom(roomData.roomMid)
            return
        }
        const element = new lineType.Message(messages[index])
        let dom = (await Message2Elm(element))[0]
        roomData.messageView.elmList.prepend(dom)
        roomData.messageView.dataList.push(element)
        if (roomData.followLatest) {
            dom.scrollIntoView()
        }
        observer.observe(dom)
    }

}
async function Message2Elm(message) {
    let data = {
        isSelected: false,
        timeInt: message.deliveredTime,
        timeStr: new Date(message.deliveredTime)
            .toLocaleTimeString()
            .substring(0, 5)
        ,
        profile: await getProfile(message._from),
        mid: message._from,
        msgId: message.id,
        rId: message.relatedMessageId,
        contentType: message.contentType,
        direction: "",
        msgGroup: ""
    }
    if (roomData.messageView.dataList[roomData.messageView.dataList.length - 1]) {
        if ((roomData.messageView.dataList[roomData.messageView.dataList.length - 1]._from == data.mid)) {
            data["msgGroup"] = "item"
        }
    }

    if (data.mid == roomData.mymid) {
        data.direction = "reverse"
    }
    if (data.rId && (message.relatedMessageServiceCode == 2) && (message.messageRelationType == 3)) {
        data.reply = await getMsgById(data.rId)
    }
    let add;
    switch (message.contentType) {
        case 0://t
            add = {
                text: [message.text],
                emoji: message.contentMetadata.REPLACE,
                mention: message.contentMetadata.MENTION
            }
            data = { ...data, ...add }
            break;
        case undefined://t
            add = {
                text: [message.text],
                emoji: message.contentMetadata.REPLACE,
                mention: message.contentMetadata.MENTION
            }
            data = { ...data, ...add }
            break;
        case 1://i
            add = {
                data: {
                    preview: await getMPDataUrl(message.id)
                }
            }
            data = { ...data, ...add }
            break;
        case 2://v
            add = {
                data: {
                    preview: await getMPDataUrl(message.id)
                }
            }
            data = { ...data, ...add }
            break;
        case 3://a
            add = {
                data: await getMDataUrl(message.id)
            }
            data = { ...data, ...add }
            break;
        case 7://st
            add = {
                img: await getStkDataUrl(message.contentMetadata.STKID),
                stkId: message.contentMetadata.STKID,
                stkPId: message.contentMetadata.STKPKGID
            }
            data = { ...data, ...add }
            break;
        case 14://fi

            break
        case 16://note
            add = {
                text: message.text,
                url: message.contentMetadata.postEndUrl,
                createBy: message.contentMetadata.officialName
            }
            data = { ...data, ...add }
            break;
            break
        case 22://fl
            add = {
                text: message.contentMetadata.ALT_TEXT,
                flex: message.contentMetadata.FLEX_JSON,
            }
            data = { ...data, ...add }
            break;
        default:
            break;
    }

    return [genMsg(data)
        , data, genMsg]//elm data func

}
function genSysMsg(data) {
    if (data.date) {
        return div(
            {
                "class": "messageDate-module__date_wrap__I4ily ",
                "data-selected": "false",
            },
            time(
                {
                    "class": "messageDate-module__date__pDnK3",
                },
                data.date)
        )
    } else if (data.event) {
        return div(
            {
                "class": "systemMessage-module__message__yIiOJ ",
                "data-flexible": "true",
                "data-selected": "false",
                "data-message-id": data.event.id,
                "data-timestamp": data.event.timeStr,
                "data-mid": data.event.mid,
                "$click": (...arg) => { buttonEvent("eventView", arg) }
            },
            div(
                {
                    "class": "systemMessage-module__text__7T3Lj"
                },
                pre(
                    {},
                    time(
                        {
                            "class": "systemMessage-module__date__o1LDL",
                        },
                        data.event.timeStr)
                    , span(
                        {},
                        data.event.text)
                )
            )
        )
    }
}
function genMsg(data = {}) {

    return div(
        {
            "class": "message-module__message__7odk3   messageLayout-module__message__YVDhk ",
            "data-selected": data.isSelected,
            "data-timestamp": data.timeInt,
            "data-message-content-prefix": data.timeStr + " " + data.profile.name,
            "data-mid": data.mid,
            "data-group": data.msgGroup,
            "data-direction": data.direction,
            "data-id": data.msgId
        },
        div(
            {
                "class": "thumbnail profileImage-module__thumbnail_wrap__0bK7m ",
                "data-mid": data.mid,
                "data-profile-image": "true",
                "style": "border-radius: 50%;"
            },
            button(
                {
                    "type": "button",
                    "class": "profileImage-module__button_profile__GqKue",
                    "$click": (...arg) => { buttonEvent("openProfile", arg) }
                },
                div(
                    {
                        "class": "profileImage-module__thumbnail_area__nqIpB"
                    },
                    span(
                        {
                            "class": "profileImage-module__thumbnail__Q6OsR"
                        },
                        img(
                            {
                                "src": data.profile.img,
                                "class": "",
                                "loading": "lazy",
                                "alt": "",
                                "draggable": "false"
                            },
                        )
                    )
                )
            )
        )
        , pre(
            {
                "class": "username-module__username__vGQGj",
                "style": "color:#fff;"
            },
            fuchi(data.profile.name)
        )
        , div(
            {
                "class": "messageLayout-module__content__PGz66"
            },
            div(
                {
                    "class": "message-module__content__OuUCi"
                },
                div(
                    {
                        "class": "message-module__content_inner__j-iko"
                    },
                    msgMain(data)
                    , div(
                        {
                            "class": "metaInfo-module__meta__F2Lfn "
                        },
                        span(
                            {
                                "class": "metaInfo-module__read_count__8-U6j"
                            },
                        )
                        , time(
                            {
                                "class": "metaInfo-module__send_time__-3Q6-",
                                "style": "color:#fff;"
                            },
                            fuchi(data.timeStr))
                    )
                )
            )
            , div(
                {
                    "class": "reactionBubblelist-module__reaction_bubble_list__eV9o2 "
                },
            ), fileMenu
        )
        , "‌")

}
function msgMain(data) {
    fileMenu = ""
    switch (data.contentType) {
        case 0://txt
            if (data.reply) {
                return replyBox(data, textMsg(data))
            } else {
                return textMsg(data)
            }
            break;
        case undefined://txt
            if (data.reply) {
                return replyBox(data, textMsg(data))
            } else {
                return textMsg(data)
            }
            break;
        case 1://img
            return imgMsg(data);
        case 2://video
            return videoMsg(data);
        case 3://audio
            return audioMsg(data);
        case 7://sticker
            return stickerMsg(data);
        case 14: //file
            break;
        case 16://note
            return noteMessage(data);
        case 22: //flex
            return flexMsg(data);
        default:
            break;
    }
    function noteMessage(data) {
        if (!data.text) {
            data.text = ""
        }
        let text = ["ノート\n", data.text, "\n", a({ href: data.url }, "ノートを見る")]
        return div(
            {
                "class": "textMessageContent-module__content_wrap__238E1 ",
                "data-message-id": data.msgId,
                "$contextmenu": (...arg) => { buttonEvent("msgAction", arg) },
                "data-direction": data.direction
            },
            pre(
                {
                    "class": "textMessageContent-module__text__EFwEN"
                },
                span(
                    {
                        "data-message-content": "",
                        "data-is-message-text": "true"
                    },
                    ...text)
            )
        )
    }
    function textMsg(data) {
        if (!data.text) {
            data.text = [""]
        }
        if (data.mention) {
            let mention = JSON.parse(data.mention)
            let txt = []
            let otxt = data.text[0]
            mention.MENTIONEES.forEach((e, i, l) => {
                let oE
                if (l[i - 1]) {
                    oE = Number(l[i - 1].E)
                } else {
                    oE = 0
                }

                if (i == (l.length - 1)) {
                    txt.push(otxt.substring(oE, Number(e.S)))
                    txt.push(strong(
                        {
                            "class": "mention",
                            "data-mid": e.M,
                            "$click": (...arg) => { buttonEvent("openProfileM", arg) }
                        }, otxt.substring(Number(e.S), Number(e.E))
                    ))
                    txt.push(otxt.substring(Number(e.E)))
                } else {
                    txt.push(otxt.substring(oE, Number(e.S)))
                    txt.push(strong(
                        {
                            "class": "mention",
                            "data-mid": e.M,
                            "$click": (...arg) => { buttonEvent("openProfileM", arg) }
                        }, otxt.substring(Number(e.S), Number(e.E))
                    ))
                }

            });
            data.text = txt
        } else if (data.emoji) {
            let emoji = JSON.parse(data.emoji)
            let txt = []
            let otxt = data.text[0]
            emoji.sticon.resources.forEach((e, i, l) => {
                let oE
                if (l[i - 1]) {
                    oE = l[i - 1].E
                } else {
                    oE = 0
                }

                if (i == (l.length - 1)) {
                    txt.push(otxt.substring(oE, e.S))
                    txt.push(span(
                        {
                            "class": "emoji-wrap",
                            "data-tooltip": "",
                            "data-tooltip-is-html": "true",
                            "data-tooltip-is-preserved": "true",
                            "data-emoji": e.productId + ":" + e.sticonId,
                            "$click": (...arg) => { buttonEvent("emojiView", arg) }
                        },
                        img(
                            {
                                "src": `https://stickershop.line-scdn.net/sticonshop/v1/sticon/${e.productId}/android/${e.sticonId}.png`,
                                "class": "emoji",
                                "alt": "(emoji)",
                                "loading": "lazy"
                            },
                        )
                    ))
                    txt.push(otxt.substring((e.E)))
                } else {
                    txt.push(otxt.substring(oE, e.S))
                    txt.push(span(
                        {
                            "class": "emoji-wrap",
                            "data-tooltip": "",
                            "data-tooltip-is-html": "true",
                            "data-tooltip-is-preserved": "true",
                            "data-emoji": e.productId + ":" + e.sticonId,
                            "$click": (...arg) => { buttonEvent("emojiView", arg) }
                        },
                        img(
                            {
                                "src": `https://stickershop.line-scdn.net/sticonshop/v1/sticon/${e.productId}/android/${e.sticonId}.png`,
                                "class": "emoji",
                                "alt": "(emoji)",
                                "loading": "lazy"
                            },
                        )
                    ))
                }

            });
            data.text = txt

        }
        return div(
            {
                "class": "textMessageContent-module__content_wrap__238E1 ",
                "data-message-id": data.msgId,
                "$contextmenu": (...arg) => { buttonEvent("msgAction", arg) },
                "data-direction": data.direction
            },
            pre(
                {
                    "class": "textMessageContent-module__text__EFwEN",
                    "style": "max-height: 500px;overflow-y: auto;"
                },
                span(
                    {
                        "data-message-content": "",
                        "data-is-message-text": "true"
                    },
                    ...data.text)
            )
        )
    }

    function replyBox(data, index) {
        return div(
            {
                "class": "replyMessageContent-module__content_wrap__D0K-5 ",
                "data-type": "",
                "data-content-type": "",
                "data-message-id": data.rId
            },
            button(
                {
                    "type": "button",
                    "class": "replyMessageContent-module__button_move__Jo33w",
                    "aria-label": "See in chat",
                    "$click": (...arg) => { buttonEvent("viewReply", arg) }
                },
                div(
                    {
                        "class": "replyMessageContent-module__message__0FNkK  messageLayout-module__message__YVDhk "
                    },
                    div(
                        {
                            "class": "thumbnail profileImage-module__thumbnail_wrap__0bK7m ",
                            "data-mid": data.reply.profile.mid,
                            "data-profile-image": "true",
                            "style": "border-radius: 50%; cursor: default;"
                        },
                        div(
                            {
                                "class": "profileImage-module__thumbnail_area__nqIpB"
                            },
                            span(
                                {
                                    "class": "profileImage-module__thumbnail__Q6OsR"
                                },
                                img(
                                    {
                                        "src": data.reply.profile.img,
                                        "class": "",
                                        "loading": "lazy",
                                        "alt": "",
                                        "draggable": "false"
                                    },
                                )
                            )
                        )
                    )
                    , pre(
                        {
                            "class": "username-module__username__vGQGj"
                        },
                        span(
                            {},
                            data.reply.profile.name)
                    )
                    , div(
                        {
                            "class": "messageLayout-module__content__PGz66"
                        },
                        p(
                            {
                                "class": "replyMessageContent-module__text__0T50-"
                            },
                            span(
                                {},
                                data.reply.txt)
                        )
                    )
                    , "‌")
            )
            , index
        )
    }
    function imgMsg(data) {
        return div(
            {
                "class": "imageMessageContent-module__content_wrap__bT-Si ",
                "data-type": ""
            },
            div(
                {
                    "class": "imageMessageContent-module__image_group__ZOeAa"
                },
                div(
                    {
                        "class": "imageMessageContent-module__item__fJDih ",
                        "data-message-id": data.msgId
                    },
                    div(
                        {
                            "class": "imageMessageContent-module__thumbnail__z4GO8"
                        },
                        button(
                            {
                                "type": "button",
                                "class": "imageMessageContent-module__button_view__4y-jN",
                                "aria-label": "Show image",
                                "data-index": "0",
                                "$click": (...arg) => { buttonEvent("imgMsgView", arg) }
                            },
                            img(
                                {
                                    "alt": "",
                                    "src": data.data.preview,
                                    "class": "",
                                    "loading": "lazy",
                                    "draggable": "false"
                                },
                            )
                        )
                    )
                )
            )
        )
    }
    function videoMsg(data) {
        return div(
            {
                "class": "videoMessageContent-module__content_wrap__ffvJq ",
                "data-message-id": data.msgId
            },
            div(
                {
                    "class": "videoMessageContent-module__thumbnail__Va9Ie"
                },
                button(
                    {
                        "type": "button",
                        "class": "videoMessageContent-module__button_view__qMX7E",
                        "aria-label": "view video",
                        "$click": (...arg) => { buttonEvent("videoMsgView", arg) }
                    },
                    img(
                        {
                            "alt": "",
                            "src": data.data.preview,
                            "class": "",
                            "loading": "lazy",
                            "draggable": "false"
                        },
                    ), div(
                        {
                            "class": "videoMessageContent-module__info__j528-"
                        },
                        i(
                            {
                                "class": "icon videoMessageContent-module__icon_play__N7WFP"
                            },
                            svg(
                                {
                                    "height": "1em",
                                    "fill": "currentColor",
                                    "viewBox": "0 0 20 20",
                                    "xmlns": "http://www.w3.org/2000/svg",
                                    "data-laicon-version": "10.0"
                                },
                                g(
                                    {
                                        "transform": "translate(-2 -2)"
                                    },
                                    path(
                                        {
                                            "d": "M18.105 11.437a.665.665 0 0 1 0 1.126L7.412 19.29a.665.665 0 0 1-1.02-.563V5.274a.665.665 0 0 1 1.02-.563l10.693 6.726z"
                                        },
                                    )
                                )
                            )
                        ),
                    )
                )
            )
        )
    }
    function audioMsg(data) {
        return div(
            {
                "class": "textMessageContent-module__content_wrap__238E1 ",
                "data-message-id": data.msgId
            }, audio(
                {
                    controls: "",
                    src: data.data,

                }
            )
        )
    }
    function stickerMsg(data) {
        return div(
            {
                "class": "stickerMessageContent-module__content_wrap__BGfk- ",
                "data-message-id": data.msgId
            },
            button(
                {
                    "type": "button",
                    "class": "stickerMessageContent-module__button_view__rTOx0",
                    "aria-label": "view sticker",
                    "data-stkPkgId": data.stkPId,
                    "$click": (...arg) => { buttonEvent("stkView", arg) }
                },
                div(
                    {
                        "class": "stickerMessageContent-module__thumbnail__eMXOS"
                    },
                    div(
                        {
                            "class": "sticker"
                        },
                        img(
                            {
                                "src": data.img,
                                "alt": "[スタンプ]",
                                "loading": "lazy",
                                "draggable": "false",
                                "class": "",
                                "width": "170",
                                "height": "149.33333333333334",
                                "data-is-owned": "false",
                                "data-is-effect-sticker": "false"
                            },
                        )
                    )
                )
            )
        )

    }
    function flexMsg(data) {
        let flex = JSON.parse(data.flex)
        let html = "<!doctype html><html class=\"in_iframe\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1\"><meta name=\"format-detection\" content=\"telephone=no\"><link rel=\"stylesheet\" type=\"text/css\" href=\"https://pamornt.github.io/flex2html/css/flex2html.css\"></head><body style=\"margin: 0;\"><div>"
        html += flex2html("hide", { "type": "flex", "altText": "Flex Message", "contents": flex }) + "</div></body></html>"
        document.getElementById("hide").innerHTML = ""
        let ifr = iframe(
            {
                "frameborder": "0",
                "title": "",
                "style": "width:100%;height:100%;",
                "data-message-id": "501557461296873730",
                "srcdoc": html,
                "sandbox": "allow-same-origin allow-popups allow-popups-to-escape-sandbox",
            },
        )
        setTimeout(() => {
            ifr.setAttribute("style", "width:" + (ifr.contentWindow.document.documentElement.offsetWidth + 1) + "px;height:" + (ifr.contentWindow.document.documentElement.offsetHeight + 11) + "px;")
        }, 2000)

        return div(
            {
                "class": "iframeMessage-module__iframe_wrap__PUSyZ"
            }, ifr
        )
    }
    function fileM() {
        fileMenu = div(
            {
                "class": "message-module__action_group__c8hSm  actionGroup-module__action_group__sGYDY"
            },
            button(
                {
                    "type": "button",
                    "class": "actionGroup-module__button_action__Cu9RJ",
                    "$click": (...arg) => { buttonEvent("dlFile", arg) }
                },
                span(
                    {
                        "class": "actionGroup-module__text__OBOQx"
                    },
                    fuchi("保存"))
            )
        )
    }
}

function fuchi(txt) {
    return span(
        { style: "color:#fff; -webkit-text-stroke: 0.2px #000;text-stroke: 0.2px #000;" }
        , txt
    )
}
/*setInterval(()=>{
    let a=Date.now()
    setTimeout(()=>{
        let b=Date.now()
        if ((b-a)>80) {
            location.reload()
        }
    },10)
    debugger;

},500)*/