const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");
const filterBtn = document.getElementById("filterBtn");
const categoryScroll = document.getElementById("categoryScroll");

// Mockdata
const fakeResults = [
  { title: "Fil 1", description: "Detta är en testfil med metadata." },
  { title: "Fil 2", description: "Här är en annan fil med info." },
  { title: "Bok om metadata", description: "ISBN 123-456, testdata" },
];

// Skapa filtermeny
const filterMenu = document.createElement("div");
filterMenu.id = "filterMenu";
filterMenu.classList.add("filter-menu");
filterMenu.innerHTML = `
  <h3>Välj filter:</h3>
  <label><input type="checkbox" value="fil" class="filterOption"> Endast filer</label><br>
  <label><input type="checkbox" value="bok" class="filterOption"> Endast böcker</label><br>
  <button id="applyFilter">Tillämpa</button>
`;
document.body.appendChild(filterMenu);
const applyFilterBtn = document.getElementById("applyFilter");


// Funktion för att söka
function performSearch() {
  const query = input.value.toLowerCase().trim();
  resultsDiv.innerHTML = "";

  // Visa eller göm filtersektionen
  const filterWrapper = document.querySelector(".filter-wrapper");
  if (query !== "") {
    filterWrapper.classList.add("visible");
    filterBtn.style.display = "inline-block"; // Visa knappen
  } else {
    filterWrapper.classList.remove("visible");
    filterBtn.style.display = "none"; // Dölj knappen
  }

  // Filtrera resultat
  const results = fakeResults.filter(r =>
    r.title.toLowerCase().includes(query) ||
    r.description.toLowerCase().includes(query)
  );

  // Visa resultat
  if (results.length === 0) {
    resultsDiv.innerHTML = "<p>Inga resultat hittades.</p>";
    return;
  }

  results.forEach(r => {
    const card = document.createElement("div");
    card.classList.add("result-card");
    card.innerHTML = `<h2>${r.title}</h2><p>${r.description}</p>`;
    resultsDiv.appendChild(card);
  });
}

// Starta sök när formuläret skickas
form.addEventListener("submit", function(event) {
  event.preventDefault();
  performSearch();
});

// Visa/göm filtermenyn
filterBtn.addEventListener("click", function() {
  if (filterMenu.style.display === "block") {
    filterMenu.style.display = "none";
  } else {
    const rect = filterBtn.getBoundingClientRect();
    filterMenu.style.top = rect.bottom + window.scrollY + "px";
    filterMenu.style.left = rect.left + window.scrollX + "px";
    filterMenu.style.display = "block";
  }
});

// Tillämpa filter
applyFilterBtn.addEventListener("click", function() {
  const checkedOptions = Array.from(
    document.querySelectorAll(".filterOption:checked")
  ).map(cb => cb.value.toLowerCase());

  const query = input.value.toLowerCase();
  const filteredResults = fakeResults.filter(r => {
    const matchesSearch =
      r.title.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query);

    if (checkedOptions.length === 0) return matchesSearch;

    return checkedOptions.some(opt =>
      r.title.toLowerCase().includes(opt)
    );
  });

  resultsDiv.innerHTML = "";
  if (filteredResults.length === 0) {
    resultsDiv.innerHTML = "<p>Inga filtrerade resultat hittades.</p>";
    return;
  }

  filteredResults.forEach(r => {
    const card = document.createElement("div");
    card.classList.add("result-card");
    card.innerHTML = `<h2>${r.title}</h2><p>${r.description}</p>`;
    resultsDiv.appendChild(card);
  });

  // Göm menyn efter att filtren tillämpats
  filterMenu.style.display = "none";
});