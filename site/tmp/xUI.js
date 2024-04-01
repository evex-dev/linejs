var chatList = []
var URLcashe = localforage.createInstance({
    name: "URLcashe"
});
var MDataCashe = localforage.createInstance({
    name: "MDataCashe"
});
var ThriftCashe = localforage.createInstance({
    name: "ThriftCashe"
});
async function buildChatButton(squareChatResponseList = []) {
    function list(inElm) {
        return div({ style: "height: " + 71 * squareChatResponseList.length + "px; width: 100%;" }, ...inElm)
    }
    let elms = []
    for (let index = 0; index < squareChatResponseList.length; index++) {
        const element = squareChatResponseList[index];
        elms.push(await squareChat2chatButton(element, index))
    }
    let res = list(elms)
    __("#root > div > div > div.chatlist-module__chatlist_wrap__KtTpq > div.chatlist-module__chatlist__qruAE > div > div > div").in(res)
    return res
}
async function squareChat2chatButton(squareChatResponse, index) {
    let lastText = ""
    let date = ""
    let unread = ""
    if (squareChatResponse.squareChatStatus.lastMessage) {
        date = new Date(squareChatResponse.squareChatStatus.lastMessage.message.createdTime)
        date = date.getMonth() + 1 + "/" + date.getDate()
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
        lastText: lastText,
        unread: unread
    }
    chatList.push(data)
    return genChatButton(data)

}

