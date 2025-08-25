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



