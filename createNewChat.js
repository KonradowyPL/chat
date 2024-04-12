const createNewChat = (chatDat) => {
  const id = newChatId();
  createNewChatObj(chatDat, id);
  return id;
};

const newChatId = () => {
  const rand = () =>
    Array.from(
      new Array(16),
      () => characters[Math.floor(Math.random() * characters.length)],
    ).join("");
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+_";
  let id = rand();
  while (chats[id]) id = rand();
  return id;
};

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

const createNewChatObj = (chatDat, chatId, noSave) => {
  // these lines make sure that most of code will run without errors
  chatDat ||= {};
  chatDat.name ||= "Unnamed";
  chatDat.model ||= "mixtral-8x7b-instant-pro";
  chatDat.date ||= 0;
  chatDat.pinned ||= false;
  chatDat.messages = chatMessages(chatId, chatDat.messages || []);

  // create proxy object for each chat
  chats[chatId] = new Proxy(chatDat, {
    set: (target, property, value) => {
      target[property] = value;
      saveChats();

      // refersh chat list
      if (["date", "name", "icon", "model"].includes(property)) {
        displayChatList();

        // refersh chat meta if modifed data of current chat
        if (chatId == currentChat) updateChatMeta();
      }
    },
  });
  if (!noSave) saveChats();
};

const loadChats = () => {
  const chatsFromStorage = tryParse(localStorage.getItem("chats"), {});
  // for rach object create new chat
  Object.keys(chatsFromStorage).forEach((key) => {
    createNewChatObj(chatsFromStorage[key], key, true);
  });
};

// behaves like normal array, but is loaded only when needed
// args: chat id to load from localstorage
const chatMessages = (id, messages) => {
  if (!localStorage.getItem(`CHAT:${id}`))
    localStorage.setItem(`CHAT:${id}`, JSON.stringify(messages));
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

      if (id == currentChat) onMessageChange(property);
      return true;
    },
  });
};
