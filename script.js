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


document.addEventListener("DOMContentLoaded", () => {

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
        project.style.transitionDelay = `${index * 0.08}s`;

        revealObserver.observe(project);

    });


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













(() => {
    const terminal = document.querySelector("#contactTerminal");

    if (!terminal) return;

    const boot = terminal.querySelector("#contactBoot");
    const consoleElement = terminal.querySelector("#contactConsole");

    const progressBar = terminal.querySelector("#bootProgressBar");
    const progressPercent = terminal.querySelector("#bootPercent");

    const response = terminal.querySelector("#contactResponse");

    const commands = terminal.querySelectorAll(".contact-command");

    const form = terminal.querySelector("#contactForm");

    const cancelButton =
        terminal.querySelector("#cancelMessage");

    const reduceMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;



    let hasBooted = false;

    const bootTerminal = () => {

        if (hasBooted) return;

        hasBooted = true;

        if (reduceMotion) {

            progressBar.style.width = "100%";
            progressPercent.textContent = "100%";

            setTimeout(showConsole, 200);

            return;
        }


        let progress = 0;

        const interval = setInterval(() => {

            progress += Math.floor(
                Math.random() * 7
            ) + 3;

            if (progress >= 100) {

                progress = 100;

                clearInterval(interval);

                progressBar.style.width = "100%";
                progressPercent.textContent = "100%";

                setTimeout(
                    showConsole,
                    650
                );

                return;
            }

            progressBar.style.width =
                `${progress}%`;

            progressPercent.textContent =
                `${progress}%`;

        }, 90);
    };



    const showConsole = () => {

        boot.style.display = "none";

        consoleElement.classList.add(
            "is-visible"
        );
    };


    const showResponse = (html) => {

        response.innerHTML = html;

        response.scrollIntoView({
            behavior: reduceMotion
                ? "auto"
                : "smooth",
            block: "nearest"
        });
    };


    commands.forEach((button) => {

        button.addEventListener("click", () => {

            const command =
                button.dataset.command;


            if (command === "email") {

                showResponse(`
                    <div class="terminal-line">
                        C:\\Users\\visitor&gt; mail sebia
                    </div>

                    <p>
                        Opening email client...
                    </p>

                    <p>
                        <a href="mailto:sebiakods@gmail.com">
                            sebiakods@gmail.com
                        </a>
                    </p>
                `);

                return;
            }

            if (command === "linkedin") {

                showResponse(`
                    <div class="terminal-line">
                        C:\\Users\\visitor&gt; open linkedin
                    </div>

                    <p>
                        Opening professional profile...
                    </p>

                    <p>
                        <a
                            href="https://www.linkedin.com/in/sebiakods/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            linkedin.com/in/sebiakods
                        </a>
                    </p>
                `);

                return;
            }




            if (command === "github") {

                showResponse(`
                    <div class="terminal-line">
                        C:\\Users\\visitor&gt; open github
                    </div>

                    <p>
                        Opening repositories...
                    </p>

                    <p>
                        <a
                            href="https://github.com/sebiakods"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            github.com/sebiakods
                        </a>
                    </p>
                `);

                return;
            }


            if (command === "message") {

                showResponse(`
                    <div class="terminal-line">
                        C:\\Users\\visitor&gt; send-message
                    </div>

                    <p>
                        Initializing message interface...
                    </p>
                `);

                form.classList.add(
                    "is-visible"
                );

                setTimeout(() => {

                    const nameInput =
                        document.querySelector(
                            "#contactName"
                        );

                    if (nameInput) {
                        nameInput.focus();
                    }

                }, 300);

            }

        });

    });



    cancelButton.addEventListener(
        "click",
        () => {

            form.classList.remove(
                "is-visible"
            );

            response.innerHTML = `
                <div class="terminal-line">
                    C:\\Users\\visitor&gt; cancel
                </div>

                <p>
                    Message interface closed.
                </p>
            `;

        }
    );



    form.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            const name =
                document.querySelector(
                    "#contactName"
                ).value.trim();

            const email =
                document.querySelector(
                    "#contactEmail"
                ).value.trim();

            const message =
                document.querySelector(
                    "#contactMessage"
                ).value.trim();


            /* Basic validation */

            if (!name || !email || !message) {

                showResponse(`
                    <div class="contact-success">
                        <strong>[ERROR]</strong>
                        Please complete all fields.
                    </div>
                `);

                return;
            }


            /* Email validation */

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {

                showResponse(`
                    <div class="contact-success">
                        <strong>[ERROR]</strong>
                        Invalid email address.
                    </div>
                `);

                return;
            }


            const subject =
                encodeURIComponent(
                    `Portfolio message from ${name}`
                );

            const body =
                encodeURIComponent(
                    `Name: ${name}\n` +
                    `Email: ${email}\n\n` +
                    `Message:\n${message}`
                );


            /*
             * Replace this email address
             * with your real email.
             */

            const destination =
                `mailto:sebiakods@gmail.com` +
                `?subject=${subject}` +
                `&body=${body}`;


            /* Open mail client */

            window.location.href =
                destination;


            /* Terminal feedback */

            showResponse(`
                <div class="contact-success">
                    <strong>[OK]</strong>
                    Message prepared successfully.
                    Opening your email client...
                </div>
            `);

        }
    );


    const observer =
        new IntersectionObserver(
            (entries) => {

                entries.forEach((entry) => {

                    if (
                        entry.isIntersecting
                    ) {

                        bootTerminal();

                        observer.unobserve(
                            entry.target
                        );
                    }

                });

            },
            {
                threshold: 0.25
            }
        );


    observer.observe(terminal);

})();

