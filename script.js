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
const chatMessages = (id, messages) => {
  return new Proxy(messages || [], {
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
newChat.onclick = newChatUI;

const chats = (() => {
  let chats = {};

  const saveChats = () => {
    decompiledObj = {};
    Object.keys(chats).forEach((key, index) => {
      let obj = Object.assign({}, chats[key]);
      delete obj.messages;
      decompiledObj[key] = obj;
    });
    console.info("saved chat data!");
    localStorage.setItem("chats", JSON.stringify(decompiledObj));
  };

  let chatsObj = tryParse(localStorage.getItem("chats"), {});

  Object.keys(chatsObj).forEach((key, index) => {
    chatsObj[key].name ||= "Unnamed";
    chatsObj[key].model ||= "mixtral-8x7b-instant-pro";
    chatsObj[key].messages = chatMessages(key);
  });

  Object.keys(chatsObj).forEach((key, index) => {
    chats[key] = new Proxy(chatsObj[key], {
      set: (target, property, value) => {
        target[property] = value;
        saveChats();
      },
    });
  });
  return chats;
})();
