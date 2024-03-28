const newChatUI = () => {
  currentChat = undefined;
  displayChatList();
  while (main.firstChild) main.removeChild(main.firstChild);
  document.body.setAttribute("data-state", "newChat");
  document.body.removeAttribute("nav");
  params.delete("c");
  url.search = params.toString();
  history.pushState({}, "", url.toString());

  const settings = document.createElement("div");
  const textarea = document.createElement("textarea");
  const select = document.createElement("select");
  textarea.placeholder = "Message mixtral-8x7b-instant-pro...";
  const chatName = Object.assign(document.createElement("input"), { placeholder: "Unnamed", maxLength: 20 });
  select.append(
    Object.assign(document.createElement("option"), { value: "mixtral-8x7b-instant-pro", innerText: "mixtral-8x7b-instant-pro" }),
    Object.assign(document.createElement("option"), { value: "mixtral-8x7b-instant", innerText: "mixtral-8x7b-instant" }),
    Object.assign(document.createElement("option"), { value: "gemma-7b-instant", innerText: "gemma-7b-instant" })
  );
  select.onchange = (e) => {
    textarea.placeholder = `Message ${select.value}...`;
  };

  textarea.addEventListener("input", (e) => {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  });

  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (textarea.value.trim()) {
        currentChat = createNewChat({ name: chatName.value || "Unnamed", model: select.value, messages: [{ role: "user", content: textarea.value.trim() }] });
        askAiWrapper(select.value, chats[currentChat].messages);
        displayChat();
        textarea.value = "";
        textarea.style.height = "auto";
      }
    }
  });

  const g1 = document.createElement("div");
  const g2 = document.createElement("div");

  g1.append(Object.assign(document.createElement("span"), { innerText: "Chat name:" }), chatName);

  g2.append(Object.assign(document.createElement("span"), { innerText: "Model:" }), select);
  settings.append(Object.assign(document.createElement("h1"), { innerText: "Create new chat" }), g1, g2);

  main.append(settings, textarea);

  textarea.focus();
  chatName.tabIndex = 2;
  select.tabIndex = 3;
  textarea.tabIndex = 1;
};