function genChatButton(data) {
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

var roomData = {
    messageView: {
        dataList: [],
        elmList: []
    },
    mymid: "",
    roomMid: ""
}
async function getMDataUrl(id) {
    let url = "https://obs-jp.line-apps.com/r/g2/m/" + id
    let data = await MDataCashe.getItem(url)
    if (data) {
        return URL.createObjectURL(data)
    } else {
        let res
        try {
            res = await LINE.proxyFetch(url,{"x-line-access":LINE.authToken,"x-line-application":LINE.SQ1.config.appName})
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
            res = await LINE.proxyFetch(url,{"x-line-access":LINE.authToken,"x-line-application":LINE.SQ1.config.appName})
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
async function getMsgById(id) {
    let data = { txt: "このメッセージはありません" }

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
            return ""
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

async function refreshProfile(mid) {
    let prot = "squareMember:" + mid
    await ThriftCashe.removeItem(prot)
    return await getProfile(mid)
}
async function getProfile(mid, raw) {
    if (mid.substring(0, 1) == "v") {
        return { name: "Auto-reply", img: "", mid: mid }
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
            joinMessage: res[10]
        })
        data = member
        ThriftCashe.setItem(prot, data)
    }
    if (raw) {
        return data
    }
    let img = ""
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
    console.log(n, arg)
    if (n == "goChat") {
        await squareChat2chatroom(await LINE.getSquareChat(arg[0].parentElement.dataset.mid))
        await getAndBuildMessages(arg[0].parentElement.dataset.mid)
    }
    if (n == "send") {
        let res = await LINE.sendTxtMessage(roomData.roomMid, arg[0].parentElement.parentElement.childNodes[0].childNodes[0].value)
        appendMsgs([res.createdSquareMessage.message])
        arg[0].parentElement.parentElement.childNodes[0].childNodes[0].value=""
    }
}

async function squareChat2chatroom(squareChatResponse) {
    roomData.messageView.dataList = []
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
            "data-mymid": data.mymid
        },
    )
    roomData.mymid = data.mymid
    roomData.messageView.elmList = mlist
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
                            "data-tooltip": "別のウィンドウで開く",
                            "$click": (...arg) => { buttonEvent("popUp", arg) }
                        },
                        i(
                            {
                                "class": "icon chatroomHeader-module__icon_popup__q5Czq"
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
                                            "d": "M12.9525 4.4625v1.6h-7.937a.2.2 0 0 0-.2.2v12.7a.2.2 0 0 0 .2.2h12.7a.2.2 0 0 0 .2-.2v-7.9h1.6v7.9a1.8 1.8 0 0 1-1.8 1.8h-12.7c-.9941 0-1.8-.8059-1.8-1.8v-12.7c0-.9941.8059-1.8 1.8-1.8h7.937Zm7.832-1.225v5.828h-1.299v-3.609l-7.08 7.079-.919-.919 7.08-7.079h-3.614v-1.3h5.832Z"
                                        },
                                    )
                                )
                            )
                        )
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
            , mlist
        )
        , div(
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
                    "style": "max-width: 100%; min-width: 100%;max-height:150%;--inherited-font-family: -apple-system, BlinkMacSystemFont, \"Helvetica Neue\", helvetica, \"Hiragino Sans\", arial, \"MS PGothic\", sans-serif; --webfont-family: F2607980855;"
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




var fileMenu = ""
async function getAndBuildMessages(mid) {
    let data = await LINE.fetchSquareChatEvents(mid)
    let chats = []
    data.events.forEach((e) => {
        if (e.type == 1) {
            chats.push(e.payload.sendMessage.squareMessage.message)
        } else if (e.type == undefined) {
            chats.push(e.payload.receiveMessage.squareMessage.message)
        }
    })
    appendMsgs(chats)
}
async function appendMsgs(messages = []) {
    for (let index = 0; index < messages.length; index++) {
        const element = new lineType.Message(messages[index])
        roomData.messageView.elmList.prepend((await Message2Elm(element))[0])
        roomData.messageView.dataList.push(element)
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
        rCode: message.relatedMessageServiceCode,
        rId: message.relatedMessageId,
        contentType: message.contentType,
        direction: "",
        msgGroup: ""
    }
    if (roomData.messageView.dataList[roomData.messageView.dataList.length - 1] && (roomData.messageView.dataList[roomData.messageView.dataList.length - 1].mid == data.mid)) {
        data["msgGroup"] = "item"
    }
    if (data.mid == roomData.mymid) {
        data.direction = "reverse"
    }
    if (data.rId) {
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
                img: await getStkDataUrl(message.contentMetadata.STKID)
            }
            data = { ...data, ...add }
            break;
        case 14://fi
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
            "data-direction": "",
            "data-selected": data.isSelected,
            "data-timestamp": data.timeInt,
            "data-message-content-prefix": data.timeStr + " " + data.name,
            "data-mid": data.mid,
            "data-group": data.msgGroup,
            "data-direction": data.direction
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
            if (data.rId) {
                return replyBox(data, textMsg(data))
            } else {
                return textMsg(data)
            }
            break;
        case undefined://txt
            if (data.rId) {
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
        case 22: //flex
            return flexMsg(data);
        default:
            break;
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
                            "$click": (...arg) => { buttonEvent("openProfile", arg) }
                        }, e.M + ":" + otxt.substring(Number(e.S), Number(e.E))
                    ))
                    txt.push(otxt.substring(Number(e.E)))
                } else {
                    txt.push(otxt.substring(oE, Number(e.S)))
                    txt.push(strong(
                        {
                            "class": "mention",
                            "data-mid": e.M,
                            "$click": (...arg) => { buttonEvent("openProfile", arg) }
                        }, e.M + ":" + otxt.substring(Number(e.S), Number(e.E))
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
                "oncontextmenu": "return false;",
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
                "data-message-id": data.msgId
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
        fileM()
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
        fileM()
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
        fileM()
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
        let html = "<!doctype html><html class=\"in_iframe\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1\"><meta name=\"format-detection\" content=\"telephone=no\"><link rel=\"stylesheet\" type=\"text/css\" href=\"https://pamornt.github.io/flex2html/css/flex2html.css\"></head><body style=\"margin: 0;\">"
        html += flex2html("hide", { "type": "flex", "altText": "Flex Message", "contents": flex }) + "</body></html>"
        document.getElementById("hide").innerHTML = ""
        return div(
            {
                "class": "iframeMessage-module__iframe_wrap__PUSyZ"
            },
            iframe(
                {
                    "frameborder": "0",
                    "title": "",
                    "width": "100%",
                    "data-message-id": "501557461296873730",
                    "srcdoc": html,
                    "sandbox": "allow-same-origin allow-popups allow-popups-to-escape-sandbox",
                },
            )
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