import logo from "../images/icon.png";
import type { BadgePosition, OpenOptionsMessage, Settings } from "../types";
import type { Card } from "../types";
console.log("[From the page context] Hello from content_scripts!");

const DEFAULT_SETTINGS: Settings = { badgePosition: "right" };

// The stylesheet parks the panel on one edge through these two classes, so
// swapping them is all it takes to move the injected UI.
const POSITION_CLASS: Record<BadgePosition, string> = {
  left: "content_script content_script--left",
  right: "content_script content_script--right",
};

function toPosition(value: unknown): BadgePosition {
  return value === "left" ? "left" : "right";
}

/**
 * Extension.js content_script entrypoint. The framework calls this on
 * injection and calls the returned function on HMR/teardown to clean up.
 * Do not invoke it yourself.
 */
export default function initial() {
  const rootDiv = document.createElement("div");

  const observer = new MutationObserver(fetchDOM);
  if (document.readyState === "complete") {
    fetchDOM();
  } else {
    window.addEventListener("load", fetchDOM);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  rootDiv.setAttribute("data-extension-root", "true");
  // Isolate the host from page styles (e.g. example.com ships div{opacity:.8},
  // which would otherwise fade the whole widget): the shadow DOM only protects
  // descendants, and the host element itself still takes page CSS.
  rootDiv.style.cssText = "all: initial !important";
  document.body.appendChild(rootDiv);

  const shadowRoot = rootDiv.attachShadow({ mode: "open" });
  const styleElement = document.createElement("style");
  shadowRoot.appendChild(styleElement);

  fetchCSS().then((css) => (styleElement.textContent = css));

  const contentDiv = document.createElement("div");
  contentDiv.className = POSITION_CLASS[DEFAULT_SETTINGS.badgePosition];
  shadowRoot.appendChild(contentDiv);

  const img = document.createElement("img");
  img.className = "content_logo";
  img.src = logo;
  contentDiv.appendChild(img);

  const title = document.createElement("h1");
  title.className = "content_title";
  title.textContent = "Content Template";
  contentDiv.appendChild(title);

  const description = document.createElement("p");
  description.className = "content_description";
  description.innerHTML =
    'This content script runs in the context of web pages. Learn more at <a href="https://extension.js.org" target="_blank" rel="noreferrer noopener">extension.js.org</a>.';
  contentDiv.appendChild(description);

  const button = document.createElement("button");
  button.className = "content_button";
  button.type = "button";
  button.textContent = "Open options";
  // Named for Accessibility as well as for sight: the label is how a screen
  // reader announces the button, and how the docs recorder finds it.
  button.setAttribute("aria-label", "Open options");
  button.addEventListener("click", () => {
    const message: OpenOptionsMessage = { type: "open-options" };
    chrome.runtime.sendMessage(message);
  });
  contentDiv.appendChild(button);

  function applyPosition(value: unknown) {
    // The class lands on the element the stylesheet positions, not on the
    // host: the host carries `all: initial !important`, which a plain style
    // write cannot beat, and it is not the positioned box either way.
    contentDiv.className = POSITION_CLASS[toPosition(value)];
  }

  // The key is absent until the first write, so ask storage for the default too.
  chrome.storage.sync.get(DEFAULT_SETTINGS, (items) => {
    applyPosition(items.badgePosition);
  });

  // The options page writes the same key, so this UI follows it live rather
  // than waiting for the next page load.
  const onSettingChanged = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string,
  ) => {
    const change = changes.badgePosition;
    if (areaName === "sync" && change) {
      applyPosition(change.newValue);
    }
  };
  chrome.storage.onChanged.addListener(onSettingChanged);

  return () => {
    chrome.storage.onChanged.removeListener(onSettingChanged);
    rootDiv.remove();
  };
}

async function fetchCSS() {
  const cssUrl = new URL("./styles.css", import.meta.url);
  const response = await fetch(cssUrl);
  const text = await response.text();
  return response.ok ? text : Promise.reject(text);
}

var shape_mapper: Record<string, number> = {
  squiggle: 1,
  diamond: 2,
  oval: 3,
};

var fill_mapper: Record<string, number> = {
  transparent: 1,
  shaded: 2,
  filled: 3,
};

// Red = 1, Purple = 2, Green = 3 (color code is index + 1)
var color_hex_mapper = [["#ff0101"], ["#800080"], ["#008002"]];
var color_text_mapper = {
  red: 1,
  purple: 2,
  green: 3,
};

