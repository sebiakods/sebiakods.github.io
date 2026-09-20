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

  if (reduce || !("IntersectionObserver" in window)) {
    if (lastTyped) lastTyped.after(cursor);
    return;
  }

  body.style.minHeight = `${body.offsetHeight}px`;
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
  term.addEventListener("click", () => {
    skipped = true;

    [...waiters].forEach(fn => fn());
  });
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
    body.style.minHeight = "";

    term.classList.remove("is-typing");
  }

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
(() => {
    const section = document.querySelector(".skills");
    if (!section) return;

    const grid = section.querySelector(".skills__grid");
    const cards = [...section.querySelectorAll(".skill-card")];

    if (!grid || !cards.length) return;

    const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


    if (reduce || !("IntersectionObserver" in window)) {
        cards.forEach(card => {
            card.classList.add("is-loaded");
        });

        return;
    }

    const status = document.createElement("div");

    status.className = "skills__status";

    status.innerHTML = `
        <span class="skills__prompt">$</span>
        <span class="skills__command">skills --scan</span>
        <span class="skills__cursor" aria-hidden="true"></span>
    `;

    grid.parentNode.insertBefore(status, grid);


    const progress = document.createElement("div");

    progress.className = "skills__progress";

    progress.innerHTML = `
        <div class="skills__progress-info">
            <span>loading modules</span>
            <span class="skills__percentage">0%</span>
        </div>

        <div class="skills__progress-track">
            <span class="skills__progress-fill"></span>
        </div>
    `;

    status.appendChild(progress);

    const fill = progress.querySelector(
        ".skills__progress-fill"
    );

    const percentage = progress.querySelector(
        ".skills__percentage"
    );

    cards.forEach(card => {
        card.classList.add("is-armed");
    });


    const sleep = ms =>
        new Promise(resolve => setTimeout(resolve, ms));

    const random = (min, max) =>
        min + Math.random() * (max - min);

    let played = false;

    async function play() {

        if (played) return;

        played = true;

        section.classList.add("is-scanning");

        await sleep(500);

        /* Type command */

        const command =
            status.querySelector(".skills__command");

        const originalCommand = command.textContent;

        command.textContent = "";

        for (const char of originalCommand) {
            command.textContent += char;

            await sleep(
                random(35, 70)
            );
        }

        await sleep(350);

        for (let i = 0; i < cards.length; i++) {

            const card = cards[i];

            card.classList.remove("is-armed");
            card.classList.add("is-loading");

            const percent = Math.round(
                ((i + 1) / cards.length) * 100
            );

            fill.style.width = `${percent}%`;
            percentage.textContent = `${percent}%`;

            await sleep(180);

            card.classList.remove("is-loading");
            card.classList.add("is-loaded");

            await sleep(140);
        }

        await sleep(300);

        status.classList.add("is-complete");

        const cursor =
            status.querySelector(".skills__cursor");

        if (cursor) {
            cursor.remove();
        }

        const commandLine =
            status.querySelector(".skills__command");

        commandLine.textContent =
            "skills --scan complete";

        await sleep(500);

        section.classList.remove("is-scanning");
    }
    const observer =
        new IntersectionObserver(
            entries => {

                const entry = entries[0];

                if (!entry.isIntersecting) return;

                observer.disconnect();

                play();
            },
            {
                threshold: 0.2
            }
        );

    observer.observe(section);

})();