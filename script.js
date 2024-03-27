function tryParse(str, exit) {
  if (!str) return exit;
  try {
    return JSON.parse(str);
  } catch {
    console.error(`Error while parsing string: "${str}"`);
    return exit;
  }
}

const chats = {};
loadChats();

newChat.onclick = newChatUI;
newChat.onclick();
