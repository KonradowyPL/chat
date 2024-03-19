var selectedModel = "";
var currentChatName = "main";
var messageHistory = [];
const switchInput = document.getElementById("switch");

const tx = document.getElementsByTagName("textarea");
for (let i = 0; i < tx.length; i++) {
  tx[i].setAttribute("style", "height:" + tx[i].scrollHeight + "px;overflow-y:hidden;");
  tx[i].addEventListener("input", OnInput, false);
}

function OnInput() {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
}

document.getElementById("message").addEventListener("keypress", function (event) {
  if (event.code === "Enter" && !event.shiftKey) {
    event.preventDefault();
    var message = document.getElementById("message").value;
    if (message === "") return;
    sendMessage(message);
    nxm = document.getElementById("message");
    nxm.value = "";
    nxm.style.height = "auto";
    nxm.style.height = this.scrollHeight + "px";
  }
});

document.getElementById("toggleSidebar").addEventListener("click", function () {
  document.getElementById("chatListContainer").classList.toggle("collapsed");
});
window.addEventListener("resize", function () {
  if (window.innerWidth <= 768) {
    document.getElementById("chatListContainer").classList.add("collapsed");
  } else {
    document.getElementById("chatListContainer").classList.remove("collapsed");
  }
});
function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle("dark-mode");
  const themeIcon = document.getElementById("themeIcon");
  if (body.classList.contains("dark-mode")) {
    themeIcon.classList.remove("bi-moon"); // Moon icon
    themeIcon.classList.add("bi-sun"); // Sun icon
    localStorage.setItem("theme", "dark"); // Save theme in local storage
  } else {
    themeIcon.classList.remove("bi-sun"); // Sun icon
    themeIcon.classList.add("bi-moon"); // Moon icon
    localStorage.setItem("theme", "light"); // Save theme in local storage
  }
}
window.onload = function () {
  const theme = localStorage.getItem("theme");
  if (theme === "light") {
    toggleDarkMode();
  }
  if (window.innerWidth <= 768) {
    document.getElementById("chatListContainer").classList.add("collapsed");
  } else {
    document.getElementById("chatListContainer").classList.remove("collapsed");
  }
  selectedModel = localStorage.getItem("selectedModel");
  if (!selectedModel) {
    selectedModel = "{{defaultmodel}}";
  }
  document.getElementById("selectedModel").value = selectedModel;
};
function changeSelectedModel() {
  selectedModel = document.getElementById("selectedModel").value;
  localStorage.setItem("selectedModel", selectedModel);
}
document.getElementById("themeSwitch").addEventListener("click", toggleDarkMode);
document.getElementById("createChat").addEventListener("click", function () {
  var chatName = document.getElementById("newChatName").value.trim();
  if (chatName) {
    var chats = JSON.parse(localStorage.getItem("chats")) || {};
    if (!chats[chatName]) {
      chats[chatName] = [];
      localStorage.setItem("chats", JSON.stringify(chats));
      loadChats();
      loadChatMessages(chatName);
    }
    document.getElementById("newChatName").value = ""; // Clear input
  }
});
function sendMessage(message) {
  document.getElementById("message").disabled = true;
  var userMessage = { role: "user", content: message };
  messageHistory.push(userMessage);

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "https://corsproxy.io/?https%3A%2F%2Fchat.discord.rocks%2Freply");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = function () {
    if (xhr.status === 200) {
      var assistantMessage = xhr.responseText;
      messageHistory.push({ role: "assistant", content: assistantMessage });
      displayMessage(assistantMessage, "assistant");
      saveChat(currentChatName); // Save after assistant reply
      document.getElementById("message").disabled = false;
      document.getElementById("message").focus();
    } else {
      var errorMessage = "Error: " + xhr.responseText;
      messageHistory.push({ role: "assistant", content: errorMessage });
      displayMessage(errorMessage, "assistant");
      document.getElementById("message").disabled = false;
      document.getElementById("message").focus();
    }
  };
  xhr.send(JSON.stringify({ messages: messageHistory, model: "gemma-7b-instant" }));
  displayMessage(message, "user");
}

