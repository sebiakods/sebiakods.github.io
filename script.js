(() => {
  const term = document.querySelector(".about .term");
  if (!term) return;

  const body = term.querySelector(".term__body");
  const blocks = [...term.querySelectorAll(".block")];

  if (!body || !blocks.length) return;

  const cursor = document.createElement("span");
  cursor.className = "cursor";
  cursor.setAttribute("aria-hidden", "true");

  const reduce = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const lastTyped = blocks[blocks.length - 1].querySelector(".typed");

  // =========================================================
  // IMPORTANT:
  // This script ONLY controls the terminal.
  // It does NOT touch the hero section or .hero-title.
  // =========================================================

  if (reduce || !("IntersectionObserver" in window)) {
    if (lastTyped) lastTyped.after(cursor);
    return;
  }

  // Keep original height so the page does not jump
  body.style.minHeight = `${body.offsetHeight}px`;

  // Store the original terminal content
  const steps = blocks.map(block => {
    const typed = block.querySelector(".typed");

    if (!typed) {
      return {
        block,
        typed: null,
        cmd: "",
        out: null,
        p: null,
        pText: "",
        items: []
      };
    }

    const cmd = typed.textContent.trim();
    typed.textContent = "";

    const out = block.querySelector(".out");
    const p = out ? out.querySelector("p") : null;

    const pText = p
      ? p.textContent.replace(/\s+/g, " ").trim()
      : "";

    if (p) p.textContent = "";

    const items = out
      ? [...out.querySelectorAll(".tree li")]
      : [];

    return {
      block,
      typed,
      cmd,
      out,
      p,
      pText,
      items
    };
  });

  term.classList.add("is-typing", "is-armed");

  // =========================================================
  // TIMING
  // =========================================================

  let skipped = false;
  const waiters = new Set();

  const sleep = ms => {
    if (skipped) return Promise.resolve();

    return new Promise(resolve => {
      const done = () => {
        clearTimeout(timer);
        waiters.delete(done);
        resolve();
      };

      const timer = setTimeout(done, ms);
      waiters.add(done);
    });
  };

  const rand = (min, max) =>
    min + Math.random() * (max - min);

  async function type(el, text, min, max) {
    if (!el) return;

    for (const char of text) {
      el.textContent += char;
      await sleep(rand(min, max));
    }
  }

  // Clicking terminal skips animation
  term.addEventListener("click", () => {
    skipped = true;

    [...waiters].forEach(fn => fn());
  });

  // =========================================================
  // PLAY TERMINAL ANIMATION
  // =========================================================

  async function play() {
    term.classList.remove("is-armed");
    term.classList.add("is-booting");

    const removeBooting = e => {
      if (e.target === term) {
        term.classList.remove("is-booting");
        term.removeEventListener(
          "animationend",
          removeBooting
        );
      }
    };

    term.addEventListener("animationend", removeBooting);

    // First prompt
    const first = steps[0];

    if (first.block) {
      first.block.classList.add("is-shown");

      if (first.typed) {
        first.typed.after(cursor);
      }
    }

    await sleep(900);

    // All terminal commands
    for (const step of steps) {
      step.block.classList.add("is-shown");

      if (step.typed) {
        step.typed.after(cursor);

        await sleep(rand(200, 350));

        await type(
          step.typed,
          step.cmd,
          35,
          75
        );
      }

      if (!step.out) continue;

      await sleep(rand(250, 400));

      cursor.remove();

      step.out.classList.add("is-shown");

      if (step.p) {
        await type(
          step.p,
          step.pText,
          8,
          18
        );
      }

      for (const li of step.items) {
        li.classList.add("is-shown");
        await sleep(110);
      }

      await sleep(320);
    }

    // Restore normal height
    body.style.minHeight = "";

    term.classList.remove("is-typing");
  }

  // =========================================================
  // START ONLY ONCE
  // =========================================================

  const io = new IntersectionObserver(
    entries => {
      const entry = entries[0];

      if (!entry.isIntersecting) return;

      io.disconnect();

      play();
    },
    {
      threshold: 0.3
    }
  );

  io.observe(term);
})();