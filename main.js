/* ============================================================
   TRATO AGRO – main.js
   ============================================================ */

(function () {
  "use strict";

  /* ── Navbar: scroll shadow ── */
  const navbar = document.getElementById("navbar");
  const onScroll = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ── Mobile menu toggle ── */
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  navToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("open");
    navToggle.classList.toggle("active", open);
    navToggle.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  });

  // Close mobile menu when a link is clicked
  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      navToggle.classList.remove("active");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  /* ── Dropdown: click-toggle on mobile, hover on desktop ── */
  const debitosToggle = document.getElementById("debitosToggle");
  const dropdown = debitosToggle.closest(".dropdown");

  debitosToggle.addEventListener("click", (e) => {
    if (window.innerWidth <= 640) {
      e.preventDefault();
      dropdown.classList.toggle("open");
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("open");
    }
  });

  /* ── Smooth scroll offset for fixed navbar ── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const id = this.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset =
        target.getBoundingClientRect().top +
        window.scrollY -
        (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--navbar-height")) || 70) -
        16;
      window.scrollTo({ top: offset, behavior: "smooth" });
    });
  });

  /* ══════════════════════════════════════════════
     FORM CARD – Fluxo multi-etapas
     1. Formulário  2. OTP  3. Loading  4. Resultado
  ══════════════════════════════════════════════ */

  // Elementos de tela
  const screenForm    = document.getElementById("screenForm");
  const screenOTP     = document.getElementById("screenOTP");
  const screenLoading = document.getElementById("screenLoading");
  const screenResult  = document.getElementById("screenResult");
  const progressBar   = document.getElementById("fcProgressBar");

  function showScreen(screen, progress) {
    [screenForm, screenOTP, screenLoading, screenResult].forEach((s) => {
      if (s) s.style.display = "none";
    });
    if (screen) screen.style.display = "";
    if (progressBar) progressBar.style.width = progress + "%";
  }

  /* ── Tipo de devedor: alternar campos PF / PJ ── */
  const tipoPF   = document.getElementById("tipoPF");
  const tipoPJ   = document.getElementById("tipoPJ");
  const fieldsPF = document.getElementById("fieldsPF");
  const fieldsPJ = document.getElementById("fieldsPJ");

  function toggleTipo() {
    const isPF = tipoPF.checked;
    fieldsPF.style.display = isPF ? "" : "none";
    fieldsPJ.style.display = isPF ? "none" : "";
  }

  if (tipoPF && tipoPJ) {
    tipoPF.addEventListener("change", toggleTipo);
    tipoPJ.addEventListener("change", toggleTipo);
  }

  /* ── Máscaras ── */
  function maskPhone(el) {
    el.addEventListener("input", function () {
      let v = this.value.replace(/\D/g, "").slice(0, 11);
      if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
      else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
      else if (v.length > 0) v = `(${v}`;
      this.value = v;
    });
  }

  function maskCPF(el) {
    el.addEventListener("input", function () {
      let v = this.value.replace(/\D/g, "").slice(0, 11);
      if (v.length > 9) v = `${v.slice(0,3)}.${v.slice(3,6)}.${v.slice(6,9)}-${v.slice(9)}`;
      else if (v.length > 6) v = `${v.slice(0,3)}.${v.slice(3,6)}.${v.slice(6)}`;
      else if (v.length > 3) v = `${v.slice(0,3)}.${v.slice(3)}`;
      this.value = v;
    });
  }

  function maskCNPJ(el) {
    el.addEventListener("input", function () {
      let v = this.value.replace(/\D/g, "").slice(0, 14);
      if (v.length > 12) v = `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5,8)}/${v.slice(8,12)}-${v.slice(12)}`;
      else if (v.length > 8) v = `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5,8)}/${v.slice(8)}`;
      else if (v.length > 5) v = `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5)}`;
      else if (v.length > 2) v = `${v.slice(0,2)}.${v.slice(2)}`;
      this.value = v;
    });
  }

  const celularInput = document.getElementById("celular");
  const cpfInput     = document.getElementById("cpf");
  const cnpjInput    = document.getElementById("cnpj");

  if (celularInput) maskPhone(celularInput);
  if (cpfInput)     maskCPF(cpfInput);
  if (cnpjInput)    maskCNPJ(cnpjInput);

  /* ── Helpers de validação ── */
  function setError(el, errorEl, show) {
    el.classList.toggle("error", show);
    errorEl.classList.toggle("visible", show);
    return show;
  }

  ["nomePF", "cpf", "cnpj", "celular", "email"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => {
      el.classList.remove("error");
      const errEl = document.getElementById(id + "Error");
      if (errEl) errEl.classList.remove("visible");
    });
  });

  /* ── ETAPA 1: Submit do formulário → ir para OTP ── */
  const consultaForm = document.getElementById("consultaForm");

  if (consultaForm) {
    consultaForm.addEventListener("submit", function (e) {
      e.preventDefault();
      let valid = true;
      const isPF = tipoPF.checked;
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (isPF) {
        const nome = document.getElementById("nomePF");
        if (setError(nome, document.getElementById("nomePFError"), !nome.value.trim())) valid = false;
        const cpf = document.getElementById("cpf");
        if (setError(cpf, document.getElementById("cpfError"), cpf.value.replace(/\D/g, "").length < 11)) valid = false;
      } else {
        const cnpj = document.getElementById("cnpj");
        if (setError(cnpj, document.getElementById("cnpjError"), cnpj.value.replace(/\D/g, "").length < 14)) valid = false;
      }

      const celular = document.getElementById("celular");
      if (setError(celular, document.getElementById("celularError"), celular.value.replace(/\D/g, "").length < 10)) valid = false;

      const email = document.getElementById("email");
      if (setError(email, document.getElementById("emailError"), !emailRe.test(email.value.trim()))) valid = false;

      if (!valid) return;

      // Exibe o celular mascarado na tela OTP e abre a tela
      const digits = celular.value.replace(/\D/g, "");
      const masked = `(${digits.slice(0,2)}) *****-${digits.slice(7)}`;
      document.getElementById("otpPhone").textContent = masked;
      document.getElementById("otpError").style.display = "none";
      showScreen(screenOTP, 50);
      document.querySelector(".otp-digit").focus();
      startOTPTimer();
    });
  }

  /* ── ETAPA 2: OTP ── */
  const otpDigits = document.querySelectorAll(".otp-digit");
  const otpError  = document.getElementById("otpError");

  // Navegacao automática entre dígitos
  otpDigits.forEach((input, i) => {
    input.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "").slice(-1);
      otpError.style.display = "none";
      if (this.value && i < otpDigits.length - 1) otpDigits[i + 1].focus();
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Backspace" && !this.value && i > 0) otpDigits[i - 1].focus();
    });

    input.addEventListener("paste", function (e) {
      e.preventDefault();
      const paste = (e.clipboardData || /** @type {any} */ (window).clipboardData).getData("text").replace(/\D/g, "").slice(0, 6);
      [...paste].forEach((ch, idx) => { if (otpDigits[idx]) otpDigits[idx].value = ch; });
      const next = Math.min(paste.length, otpDigits.length - 1);
      otpDigits[next].focus();
    });
  });

  // Timer de reenvio
  let timerInterval;
  function startOTPTimer() {
    let secs = 60;
    const timerEl = document.getElementById("otpTimer");
    const resendBtn = document.getElementById("btnResendOTP");
    resendBtn.disabled = true;
    clearInterval(timerInterval);

    timerEl.textContent = `(${secs}s)`;
    timerInterval = setInterval(() => {
      secs--;
      timerEl.textContent = secs > 0 ? `(${secs}s)` : "";
      if (secs <= 0) {
        clearInterval(timerInterval);
        resendBtn.disabled = false;
      }
    }, 1000);
  }

  const btnResend = document.getElementById("btnResendOTP");
  if (btnResend) {
    btnResend.addEventListener("click", () => {
      otpDigits.forEach((d) => (d.value = ""));
      otpError.style.display = "none";
      otpDigits[0].focus();
      startOTPTimer();
    });
  }

  // Confirmação do OTP → Loading → Resultado
  const btnConfirmOTP = document.getElementById("btnConfirmOTP");
  if (btnConfirmOTP) {
    btnConfirmOTP.addEventListener("click", () => {
      const code = [...otpDigits].map((d) => d.value).join("");

      if (code.length < 6) {
        otpError.style.display = "block";
        otpError.textContent = "Digite os 6 dígitos do código.";
        return;
      }

      // Simula validação OTP (qualquer código de 6 dígitos é aceito no demo)
      clearInterval(timerInterval);
      showScreen(screenLoading, 75);
      runLoadingSequence();
    });
  }

  /* ── ETAPA 3: Loading ── */
  function runLoadingSequence() {
    const label = document.getElementById("loadingLabel");
    const steps = [
      { text: "Consultando bases da Receita Federal...", delay: 1200 },
      { text: "Verificando débitos de ITR...", delay: 1000 },
      { text: "Calculando encargos atualizados...", delay: 900 },
    ];

    let i = 0;
    function next() {
      if (i >= steps.length) {
        showScreen(screenResult, 100);
        return;
      }
      label.textContent = steps[i].text;
      setTimeout(() => { i++; next(); }, steps[i - 1]?.delay ?? steps[0].delay);
    }
    // corrige o índice: começa no 0
    i = 0;
    label.textContent = steps[0].text;
    i = 1;
    setTimeout(() => next(), steps[0].delay);
  }

  /* ── ETAPA 4: Resultado – botões ── */
  const btnVerDetalhes = document.getElementById("btnVerDetalhes");
  const btnRegularizar = document.getElementById("btnRegularizar");
  const btnParcela     = document.getElementById("btnParcela");

  [btnVerDetalhes, btnRegularizar, btnParcela].forEach((btn) => {
    if (btn) btn.addEventListener("click", () => { window.location.href = "#como-funciona"; });
  });

  /* ── Intersection Observer: fade-in sections ── */
  if ("IntersectionObserver" in window) {
    const style = document.createElement("style");
    style.textContent = `
      .fade-in { opacity: 0; transform: translateY(24px); transition: opacity 0.55s ease, transform 0.55s ease; }
      .fade-in.visible { opacity: 1; transform: translateY(0); }
    `;
    document.head.appendChild(style);

    const targets = document.querySelectorAll(
      ".step-card, .parcela-card, .why-item, .security-item, .about-block, .faq-item, .itr-block"
    );

    targets.forEach((el) => el.classList.add("fade-in"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    targets.forEach((el) => observer.observe(el));
  }
})();
