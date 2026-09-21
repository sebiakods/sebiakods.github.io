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
/* =========================================================
   FEATURED PROJECTS
   - Scroll reveal
   - Metric counters
   - Project image cursor
   - Architecture animation
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /*
    =========================================================
    1. SCROLL REVEAL
    =========================================================
    */

    const projects = document.querySelectorAll(".project");

    if (!projects.length) return;

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {

            entries.forEach((entry) => {

                if (!entry.isIntersecting) return;

                entry.target.classList.add("is-visible");

                observer.unobserve(entry.target);

            });

        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -80px 0px"
        }
    );


    projects.forEach((project, index) => {

        // Slight delay between projects
        project.style.transitionDelay = `${index * 0.08}s`;

        revealObserver.observe(project);

    });


    /*
    =========================================================
    2. METRIC COUNTERS
    =========================================================
    */

    const counters = document.querySelectorAll("[data-count]");

    const counterObserver = new IntersectionObserver(
        (entries, observer) => {

            entries.forEach((entry) => {

                if (!entry.isIntersecting) return;

                const element = entry.target;

                const target = parseFloat(
                    element.dataset.count
                );

                const duration = 1400;

                const start = performance.now();

                function updateCounter(currentTime) {

                    const elapsed = currentTime - start;

                    const progress = Math.min(
                        elapsed / duration,
                        1
                    );

                    // Smooth ease-out
                    const eased =
                        1 - Math.pow(1 - progress, 4);

                    const current =
                        target * eased;

                    /*
                    Keep decimal for 69.1
                    but integers for 10,000 / 146 / 4
                    */

                    if (target % 1 !== 0) {

                        element.textContent =
                            current.toFixed(1);

                    } else {

                        element.textContent =
                            Math.floor(current)
                                .toLocaleString();

                    }

                    if (progress < 1) {

                        requestAnimationFrame(
                            updateCounter
                        );

                    } else {

                        if (target % 1 !== 0) {

                            element.textContent =
                                target.toFixed(1);

                        } else {

                            element.textContent =
                                target.toLocaleString();

                        }

                    }

                }

                requestAnimationFrame(updateCounter);

                observer.unobserve(element);

            });

        },
        {
            threshold: 0.5
        }
    );


    counters.forEach((counter) => {

        counterObserver.observe(counter);

    });


    /*
    =========================================================
    3. PROJECT IMAGE FOLLOW CURSOR
    =========================================================
    */

    const imageAreas =
        document.querySelectorAll(".js-project-image");

    imageAreas.forEach((area) => {

        const cursor =
            area.querySelector(".project__cursor");

        if (!cursor) return;


        area.addEventListener("mousemove", (event) => {

            const rect =
                area.getBoundingClientRect();

            const x =
                event.clientX - rect.left;

            const y =
                event.clientY - rect.top;

            /*
            Offset by half the cursor size
            so the circle is centered on pointer.
            */

            cursor.style.transform =
                `translate(${x - 37}px, ${y - 37}px) scale(1)`;

        });


        area.addEventListener("mouseenter", () => {

            cursor.style.opacity = "1";

        });


        area.addEventListener("mouseleave", () => {

            cursor.style.opacity = "0";

            cursor.style.transform =
                "translate(-50%, -50%) scale(.5)";

        });

    });


    /*
    =========================================================
    4. ARCHITECTURE LINE REVEAL
    =========================================================
    */

    const architecture =
        document.querySelectorAll(".architecture");

    const architectureObserver =
        new IntersectionObserver(
            (entries, observer) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting) return;

                    const lines =
                        entry.target.querySelectorAll(
                            ".architecture__line"
                        );

                    lines.forEach((line, index) => {

                        line.style.transform =
                            "scaleX(0)";

                        line.style.transition =
                            `
                            transform
                            ${0.45}s
                            cubic-bezier(.16,1,.3,1)
                            ${index * 0.12}s
                            `;

                        requestAnimationFrame(() => {

                            line.style.transform =
                                "scaleX(1)";

                        });

                    });

                    observer.unobserve(entry.target);

                });

            },
            {
                threshold: 0.35
            }
        );


    architecture.forEach((item) => {

        architectureObserver.observe(item);

    });


    /*
    =========================================================
    5. SUBTLE IMAGE PARALLAX
    =========================================================
    */

    const visualAreas =
        document.querySelectorAll(
            ".project__image-wrapper, .wildfire__visual"
        );

    visualAreas.forEach((area) => {

        const image =
            area.querySelector(".project__image");

        if (!image) return;


        area.addEventListener("mousemove", (event) => {

            /*
            Don't use parallax on small screens.
            */

            if (window.innerWidth < 900) return;

            const rect =
                area.getBoundingClientRect();

            const x =
                (event.clientX - rect.left)
                / rect.width;

            const y =
                (event.clientY - rect.top)
                / rect.height;

            const moveX =
                (x - 0.5) * 8;

            const moveY =
                (y - 0.5) * 8;

            image.style.transform =
                `scale(1.055) translate(${moveX}px, ${moveY}px)`;

        });


        area.addEventListener("mouseleave", () => {

            image.style.transform =
                "scale(1.02) translate(0, 0)";

        });

    });

});