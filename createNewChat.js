const createNewChat = (params) => {
  console.log(params);
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

const createNewChatObj = (chatDat, chatId) => {
  // these lines make sure that most of code will run without errors
  chatDat ||= [];
  chatDat.name ||= "Unnamed";
  chatDat.model ||= "mixtral-8x7b-instant-pro";
  chatDat.messages = chatMessages(chatId);

  // create proxy object for each chat
  chats[chatId] = new Proxy(chatDat, {
    set: (target, property, value) => {
      target[property] = value;
      saveChats();
    },
  });
};

const loadChats = () => {
  const chatsFromStorage = tryParse(localStorage.getItem("chats"), {});
  // for rach object create new chat
  Object.keys(chatsFromStorage).forEach((key) => {
    createNewChatObj(chatsFromStorage[key], key);
  });
};

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
