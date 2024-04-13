const newChatUI = () => {
    currentChat = undefined;
    displayChatList();
    while (main.firstChild) main.removeChild(main.firstChild);
    document.body.setAttribute("data-state", "newChat");
    document.body.removeAttribute("nav");
    params.delete("c");
    url.search = params.toString();
    history.pushState({}, "", url.toString());

    const settings = document.createElement("div");
    const textarea = document.createElement("textarea");
    const select = document.createElement("select");
    textarea.placeholder = "Message mixtral-8x7b-instant-pro...";
    const chatName = Object.assign(document.createElement("input"), {
        placeholder: "Unnamed",
        maxLength: 20,
    });
    chatName.setAttribute("aria-label", "Chat name");
    select.setAttribute("aria-label", "Select Model");
    select.append(
        Object.assign(document.createElement("option"), {
            value: "mixtral-8x7b-instant-pro",
            innerText: "mixtral-8x7b-instant-pro",
        }),
        Object.assign(document.createElement("option"), {
            value: "mixtral-8x7b-instant",
            innerText: "mixtral-8x7b-instant",
        }),
        Object.assign(document.createElement("option"), {
            value: "gemma-7b-instant",
            innerText: "gemma-7b-instant",
        }),
        Object.assign(document.createElement("option"), {
            value: "gpt-4",
            innerText: "gpt-4",
        }),
        Object.assign(document.createElement("option"), {
            value: "gpt-4-turbo-preview",
            innerText: "gpt-4-turbo-preview",
        }),
        Object.assign(document.createElement("option"), {
            value: "gemini",
            innerText: "gemini",
        }),
        Object.assign(document.createElement("option"), {
            value: "none",
            innerText: "[debug] none",
        })
    );
    select.onchange = (e) => {
        textarea.placeholder = `Message ${select.value}...`;
    };

    textarea.addEventListener("input", (e) => {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
    });

    textarea.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (textarea.value.trim()) {
                currentChat = createNewChat({
                    name: chatName.value || "Unnamed",
                    model: select.value,
                    messages: [{ role: "user", content: textarea.value.trim() }],
                    date: Date.now(),
                });
                askAiWrapper(select.value, chats[currentChat].messages);
                displayChat();
                createTextPlaceholder();
                textarea.value = "";
                textarea.style.height = "auto";
            }
        }
    });

    const g1 = document.createElement("div");
    const g2 = document.createElement("div");

    const s1 = Object.assign(document.createElement("span"), { innerText: "Chat name:" });
    const s2 = Object.assign(document.createElement("span"), { innerText: "Model:" });
    s1.setAttribute("aria-hidden", "true");
    s2.setAttribute("aria-hidden", "true");

    g1.append(s1, chatName);
    g2.append(s2, select);

    settings.append(
        Object.assign(document.createElement("h1"), {
            innerText: "Create new chat",
        }),
        g1,
        g2
    );

    main.append(settings, textarea);

    textarea.focus();
};
