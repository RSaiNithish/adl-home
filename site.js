(function () {
  const header = document.querySelector(".site-header");
  const themeButton = document.querySelector(".theme-toggle");
  const toggle = document.querySelector(".nav-toggle");
  const panel = document.getElementById("menu");
  const progress = document.getElementById("progress");
  const memo = document.getElementById("memo");
  const form = document.getElementById("waitlist-form");
  const railLinks = Array.from(document.querySelectorAll(".rail a"));
  const sections = railLinks
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  function setMenu(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.textContent = open ? "Close" : "Menu";
    document.body.style.overflow = open ? "hidden" : "";
  }

  function applyTheme(theme, persist) {
    const light = theme === "light";
    document.documentElement.setAttribute("data-theme", light ? "light" : "dark");
    themeButton.textContent = light ? "Dark" : "Light";
    themeButton.setAttribute("aria-pressed", light ? "true" : "false");
    themeButton.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
    const color = document.querySelector('meta[name="theme-color"]');
    if (color) color.setAttribute("content", light ? "#f4f0e6" : "#090908");
    const icon = document.querySelector('link[rel="icon"]');
    if (icon) icon.setAttribute("href", light ? "logo-light.png" : "logo-dark.png");
    if (persist) {
      try { localStorage.setItem("adl-theme", light ? "light" : "dark"); } catch (e) {}
    }
  }

  applyTheme(document.documentElement.getAttribute("data-theme") || "dark", false);
  themeButton.addEventListener("click", function () {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    applyTheme(current === "light" ? "dark" : "light", true);
  });

  toggle.addEventListener("click", function () {
    setMenu(panel.hidden);
  });

  panel.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { setMenu(false); });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !panel.hidden) setMenu(false);
  });

  function onScroll() {
    const root = document.documentElement;
    const max = root.scrollHeight - root.clientHeight;
    const ratio = max > 0 ? root.scrollTop / max : 0;
    progress.style.transform = "scaleX(" + ratio + ")";

    const mark = window.scrollY + header.offsetHeight + 32;
    let current = sections[0];
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top + window.scrollY <= mark) current = section;
    });
    railLinks.forEach(function (link) {
      link.classList.toggle("is-on", current && link.getAttribute("href") === "#" + current.id);
    });
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  if (memo && "IntersectionObserver" in window) {
    const memoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        memoObserver.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    memoObserver.observe(memo);
  } else if (memo) {
    memo.classList.add("in");
  }

  document.querySelectorAll("[data-hl]").forEach(function (item) {
    const ids = item.dataset.hl.split(" ");
    function mark(on) {
      ids.forEach(function (id) {
        const node = document.getElementById(id);
        if (node) node.classList.toggle("hot", on);
      });
    }
    item.addEventListener("mouseenter", function () { mark(true); });
    item.addEventListener("mouseleave", function () { mark(false); });
    item.addEventListener("focus", function () { mark(true); });
    item.addEventListener("blur", function () { mark(false); });
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const message = document.getElementById("form-message");
    const button = form.querySelector("button");
    const email = form.querySelector("input[type=email]").value;
    button.disabled = true;
    button.textContent = "Sending";
    message.className = "form-note";
    message.textContent = "";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: email })
      });
      if (response.ok) {
        message.textContent = "Received. We’ll reply about the trial.";
        message.classList.add("ok");
        form.reset();
      } else {
        message.textContent = "Something went wrong. Try again.";
        message.classList.add("bad");
      }
    } catch (error) {
      message.textContent = "Network error. Try again.";
      message.classList.add("bad");
    }

    button.disabled = false;
    button.textContent = "Request a memo";
  });
})();
