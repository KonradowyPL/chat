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

chats = new Proxy(chats, {
  set: (target, property, value) => {
    target[property] = value;
  },
  get: (target, property, value) => target[property],
});

if (currentChat && currentChat.match(/^[ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+_]{16}/g) && chats[currentChat]) {
  displayChat();
} else {
  newChatUI();
}
