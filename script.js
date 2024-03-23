const textArea = document.getElementById("message");
const chat = document.getElementById("messages");
const chatNameEle = document.getElementById("chatName");
const newChat = document.getElementById("newChat");
const newChatForm = document.getElementById("newChatForm");
const chatsEle = document.getElementById("chats");

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
var chatName = urlParams.get("c") || "main";
var locked = false;
var model = "mixtral-8x7b-instant-pro";
var chats = [];
var chatHistory = {};

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

textArea.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey && !locked) {
    e.preventDefault();
    writeMessage(textArea.value.trim());
    textArea.value = "";
  }
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
  let exists = !!localStorage.getItem(`CHAT:${chatName}`);
  localStorage.setItem(`CHAT:${chatName}`, JSON.stringify({ messages: conversation, model }));
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  if (!exists) {
    loadChats();
  }
}

function loadConversation() {
  while (chat.firstChild) {
    chat.removeChild(chat.firstChild);
  }

  urlParams.set("c", chatName);
  history.replaceState({}, "", "?" + urlParams.toString());

  chatNameEle.innerText = `${chatName} ᛫ ${model}`;
  chatData = JSON.parse(localStorage.getItem(`CHAT:${chatName}`)) || {};
  conversation = chatData.messages || [];
  model = chatData.model || model;

  conversation.forEach(createMessage);
}

function addMessage(message) {
  conversation.push(message);
  chatHistory[chatName] = Date.now();
  createMessage(message);
  saveConversation();
}

function createMessage(message) {
  const li = document.createElement("li");

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

  chats = Object.keys(localStorage)
    .filter((key) => key.startsWith("CHAT:"))
    .map((key) => key.slice("CHAT:".length));

  chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "{}");
  console.log(chatHistory);

  chats.sort((a, b) => chatHistory[b] || 0 - chatHistory[a] || 0);

  chatsEle.append(
    ...chats.map((ele) => {
      const li = document.createElement("li");
      li.append(bootStrapIcon("bi-chat"), document.createTextNode(ele));

      li.onclick = () => {
        chatName = ele;
        loadConversation();
      };

      return li;
    })
  );
}

newChatForm.onsubmit = (e) => {
  e.preventDefault();
  chatName =
    newChat.value ||
    `Unnamed ${
      +Object.keys(localStorage)
        .filter((key) => key.startsWith("CHAT:Unnamed "))
        .map((key) => +key.slice("CHAT:Unnamed ".length) || 0)
        .sort((a, b) => a - b)
        .reverse()[0] + 1 || 1
    }`;

  model = document.querySelector("input[type=radio][name=model]:checked").id;
  loadConversation();
  saveConversation();
  loadChats();
};

function bootStrapIcon(name) {
  return Object.assign(document.createElement("i"), { className: `bi ${name}` });
}

loadConversation();
loadChats();
