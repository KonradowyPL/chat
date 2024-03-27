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

const chats = {};
loadChats();

if (currentChat && chats[currentChat]) {
  displayChat();
} else {
  newChat.onclick();
}
