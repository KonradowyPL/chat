// detect cors bypass extension
var corsDisabled = false;
fetch("https://www.google.com")
  .then((response) => {
    if (!response.ok) throw new Error("");
  })
  .then(() => (corsDisabled = true))
  .catch(() => (corsDisabled = false));

const cors = (url) => (corsDisabled ? url : "https://corsproxy.io/?" + encodeURIComponent(url));

const askAI = (model, messages) => {
  const rockModel = (name) => {
    return (messages) => {
      return fetch(cors("https://chat.discord.rocks/reply"), {
        method: "POST",
        body: JSON.stringify({
          messages: messages.map((obj) => ({
            role: obj.role,
            content: obj.content,
          })),
          model: name,
        }),
        headers: { "Content-Type": "application/json" },
      }).then((response) => {
        locked = false;
        if (response.ok) return response.text();
        else throw `Error: ${response.text()}`;
      });
    };
  };

  const gptModel = (name) => {
    return (messages) => {
      return fetch(cors("https://gpt4.discord.rocks/ask"), {
        method: "POST",
        body: JSON.stringify({
          messages: messages.map((obj) => ({
            role: obj.role,
            content: obj.content,
          })),
          model: name,
        }),
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => {
          locked = false;
          if (response.ok) return response.json();
          else throw `Error: ${response.json()}`;
        })
        .then((dat) => dat.response + (dat?.url ? "\n" + dat.url : ""));
    };
  };

  const models = {
    "mixtral-8x7b-instant-pro": rockModel("mixtral-8x7b-instant-pro"),
    "mixtral-8x7b-instant": rockModel("mixtral-8x7b-instant"),
    "gemma-7b-instant": rockModel("gemma-7b-instant"),
    "gpt-4-turbo-preview": gptModel("gpt-4-turbo-preview"),
    "gpt-4": gptModel("gpt-4"),
    gemini: (messages) => {
      return fetch(cors("https://gemini.discord.rocks/ask"), {
        method: "POST",
        body: JSON.stringify({
          messages: messages.map((obj) => ({
            role: obj.role == "user" ? "user" : "model",
            content: obj.content,
          })),
        }),
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => {
          locked = false;
          if (response.ok) return response.json();
          else throw `Error: ${response.text()}`;
        })
        .then((dat) => dat.response + (dat?.url ? "\n" + dat.url : ""));
    },
    none: (messages) => new Promise((r) => r(messages[messages.length - 1].content)),
  };

  return models[model](messages)
    .then((assistantMessage) => ({ role: "assistant", content: assistantMessage }))
    .catch((errorMessage) => ({ role: "assistant", content: `Error`, error: String(errorMessage) }));
};

var locked = false;

const askAiWrapper = (model, messages, scrollBottom) => {
  let chat = currentChat;
  if (!locked) {
    locked = true;
    let messagesObj = document.querySelector("body[data-state=chat] > #main > .messages");

    askAI(model, messages).then((response) => {
      locked = false;
      chats[chat].messages.push(response);
      chats[chat].date = Date.now();

      removeTextPlaceholder();
      if (scrollBottom && chat == currentChat) messagesObj.scrollTop = messagesObj.scrollHeight;
    });
    createTextPlaceholder();
    if (scrollBottom && chat == currentChat) messagesObj.scrollTop = messagesObj.scrollHeight;
  }
};
