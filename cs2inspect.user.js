// ==UserScript==
// @name         Inspect in CS2
// @version      1.0
// @description  Generates CS2 inspect console commands for Steam Inventory items and Community Market listings
// @match        *://steamcommunity.com/id/*/inventory*
// @match        *://steamcommunity.com/profiles/*/inventory*
// @match        *://steamcommunity.com/market/listings/730/*
// @grant        none
// @author       pirssi
// @downloadURL  https://github.com/pirssi/cs2-inspect/raw/main/cs2inspect.user.js
// @updateURL    https://github.com/pirssi/cs2-inspect/raw/main/cs2inspect.user.js
// @supportURL   https://github.com/pirssi/cs2-inspect
// @homepageURL  https://github.com/pirssi/cs2-inspect
// ==/UserScript==

// Whether you want to show Inspect links for both CS:GO ('Inspect in game...') and CS2 ('Inspect in CS2...')
// (set to "true" or "1" to show both, "false" or "0" to show only the CS2 link)
// NOTE: setting this to "false" may cause some errors in the browser console that I can't be arsed to fix
const SHOW_BOTH_INSPECTS = true;

("use strict");

function addButton(div) {
  if (div.querySelector("#newButton")) return;
  const button = div.querySelector("a");
  if (!button) return;

  const match = button.href.match(/\+(.*?)$/);
  const inspectCommand = decodeURIComponent(match[1].replace(/\+/g, " "));

  const newButton = document.createElement("a");
  newButton.id = "newButton";
  newButton.className = "btn_small btn_grey_white_innerfade";
  newButton.href = "javascript:void(0)";
  const buttonText = document.createElement("span");
  let buttonTextNode = document.createTextNode("Inspect in CS2...");
  buttonText.appendChild(buttonTextNode);
  newButton.appendChild(buttonText);
  newButton.onclick = function () {
    navigator.clipboard.writeText(inspectCommand).then(
      () => {
        buttonTextNode.textContent = "Copied to clipboard!";
      },
      () => {
        buttonTextNode.textContent = "Failed to copy!";
      }
    );
  };
  SHOW_BOTH_INSPECTS ? div.replaceChildren(button, newButton) : div.replaceChildren(newButton);
}
function addDropdownItem(div) {
  if (div.querySelector("#newLink")) return;
  const inspectLink = document.querySelector('.popup_menu_item[href^="steam://rungame/730/"]');
  if (!inspectLink) return;

  const match = inspectLink.href.match(/\+(.*?)$/);
  const inspectCommand = decodeURIComponent(match[1].replace(/\+/g, " "));

  const newDropdownItem = document.createElement("a");
  newDropdownItem.id = "newLink";
  newDropdownItem.className = "popup_menu_item";
  newDropdownItem.href = "javascript:void(0)";
  newDropdownItem.textContent = "Inspect in CS2...";
  newDropdownItem.onclick = function () {
    navigator.clipboard.writeText(inspectCommand).then(
      () => {
        newDropdownItem.textContent = "Copied to clipboard!";
      },
      () => {
        newDropdownItem.textContent = "Failed to copy!";
      }
    );
  };
  SHOW_BOTH_INSPECTS
    ? div.replaceChildren(inspectLink, newDropdownItem)
    : div.replaceChildren(newDropdownItem);
}

function addInspect() {
  // first listing inspect at the top
  const largeiteminfoDiv = document.querySelector("#largeiteminfo_item_actions");
  if (largeiteminfoDiv) {
    addButton(largeiteminfoDiv);
    // not updating, so no need for observer
  }
  // popup/dropdown menu on individual listings
  const popupDiv = document.getElementById("market_action_popup");
  const itemactionsDiv = document.getElementById("market_action_popup_itemactions");
  if (popupDiv && itemactionsDiv) {
    const observerMarket = new MutationObserver(function (mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.attributeName === "style") {
          const style = window.getComputedStyle(popupDiv);
          const displayValue = style.getPropertyValue("display");
          if (displayValue === "block") {
            addDropdownItem(itemactionsDiv);
          }
        }
      }
    });
    // observe the popup div for changes (selecting another item, etc.)
    observerMarket.observe(popupDiv, { attributes: true });
  }
  // items in inventory
  const inventoryPage = document.querySelector(".inventory_page_left");
  if (inventoryPage) {
    const observerInv = new MutationObserver(function (mutationsList) {
      for (const mutation of mutationsList) {
        if (mutation.type === "attributes") {
          const itemActions = document.querySelectorAll(".item_actions");
          itemActions.forEach(addButton);
        }
      }
    });
    // observe the inventory page div for changes (selecting another item, etc.)
    observerInv.observe(inventoryPage, { attributes: true, childList: true, subtree: true });
  }
}

// call the function to add initial inspect links and start observing changes
addInspect();
