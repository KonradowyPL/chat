function tryParse(str, exit) {
  if (str) {
    try {
      let a = JSON.parse(str);
      return a;
    } catch {
      console.error(`Error while parsing string: "${str}"`);
      return exit;
    }
  }
  return exit;
}

const chatMessages = (id) => {
  return new Proxy([], {
    // target == backend object
    // property == vaule passed as key
    // value == proxy object
    get: function (target, property, value) {
      console.log({ target, property, value });
      if (target.length == 0) {
        target.push(...tryParse(localStorage.getItem(`CHAT:${id}`), []));
        console.info("HOT Loaded");
      }
      if (property == "save") {
        return () => localStorage.setItem(`CHAT:${id}`, JSON.stringify(target));
      }
      return target[property];
    },
  });
};

const chat = chatMessages("0");
