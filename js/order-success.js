'use strict';

function initOrderSuccess() {
  const orderNumber = document.getElementById("order-number");
  if (!orderNumber) return;

  const reference = 1000 + Math.floor(Math.random() * 9000);

  // Updated fallback address to match the rest of the site (26, not 60a)
  const savedAddress = localStorage.getItem("im_last_address") || "Astana, Kabanbay Batyr Ave., 26";
  const savedPhone = localStorage.getItem("im_last_phone") || "+7 (7172) 00-00-00";
  const savedMethod = localStorage.getItem("im_last_payment") || "card";
  const savedTotal = localStorage.getItem("im_last_total") || "0 ₸";

  orderNumber.textContent = "#" + reference;

  const addressEl = document.getElementById("order-address");
  if (addressEl) addressEl.textContent = savedAddress;

  const phoneEl = document.getElementById("order-phone");
  if (phoneEl) phoneEl.textContent = savedPhone;

  const totalEl = document.getElementById("order-total");
  if (totalEl) totalEl.textContent = savedTotal;

  const paymentEl = document.getElementById("order-payment");
  if (paymentEl) {
    const map = { card: "Bank Card", kaspi: "Kaspi QR", cash: "Cash" };
    paymentEl.textContent = map[savedMethod] || savedMethod;
  }

  const main = document.querySelector("main");
  if (main) {
    const note = document.createElement("p");
    note.className = "form-result success";
    note.textContent =
      "Demo confirmation — reference #" + reference +
      " is a temporary front-end value only. No real order was placed and no payment was processed.";
    const hero = main.querySelector(".hero");
    if (hero) hero.appendChild(note);
  }
}

document.addEventListener("DOMContentLoaded", initOrderSuccess);