const decodeCards = (card: Card) => {
  let swap_shape_mapper = Object.fromEntries(
    Object.entries(shape_mapper).map(([keys, values]) => [values, keys]),
  );
  let swap_color_mapper = Object.fromEntries(
    Object.entries(color_text_mapper).map(([keys, values]) => [values, keys]),
  );
  let swap_fill_mapper = Object.fromEntries(
    Object.entries(fill_mapper).map(([keys, values]) => [values, keys]),
  );

  return `${card.number} ${swap_color_mapper[card.color]} ${swap_fill_mapper[card.fill]} ${swap_shape_mapper[card.shape]}`;
};
const getActiveCardsProps = (active_cards: any) => {
  let cards_props: Card[] = [];
  active_cards.forEach((card: any, i: number) => {
    let svgs = card.querySelectorAll("svg");
    let svg_items = svgs[0].querySelectorAll("use");
    let svg_item = svg_items[0];

    // Assign default values
    let [card_no, card_shape, card_fill, card_color] = [-1, -1, -1, -1];

    // Get number of cards
    card_no = svgs.length;

    // Get shape of cards
    if (svg_item.getAttribute("href") !== null) {
      let svg_shape = svg_item.getAttribute("href").slice(1);
      if (Object.hasOwn(shape_mapper, svg_shape)) {
        card_shape = shape_mapper[svg_shape];
      }
    }

    // Get fill of cards
    let mask = svg_item.getAttribute("mask");
    let fill = svg_item.getAttribute("fill");
    let svg_fill = "";
    if (fill == "transparent") {
      svg_fill = "transparent";
    } else if (mask !== "" && mask !== null) {
      svg_fill = "shaded";
    } else {
      svg_fill = "filled";
    }
    card_fill = fill_mapper[svg_fill];

    // Get color of cards
    let svg_color = svg_items[1].getAttribute("stroke");
    if (svg_color) {
      color_hex_mapper.forEach((color, i) => {
        color.forEach((hex) => {
          if (hex == svg_color) {
            card_color = i + 1;
          }
        });
      });
    }

    cards_props.push({
      index: i,
      number: card_no,
      shape: card_shape,
      color: card_color,
      fill: card_fill,
    });
  });
  return cards_props;
};

const analyzeCards = (cards_props: Card[]) => {
  // Creating defualt values for each variable
  // Each variable would be a 3 bit number, by ORing each card value to the nth bit
  // Valid sets are those of up bit count 1 or 3 only
  let set_found = false;
  let set_indices: number[] = [];
  const check_property = (n: number) => {
    // is power of 2  or is 1110
    if ((n > 0 && (n & (n - 1)) === 0) || n === 14) {
      return true;
    }
    return false;
  };

  for (let i = 0; i < cards_props.length - 2; i++) {
    for (let j = i + 1; j < cards_props.length - 1; j++) {
      for (let k = j + 1; k < cards_props.length; k++) {
        let [number, shape, color, fill] = [0, 0, 0, 0];
        for (let card of [cards_props[i], cards_props[j], cards_props[k]]) {
          number |= 1 << card.number;
          shape |= 1 << card.shape;
          color |= 1 << card.color;
          fill |= 1 << card.fill;
        }
        if (
          check_property(number) &&
          check_property(shape) &&
          check_property(color) &&
          check_property(fill)
        ) {
          set_indices = [
            cards_props[i].index,
            cards_props[j].index,
            cards_props[k].index,
          ];
          console.log(decodeCards(cards_props[i]));
          console.log(decodeCards(cards_props[j]));
          console.log(decodeCards(cards_props[k]));
          set_found = true;
          break;
        }
      }
      if (set_found) {
        break;
      }
    }
    if (set_found) {
      break;
    }
  }
  return set_indices;
};

async function fetchDOM() {
  let board: any = null;
  let cards: any = null;
  setInterval(() => {
    if (board == null || cards == null) {
      board = document.querySelectorAll(".MuiPaper-root")[3];
      cards = [...board.children].slice(1);
    }
    let active_cards = cards.filter(
      (card: any) => card.style.visibility == "visible",
    );

    let cards_props: Card[] = getActiveCardsProps(active_cards);

    let set_indices = analyzeCards(cards_props);
    for (let index of set_indices) {
      active_cards[index].children[0].click();
    }
    // console.log(set_indices);
  }, 1000);
}
