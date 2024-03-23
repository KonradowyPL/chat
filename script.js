const textArea = document.getElementById("message");
const chat = document.getElementById("messages");
const chatNameEle = document.getElementById("chatName");
const chatModelEle = document.getElementById("chatModel");
const newChat = document.getElementById("newChat");
const newChatForm = document.getElementById("newChatForm");
const chatsEle = document.getElementById("chats");
const chatSettings = document.getElementById("chatSettings");
const settingsBox = document.getElementById("settingsBox");
const renameChatEle = document.getElementById("renameChat");
const pinChat = document.getElementById("pinChat");
const pinnedChatsEle = document.getElementById("pinnedChats");
const deleteChat = document.getElementById("deleteChat");
const navToggle = document.getElementById("navToggle");

const urlParams = new URLSearchParams(window.location.search);

const renderer = new marked.Renderer();
renderer.code = function (code, language) {
  // Check if the language is valid for highlight.js
  const validLanguage = !!(language && hljs.getLanguage(language));
  // Highlight the code
  const highlighted = validLanguage
    ? hljs.highlight(code, { language, ignoreIllegals: false }).value
    : hljs.highlight(code, { language: "js", ignoreIllegals: false }).value;
  // Return the highlighted code wrapped in a <code> tag
  return `<code class="hljs ${language}">${highlighted}<span class="bi copy bi-copy"/></code>`;
};

// Set the renderer to marked
marked.use({
  renderer,
  breaks: false,
  gfm: true,
});

var conversation = [];
var chatId = urlParams.get("c") || Object.keys(JSON.parse(localStorage.getItem("chatHistory") || "[]"))[0] || ((Math.random() * 0xffffffff) >>> 0) + "";
var chatName;
var locked = false;
var model = "mixtral-8x7b-instant-pro";
var chats = [];
var chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || {};
var chatNames = JSON.parse(localStorage.getItem("chatNames")) || {};
var pinnedChats = JSON.parse(localStorage.getItem("pinnedChats")) || [];

const rockModel = (name) => {
  return (messages) => {
    return fetch("https://corsproxy.io/?https%3A%2F%2Fchat.discord.rocks%2Freply", {
      method: "POST",
      body: JSON.stringify({
        messages: messages.map((obj) => ({
          role: obj.role,
          content: obj.content,
        })),
        model: name,
      }),
      headers: { "Content-Type": "application/json" },
    });
  };
};

const models = {
  "mixtral-8x7b-instant-pro": rockModel("mixtral-8x7b-instant-pro"),
  "mixtral-8x7b-instant": rockModel("mixtral-8x7b-instant"),
  "gemma-7b-instant": rockModel("gemma-7b-instant"),
};

loadConversation();
loadChats();

textArea.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey && !locked) {
    e.preventDefault();
    writeMessage(textArea.value.trim());
    textArea.value = "";
  }
});

newChatForm.onsubmit = (e) => {
  e.preventDefault();
  chatId = ((Math.random() * 0xffffffff) >>> 0) + "";
  chatName =
    newChat.value ||
    `Unnamed ${
      +Object.values(chatNames)
        .filter((key) => key.startsWith("Unnamed "))
        .map((key) => +key.slice("Unnamed ".length) || 0)
        .sort((a, b) => a - b)
        .reverse()[0] + 1 || 1
    }`;

  chatNames[chatId] = chatName;

  model = document.querySelector("input[type=radio][name=model]:checked").id;
  loadConversation();
  saveConversation();
  loadChats();

  document.body.classList.remove("nav");
};

renameChatEle.addEventListener("input", (e) => {
  console.log("e");
  renameChat(chatId, renameChatEle.value || "Unnamed");
});

chatSettings.addEventListener("click", (e) => {
  if (settingsBox.classList.contains("hidden")) {
    settingsBox.classList.remove("hidden");
    chatSettings.classList.remove("bi-three-dots-vertical");
    chatSettings.classList.add("bi-x-lg");
  } else {
    settingsBox.classList.add("hidden");
    chatSettings.classList.add("bi-three-dots-vertical");
    chatSettings.classList.remove("bi-x-lg");
  }
});

pinChat.addEventListener("change", (e) => {
  if (pinChat.checked) {
    pinnedChats.push(chatId);
  } else {
    pinnedChats.splice(pinnedChats.indexOf(chatId), 1);
  }
  saveConversation();
  loadChats();
});

deleteChat.addEventListener("click", (e) => {
  localStorage.removeItem(`CHAT:${chatId}`);
  delete chatHistory[chatId];
  delete chatNames[chatId];
  pinnedChats.splice(pinnedChats.indexOf(chatId), 1);
  chatId = Object.keys(chatHistory)[0];
  loadConversation();
  saveConversation();
  loadChats();
  settingsBox.classList.add("hidden");
});

