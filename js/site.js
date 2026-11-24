(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var revealNodes = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    revealNodes.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    revealNodes.forEach(function (el) {
      var siblings = el.parentElement.querySelectorAll(":scope > .reveal");
      var index = Array.prototype.indexOf.call(siblings, el);
      if (index < 0) index = 0;
      el.style.setProperty("--d", (index * 70) + "ms");
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealNodes.forEach(function (el) { observer.observe(el); });
  }

  document.querySelectorAll("[data-tabs]").forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll("[role='tab']"));
    var panels = Array.prototype.slice.call(root.querySelectorAll("[role='tabpanel']"));
    if (!tabs.length || !panels.length) return;

    function activate(id) {
      tabs.forEach(function (tab) {
        var on = tab.getAttribute("aria-controls") === id;
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (panel) {
        var on = panel.id === id;
        if (on) {
          panel.classList.remove("is-active");
          void panel.offsetWidth;
        }
        panel.classList.toggle("is-active", on);
        panel.hidden = !on;
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var id = tab.getAttribute("aria-controls");
        activate(id);
        if (history.replaceState) {
          history.replaceState(null, "", "#" + id);
        }
      });
    });

    var hash = (location.hash || "").replace("#", "");
    var known = panels.some(function (panel) { return panel.id === hash; });
    activate(known ? hash : panels[0].id);
  });

  var dialog = document.getElementById("lightbox");
  var shots = Array.prototype.slice.call(document.querySelectorAll("[data-shot]"));
  if (dialog && shots.length && typeof dialog.showModal === "function") {
    var frames = dialog.querySelectorAll(".lb-frame img");
    var caption = dialog.querySelector("[data-caption]");
    var front = 0;
    var current = 0;

    function show(index) {
      current = (index + shots.length) % shots.length;
      var shot = shots[current];
      var next = front === 0 ? 1 : 0;
      var incoming = frames[next];
      incoming.src = shot.getAttribute("data-full");
      incoming.alt = shot.getAttribute("data-alt") || "";
      incoming.classList.add("is-front");
      frames[front].classList.remove("is-front");
      front = next;
      if (caption) caption.textContent = incoming.alt;
    }

    shots.forEach(function (shot, index) {
      shot.addEventListener("click", function () {
        show(index);
        dialog.showModal();
      });
    });

    dialog.querySelector("[data-prev]").addEventListener("click", function () {
      show(current - 1);
    });
    dialog.querySelector("[data-next]").addEventListener("click", function () {
      show(current + 1);
    });
    dialog.querySelector("[data-close]").addEventListener("click", function () {
      dialog.close();
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("cancel", function () {});
  }

  var form = document.getElementById("demo-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var status = document.getElementById("form-status");
      if (status) {
        status.hidden = false;
        status.textContent = "This is a demo form. Nothing was sent.";
      }
    });
  }
})();
