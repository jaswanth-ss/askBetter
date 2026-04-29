chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "GET_PROMPTS") {
    const messageEls = document.querySelectorAll('[data-message-author-role="user"]');

    if (messageEls.length === 0) {
      sendResponse({ error: "No prompts found in this conversation." });
      return;
    }

    const prompts = Array.from(messageEls)
      .map((el) => el.innerText.trim())
      .filter((t) => t.length > 0);

    sendResponse({ prompts });
  }
});
