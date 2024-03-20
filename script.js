const textArea = document.getElementById("message");
const chat = document.getElementById("messages");

var conversation = [];

textArea.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    writeMessage(textArea.value);
    textArea.value = "";
  }
});

function writeMessage(message) {
  const li = document.createElement("li");
  li.innerText = `You: ${message}`;
  conversation.push({ role: "user", content: message });
  chat.append(li);

  fetch("https://corsproxy.io/?https%3A%2F%2Fchat.discord.rocks%2Freply", {
    method: "POST",
    body: JSON.stringify({ messages: conversation, model: "mixtral-8x7b-instant-pro" }),
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (response.ok) return response.text();
      else throw new Error("Error: " + response.text());
    })
    .then((assistantMessage) => {
      conversation.push({ role: "assistant", content: assistantMessage });
      const li = document.createElement("li");
      li.innerText = `Bot: ${assistantMessage}`;
      chat.append(li);
    })
    .catch((errorMessage) => {});
}
