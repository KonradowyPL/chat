const setChat = (chatId, noDisplay) => {
  currentChat = chatId;
  params.set("c", chatId);
  url.search = params.toString();
  history.pushState({}, "", url.toString());
  if (!noDisplay) displayChat();
  document.body.removeAttribute("nav");
  // update current chat
  displayChatList();
};

const displayChat = () => {
  setChat(currentChat, true);
  while (main.firstChild) main.removeChild(main.firstChild);
  document.body.setAttribute("data-state", "chat");
  const meta = document.createElement("div");
  const textareaContainer = document.createElement("div");
  textareaContainer.classList = "textarea-container";
  meta.classList = "chat-meta";
  meta.append(
    Object.assign(document.createElement("span"), { innerText: chats[currentChat].name }),
    Object.assign(document.createElement("span"), { innerText: chats[currentChat].model })
  );

  const messages = document.createElement("div");
  messages.classList = "messages";
  messages.append(...chats[currentChat].messages.map((e) => createMessageObj(e.content, e.role, e.error)));

  const textarea = document.createElement("textarea");
  textareaContainer.append(textarea);
  textarea.placeholder = "Ask a folowup question...";
  textarea.addEventListener("input", (e) => {
    let isTop = messages.scrollTop + messages.clientHeight >= messages.scrollHeight;

    textareaContainer.style.height = "auto";
    textareaContainer.style.height = textarea.scrollHeight + "px";
    messages.style.paddingBottom = Math.min(textarea.scrollHeight, 500) + 30 + "px";

    if (isTop) messages.scrollTop = messages.scrollHeight;
  });

  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!locked && textarea.value.trim()) {
        let isTop = messages.scrollTop + messages.clientHeight >= messages.scrollHeight;

        chats[currentChat].messages.push({ role: "user", content: textarea.value.trim() });
        chats[currentChat].date = Date.now();
        askAiWrapper(chats[currentChat].model, chats[currentChat].messages, isTop);

        // scroll bottom
        textarea.value = "";

        // reset size
        textareaContainer.style.height = "auto";
        textareaContainer.style.paddingBottom = textarea.scrollHeight + 30 + "px";
      }
    }
  });

  main.append(meta, messages, textareaContainer);
  messages.scrollTop = messages.scrollHeight;
  textarea.focus();

  // called (helpfully) when message content changes in current chat
  onMessageChange = (index) => {
    if (index == messages.childElementCount) {
      let messageObj = chats[currentChat].messages[index];
      messages.append(createMessageObj(messageObj.content, messageObj.role, messageObj.error));
    }
  };
};

const createMessageObj = (content, role, error) => {
  const box = document.createElement("div");
  box.classList.add(...[role == "user" ? "person" : "robot", "message"]);
  box.append(
    bootStrapIcon(role == "user" ? "bi-person" : "bi-robot"),
    Object.assign(document.createElement("div"), { innerHTML: error || content, classList: `content ${error ? "error" : ""}` })
  );
  return box;
};

function bootStrapIcon(name) {
  return Object.assign(document.createElement("i"), { className: `bi ${name}` });
}
