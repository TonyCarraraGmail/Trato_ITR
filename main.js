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

  /* ── Tipo de devedor: alternar campos PF / PJ ── */
  const tipoPF = document.getElementById("tipoPF");
  const tipoPJ = document.getElementById("tipoPJ");
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
  const cpfInput    = document.getElementById("cpf");
  const cnpjInput   = document.getElementById("cnpj");

  if (celularInput) maskPhone(celularInput);
  if (cpfInput)    maskCPF(cpfInput);
  if (cnpjInput)   maskCNPJ(cnpjInput);

  /* ── Form validation & submission ── */
  const consultaForm = document.getElementById("consultaForm");
  const formSuccess  = document.getElementById("formSuccess");

  function setError(el, errorEl, show) {
    el.classList.toggle("error", show);
    errorEl.classList.toggle("visible", show);
    return show;
  }

  if (consultaForm) {
    consultaForm.addEventListener("submit", function (e) {
      e.preventDefault();
      let valid = true;
      const isPF = tipoPF.checked;
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (isPF) {
        // Nome
        const nome = document.getElementById("nomePF");
        if (setError(nome, document.getElementById("nomePFError"), !nome.value.trim())) valid = false;

        // CPF (11 dígitos)
        const cpf = document.getElementById("cpf");
        if (setError(cpf, document.getElementById("cpfError"), cpf.value.replace(/\D/g, "").length < 11)) valid = false;
      } else {
        // CNPJ (14 dígitos)
        const cnpj = document.getElementById("cnpj");
        if (setError(cnpj, document.getElementById("cnpjError"), cnpj.value.replace(/\D/g, "").length < 14)) valid = false;
      }

      // Celular
      const celular = document.getElementById("celular");
      if (setError(celular, document.getElementById("celularError"), celular.value.replace(/\D/g, "").length < 10)) valid = false;

      // Email
      const email = document.getElementById("email");
      if (setError(email, document.getElementById("emailError"), !emailRe.test(email.value.trim()))) valid = false;

      if (!valid) return;

      consultaForm.style.display = "none";
      formSuccess.classList.add("visible");
    });

    // Live: limpa erro ao digitar
    ["nomePF", "cpf", "cnpj", "celular", "email"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", () => {
        el.classList.remove("error");
        document.getElementById(id + "Error").classList.remove("visible");
      });
    });
  }

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
