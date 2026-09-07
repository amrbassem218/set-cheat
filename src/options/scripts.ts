import type { BadgePosition, Settings } from "../types";

const DEFAULT_SETTINGS: Settings = { badgePosition: "right" };

const checkbox = document.querySelector<HTMLInputElement>("#badge-left");
const statusLine = document.querySelector<HTMLParagraphElement>("#status");

if (checkbox && statusLine) {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (items) => {
    checkbox.checked = items.badgePosition === "left";
    statusLine.textContent = "Setting loaded from chrome.storage.sync";
  });

  checkbox.addEventListener("change", () => {
    const position: BadgePosition = checkbox.checked ? "left" : "right";
    const settings: Settings = { badgePosition: position };
    chrome.storage.sync.set(settings, () => {
      statusLine.textContent = `Saved: the overlay sits on the ${position}`;
    });
  });
}
