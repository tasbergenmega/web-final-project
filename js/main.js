'use strict';

const money = (value) => value + " ₸";
const isEmail = (text) => /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(text.trim());
const digitsOnly = (text) => text.replace(/[^0-9]/g, "");
const toNumber = (text) => parseInt(text.replace(/[^0-9]/g, ""), 10) || 0;

/* ================= field errors ================= */

function showError(input, message) {
  clearError(input);
  input.setAttribute("aria-invalid", "true");
  const error = document.createElement("p");
  error.className = "form-result error";
  error.textContent = message;
  input.parentNode.appendChild(error);
}

function clearError(input) {
  input.removeAttribute("aria-invalid");
  input.parentNode.querySelectorAll(".form-result.error").forEach((el) => el.remove());
}

function clearForm(form) {
  form.querySelectorAll("input, textarea, select").forEach(clearError);
}

function focusFirstInvalid(scope) {
  const bad = scope.querySelector('[aria-invalid="true"]');
  if (bad) bad.focus();
}

/* ================= result messages ================= */

function showResult(box, message, type) {
  box.textContent = message;
  box.classList.remove("hidden", "success", "error");
  box.classList.add(type);
}

/* ================= cart storage (plain JS) ================= */

const CART_KEY = "im_cart_demo";

function readCart() {
  const saved = localStorage.getItem(CART_KEY);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  refreshCartBadges(items);
}