function displayMessage(message, role) {
  var chatDiv = document.getElementById("chat");
  var messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  if (role === "user") {
    messageDiv.classList.add("user-message");
    message = marked.parse(message).replaceAll("\n", "<br>");
    messageDiv.innerHTML = "You: " + message;
    messageDiv.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightBlock(block);
      var lang = block.className.split(" ")[0];
      var title = document.createElement("div");
      title.classList.add("code-title");
      if (lang.toLowerCase() == "hljs") {
        lang = "plain";
      }
      title.textContent = lang.toLowerCase().replace("language-", "");
      block.parentNode.insertBefore(title, block);
    });
    // Check if the message contains code blocks
    var codeBlocks = messageDiv.querySelectorAll("pre code");
    codeBlocks.forEach((block) => {
      // Create a copy button for each code block
      var copyButton = document.createElement("a");
      copyButton.classList.add("copy-button");
      copyButton.innerHTML = '<i class="bi bi-clipboard" title="Copy to Clipboard"></i>';
      copyButton.addEventListener("click", function () {
        copyToClipboard(block.innerText);
        showCopiedMessage(copyButton);
      });
      block.appendChild(copyButton, block.nextSibling);
    });
    var copyButton = document.createElement("a");
    copyButton.textContent = "Copy";
    copyButton.classList.add("copy-button");
    copyButton.innerHTML = '<i class="bi bi-clipboard" title="Copy to Clipboard"></i>';
    copyButton.addEventListener("click", function () {
      // Copy message content in markdown format
      copyToClipboard(message);
      showCopiedMessage(copyButton);
    });
    messageDiv.appendChild(copyButton);
  } else if (role === "assistant") {
    messageDiv.classList.add("assistant-message");
    // Parse markdown and highlight code
    messageDiv.innerHTML = marked.parse(message);
    messageDiv.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightBlock(block);
      var lang = block.className.split(" ")[0];
      var title = document.createElement("div");
      title.classList.add("code-title");
      if (lang.toLowerCase() == "hljs") {
        lang = "plain";
      }
      title.textContent = lang.toLowerCase().replace("language-", "");
      block.parentNode.insertBefore(title, block);
    });
    messageDiv.innerHTML = "Bot: " + messageDiv.innerHTML;
    // Check if the message contains code blocks
    var codeBlocks = messageDiv.querySelectorAll("pre code");
    codeBlocks.forEach((block) => {
      // Create a copy button for each code block
      var copyButton = document.createElement("a");
      copyButton.classList.add("copy-button");
      copyButton.innerHTML = '<i class="bi bi-clipboard" title="Copy to Clipboard"></i>';
      copyButton.addEventListener("click", function () {
        copyToClipboard(block.innerText);
        showCopiedMessage(copyButton);
      });
      block.appendChild(copyButton, block.nextSibling);
    });
    var copyButton = document.createElement("a");
    copyButton.textContent = "Copy";
    copyButton.classList.add("copy-button");
    copyButton.innerHTML = '<i class="bi bi-clipboard" title="Copy to Clipboard"></i>';
    copyButton.addEventListener("click", function () {
      // Copy message content in markdown format
      copyToClipboard(message);
      showCopiedMessage(copyButton);
    });
    messageDiv.appendChild(copyButton);
  }
  chatDiv.appendChild(messageDiv);
  chatDiv.scrollTop = chatDiv.scrollHeight; // Scroll to the bottom
}
function copyToClipboard(text) {
  var dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.value = text;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
}

function showCopiedMessage(button) {
  var message = document.createElement("div");
  message.classList.add("copied-message");
  message.textContent = "Copied to clipboard";
  document.body.appendChild(message);
  setTimeout(function () {
    message.remove();
  }, 2000);
}
function loadChats() {
  var chats = JSON.parse(localStorage.getItem("chats")) || {};
  var chatList = document.getElementById("chatList");
  chatList.innerHTML =
    '_<div style="position: fixed; bottom: 0px; width: 220px; left: 0px; height: 180px; background-color: #333; padding-top: 10px;" id="buttons"><li style="text-decoration: none; margin: auto; text-align: center; border-bottom: none;"><select id = "selectedModel" onchange="changeSelectedModel()">{% for model in modelnames %}<option value="{{model}}">{{model}}</option>{% endfor %}</select></li></a><hr><div style="margin: auto; text-align: center;"><select onchange="window.location.href=this.value" style="display: inline-block;"><option selected disabled hidden>More</option><option value="https://chat.discord.rocks/how">How this works</option><option value="https://chat.discord.rocks/docs">API Documentation</option></select></div><hr><a href="https://discord.gg/vmb2g2rpnP" style="text-decoration: none; margin: auto; text-align: center;"><li style=" border-bottom: 0px;">Join our Discord</li></a>'; // Clear existing list
  var hash = window.location.hash.slice(1); // Get the URL hash without '#'
  Object.keys(chats).forEach(function (chatName) {
    var li = document.createElement("li");
    li.textContent = chatName;
    var deleteButton = document.createElement("a");
    deleteButton.className = "small";
    deleteButton.textContent = "Delete";
    deleteButton.onclick = function (event) {
      event.stopPropagation(); // Prevent li onclick from triggering
      deleteChat(chatName);
      loadChatMessages("");
    };
    li.appendChild(deleteButton);
    li.onclick = function () {
      loadChatMessages(chatName);
      window.location.hash = "#" + chatName; // Modify the window location hash
    };
    chatList.insertBefore(li, chatList.firstChild); // Prepend the new chat

    // Check if the chatName matches the hash
    if (hash && chatName === hash) {
      loadChatMessages(chatName);
    }
  });

  // If hash is provided but not found in chats, default to main chat
  if (hash && !chats[hash]) {
    loadChatMessages("main");
  }
}

// Load messages for a specific chat
function loadChatMessages(chatName) {
  lastChatName = currentChatName;
  currentChatName = chatName;
  if (currentChatName == "") {
    currentChatName = "main";
  }
  var chats = JSON.parse(localStorage.getItem("chats")) || {};
  messageHistory = chats[chatName] || [];
  var chatDiv = document.getElementById("chat");
  chatDiv.innerHTML = ""; // Clear chat
  messageHistory.forEach(function (message) {
    displayMessage(message.content, message.role);
  });
  // Highlight the active chat
  document.querySelectorAll("#chatList li").forEach(function (li) {
    if (lastChatName != chatName) {
      if (li.textContent.replace("Delete", "") === chatName) {
        li.classList.toggle("active");
      } else if (li.className.includes("active")) {
        li.classList.toggle("active");
      }
    }
  });
}

// Save chat to local storage
function saveChat(chatName) {
  var chats = JSON.parse(localStorage.getItem("chats")) || {};
  chats[chatName] = messageHistory;
  localStorage.setItem("chats", JSON.stringify(chats));
  loadChats(); // Refresh the chat list
}

// Delete a chat
function deleteChat(chatName) {
  var chats = JSON.parse(localStorage.getItem("chats")) || {};
  delete chats[chatName];
  localStorage.setItem("chats", JSON.stringify(chats));
  loadChats(); // Refresh the chat list
}

// Call loadChats on page load
loadChats();
loadChatMessages(currentChatName);
