const suggestBtn = document.getElementById("suggestBtn");
const statusEl   = document.getElementById("status");
const resultCard = document.getElementById("resultCard");
const resultText = document.getElementById("resultText");
const copyBtn    = document.getElementById("copyBtn");
const newBtn     = document.getElementById("newBtn");

chrome.storage.local.get(["lastResult", "lastError", "analysing"], (res) => {
  if (res.analysing) {
    setLoading(true);
    setStatus("Analysing your prompts...");
    pollForResult();
  } else if (res.lastResult) {
    showResult(res.lastResult);
  } else if (res.lastError) {
    setStatus(res.lastError, "error");
    chrome.storage.local.remove("lastError");
  }
});

suggestBtn.addEventListener("click", async () => {
  setLoading(true);
  setStatus("Analysing... you can close this popup.");
  hideResult();
  await chrome.storage.local.set({ analysing: true, lastResult: null, lastError: null });
  chrome.runtime.sendMessage({ type: "SUGGEST_FROM_POPUP" });
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(resultText.textContent).then(() => {
    copyBtn.textContent = "Copied!";
    copyBtn.classList.add("copied");
    setTimeout(() => { copyBtn.textContent = "Copy"; copyBtn.classList.remove("copied"); }, 2000);
  });
});

newBtn.addEventListener("click", () => {
  chrome.storage.local.remove(["lastResult", "lastError", "analysing"]);
  hideResult();
  setStatus("");
});

function pollForResult() {
  const t = setInterval(() => {
    chrome.storage.local.get(["lastResult", "lastError", "analysing"], (res) => {
      if (res.analysing) return;
      clearInterval(t);
      setLoading(false);
      if (res.lastResult) { setStatus(""); showResult(res.lastResult); }
      else if (res.lastError) { setStatus(res.lastError, "error"); chrome.storage.local.remove("lastError"); }
    });
  }, 1000);
}

function setLoading(on) {
  suggestBtn.disabled = on;
  suggestBtn.innerHTML = on
    ? `<span class="spinner"></span> Analysing...`
    : `<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Analyse &amp; Suggest`;
}

function setStatus(msg, type) { statusEl.textContent = msg; statusEl.className = type || ""; }
function showResult(text) { resultText.textContent = text; resultCard.style.display = "block"; }
function hideResult() { resultCard.style.display = "none"; resultText.textContent = ""; }
