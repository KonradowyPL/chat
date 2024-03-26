function tryParse(str, exit) {
  if (!str) return exit;
  try {
    return JSON.parse(str);
  } catch {
    console.error(`Error while parsing string: "${str}"`);
    return exit;
  }
}

// behaves like normal array, but is loaded only when needed
// args: chat id to load from localstorage
const chatMessages = (id) => {
  return new Proxy([], {
    // target == backend object
    // property == vaule passed as key
    // value == proxy object
    get: function (target, property, value) {
      if (!target?.length) {
        target.push(...tryParse(localStorage.getItem(`CHAT:${id}`), []));
        console.info("HOT Loaded");
      }
      return target[property];
    },
    set: function (target, property, value) {
      if (!target?.length) this.get(target, property, value);
      target[property] = value;
      localStorage.setItem(`CHAT:${id}`, JSON.stringify(target));
      return true;
    },
  });
};

const chat = chatMessages("0");

newChat.onclick = (e) => {
  while (main.firstChild) main.removeChild(main.firstChild);

  document.body.setAttribute("data-state", "newChat");
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

      console.log({ name: chatName.value || "Unnamed", model: select.value, messages: { role: "user", content: textarea.value } });

      textarea.value = "";
      textarea.style.height = "auto";
    }
  });

  const g1 = document.createElement("div");
  const g2 = document.createElement("div");

  g1.append(Object.assign(document.createElement("span"), { innerText: "Chat name:" }), chatName);

  g2.append(Object.assign(document.createElement("span"), { innerText: "Model:" }), select);
  settings.append(g1, g2);

  main.append(settings, textarea);

  textarea.focus();
  textarea.selectionStart = textarea.value.length;
};

newChat.onclick();
