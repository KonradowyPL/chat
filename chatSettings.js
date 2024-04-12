const displayChatSettings = () => {
    while (chatSettingsOverlay.firstChild) chatSettingsOverlay.removeChild(chatSettingsOverlay.firstChild);

    const settings = document.createElement("div");
    settings.classList = "settings";

    const closeBtn = document.createElement("button");
    closeBtn.classList = "close";
    closeBtn.append(bootStrapIcon("bi-x-lg"));

    const select = document.createElement("select");
    const chatName = Object.assign(document.createElement("input"), {
        placeholder: "Unnamed",
        maxLength: 20,
        value: chats[currentChat].name,
    });
    select.append(
        Object.assign(document.createElement("option"), {
            value: "mixtral-8x7b-instant-pro",
            innerText: "mixtral-8x7b-instant-pro",
        }),
        Object.assign(document.createElement("option"), {
            value: "mixtral-8x7b-instant",
            innerText: "mixtral-8x7b-instant",
        }),
        Object.assign(document.createElement("option"), {
            value: "gemma-7b-instant",
            innerText: "gemma-7b-instant",
        }),
        Object.assign(document.createElement("option"), {
            value: "gpt-4",
            innerText: "gpt-4",
        }),
        Object.assign(document.createElement("option"), {
            value: "gpt-4-turbo-preview",
            innerText: "gpt-4-turbo-preview",
        }),
        Object.assign(document.createElement("option"), {
            value: "gemini",
            innerText: "gemini",
        })
    );
    select.value = chats[currentChat].model;
    const deleteBtn = document.createElement("button");
    deleteBtn.classList = "delete";

    deleteBtn.append(bootStrapIcon("bi-trash-fill"), Object.assign(document.createElement("span"), { innerText: "Delete Chat" }));

    const g1 = document.createElement("div");
    const g2 = document.createElement("div");
    const g3 = document.createElement("div");

    g1.append(Object.assign(document.createElement("span"), { innerText: "Chat name:" }), chatName);

    g2.append(Object.assign(document.createElement("span"), { innerText: "Model:" }), select);

    settings.append(closeBtn, Object.assign(document.createElement("h2"), { innerText: "Chat settings" }), g1, g2, deleteBtn);

    chatName.addEventListener("change", (e) => {
        chats[currentChat].name = chatName.value || "Unnamed";
    });

    select.addEventListener("change", (e) => {
        chats[currentChat].model = select.value;
    });

    deleteBtn.addEventListener("click", (e) => {
        deleteChat(currentChat);
        hideSettings();
    });

    closeBtn.addEventListener("click", (e) => {
        hideSettings();
    });

    chatSettingsOverlay.append(settings);
};

chatSettingsOverlay.onclick = (e) => {
    if (e.srcElement == chatSettingsOverlay) hideSettings();
};

// hide chat when esc key pressed
document.addEventListener("keydown", function (event) {
    // esc key && chat open && body is focused (so no input is focused)
    if (event.key === "Escape" && chatSettingsOverlay.firstChild && document.activeElement == document.body) {
        hideSettings();
    }
});

const hideSettings = () => {
    while (chatSettingsOverlay.firstChild) chatSettingsOverlay.removeChild(chatSettingsOverlay.firstChild);
};

const deleteChat = (chatId) => {
    delete chats[chatId];
};
