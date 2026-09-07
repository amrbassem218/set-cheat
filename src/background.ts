import type { OpenOptionsMessage } from "./types";

console.log(
  "[From the background context] Hello from the background worker/script!",
);
function isOpenOptionsMessage(message: unknown): message is OpenOptionsMessage {
  return (
    typeof message === "object" &&
    message !== null &&
    (message as Partial<OpenOptionsMessage>).type === "open-options"
  );
}

chrome.runtime.onMessage.addListener((message: unknown) => {
  if (isOpenOptionsMessage(message)) {
    chrome.runtime.openOptionsPage();
  }
});
