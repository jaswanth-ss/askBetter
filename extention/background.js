chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SUGGEST_FROM_POPUP") {
    handleSuggest(sender);
    sendResponse({ received: true });
  }
});

async function handleSuggest(sender) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  chrome.tabs.sendMessage(tab.id, { type: "GET_PROMPTS" }, async (response) => {
    if (chrome.runtime.lastError || !response || response.error) {
      const err = (response && response.error) || "Could not read prompts from the page.";
      await chrome.storage.local.set({ lastResult: null, lastError: err, analysing: false });
      setTimeout(() => chrome.action.openPopup(), 5000);
      return;
    }

    const prompts = response.prompts;
    if (!prompts || prompts.length === 0) {
      await chrome.storage.local.set({ lastResult: null, lastError: "No prompts found in this conversation.", analysing: false });
      setTimeout(() => chrome.action.openPopup(), 5000);
      return;
    }

    const combined = prompts.join(" &&& ");
    console.log("[askBetter] Sending:", combined);

    try {
      const res = await fetch("https://askbetter.onrender.com/suggest-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompts: combined }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();
      const suggested = data.suggested_prompt || "No suggestion returned.";

      await chrome.storage.local.set({ lastResult: suggested, lastError: null, analysing: false });
    } catch (err) {
      console.error("[askBetter]", err);
      await chrome.storage.local.set({ lastResult: null, lastError: err.message, analysing: false });
    }

    setTimeout(() => chrome.action.openPopup(), 5000);
  });
}
