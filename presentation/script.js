const form = document.getElementById("searchForm"); // Hittar formuläret
const input = document.getElementById("searchInput"); // Hittar sökfältet
const resultsDiv = document.getElementById("results"); // Div där resultat visas
const filterBtn = document.getElementById("filterBtn"); // Filtreringsknappen

// Mockdata
const fakeResults = [
  { title: "Fil 1", description: "Detta är en testfil med metadata." },
  { title: "Fil 2", description: "Här är en annan fil med info." },
  { title: "Bok om metadata", description: "ISBN 123-456, testdata" },
];

// Skapa filtermenyn dynamiskt
const filterMenu = document.createElement("div");
filterMenu.id = "filterMenu";
filterMenu.classList.add("filter-menu");
filterMenu.innerHTML = `
  <h3>Välj filter:</h3>
  <label><input type="checkbox" value="fil" class="filterOption"> Endast filer</label><br>
  <label><input type="checkbox" value="bok" class="filterOption"> Endast böcker</label><br>
  <button id="applyFilter">Tillämpa</button>
`;
document.body.appendChild(filterMenu); // Lägg till i body

const applyFilterBtn = document.getElementById("applyFilter");

// Funktion som kör själva sökningen
function performSearch() {
  const query = input.value.toLowerCase();
  resultsDiv.innerHTML = "";

  if (input.value.trim() !== "") {
    filterBtn.style.display = "inline-block"; // visa filterknappen när något söks
  }

  // Filtrera data efter titel eller beskrivning
  const results = fakeResults.filter(r =>
    r.title.toLowerCase().includes(query) ||
    r.description.toLowerCase().includes(query)
  );

  if (results.length === 0) {
    resultsDiv.innerHTML = "<p>Inga resultat hittades.</p>";
    return;
  }

  // Resultatkort
  results.forEach(r => {
    const card = document.createElement("div");
    card.classList.add("result-card");
    card.innerHTML = `<h2>${r.title}</h2><p>${r.description}</p>`;
    resultsDiv.appendChild(card);
  });
}

// Kör sökningen när formuläret skickas (enter, sök-knappen)
form.addEventListener("submit", function(event) {
  event.preventDefault();
  performSearch();
});

// Visa/göm filtermeny när filterknappen klickas
filterBtn.addEventListener("click", function() {
  if (filterMenu.style.display === "block") {
    filterMenu.style.display = "none";
  } else {
    // Placera menyn nära sökfältet
    const rect = filterBtn.getBoundingClientRect();
    filterMenu.style.top = rect.bottom + window.scrollY + "px";
    filterMenu.style.left = rect.left + window.scrollX + "px";
    filterMenu.style.display = "block";
  }
});

// När Tillämpa klickas i menyn
applyFilterBtn.addEventListener("click", function() {
  const checkedOptions = Array.from(document.querySelectorAll(".filterOption:checked"))
                             .map(cb => cb.value.toLowerCase());

  const query = input.value.toLowerCase();

  const filteredResults = fakeResults.filter(r => {
    let matchesSearch = r.title.toLowerCase().includes(query) || r.description.toLowerCase().includes(query);

    if (checkedOptions.length === 0) return matchesSearch; // inga filter valda, visa allt
    let matchesFilter = false;
    checkedOptions.forEach(opt => {
      if (r.title.toLowerCase().includes(opt)) matchesFilter = true;
    });

    return matchesSearch && matchesFilter;
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

  // stäng menyn efter filtrering
  filterMenu.style.display = "none"; 
});