navToggle.addEventListener("click", (e) => {
  document.body.classList.toggle("nav");
  settingsBox.classList.add("hidden");
});

function writeMessage(message) {
  addMessage({ role: "user", content: message });

  locked = true;

  models[model](conversation)
    .then((response) => {
      locked = false;
      if (response.ok) {
        return response.text();
      } else {
        throw "There was an error while generating your response. Check console and report bugs!";
      }
    })
    .then((assistantMessage) => {
      addMessage({ role: "assistant", content: assistantMessage });
    })
    .catch((errorMessage) => {
      addMessage({ role: "assistant", content: `Error`, error: String(errorMessage) });
    });
}

function saveConversation() {
  chatNames[chatId] = chatName;
  let exists = !!localStorage.getItem(`CHAT:${chatId}`);
  localStorage.setItem(`CHAT:${chatId}`, JSON.stringify({ messages: conversation, model }));
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  localStorage.setItem("chatNames", JSON.stringify(chatNames));
  localStorage.setItem("pinnedChats", JSON.stringify(pinnedChats));

  if (!exists) {
    loadChats();
  }
}

function loadConversation() {
  while (chat.firstChild) {
    chat.removeChild(chat.firstChild);
  }

  urlParams.set("c", chatId);
  history.replaceState({}, "", "?" + urlParams.toString());

  chatData = JSON.parse(localStorage.getItem(`CHAT:${chatId}`)) || {};
  conversation = chatData.messages || [];
  model = chatData.model || model;
  chatName = chatNames[chatId] || "Main";
  renameChatEle.value = chatName;
  pinChat.checked = pinnedChats.indexOf(chatId) != -1;

  loadConversationMeta();
  conversation.forEach(createMessage);
}

function loadConversationMeta() {
  chatNameEle.innerText = chatName;
  chatModelEle.innerText = model;
}

function addMessage(message) {
  conversation.push(message);
  chatHistory[chatId] = Date.now();
  createMessage(message);
  saveConversation();
  loadChats();
}

function createMessage(message) {
  const li = document.createElement("div");

  let parsedMessage = !message.error
    ? marked
        .parse(message.content)
        .trim()
        .replaceAll("\n", "<br>")
        .replace(/^<p>/, "")
        .replace(/<\/p>$/, "")
    : message.error;
  li.append(
    bootStrapIcon(message.role == "user" ? "bi-person" : "bi-robot"),
    Object.assign(document.createElement("div"), { innerHTML: parsedMessage, classList: `message ${message.error ? "error" : ""}` })
  );
  li.classList = message.role == "user" ? "person" : "robot";
  li.querySelectorAll(".copy.bi.bi-copy").forEach((ele) => {
    ele.onclick = (e) => {
      navigator.clipboard.writeText(ele.parentNode.innerText);
    };
  });
  chat.append(li);
  chat.scrollTop = chat.scrollHeight;
}

function loadChats() {
  while (chatsEle.firstChild) {
    chatsEle.removeChild(chatsEle.firstChild);
  }
  while (pinnedChatsEle.firstChild) {
    pinnedChatsEle.removeChild(pinnedChatsEle.firstChild);
  }

  chats = Object.keys(localStorage)
    .filter((key) => key.startsWith("CHAT:"))
    .map((key) => key.slice("CHAT:".length));

  chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "{}");
  chatNames = JSON.parse(localStorage.getItem("chatNames") || "{}");

  chats.sort((a, b) => (chatHistory[b] || 0) - (chatHistory[a] || 0));

  const pinned = chats.filter((chat) => pinnedChats.indexOf(chat) != -1);
  const unpinned = chats.filter((chat) => pinnedChats.indexOf(chat) == -1);

  const c = (ele) => {
    const li = document.createElement("li");
    li.append(bootStrapIcon(icon), document.createTextNode(chatNames[ele]));
    li.setAttribute("data-id", ele);

    li.onclick = () => {
      chatId = ele;
      settingsBox.classList.add("hidden");
      document.body.classList.remove("nav");
      loadConversation();
    };

    return li;
  };

  var icon = "bi-chat";
  chatsEle.append(...unpinned.map(c));
  icon = "bi-pin";
  pinnedChatsEle.append(...pinned.map(c));
}

function bootStrapIcon(name) {
  return Object.assign(document.createElement("i"), { className: `bi ${name}` });
}

function renameChat(id, name) {
  chatNames[id] = name;
  localStorage.setItem("chatNames", JSON.stringify(chatNames));
  loadChats();
  if (id == chatId) {
    chatName = name;
    loadConversationMeta();
  }
}
