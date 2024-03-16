const chatlist = (mid, top, obs, memberCount, lastTime, unreadCount,chatname,lastText) => {
    let unread = `<span class="chatlistItem-module__message_count__FRt4s">${unreadCount}</span>`
    if (!unreadCount) {
        unreadCount = ""
    }
    return `<div class="chatlistItem-module__chatlist_item__MOwxh " aria-selected="false"
    aria-busy="false" aria-current="false"
    data-mid="CnCIQmWkzr2bbKZg40OoYcs7STrvoqSo_wylnPiluNeQ"
    style="position: absolute; left: 0px; top: ${71 * top}px; height: 71px; width: 100%;" id="ChatList:${mid}" >
    <div class="profileImage-module__thumbnail_wrap__0bK7m "
        data-mid=""
        data-profile-image="true"
        style="width: 53px; height: 53px; border-radius: 50%;"><button
            type="button" class="profileImage-module__button_profile__GqKue">
            <div class="profileImage-module__thumbnail_area__nqIpB"><span
                    class="profileImage-module__thumbnail__Q6OsR"><img
                        src="https://profile.line-scdn.net/${obs}/preview"
                        class="" loading="lazy" alt="" draggable="false"></span>
            </div>
        </button></div>
    <div class="chatlistItem-module__info__nHGhi"><strong
            class="chatlistItem-module__title_box__aDNJD"><span
                class="chatlistItem-module__text__daDD3">
                <pre><span>${chatname}</span></pre>
            </span><span
                class="chatlistItem-module__member_count__MbL2c">(${memberCount})</span></strong><time
            class="chatlistItem-module__date__tG-MV">${lastTime}</time>
        <div class="chatlistItem-module__description__JH3NE">
            <p class="chatlistItem-module__text__daDD3">${lastText}</p>
        </div>${unread}
    </div><button type="button" aria-label="Go chatroom"
        class="chatlistItem-module__button_chatlist_item__pcmtA" id="ChatList:${mid}:Go_Button"></button>
</div>`
}
const chatroom = (mid, name,data) => {
    return `<div class="chatroom-module__chatroom__eVUaK " id="Chatroom:${mid}">
    <div class="chatroomHeader-module__header__ihDT2">
        <div class="chatroomHeader-module__inner__0P5fp">
            <div class="chatroomHeader-module__info__2my0W"><button type="button"
                    class="chatroomHeader-module__button_name__US7lb" aria-controls="member_popup"
                    aria-haspopup="false" aria-expanded="false"><strong
                        class="chatroomHeader-module__name__t-K11">
                        <pre><span>${name}</span></pre>
                    </strong></button><button class="chatroomHeader-module__button_alarm__dBqwP"
                    data-tooltip="通知オフ"><i class="icon chatroomHeader-module__icon_alarm__tgjw2"><svg
                            height="1em" fill="currentColor" viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg" data-laicon-version="7.0">
                            <g transform="translate(-2 -2)">
                                <path
                                    d="m8.377 7.845 5.004-4.665c.419-.391 1.119-.103 1.119.46v16.72c0 .563-.699.851-1.119.46l-5.004-4.665H2.661a.654.654 0 0 1-.654-.545L2 15.515v-7.03a.65.65 0 0 1 .661-.64h5.716zm9.37 1.243a4.185 4.185 0 0 0-.725-.57l-.702 1.09.175.118A2.793 2.793 0 0 1 16.819 14c-.153.15-.32.281-.498.392l.701 1.09.192-.127c.19-.133.368-.28.533-.443a4.068 4.068 0 0 0 0-5.824zM18.637 6c.452.28.87.61 1.25.983a7.008 7.008 0 0 1 0 10.034c-.305.3-.634.57-.983.809L18.64 18l-.704-1.09c.37-.23.712-.5 1.023-.805a5.735 5.735 0 0 0 0-8.21 5.874 5.874 0 0 0-.753-.626l-.27-.179.701-1.09z">
                                </path>
                            </g>
                        </svg></i></button><button class="chatroomHeader-module__button_popup__tcF1V"
                    data-tooltip="別のウィンドウで開く"><i
                        class="icon chatroomHeader-module__icon_popup__q5Czq"><svg height="1em"
                            fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
                            data-laicon-version="5.0">
                            <g transform="translate(-2 -2)">
                                <path
                                    d="M12.9525 4.4625v1.6h-7.937a.2.2 0 0 0-.2.2v12.7a.2.2 0 0 0 .2.2h12.7a.2.2 0 0 0 .2-.2v-7.9h1.6v7.9a1.8 1.8 0 0 1-1.8 1.8h-12.7c-.9941 0-1.8-.8059-1.8-1.8v-12.7c0-.9941.8059-1.8 1.8-1.8h7.937Zm7.832-1.225v5.828h-1.299v-3.609l-7.08 7.079-.919-.919 7.08-7.079h-3.614v-1.3h5.832Z">
                                </path>
                            </g>
                        </svg></i></button></div>
            <div class="chatroomHeader-module__action_group__k8w1P">
                <button type="button" aria-label="more button"
                class="chatroomHeader-module__button_more__9rz-2" aria-haspopup="true">
                <i class="icon chatroomHeader-module__icon_more__Q8OVO"><svg xmlns="http://www.w3.org/2000/svg" height="2em" fill="none" viewBox="0 0 20 20"><g stroke="#000" stroke-width="1.5"><path d="M3.75 4c0-.69.56-1.25 1.25-1.25h13c.69 0 1.25.56 1.25 1.25v14.004c0 .69-.56 1.25-1.25 1.25H5c-.69 0-1.25-.56-1.25-1.25V4zM8.523 8.026h5.954M8.523 10.979h5.954M8.523 13.979h5.954"/></g><defs><clipPath id="bcclip0_1_5447"><path fill="#fff" transform="translate(3 2)" d="M0 0h17v18H0z"/></clipPath></defs></svg></i></button>
                <button type="button" aria-label="more button"
                    class="chatroomHeader-module__button_more__9rz-2" aria-haspopup="true"><i
                        class="icon chatroomHeader-module__icon_more__Q8OVO"><svg height="1em"
                            fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
                            data-laicon-version="5.0">
                            <g transform="translate(-2 -2)">
                                <path
                                    d="M12 16.4722c.829 0 1.5.671 1.5 1.5 0 .311-.094.599-.256.838-.054.08-.116.155-.183.223a1.499 1.499 0 0 1-1.061.439c-.414 0-.789-.168-1.061-.439a1.5739 1.5739 0 0 1-.183-.223 1.487 1.487 0 0 1-.256-.838c0-.829.671-1.5 1.5-1.5ZM12 10.5c.829 0 1.5.671 1.5 1.5s-.671 1.5-1.5 1.5-1.5-.671-1.5-1.5.671-1.5 1.5-1.5Zm0-5.9722c.829 0 1.5.672 1.5 1.5 0 .829-.671 1.5-1.5 1.5s-1.5-.671-1.5-1.5c0-.828.671-1.5 1.5-1.5Z">
                                </path>
                            </g>
                        </svg></i></button>
                
                </button>
            </div>
        </div>
    </div>
    <div class="chatroomContent-module__content_area__gK6db ">
        <ul class="ToastContainer-module__toast-list__QAniw" style="z-index: 100;"></ul><button
            type="button" aria-label="Scroll down"
            class="scrollDownButton-module__button_scroll_down__-XrLT" data-hidden="true"><i
                class="icon scrollDownButton-module__icon_arrow__6We-I"><svg height="1em"
                    fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
                    data-laicon-version="5.0">
                    <g transform="translate(-2 -2)">
                        <path
                            d="m13 3.6245-.0002 13.046 5.7122-5.4163 1.3762 1.4512L12 20.3754l-8.0882-7.67 1.3762-1.4512 5.7118 5.4163L11 3.6245h2Z">
                        </path>
                    </g>
                </svg></i></button>
        ${chatMsgList(mid,data)}
    </div>
    <div class="chatroomEditor-module__editor_area__1UsgR">
        <textarea part="input" class="input chatTxtIn" placeholder="メッセージを入力" maxlength="10000" autofocus="" style="--inherited-font-family: -apple-system, BlinkMacSystemFont, &quot;Helvetica Neue&quot;, helvetica, &quot;Hiragino Sans&quot;, arial, &quot;MS PGothic&quot;, sans-serif; --webfont-family: F2176498343;"></textarea>
        <div class="cover" part="cover" style="--inherited-font-family: -apple-system, BlinkMacSystemFont, &quot;Helvetica Neue&quot;, helvetica, &quot;Hiragino Sans&quot;, arial, &quot;MS PGothic&quot;, sans-serif; --webfont-family: F2176498343;"></div>
        <div class="actionGroup-module__action_box__-HA8N ">
        <button type="button" aria-label="Send file" class="actionGroup-module__button_action__VwNgx" data-type="file" data-tooltip="ファイル送信" data-tooltip-placement="top-start"><i class="icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.479 4.971c1.664-1.925 4.658-2.24 6.686-.702.988.749 1.603 1.823 1.73 3.021a4.32 4.32 0 0 1-.908 3.123l-.156.19-8.75 10.125-1.1-.834 8.78-10.158c.566-.655.828-1.47.74-2.3A3.009 3.009 0 0 0 17.3 5.341c-1.382-1.049-3.414-.88-4.615.352l-.134.147-6.762 7.828a1.86 1.86 0 0 0-.458 1.421c.054.513.316.971.744 1.295a2.16 2.16 0 0 0 1.54.418 2.17 2.17 0 0 0 1.296-.597l.123-.131 6.763-7.83a.707.707 0 0 0-.109-1.042.885.885 0 0 0-1.098.046l-.078.078-5.367 6.213-1.043-.954 5.34-6.128a2.316 2.316 0 0 1 3.113-.326 2.034 2.034 0 0 1 .415 2.854l-.102.127-6.763 7.83a3.579 3.579 0 0 1-2.348 1.21 3.578 3.578 0 0 1-2.55-.696 3.192 3.192 0 0 1-1.269-2.22 3.176 3.176 0 0 1 .638-2.26l.142-.176 6.762-7.829z" fill="#303030"></path></svg></i></button>
        <button type="button" aria-label="Capture screen" class="actionGroup-module__button_action__VwNgx" data-type="capture" data-tooltip="画面キャプチャ" data-tooltip-placement="top-start"><i class="icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.077 3.659V16.5a.5.5 0 0 0 .5.5h12.84" stroke="#303030" stroke-width="1.4" stroke-linecap="square" stroke-linejoin="round"></path><path d="M17.824 19.594V6.753a.5.5 0 0 0-.5-.5H4.483" stroke="#303030" stroke-width="1.4" stroke-linecap="square" stroke-linejoin="round"></path></svg></i></button>
        <button type="button" aria-label="Select sticker" class="actionGroup-module__button_action__VwNgx" data-type="sticker" data-tooltip="スタンプ" data-tooltip-placement="top-end"><i class="icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.01" fill="#fff"><path d="M0 0h24v24H0z"></path><path opacity="0.7" d="M2 2h20v20H2z"></path></g><path d="M14.843 13.17a.624.624 0 0 0-.853.228 2.76 2.76 0 0 1-4.78 0 .624.624 0 1 0-1.08.625 4.008 4.008 0 0 0 6.94 0 .624.624 0 0 0-.227-.852z" fill="#303030"></path><circle cx="14.266" cy="10.464" r="0.96" fill="#303030"></circle><circle cx="8.934" cy="10.464" r="0.96" fill="#303030"></circle><path fill-rule="evenodd" clip-rule="evenodd" d="M11.6 3.22a8.88 8.88 0 1 0 8.88 8.88 8.89 8.89 0 0 0-8.88-8.88zm0 16.512a7.632 7.632 0 1 1 7.632-7.632 7.64 7.64 0 0 1-7.632 7.632z" fill="#303030"></path><path d="M11.6 3.22v-.1.1zm8.88 8.88h.1-.1zm-8.88 7.632v.1-.1zm7.632-7.632h.1-.1zM11.6 3.12a8.98 8.98 0 0 0-8.98 8.98h.2a8.78 8.78 0 0 1 8.78-8.78v-.2zM2.62 12.1a8.98 8.98 0 0 0 8.98 8.98v-.2a8.78 8.78 0 0 1-8.78-8.78h-.2zm8.98 8.98a8.98 8.98 0 0 0 8.98-8.98h-.2a8.78 8.78 0 0 1-8.78 8.78v.2zm8.98-8.98a8.99 8.99 0 0 0-8.98-8.98v.2a8.79 8.79 0 0 1 8.78 8.78h.2zm-8.98 7.532a7.532 7.532 0 0 1-6.96-4.649l-.184.077a7.732 7.732 0 0 0 7.144 4.772v-.2zm-6.96-4.649a7.532 7.532 0 0 1 1.633-8.209l-.142-.141a7.732 7.732 0 0 0-1.675 8.427l.185-.077zm1.633-8.209a7.532 7.532 0 0 1 8.209-1.633l.076-.185a7.732 7.732 0 0 0-8.427 1.677l.142.141zm8.209-1.633a7.532 7.532 0 0 1 4.65 6.959h.2a7.732 7.732 0 0 0-4.774-7.144l-.076.185zm4.65 6.959a7.54 7.54 0 0 1-7.532 7.532v.2a7.74 7.74 0 0 0 7.731-7.732h-.2z" fill="#303030"></path></svg></i></button>
        <button type="button" aria-label="Select sticker" class="actionGroup-module__button_action__VwNgx" data-type="send" data-tooltip="送信" data-tooltip-placement="top-end"><i class="icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path class="sendButton" d="M9.00967 5.12761H11.0097C12.1142 5.12761 13.468 5.89682 14.0335 6.8457L16.5089 11H21.0097C21.562 11 22.0097 11.4477 22.0097 12C22.0097 12.5523 21.562 13 21.0097 13H16.4138L13.9383 17.1543C13.3729 18.1032 12.0191 18.8724 10.9145 18.8724H8.91454L12.4138 13H5.42485L3.99036 15.4529H1.99036L4.00967 12L4.00967 11.967L2.00967 8.54712H4.00967L5.44417 11H12.5089L9.00967 5.12761Z" fill="currentColor" /></svg></i></button>
        </div></div>
</div>`
}
const chatMsgList = (mid="",data) => {
    return `
    <div class="message_list" role="log" id="Chatroom:${mid}:msgList">
        ${chatMsgs(data,mid)}
    </div>`
}
const chatMsg = (type = "text",mid = "MID_TEST",data = {}) => {
    let html = ""
    switch (type) {
        case "text":
            html = `<div class="message-module__message__7odk3   messageLayout-module__message__YVDhk " id="Chatroom:${mid}:msgList:${data.id}">
            <div class="thumbnail profileImage-module__thumbnail_wrap__0bK7m "
                data-mid="UjYpcj9JHh8DtECr6n0TFTmkG9X36Fgf7dyOIGvAhP6s" data-profile-image="true"
                style="border-radius: 50%;"><button type="button"
                    class="profileImage-module__button_profile__GqKue">
                    <div class="profileImage-module__thumbnail_area__nqIpB"><span
                            class="profileImage-module__thumbnail__Q6OsR"><img
                            src="https://profile.line-scdn.net/${data.obs}/preview"
                            class="" loading="lazy" alt="" draggable="false"></span></div>
            </button></div>
        <pre class="username-module__username__vGQGj"><span>${data.name}</span></pre>
        <div class="messageLayout-module__content__PGz66">
            <div class="message-module__content__OuUCi">
                <div class="message-module__content_inner__j-iko">
                    <div class="textMessageContent-module__content_wrap__238E1 ">
                        <pre
                            class="textMessageContent-module__text__EFwEN"><span>${data.text}</span></pre>
                    </div>
                    <div class="metaInfo-module__meta__F2Lfn ">
                        <div class="reactionPopover-module__reaction_popover__whj1x"
                            data-valign="top" data-expanded="false"><button type="button"
                                class="reactionPopover-module__button_popover__QlpMP"
                                aria-expanded="false" data-active="false"><i
                                    class="icon reactionPopover-module__icon__YUPPA"><svg
                                        height="1em" fill="currentColor" viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                        data-laicon-version="5.0">
                                        <g transform="translate(-2 -2)">
                                            <path
                                                d="M12 2.75c5.1086 0 9.25 4.1414 9.25 9.25s-4.1414 9.25-9.25 9.25S2.75 17.1086 2.75 12 6.8914 2.75 12 2.75Zm0 1.3c-4.3907 0-7.95 3.5593-7.95 7.95 0 4.3907 3.5593 7.95 7.95 7.95 4.3907 0 7.95-3.5593 7.95-7.95 0-4.3907-3.5593-7.95-7.95-7.95Zm3.377 9.0651a.65.65 0 0 1 .2369.8882C14.8733 15.2827 13.5064 16.088 12 16.088c-1.5064 0-2.8733-.8053-3.6139-2.0847a.65.65 0 0 1 1.1252-.6512c.5104.8818 1.4509 1.4359 2.4887 1.4359s1.9783-.554 2.4887-1.436a.65.65 0 0 1 .8882-.2369Zm-.5999-3.8187c.5523 0 1 .4477 1 1s-.4477 1-1 1c-.5522 0-1-.4477-1-1s.4478-1 1-1Zm-5.5542 0c.5522 0 1 .4477 1 1s-.4478 1-1 1c-.5523 0-1-.4477-1-1s.4477-1 1-1Z">
                                            </path>
                                        </g>
                                    </svg></i></button>
                            <div class="reactionPopover-module__popover_content__zYAVw"></div>
                        </div><span class="metaInfo-module__read_count__8-U6j"></span><time
                            class="metaInfo-module__send_time__-3Q6-"
                            datetime="Thu Feb 01 2024 22:33:26 GMT+0900 (日本標準時)">${data.time}</time>
                    </div>
                </div>
            </div>
            <div class="reactionBubblelist-module__reaction_bubble_list__eV9o2 "></div>
        </div>‌
    </div>`
            break
        case "text+":

            break
        case "image":

            break
        case "systemText":
            html=`<div class="messageDate-module__date_wrap__I4ily ">
            <p class="messageDate-module__date__pDnK3">${data.text}</p></div>`
            break
        case "sticker":

            break
        default:
            break;
    }
    return html
}
const chatMsgs=(datas=[],mid="")=>{
    html=""
    datas.forEach(element => {
        html+=chatMsg(element[0],mid=mid,element[1])
    });
    return html
}