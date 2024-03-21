const textArea = document.getElementById("message");
const chat = document.getElementById("messages");
const chatNameEle = document.getElementById("chatName");
const newChat = document.getElementById("newChat");
const newChatForm = document.getElementById("newChatForm");
const chatsEle = document.getElementById("chats");

var conversation = [];
var chatName = "main";
var locked = false;
var model = "mixtral-8x7b-instant-pro";

const rockModel = (name) => {
  return (messages) => {
    return fetch("https://corsproxy.io/?https%3A%2F%2Fchat.discord.rocks%2Freply", {
      method: "POST",
      body: JSON.stringify({ messages: messages, model: name }),
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
      } else throw new Error("Error: " + response.text());
    })
    .then((assistantMessage) => {
      addMessage({ role: "assistant", content: assistantMessage });
    })
    .catch((errorMessage) => {
      addMessage({ role: "assistant", content: JSON.stringify(errorMessage) });
    });
}

function saveConversation() {
  localStorage.setItem(`CHAT:${chatName}`, JSON.stringify({ messages: conversation, model }));
}

function loadConversation() {
  while (chat.firstChild) {
    chat.removeChild(chat.firstChild);
  }

  chatNameEle.innerText = `${chatName} ᛫ ${model}`;
  chatData = JSON.parse(localStorage.getItem(`CHAT:${chatName}`)) || {};
  conversation = chatData.messages || [];
  model = chatData.model || model;

  conversation.forEach(createMessage);
}

function addMessage(message) {
  conversation.push(message);
  createMessage(message);
  saveConversation();
}

function createMessage(message) {
  const li = document.createElement("li");
  parsedMessage = marked.parseInline(message.content).trim().replaceAll("\n", "<br>");
  li.append(bootStrapIcon(message.role == "user" ? "bi-person" : "bi-robot"), Object.assign(document.createElement("div"), { innerHTML: parsedMessage }));
  li.classList = message.role == "user" ? "person" : "robot";
  chat.append(li);
  chat.scrollTop = chat.scrollHeight;
}

function loadChats() {
  while (chatsEle.firstChild) {
    chatsEle.removeChild(chatsEle.firstChild);
  }

  const chats = Object.keys(localStorage)
    .filter((key) => key.startsWith("CHAT:"))
    .map((key) => key.slice("CHAT:".length));

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
  chatName = newChat.value;
  model = document.querySelector("input[type=radio][name=model]:checked").id;
  localStorage.setItem(`CHAT:${chatName}`, "[]");
  loadConversation();
  loadChats();
};

function bootStrapIcon(name) {
  return Object.assign(document.createElement("i"), { className: `bi ${name}` });
}

loadConversation();
loadChats();
