const displayChatSelect = () => {
    navWrapper.classList.add("checkbox");

    // uncheck all checkboxes
    chatsContainer.querySelectorAll("input[type=checkbox]").forEach((e) => (e.checked = false));

    const current = chatsContainer.querySelector(`[data-id="${currentChat}"] > input[type=checkbox]`);
    if (current) current.checked = true;
};

const hideChatSelect = () => {
    navWrapper.classList.remove("checkbox");
};

const invertSelect = () => {
    chatsContainer.querySelectorAll("input[type=checkbox]").forEach((e) => (e.checked = !e.checked));
};

const toggleSelect = () => {
    if (navWrapper.classList.contains("checkbox")) hideChatSelect();
    else displayChatSelect();
};

const deleteSelected = () => {
    Array.from(chatsContainer.querySelectorAll("div[data-id]:has(:checked)")).forEach((e) => {
        deleteChat(e.dataset.id);
    });
    hideChatSelect();
};

const allSelect = () => {
    chatsContainer.querySelectorAll("input[type=checkbox]").forEach((e) => (e.checked = true));
};

selectAll.onclick = allSelect;
selectOpen.onclick = toggleSelect;
selectInvert.onclick = invertSelect;
selectDelete.onclick = deleteSelected;
