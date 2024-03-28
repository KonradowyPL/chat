const renderer = new marked.Renderer();
renderer.code = function (code, language) {
  // Check if the language is valid for highlight.js
  const validLanguage = !!(language && hljs.getLanguage(language));
  // Highlight the code
  const highlighted = validLanguage
    ? hljs.highlight(code, { language, ignoreIllegals: false }).value
    : hljs.highlight(code, { language: "js", ignoreIllegals: false }).value;
  // Return the highlighted code wrapped in a <code> tag
  return `<code class="hljs ${language}">${highlighted}<span class="bi copy bi-copy" onclick="navigator.clipboard.writeText(this.parentNode.innerText)"/></code>`;
};

marked.use({
  renderer,
  breaks: false,
  gfm: true,
});

const parseMessage = (content) => {
  return marked
    .parse(content)
    .trim()
    .replaceAll("\n", "<br>")
    .replace(/^<p>/, "")
    .replace(/<\/p>$/, "");
};
