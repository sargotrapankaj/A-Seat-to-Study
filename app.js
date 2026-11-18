/* ============================================================
   A Seat to Study — home dashboard + AI suggestion
   ============================================================ */

const SESSION_KEY = "asts_session";
const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");

/* Redirect to login if not logged in */
if (!session) {
  window.location.href = "index.html";
}

/* ---------- Spaces data ---------- */
let spaces = [
  { id: "lib-reading", name: "Central Library Reading Room", type: "Silent", capacity: 120, status: "Filling up", desc: "Large silent reading hall; best before 10am during exams.", updated: "10 min ago" },
  { id: "lib-group2", name: "Library Group Discussion Room 2", type: "Group", capacity: 8, status: "Full", desc: "Small group room with whiteboard; often booked in exam week.", updated: "5 min ago" },
  { id: "block34", name: "Block 34 Study Corner", type: "Silent", capacity: 40, status: "Free", desc: "Quiet corner near ground-floor labs; often overlooked.", updated: "just now" },
  { id: "block26", name: "Block 26 Quiet Zone", type: "Silent", capacity: 30, status: "Filling up", desc: "Popular with final-year students; good natural light.", updated: "15 min ago" },
  { id: "hostel-common", name: "Hostel Common Room Study Area", type: "Group", capacity: 20, status: "Free", desc: "Informal group study; can get noisy after 9pm.", updated: "just now" },
  { id: "block14", name: "Academic Block 14 Group Tables", type: "Group", capacity: 16, status: "Filling up", desc: "Group tables near canteen; busy at lunch.", updated: "20 min ago" }
];

/* ---------- Welcome text ---------- */
document.getElementById("welcomeText").textContent =
  `Welcome, ${session.name.split(" ")[0]} — ${session.spacePref === "Both" ? "silent & group" : session.spacePref.toLowerCase()} study spaces.`;

/* ---------- DOM ---------- */
const cardGrid = document.getElementById("cardGrid");
const filters = document.getElementById("filters");
const spaceSelect = document.getElementById("spaceSelect");
const reportForm = document.getElementById("reportForm");
const reportMsg = document.getElementById("reportMsg");
const logoutBtn = document.getElementById("logoutBtn");
const aiBtn = document.getElementById("aiBtn");
const aiResult = document.getElementById("aiResult");

/* ---------- Helpers ---------- */
function statusClass(status) {
  if (status === "Free") return "Free";
  if (status === "Filling up") return "Filling";
  return "Full";
}

/* ---------- Render cards ---------- */
function renderCards(filter = "all") {
  cardGrid.innerHTML = "";
  const visible = spaces.filter(s =>
    filter === "all" ? true : s.type.toLowerCase() === filter
  );

  if (!visible.length) {
    cardGrid.innerHTML = '<p class="muted">No spaces match this filter.</p>';
    return;
  }

  visible.forEach(space => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${space.name}</h3>
      <p class="card-type">${space.type} · seats ${space.capacity}</p>
      <div class="status-row">
        <span class="dot ${statusClass(space.status)}"></span>
        <span>${space.status}</span>
      </div>
      <p class="updated">Last updated: ${space.updated}</p>
    `;
    cardGrid.appendChild(card);
  });
}

/* ---------- Filters ---------- */
filters.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderCards(btn.dataset.filter);
});

/* ---------- Report dropdown ---------- */
function populateSelect() {
  spaceSelect.innerHTML = '<option value="">-- choose a space --</option>';
  spaces.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = `${s.name} (${s.type})`;
    spaceSelect.appendChild(opt);
  });
}

/* ---------- Report form ---------- */
reportForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = spaceSelect.value;
  const status = reportForm.querySelector('input[name="status"]:checked');

  if (!id || !status) { alert("Please choose a space and a status."); return; }

  const space = spaces.find(s => s.id === id);
  if (space) { space.status = status.value; space.updated = "just now"; }

  renderCards(document.querySelector(".filter-btn.active").dataset.filter);
  populateSelect();
  reportMsg.hidden = false;
  setTimeout(() => { reportMsg.hidden = true; }, 3000);
  reportForm.reset();
});

/* ---------- AI suggestion (rule-based, prototype) ---------- */
function aiSuggest() {
  const pref = session.spacePref; // "Silent" | "Group" | "Both"

  // 1. Filter by preference
  let candidates = spaces.filter(s => {
    if (pref === "Both") return true;
    return s.type === pref;
  });

  if (!candidates.length) {
    candidates = spaces;
  }

  // 2. Score: Free > Filling up > Full, and larger capacity preferred
  const score = (s) => {
    let pts = 0;
    if (s.status === "Free") pts += 100;
    else if (s.status === "Filling up") pts += 50;
    else pts += 0;
    pts += Math.min(s.capacity, 100) * 0.2;
    return pts;
  };

  candidates.sort((a, b) => score(b) - score(a));
  const best = candidates[0];

  const reason =
    best.status === "Free"
      ? "It's currently free and usually less crowded."
      : best.status === "Filling up"
      ? "It's filling up but still has space — go soon."
      : "Everything is full; this one is still your best bet (large capacity).";

  aiResult.innerHTML = `
    <div class="ai-pick">
      <h3>${best.name}</h3>
      <p class="card-type">${best.type} · seats ${best.capacity}</p>
      <div class="status-row">
        <span class="dot ${statusClass(best.status)}"></span>
        <span>${best.status}</span>
      </div>
      <p class="ai-reason">${reason}</p>
    </div>
  `;
}

aiBtn.addEventListener("click", aiSuggest);

/* ---------- Logout ---------- */
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "index.html";
});

/* ---------- Init ---------- */
renderCards();
populateSelect();