const EMAIL = "Ahmad.amro.dev@gmail.com";

const projects = [
  {
    title: "Notion Table Replica",
    type: "frontend",
    desc: "Pixel-focused UI replication with interactive table behaviors. Emphasis on UI states, clean components, and fast iteration.",
    links: [
      { label: "Repo", url: "https://github.com/a7amr/notion-table-replica" },
    ],
    tags: ["UI replication", "Components", "Interactions"],
  },
  {
    title: "GitHub Portfolio",
    type: "frontend",
    desc: "Selected projects + documentation showing implementation depth, structure, and maintainability.",
    links: [{ label: "GitHub", url: "https://github.com/a7amr" }],
    tags: ["Code quality", "Docs", "Structure"],
  },
  {
    title: "Hugging Face Demos",
    type: "ai",
    desc: "Deployed interactive apps showcasing end-to-end execution and user-facing UI flows.",
    links: [{ label: "Demos", url: "https://huggingface.co/a7madAmro" }],
    tags: ["Model → UI", "User flow", "Deployment"],
  },
  {
    title: "ArabCard",
    type: "production",
    desc: "Public-facing production website with responsive layout and real deployment constraints.",
    links: [{ label: "Live", url: "https://arabcard.net/" }],
    tags: ["Responsive", "Production", "Real users"],
  },
  {
    title: "MECA Engineering (Example Page)",
    type: "production",
    desc: "Structured content, navigation clarity, and SEO-friendly presentation.",
    links: [{ label: "Live", url: "https://www.mecaengineering.com/industries0" }],
    tags: ["SEO", "Content", "Navigation"],
  },
];

const elProjects = document.getElementById("projects");
const elSearch = document.getElementById("search");
const chips = Array.from(document.querySelectorAll(".chip"));
const year = document.getElementById("year");

const themeBtn = document.getElementById("themeBtn");
const copyBtn = document.getElementById("copyEmailBtn");
const toast = document.getElementById("copyToast");

year.textContent = new Date().getFullYear().toString();

let activeFilter = "all";
let activeQuery = "";

// ---------- Scroll reveal (fast) ----------
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("is-in");
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal:not(.is-in)").forEach((el) => io.observe(el));

function observeNewReveals() {
  document.querySelectorAll(".project.reveal:not(.is-in)").forEach((el) => io.observe(el));
}

// ---------- Ambient glow + section shifts + scroll intensity ----------
const glow = document.querySelector(".page-glow");
const prefersReduced =
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (glow && !prefersReduced) {
  let cx = 40, cy = 30;
  let tx = 40, ty = 30;

  const ease = 0.012;

  const sectionZones = {
    top: { x: 35, y: 25 },
    work: { x: 30, y: 55 },
    about: { x: 70, y: 55 },
    contact: { x: 55, y: 35 },
  };

  function setZoneTarget(zoneKey) {
    const z = sectionZones[zoneKey] || sectionZones.top;
    tx = z.x + (Math.random() * 10 - 5);
    ty = z.y + (Math.random() * 10 - 5);
    tx = Math.min(80, Math.max(20, tx));
    ty = Math.min(80, Math.max(20, ty));
  }

  setZoneTarget("top");

  function animate() {
    cx += (tx - cx) * ease;
    cy += (ty - cy) * ease;

    glow.style.setProperty("--mx", `${cx}%`);
    glow.style.setProperty("--my", `${cy}%`);

    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  const sectionMap = new Map([
    [document.getElementById("top"), "top"],
    [document.getElementById("work"), "work"],
    [document.getElementById("about"), "about"],
    [document.getElementById("contact"), "contact"],
  ]);

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];

      if (visible) {
        const key = sectionMap.get(visible.target);
        setZoneTarget(key);
      }
    },
    { threshold: [0.18, 0.35, 0.55] }
  );

  sectionMap.forEach((key, el) => {
    if (el) sectionObserver.observe(el);
  });

  function clamp(n, a, b) { return Math.min(b, Math.max(a, n)); }

  function updateGlowOpacity() {
    const doc = document.documentElement;
    const maxScroll = doc.scrollHeight - window.innerHeight;
    const p = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    const distFromMid = Math.abs(p - 0.5) * 2;
    const opacity = 1.0 - distFromMid * 0.22;
    glow.style.setProperty("--glowOpacity", clamp(opacity, 0.76, 1.0));
  }

  window.addEventListener("scroll", updateGlowOpacity, { passive: true });
  window.addEventListener("resize", updateGlowOpacity);
  updateGlowOpacity();
}

function matches(p) {
  const inFilter = activeFilter === "all" ? true : p.type === activeFilter;
  const q = activeQuery.trim().toLowerCase();
  if (!q) return inFilter;

  const hay = [
    p.title,
    p.type,
    p.desc,
    ...(p.tags || []),
    ...(p.links || []).map((l) => l.label),
  ]
    .join(" ")
    .toLowerCase();

  return inFilter && hay.includes(q);
}

function render() {
  const list = projects.filter(matches);

  if (!list.length) {
    elProjects.innerHTML = `
      <div class="project" style="grid-column: 1 / -1;">
        <div class="p-top">
          <div class="p-title">No matches</div>
          <div class="p-type">Tip</div>
        </div>
        <div class="p-desc">Try a different keyword or switch filters.</div>
      </div>
    `;
    return;
  }

  elProjects.innerHTML = list
    .map((p, idx) => {
      const typeLabel =
        p.type === "frontend" ? "Frontend" : p.type === "ai" ? "AI Demo" : "Production";

      const links = (p.links || [])
        .map(
          (l) =>
            `<a href="${l.url}" target="_blank" rel="noreferrer">${l.label}</a>`
        )
        .join("");

      const tags = (p.tags || []).slice(0, 3).map((t) => `<span class="tag">${t}</span>`).join("");

      return `
        <article class="project reveal" style="transition-delay:${idx * 60}ms">
          <div class="p-top">
            <div class="p-title">${p.title}</div>
            <div class="p-type">${typeLabel}</div>
          </div>
          <div class="p-desc">${p.desc}</div>
          <div class="p-links">${links}</div>
          <div class="tags">${tags}</div>
        </article>
      `;
    })
    .join("");

  observeNewReveals();
}

chips.forEach((c) => {
  c.addEventListener("click", () => {
    chips.forEach((x) => x.classList.remove("is-active"));
    c.classList.add("is-active");
    activeFilter = c.dataset.filter;
    render();
  });
});

elSearch.addEventListener("input", (e) => {
  activeQuery = e.target.value || "";
  render();
});

// Theme
function setTheme(mode) {
  document.documentElement.dataset.theme = mode;
  localStorage.setItem("theme", mode);
  toast.textContent = "";
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);

themeBtn.addEventListener("click", () => {
  const current = document.documentElement.dataset.theme || "dark";
  setTheme(current === "dark" ? "light" : "dark");
});

// Copy email
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(EMAIL);
    toast.textContent = "Email copied.";
    setTimeout(() => (toast.textContent = ""), 1400);
  } catch {
    toast.textContent = "Copy failed — email: " + EMAIL;
    setTimeout(() => (toast.textContent = ""), 2200);
  }
});

render();

