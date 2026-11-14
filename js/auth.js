'use strict';

function initAuthPage() {
  const form = document.querySelector(".auth-form");
  if (!form) return;

  form.noValidate = true;

  const isRegister = !!document.getElementById("confirm");
  if (isRegister) initRegisterForm(form);
  else initLoginForm(form);
}

function initLoginForm(form) {
  const username = form.querySelector("#username");
  const password = form.querySelector("#password");
  const result = form.querySelector("#login-result");

  addShowHide(password);
  bindLiveClear(form);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearForm(form);
    if (result) result.classList.add("hidden");

    if (username.value.trim().length < 3) showError(username, "Username must have at least 3 characters");
    if (password.value.length < 6) showError(password, "Password must have at least 6 characters");

    if (form.querySelector('[aria-invalid="true"]')) {
      focusFirstInvalid(form);
      return;
    }

    if (result) {
      localStorage.setItem("im_logged_in", "1");
      showResult(result, "Success! Redirecting to your account...", "success");
      setTimeout(function () {
        window.location.href = "account.html";
      }, 1500);
    }
  });
}

function initRegisterForm(form) {
  const username = form.querySelector("#username");
  const email = form.querySelector("#email");
  const password = form.querySelector("#password");
  const confirm = form.querySelector("#confirm");
  const terms = document.getElementById("terms");
  const result = form.querySelector("#register-result");

  addShowHide(password);
  addShowHide(confirm);
  bindLiveClear(form);

  const checklist = createPasswordChecklist(password, [
    { rule: /.{8,}/,        label: "At least 8 characters" },
    { rule: /[A-Z]/,        label: "One uppercase letter" },
    { rule: /[a-z]/,        label: "One lowercase letter" },
    { rule: /\d/,           label: "One digit" },
    { rule: /[^A-Za-z0-9]/, label: "One special character" },
  ]);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearForm(form);
    if (result) result.classList.add("hidden");

    if (username.value.trim().length < 3) showError(username, "Username must have at least 3 characters");
    if (!isEmail(email.value)) showError(email, "Enter a valid email like you@example.com");
    if (!checklist.allPass(password.value)) showError(password, "Password does not meet all requirements");
    if (confirm.value !== password.value) showError(confirm, "Passwords do not match");
    if (terms && !terms.checked) showError(terms, "Please accept the Terms of Service");

    if (form.querySelector('[aria-invalid="true"]')) {
      focusFirstInvalid(form);
      return;
    }

    if (result) {
      showResult(result,
        "Demo registration — no account was created. Front-end demonstration only.",
        "success");
    }
  });
}

function bindLiveClear(form) {
  form.querySelectorAll("input, textarea, select").forEach((input) => {
    const evt = input.type === "checkbox" || input.tagName === "SELECT" ? "change" : "input";
    input.addEventListener(evt, () => clearError(input));
  });
}

function addShowHide(input) {
  if (!input) return;

  // Оборачиваем инпут в контейнер для позиционирования иконки
  const wrapper = document.createElement("div");
  wrapper.className = "password-wrapper";
  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "password-toggle";
  btn.innerHTML = "👁"; 
  btn.setAttribute("aria-label", "Show or hide password");
  
  wrapper.appendChild(btn);

  btn.addEventListener("click", () => {
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    btn.innerHTML = isPassword ? "👁‍🗨" : "👁"; 
  });
}

function createPasswordChecklist(passwordInput, rules) {
  const list = document.createElement("ul");
  list.className = "password-checklist";
  list.setAttribute("aria-live", "polite");

  rules.forEach((rule) => {
    const li = document.createElement("li");
    li.textContent = "❌ " + rule.label;
    li.style.color = "#d62300";
    list.appendChild(li);
  });

  // ИСПРАВЛЕНИЕ: Вставляем список в .form-group, а не внутрь обертки глазка
  const formGroup = passwordInput.closest(".form-group");
  if (formGroup) {
    formGroup.appendChild(list);
  } else {
    passwordInput.parentNode.appendChild(list);
  }

  const update = () => {
    const value = passwordInput.value;
    list.querySelectorAll("li").forEach((li, i) => {
      const passes = rules[i].rule.test(value);
      if (passes) {
        li.textContent = "✅ " + rules[i].label;
        li.style.color = "#1a9e4a";
      } else {
        li.textContent = "❌ " + rules[i].label;
        li.style.color = "#d62300";
      }
    });
  };

  passwordInput.addEventListener("input", update);
  update();

  return {
    allPass(value) { return rules.every((r) => r.rule.test(value)); },
  };
}

document.addEventListener("DOMContentLoaded", initAuthPage);
// Handle logout clicks from any page
document.addEventListener("click", (event) => {
  const logoutBtn = event.target.closest('a[href="login.html"]');
  if (logoutBtn && logoutBtn.textContent.trim() === "Log Out") {
    localStorage.removeItem("im_logged_in");
  }
});