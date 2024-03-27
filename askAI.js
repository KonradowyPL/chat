const askAI = (model, messages) => {
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

  return models[model](messages)
    .then((response) => {
      locked = false;
      if (response.ok) {
        return response.text();
      } else {
        throw "There was an error while generating your response. Check console and report bugs!";
      }
    })
    .then((assistantMessage) => {
      return { role: "assistant", content: assistantMessage };
    })
    .catch((errorMessage) => {
      return { role: "assistant", content: `Error`, error: String(errorMessage) };
    });
};

const askAiWrapper = (model, messages) => {
  askAI(model, messages).then((response) => {
    chats[currentChat].messages.push(response);
  });
};
