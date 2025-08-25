const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");

const fakeResults = [
  { title: "Fil 1", description: "Detta är en testfil med metadata." },
  { title: "Fil 2", description: "Här är en annan fil med info." },
  { title: "Bok om metadata", description: "ISBN 123-456, testdata" },
];

form.addEventListener("submit", function(event) {
  event.preventDefault(); 

  const query = input.value.toLowerCase(); 
  resultsDiv.innerHTML = ""; 

  const results = fakeResults.filter(r =>
    r.title.toLowerCase().includes(query) ||
    r.description.toLowerCase().includes(query)
  );

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
});

