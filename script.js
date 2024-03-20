const textArea = document.getElementById("message");
const chat = document.getElementById("messages");
const chatNameEle = document.getElementById("chatName");
const newChat = document.getElementById("newChat");
const newChatForm = document.getElementById("newChatForm");
const chatsEle = document.getElementById("chats");

var conversation = [];
var chatName = "main";
var locked = false;

textArea.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey && !locked) {
    e.preventDefault();
    writeMessage(textArea.value);
    textArea.value = "";
  }
});

function writeMessage(message) {
  addMessage({ role: "user", content: message });

  locked = true;

  fetch("https://corsproxy.io/?https%3A%2F%2Fchat.discord.rocks%2Freply", {
    method: "POST",
    body: JSON.stringify({ messages: conversation, model: "mixtral-8x7b-instant-pro" }),
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      locked = false;
      if (response.ok) return response.text();
      else throw new Error("Error: " + response.text());
    })
    .then((assistantMessage) => {
      addMessage({ role: "assistant", content: assistantMessage });
    })
    .catch((errorMessage) => {
      addMessage({ role: "assistant", content: errorMessage });
    });
}

function saveConversation() {
  localStorage.setItem(`CHAT:${chatName}`, JSON.stringify(conversation));
}

function loadConversation() {
  while (chat.firstChild) {
    chat.removeChild(chat.firstChild);
  }

  chatNameEle.innerText = chatName;
  conversation = JSON.parse(localStorage.getItem(`CHAT:${chatName}`)) || [];
  conversation.forEach(createMessage);
}

function addMessage(message) {
  conversation.push(message);
  createMessage(message);
  saveConversation();
}

function createMessage(message) {
  const li = document.createElement("li");
  li.innerText = `${message.role == "user" ? "You" : "Bot"}: ${message.content}`;
  chat.append(li);
  chat.scrollTop = chat.scrollHeight;
}

function loadChats() {
  const chats = Object.keys(localStorage)
    .filter((key) => key.startsWith("CHAT:"))
    .map((key) => key.slice("CHAT:".length));

  chatsEle.append(
    ...chats.map((ele) => {
      const li = document.createElement("li");
      li.innerText = ele;

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
  loadConversation();
  loadChats();
};

loadConversation();
loadChats();
