const displayChatList = () => {
  const chatEle = (chatId) => {
    const ele = document.createElement("div");
    ele.append(bootStrapIcon("bi-chat-text"), document.createTextNode(chats[chatId].name));
    ele.onclick = () => {
      setChat(chatId);
    };
    return ele;
  };

  while (chatsContainer.firstChild) chatsContainer.removeChild(chatsContainer.firstChild);
  chatsContainer.append(...Object.keys(chats).map(chatEle));
};