function cartQuantity(items) {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

function refreshCartBadges(items) {
  const count = cartQuantity(items);
  document.querySelectorAll(".cart-count, .nav-cart-count").forEach((badge) => {
    badge.textContent = count;
    badge.classList.toggle("hidden", count === 0);
  });
}

function addToCart(newItem) {
  const items = readCart();
  const found = items.find((item) => item.name === newItem.name);
  if (found) found.qty += 1;
  else items.push({ ...newItem, qty: 1 });
  writeCart(items);
  return items;
}

/* ================= cart page render (plain JS) ================= */

function createCartRow(item) {
  const lineTotal = item.price * item.qty;

  const row = document.createElement("article");
  row.className = "cart-item";
  row.dataset.name = item.name;

  const img = document.createElement("img");
  img.className = "cart-item-img";
  img.src = item.img || "";
  img.alt = item.name;
  row.appendChild(img);

  const info = document.createElement("div");
  info.className = "cart-item-info";

  const h3 = document.createElement("h3");
  h3.textContent = item.name;
  info.appendChild(h3);

  const desc = document.createElement("p");
  desc.textContent = item.desc || "";
  info.appendChild(desc);

  const price = document.createElement("p");
  price.className = "cart-item-price";
  price.textContent = money(item.price);
  info.appendChild(price);

  row.appendChild(info);

  const qty = document.createElement("div");
  qty.className = "cart-item-qty";

  const minus = document.createElement("button");
  minus.type = "button";
  minus.className = "qty-btn";
  minus.textContent = "−";
  qty.appendChild(minus);

  const val = document.createElement("span");
  val.className = "qty-value";
  val.textContent = item.qty;
  qty.appendChild(val);

  const plus = document.createElement("button");
  plus.type = "button";
  plus.className = "qty-btn";
  plus.textContent = "+";
  qty.appendChild(plus);

  row.appendChild(qty);

  const total = document.createElement("p");
  total.className = "cart-item-total";
  total.textContent = money(lineTotal);
  row.appendChild(total);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove-btn";
  remove.textContent = "Remove";
  row.appendChild(remove);

  return row;
}

function renderCartPage() {
  const list = document.getElementById("cart-list");
  if (!list) return;

  const items = readCart();
  list.innerHTML = "";

  if (items.length === 0) {
    const p = document.createElement("p");
    p.className = "cart-empty";
    p.innerHTML = 'Your cart is empty. <a href="menu.html">Go to the menu →</a>';
    list.appendChild(p);
  } else {
    items.forEach((item) => list.appendChild(createCartRow(item)));
  }

  updateSummary(items);
}

/* ================= cart summary ================= */

function updateSummary(items) {
  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const delivery = count > 0 && subtotal < 5000 ? 500 : 0;
  const discount = count > 0 && subtotal >= 3000 ? 200 : 0;
  const total = subtotal + delivery - discount;

  const badge = document.querySelector(".hero strong");
  if (badge) badge.textContent = count + (count === 1 ? " item" : " items");

  const subtotalEl = document.getElementById("cart-subtotal");
  if (subtotalEl) subtotalEl.textContent = money(subtotal);
  const deliveryEl = document.getElementById("cart-delivery");
  if (deliveryEl) deliveryEl.textContent = money(delivery);
  const discountEl = document.getElementById("cart-discount");
  if (discountEl) discountEl.textContent = discount > 0 ? "− " + money(discount) : money(0);
  const totalEl = document.getElementById("cart-total");
  if (totalEl) totalEl.textContent = money(total);

  const checkout = document.querySelector(".summary-box .btn-full");
  if (checkout) {
    if (count === 0) {
      checkout.classList.add("hidden");
    } else {
      checkout.classList.remove("hidden");
      checkout.textContent = "Place Order — " + money(total) + " →";
      checkout.dataset.total = total;
    }
  }

  refreshCartBadges(items);
}

/* ================= cart click delegation (plain JS) ================= */

function initCartClicks() {
  document.addEventListener("click", (event) => {
    const addBtn = event.target.closest(".add-to-cart");
    if (addBtn) {
      event.preventDefault();
      const card = addBtn.closest(".card");
      if (!card) return;

      const name = card.querySelector("h3")?.textContent || "";
      const desc = card.querySelector("p")?.textContent || "";
      const priceText = card.querySelector(".price")?.textContent || "0";
      const img = card.querySelector(".card-img")?.getAttribute("src") || "";

      addToCart({ name, desc, price: toNumber(priceText), img });

      const original = "Add to Cart";
      addBtn.textContent = "Added ✓";
      addBtn.disabled = true;
      setTimeout(() => {
        addBtn.textContent = original;
        addBtn.disabled = false;
      }, 900);
      return;
    }

    const cartBtn = event.target.closest("#cart-list button");
    if (cartBtn) {
      const row = cartBtn.closest(".cart-item");
      if (!row) return;

      const name = row.dataset.name;
      const items = readCart();
      const index = items.findIndex((i) => i.name === name);
      if (index === -1) return;

      if (cartBtn.classList.contains("qty-btn")) {
        if (cartBtn.textContent === "+") items[index].qty += 1;
        else if (items[index].qty > 1) items[index].qty -= 1;
        writeCart(items);
        renderCartPage();
      }

      if (cartBtn.classList.contains("remove-btn")) {
        items.splice(index, 1);
        writeCart(items);
        renderCartPage();
      }
    }
  });
}

/* ================= delivery page: packs from array (plain JS) ================= */

const DELIVERY_PACKS = [
  { name: "Pack 1", desc: "Chicken Burger + Fanta 0.25 — a light and tasty combo.", price: 1150 },
  { name: "Pack 2", desc: "Combo Beef Tasty — burger, fries, and a drink.", price: 4150 },
  { name: "Pack 3", desc: "Combo Fishburger — light fish burger with fries and drink.", price: 2750 },
  { name: "Pack 4", desc: "Combo Double Grand Burger — big hunger, big taste.", price: 3950 },
];

function renderDeliveryPacks() {
  const section = [...document.querySelectorAll(".section")]
    .find((s) => s.querySelector("h2")?.textContent.includes("Pick a Combo"));
  if (!section) return;

  const cards = section.querySelector(".cards");
  if (!cards) return;

  cards.innerHTML = "";

  DELIVERY_PACKS.forEach((pack) => {
    const card = document.createElement("article");
    card.className = "card";

    const h3 = document.createElement("h3");
    h3.textContent = pack.name;
    card.appendChild(h3);

    const p = document.createElement("p");
    p.textContent = pack.desc;
    card.appendChild(p);

    const price = document.createElement("p");
    price.className = "price";
    price.textContent = money(pack.price);
    card.appendChild(price);

    cards.appendChild(card);
  });
}

/* ================= newsletter ================= */

function initNewsletter() {
  const form = document.querySelector(".newsletter-form");
  if (!form) return;

  form.noValidate = true;
  const email = form.querySelector('input[name="email"]');
  const result = form.querySelector("#newsletter-result");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearError(email);
    if (!isEmail(email.value)) {
      showError(email, "Please write a correct email");
      email.focus();
      return;
    }
    if (result) showResult(result, "Demo subscription — no email was actually sent.", "success");
    form.reset();
  });
}

