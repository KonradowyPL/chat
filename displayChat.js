var currentChat;

const setChat = (chatId) => {
  currentChat = chatId;
};

const displayChat = () => {
  setChat(currentChat);
  while (main.firstChild) main.removeChild(main.firstChild);
  document.body.setAttribute("data-state", "chat");
  console.log(currentChat);
  const meta = document.createElement("div");
  meta.classList = "chat-meta";
  meta.append(
    Object.assign(document.createElement("span"), { innerText: chats[currentChat].name }),
    Object.assign(document.createElement("span"), { innerText: chats[currentChat].model })
  );

  const messages = document.createElement("div");
  messages.classList = "messages";
  messages.append(...chats[currentChat].messages.map((e) => createMessageObj(e.content, e.role)));

  const textarea = document.createElement("textarea");
  textarea.placeholder = "Add a folowup question...";
  textarea.addEventListener("input", (e) => {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  });

  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
    }
  });

  main.append(meta, messages, textarea);
};

// TODO: rewrite this
const createMessageObj = (content, role) => {
  return Object.assign(document.createElement("div"), { innerText: `${role}: ${content}` });
};
