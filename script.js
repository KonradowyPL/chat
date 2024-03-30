function tryParse(str, exit) {
  if (!str) return exit;
  try {
    return JSON.parse(str);
  } catch {
    console.error(`Error while parsing string: "${str}"`);
    return exit;
  }
}

let url = new URL(window.location.href);
const params = new URLSearchParams(url.search);

var currentChat = params.get("c");
newChat.onclick = newChatUI;

var chats = {};
loadChats();
displayChatList();

chats = new Proxy(chats, {
  set: (target, property, value) => {
    target[property] = value;
    displayChatList();
  },
  get: (target, property, value) => target[property],

  deleteProperty: (target, property) => {
    localStorage.removeItem(`CHAT:${property}`);
    delete target[property];
    saveChats();
    displayChatList();
    if (property == currentChat) newChatUI();
  },
});

if (currentChat && currentChat.match(/^[ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+_]{16}/g) && chats[currentChat]) {
  displayChat();
} else {
  newChatUI();
}

navToggle.onclick = () => {
  document.body.toggleAttribute("nav");
};

// emulate clicking when focused
document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    document.activeElement.click();
  }

  // unfocus element
  if (event.key === "Escape") {
    document?.activeElement.blur();
  }

  if (event.key === "/") {
    document.querySelector("textarea")?.focus();
    event.preventDefault();
  }
});
