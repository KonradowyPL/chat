function tryParse(str, exit) {
    if (!str) return exit;
    try {
        return JSON.parse(str);
    } catch {
        console.error(`Error while parsing string: "${str}"`);
        return exit;
    }
}

let url = new URL(window.location.href);
const params = new URLSearchParams(url.search);

var currentChat = params.get("c");
newChat.onclick = newChatUI;

var chats = {};
loadChats();
displayChatList();

chats = new Proxy(chats, {
    set: (target, property, value) => {
        target[property] = value;
        displayChatList();
    },
    get: (target, property, value) => target[property],

    deleteProperty: (target, property) => {
        localStorage.removeItem(`CHAT:${property}`);
        delete target[property];
        saveChats();
        displayChatList();
        if (property == currentChat) newChatUI();
    },
});

if (currentChat && currentChat.match(/^[ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+_]{16}/g) && chats[currentChat]) {
    displayChat();
} else {
    newChatUI();
}

navToggle.onclick = () => {
    document.body.toggleAttribute("nav");
};

// emulate clicking when focused
document.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && document?.activeElement?.nodeName != "BUTTON") {
        document?.activeElement?.click();
    }

    // unfocus element
    if (event.key === "Escape") {
        document?.activeElement?.blur();
    }

    if (event.key === "/" && document?.activeElement == document.body) {
        document.querySelector("textarea")?.focus();
        event.preventDefault();
    }
    if (event.altKey && (event.keyCode == 40 || event.keyCode == 38)) {
        let focuesd = currentChat;
        if (document.activeElement.parentElement.parentElement == chatsContainer) {
            focuesd = document.activeElement.getAttribute("data-id");
        } else if (document.activeElement == newChat) {
            focuesd = -1;
        }
        const currentIdx = sortedChats.indexOf(focuesd);
        const newIdx = currentIdx + (event.keyCode == 38 ? -1 : 1);
        console.log(newIdx);
        if (newIdx < 0) {
            newChat?.focus();
            newChatUI();
        } else {
            const newChat = sortedChats[newIdx];
            if (newChat) {
                chatsContainer.querySelector(`[data-id="${newChat}"]`)?.focus();
                setChat(newChat);
            }
        }
    }
    if (event.altKey && event.key == "=") {
        newChatUI();
    }
});

// fix mobile keyboard covering up footers (textarea)
window.addEventListener("resize", () => {
    document.body.style.height = window.visualViewport.height + "px";
});

document.body.style.height = window.visualViewport.height + "px";

// navbar swipe logic
var touchStart;
document.addEventListener(
    "touchstart",
    (e) => {
        touchStart = e.changedTouches[0].pageX;
        if (document.body.getAttribute("nav") != undefined) touchStart -= nav.clientWidth;
    },
    { passive: true }
);

document.addEventListener(
    "touchmove",
    (e) => {
        if (window.matchMedia("screen and (max-width: 700px)").matches) {
            nav.style.translate = `clamp(-100%, calc(${e.changedTouches[0].pageX - touchStart}px - 100%), 0%) 0`;
            nav.style.transition = `translate 0ms`;
        }
    },
    { passive: true }
);

document.addEventListener(
    "touchend",
    (e) => {
        nav.style.removeProperty("translate");
        nav.style.removeProperty("transition");
        if (window.matchMedia("screen and (max-width: 700px)").matches) {
            if (e.changedTouches[0].pageX - touchStart > nav.clientWidth / 2) document.body.setAttribute("nav", "");
            else document.body.removeAttribute("nav");
        }
    },
    { passive: true }
);

// extension url basing on browser
if (navigator.userAgent.includes("Firefox")) extension.href = "https://addons.mozilla.org/en-US/firefox/addon/access-control-allow-origin";
else extension.href = "https://chromewebstore.google.com/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf";