/* ================= delivery form ================= */

function initDeliveryForm() {
  const form = document.querySelector(".contact-form");
  const pack = document.getElementById("pack");
  if (!form || !pack) return;

  form.noValidate = true;
  const phone = document.getElementById("phone");
  const address = document.getElementById("address");
  const result = document.getElementById("delivery-result");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearForm(form);

    if (pack.value === "") showError(pack, "Please choose a pack");
    if (digitsOnly(phone.value).length < 11) {
      showError(phone, "Please write a correct phone number, for example +7 (777) 123-45-67");
    }
    if (address.value.trim().length < 5) showError(address, "Please write the delivery address");

    if (form.querySelector('[aria-invalid="true"]')) {
      focusFirstInvalid(form);
      return;
    }

    const chosen = pack.options[pack.selectedIndex].text;
    const etaMinutes = 25 + Math.floor(Math.random() * 11);

    if (result) {
      showResult(
        result,
        "Demo request only — " + chosen + ". Estimated delivery: " +
          etaMinutes + " min. No real order was placed.",
        "success"
      );
    }
    form.reset();
  });
}

/* ================= order (checkout) page ================= */

function initOrderPage() {
  const layout = document.querySelector(".checkout-layout");
  if (!layout) return;

  const payButton = layout.querySelector(".checkout-right .btn-full");
  if (!payButton) return;

  const summaryBox = layout.querySelector(".summary-box");
  const items = readCart();

  summaryBox.querySelectorAll(".summary-item, .summary-row").forEach((el) => el.remove());

  if (items.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.className = "cart-empty";
    emptyMsg.innerHTML = 'Your cart is empty. <a href="menu.html">Go to menu →</a>';
    summaryBox.insertBefore(emptyMsg, summaryBox.querySelector(".summary-total"));

    const totalSpan = summaryBox.querySelector(".summary-total span:last-child");
    if (totalSpan) totalSpan.textContent = money(0);

    payButton.classList.add("hidden");
    return;
  }

  let subtotal = 0;

  items.forEach((item) => {
    const lineTotal = item.price * item.qty;
    subtotal += lineTotal;

    const div = document.createElement("div");
    div.className = "summary-item";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = item.name + " × " + item.qty;

    const priceSpan = document.createElement("span");
    priceSpan.textContent = money(lineTotal);

    div.append(nameSpan, priceSpan);
    summaryBox.insertBefore(div, summaryBox.querySelector(".summary-total"));
  });

  const delivery = subtotal < 5000 ? 500 : 0;
  const discount = subtotal >= 3000 ? 200 : 0;
  const total = subtotal + delivery - discount;

  const rowSubtotal = document.createElement("div");
  rowSubtotal.className = "summary-row";
  rowSubtotal.innerHTML =
    '<span>Subtotal</span><span>' + money(subtotal) + "</span>";
  summaryBox.insertBefore(rowSubtotal, summaryBox.querySelector(".summary-total"));

  const rowDelivery = document.createElement("div");
  rowDelivery.className = "summary-row";
  rowDelivery.innerHTML =
    '<span>Delivery Fee</span><span>' + money(delivery) + "</span>";
  summaryBox.insertBefore(rowDelivery, summaryBox.querySelector(".summary-total"));

  const rowDiscount = document.createElement("div");
  rowDiscount.className = "summary-row";
  rowDiscount.innerHTML =
    '<span>Bonus Discount</span><span class="discount">' +
    (discount ? "− " + money(discount) : money(0)) +
    "</span>";
  summaryBox.insertBefore(rowDiscount, summaryBox.querySelector(".summary-total"));

  const totalSpan = summaryBox.querySelector(".summary-total span:last-child");
  if (totalSpan) totalSpan.textContent = money(total);

  payButton.textContent = "Pay " + money(total);

  const savedAddress = localStorage.getItem("im_last_address");
  const savedPhone = localStorage.getItem("im_last_phone");
  const addressInput = document.getElementById("address");
  const phoneInput = document.getElementById("phone");
  if (savedAddress && addressInput) addressInput.value = savedAddress;
  if (savedPhone && phoneInput) phoneInput.value = savedPhone;

  const cardBlock = [...layout.querySelectorAll(".checkout-block")]
    .find((b) => b.querySelector("h2")?.textContent === "Card Details");

  const toggleCard = () => {
    const checked = document.querySelector('input[name="pay"]:checked');
    if (cardBlock) cardBlock.classList.toggle("hidden", !checked || checked.value !== "card");
  };
  layout.querySelectorAll('input[name="pay"]').forEach((r) => r.addEventListener("change", toggleCard));
  toggleCard();

  const cardNumber = document.getElementById("card-number");
  const cardName = document.getElementById("card-name");
  const cardExpiry = document.getElementById("card-expiry");
  const cardCvv = document.getElementById("card-cvv");

  if (cardNumber) cardNumber.addEventListener("input", () => {
    const digits = digitsOnly(cardNumber.value).slice(0, 16);
    cardNumber.value = digits.replace(/(.{4})/g, "$1 ").trim();
  });
  if (cardExpiry) cardExpiry.addEventListener("input", () => {
    const d = digitsOnly(cardExpiry.value).slice(0, 4);
    cardExpiry.value = d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  });
  if (cardCvv) cardCvv.addEventListener("input", () => {
    cardCvv.value = digitsOnly(cardCvv.value).slice(0, 3);
  });

  payButton.addEventListener("click", (event) => {
    event.preventDefault();

    [addressInput, phoneInput, cardNumber, cardName, cardExpiry, cardCvv]
      .filter(Boolean)
      .forEach(clearError);

    const method = document.querySelector('input[name="pay"]:checked')?.value || "card";

    if (method === "card") {
      if (digitsOnly(cardNumber.value).length !== 16) showError(cardNumber, "Card number must have 16 digits");
      if (cardName.value.trim().length < 3) showError(cardName, "Write the name as on the card");
      if (!/^[0-9]{2}\/[0-9]{2}$/.test(cardExpiry.value)) showError(cardExpiry, "Use MM/YY format");
      if (digitsOnly(cardCvv.value).length !== 3) showError(cardCvv, "CVV must be 3 digits");
    }

    if (addressInput.value.trim().length < 5) showError(addressInput, "Please write your address");
    if (digitsOnly(phoneInput.value).length < 11) showError(phoneInput, "Please write a correct phone number");

    if (layout.querySelector('[aria-invalid="true"]')) {
      focusFirstInvalid(layout);
      return;
    }

    localStorage.setItem("im_last_address", addressInput.value.trim());
    localStorage.setItem("im_last_phone", phoneInput.value.trim());
    localStorage.setItem("im_last_payment", method);
    localStorage.setItem("im_last_total", money(total));

    writeCart([]);
    window.location.href = "order-success.html";
  });
}

// Toggles the header login state based on localStorage
function refreshAuthState() {
  const isLoggedIn = localStorage.getItem("im_logged_in") === "1";
  const guestBlock = document.getElementById("auth-guest");
  const userBlock = document.getElementById("auth-user");
  
  if (guestBlock && userBlock) {
    if (isLoggedIn) {
      guestBlock.classList.add("hidden");
      userBlock.classList.remove("hidden");
    } else {
      guestBlock.classList.remove("hidden");
      userBlock.classList.add("hidden");
    }
  }
}

/* ================= start ================= */

document.addEventListener("DOMContentLoaded", () => {
  refreshAuthState();
  refreshCartBadges(readCart());
  renderDeliveryPacks();
  renderCartPage();
  initNewsletter();
  initDeliveryForm();
  initOrderPage();
  initCartClicks();
});