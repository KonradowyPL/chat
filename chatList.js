const displayChatList = () => {
    const chatEle = (chatId) => {
        const ele = document.createElement("div");
        if (currentChat == chatId) ele.classList = "current";
        const checkbox = Object.assign(document.createElement("input"), {
            type: "checkbox",
        });
        ele.append(bootStrapIcon("bi-chat-text"), document.createTextNode(chats[chatId].name), checkbox);

        ele.setAttribute("data-id", chatId);
        ele.tabIndex = 0;
        ele.role = "button";
        ele.onclick = (e) => {
            if (!document.querySelector("#navWrapper.checkbox")) setChat(chatId);
        };

        checkbox.oninput = () => {
            if (!chatsContainer.querySelectorAll("input[type=checkbox]:checked").length) hideChatSelect();
        };

        return ele;
    };

    while (chatsContainer.firstChild) chatsContainer.removeChild(chatsContainer.firstChild);

    const groups = groupchats(chats);
    chatsContainer.append(
        ...Object.keys(groups).map((group) => {
            const ele = document.createElement("div");
            const groupChats = groups[group].sort((a, b) => chats[b].date - chats[a].date);
            ele.append(Object.assign(document.createElement("span"), { innerText: group }), ...groupChats.map(chatEle));
            return ele;
        })
    );
};

// groups chats by last message date
function groupchats(chats) {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    const groups = {
        "Last 24 Hours": [],
        "Last 7 Days": [],
        "Last 30 Days": [],
        "This year": [], // there are all chats older than 30 days
    };
    Object.keys(chats).forEach((chatId) => {
        let epochTime = chats[chatId].date;
        const itemDate = new Date(epochTime);
        if (itemDate >= last24Hours) {
            groups["Last 24 Hours"].push(chatId);
        } else if (itemDate >= last7Days) {
            groups["Last 7 Days"].push(chatId);
        } else if (itemDate >= last30Days) {
            groups["Last 30 Days"].push(chatId);
        } else {
            groups["This year"].push(chatId);
        }
    });

    return groups;
}

navWrapper.onclick = (e) => {
    if (e.srcElement == navWrapper) document.body.removeAttribute("nav");
};
