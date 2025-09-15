// Elementreferenser
const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");
const filterBtn = document.getElementById("filterBtn");
const filterWrapper = document.querySelector(".filter-wrapper");


// ___________________________
// Filtermeny
const filterMenu = document.createElement("div");
filterMenu.id = "filterMenu";
filterMenu.classList.add("filter-menu");
filterMenu.innerHTML = `
  <h3>Välj filter:</h3>
  <label><input type="checkbox" value="email" class="filterOption"> Filtrera på e-post</label><br>
  <label><input type="checkbox" value="namn" class="filterOption"> Filtrera på namn</label><br>
  <button id="applyFilter">Tillämpa</button>
`;
document.body.appendChild(filterMenu);
const applyFilterBtn = document.getElementById("applyFilter");


// ___________________________
// Hjälpfunktioner 
// Visa eller göm element
function toggleElement(el, show, displayType = "block") {
  el.style.display = show ? displayType : "none";
}


// ___________________________
// Highlighta sökord i text
function highlightMatch(text, query) {
  if (!text || !query) return text || "";
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}


// ___________________________
// API-anrop (eller mock)
async function fetchResults(query) {
  try {
    const response = await fetch(`http://localhost:3000/search?term=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("API misslyckades, använder mock-data:", error);

    // Mock-data
    const data = [
      { firstName: "Micael", lastName: "Scofield", email: "michael@example.com" },
      { firstName: "Lincoln", lastName: "Burrows", email: "lincoln@example.com" },
      { firstName: "Sara", lastName: "Tancredi", email: "sara@example.com" },
      { firstName: "Fernando", lastName: "Sucre", email: "fernando@example.com" },
      { firstName: "Brad", lastName: "Bellick", email: "brad@example.com" },
      { firstName: "Paul", lastName: "Kellerman", email: "paul@example.com" },
      { firstName: "Alexander", lastName: "Mahone", email: "alexander@example.com" },
      { firstName: "John", lastName: "Abruzzi", email: "axel@example.com" },
      { firstName: "Theodore", lastName: "T-bag", email: "theodore@example.com" },
      { firstName: "Maricruz", lastName: "Delgado", email: "theodore@example.com" },
      { firstName: "Benjamin", lastName: "C-note", email: "benjamin@example.com" },
      { firstName: "Gretchen", lastName: "Morgan", email: "gretchen@example.com" }
    ];
    return data.filter(r =>
      (r.firstName && r.firstName.toLowerCase().includes(query)) ||
      (r.lastName && r.lastName.toLowerCase().includes(query)) ||
      (r.email && r.email.toLowerCase().includes(query))
    );
  }
}


// ___________________________
// Resultatvisning
let allResults = [];
let currentIndex = 0;
const pageSize = 5;

const showMoreBtn = document.createElement("button");
showMoreBtn.id = "showMoreBtn";
showMoreBtn.textContent = "Visa fler";
showMoreBtn.classList.add("show-more-btn");
toggleElement(showMoreBtn, false);
resultsDiv.insertAdjacentElement("afterend", showMoreBtn);

function displayResults(results, reset = true) {
  if (reset) {
    resultsDiv.innerHTML = "";
    currentIndex = 0;
    allResults = results;
  }
  const nextResults = allResults.slice(currentIndex, currentIndex + pageSize);
  currentIndex += pageSize;

  if (nextResults.length === 0 && reset) {
    resultsDiv.innerHTML = "<p>Inga resultat hittades.</p>";
    toggleElement(showMoreBtn, false);
    toggleElement(filterWrapper, false);
    toggleElement(filterBtn, false);
    return;
  }

  const query = input.value.trim().toLowerCase(); // hämtar sökorden

  nextResults.forEach(r => {
    const card = document.createElement("div");
    card.classList.add("result-card");
    card.innerHTML = `
      <h2>${highlightMatch(r.firstName, query)} ${highlightMatch(r.lastName, query)}</h2>
      <p>E-post: ${highlightMatch(r.email, query) || 'Ej tillgänglig'}</p>
    `;
    resultsDiv.appendChild(card);
  });

  toggleElement(showMoreBtn, currentIndex < allResults.length);
  toggleElement(filterWrapper, allResults.length > 0, "flex");
  toggleElement(filterBtn, allResults.length > 0, "inline-block");
}

showMoreBtn.addEventListener("click", () => displayResults(allResults, false));


// ___________________________
// Sök-historik
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

const historyDropdown = document.createElement("div");
historyDropdown.id = "historyDropdown";
historyDropdown.classList.add("history-dropdown");
document.body.appendChild(historyDropdown);

function updateHistoryPosition() {
  const rect = input.getBoundingClientRect();
  historyDropdown.style.top = `${rect.bottom + window.scrollY}px`;
  historyDropdown.style.left = `${rect.left + window.scrollX}px`;
  historyDropdown.style.width = `${rect.width}px`;
}

function renderHistory() {
  historyDropdown.innerHTML = "";
  if (searchHistory.length === 0) {
    toggleElement(historyDropdown, false);
    return;
  }
  searchHistory.slice().reverse().forEach(item => {
    const div = document.createElement("div");
    div.textContent = item;
    div.classList.add("history-item");
    div.addEventListener("click", async () => {
      input.value = item;
      toggleElement(historyDropdown, false);
      await performSearch();
    });
    historyDropdown.appendChild(div);
  });
  toggleElement(historyDropdown, true);
}

function updateSearchHistory(query) {
  if (!searchHistory.includes(query)) {
    searchHistory.push(query);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }
}


// ___________________________
// Sökfunktion
async function performSearch() {
  const query = input.value.trim().toLowerCase();
  toggleElement(historyDropdown, false);

  if (query) updateSearchHistory(query);

  const results = await fetchResults(query);
  displayResults(results, true);
}

// Event listeners för historik
input.addEventListener("focus", () => {
  if (searchHistory.length > 0) {
    updateHistoryPosition();
    renderHistory();
  }
});

document.addEventListener("click", e => {
  if (!historyDropdown.contains(e.target) && e.target !== input) {
    toggleElement(historyDropdown, false);
  }
});

window.addEventListener("scroll", () => {
  if (historyDropdown.style.display === "block") {
    updateHistoryPosition();
  }
});


// ___________________________
// Filter
applyFilterBtn.addEventListener("click", async () => {
  const query = input.value.toLowerCase();
  const checkedOptions = Array.from(document.querySelectorAll(".filterOption:checked")).map(cb => cb.value);
  const results = await fetchResults(query);

  let filteredResults = [...results];
  if (checkedOptions.includes("email")) {
    filteredResults = filteredResults.filter(r => r.email && r.email.toLowerCase().includes(query));
  }
  if (checkedOptions.includes("namn")) {
    filteredResults = filteredResults.filter(r =>
      (r.firstName && r.firstName.toLowerCase().includes(query)) ||
      (r.lastName && r.lastName.toLowerCase().includes(query))
    );
  }

  displayResults(filteredResults, true);
  toggleElement(filterMenu, false);
});

filterBtn.addEventListener("click", () => {
  if (filterMenu.style.display === "block") {
    toggleElement(filterMenu, false);
  } else {
    const rect = filterBtn.getBoundingClientRect();
    filterMenu.style.top = `${rect.bottom + window.scrollY}px`;
    filterMenu.style.left = `${rect.left + window.scrollX}px`;
    toggleElement(filterMenu, true);
  }
});

// Stäng filtermenyn om man klickar utanför
document.addEventListener("click", e => {
  if (
    filterMenu.style.display === "block" && 
    !filterMenu.contains(e.target) && 
    e.target !== filterBtn
  ) {
    toggleElement(filterMenu, false);
  }
});


// ___________________________
// "Scroll-to-top" knapp
const scrollTopBtn = document.createElement("button");
scrollTopBtn.id = "scrollTopBtn";
scrollTopBtn.textContent = "↑";
document.body.appendChild(scrollTopBtn);
toggleElement(scrollTopBtn, false);

window.addEventListener("scroll", () => {
  toggleElement(scrollTopBtn, window.scrollY > 200);
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});


// ___________________________
// Formhantering
form.addEventListener("submit", async e => {
  e.preventDefault();
  await performSearch();
});

