// Elementreferenser, hämtar HTML-element som vi kommer att jobba med
const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");
const filterBtn = document.getElementById("filterBtn");
const categoryScroll = document.getElementById("categoryScroll");

// Skapar en filtermeny
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


// Funktion för att hämta resultat från API:et, skickar sökfrågan till backend
// och retunerar resultatet i JSON
async function fetchResults(query) {
  try {
    const response = await fetch(`http://localhost:3000/search?term=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const results = await response.json();
    return results;
  } catch (error) {
    console.error("Något gick fel vid sökning:", error);
    return [];
  }
}

/*
 // Mock-data för att se om det nya scriptet fungerar
async function fetchResults(query) {
  const data = [
    { firstName: "John", lastName: "Johnsson", email: "john@example.com" },
    { firstName: "Axel", lastName: "Axelsson", email: "axel@example.com" }
  ];

  return data.filter(r =>
    (r.firstName && r.firstName.toLowerCase().includes(query)) ||
    (r.lastName && r.lastName.toLowerCase().includes(query)) ||
    (r.email && r.email.toLowerCase().includes(query))
  );
}
/** */

// Funktion för att visa resultat
function displayResults(results) {
  resultsDiv.innerHTML = "";
  if (results.length === 0) {
    resultsDiv.innerHTML = "<p>Inga resultat hittades.</p>";
    return;
  }

  results.forEach(r => {
    const card = document.createElement("div");
    card.classList.add("result-card");
    card.innerHTML = `
      <h2>${r.firstName || ''} ${r.lastName || ''}</h2>
      <p>E-post: ${r.email || 'Ej tillgänglig'}</p>
    `;
    resultsDiv.appendChild(card);
  });
}

// Sökfunktion, hanterar sökfältets värde, anropar APIet och visar resultat
async function performSearch() {
  const query = input.value.toLowerCase().trim();
  const filterWrapper = document.querySelector(".filter-wrapper");

// Visar filtrera knappen om det finns ett resultat
  if (query !== "") {
    filterWrapper.classList.add("visible");
    filterBtn.style.display = "inline-block";
  } else {
    filterWrapper.classList.remove("visible");
    filterBtn.style.display = "none";
  }

// Hämta och visa resultat
  const results = await fetchResults(query);
  displayResults(results);
}

// När användaren trycker "Sök", stoppas sidladdningen och vår egen sökfunktion körs
form.addEventListener("submit", async function(event) {
  event.preventDefault();
  await performSearch();
});

// Visa/göm filtermenyn
filterBtn.addEventListener("click", function() {
  if (filterMenu.style.display === "block") {
    filterMenu.style.display = "none";
  } else {
    const rect = filterBtn.getBoundingClientRect();
    filterMenu.style.top = `${rect.bottom + window.scrollY}px`;
    filterMenu.style.left = `${rect.left + window.scrollX}px`;
    filterMenu.style.display = "block";
  }
});

// Tillämpa filter
applyFilterBtn.addEventListener("click", async function() {
  const query = input.value.toLowerCase();
  const checkedOptions = Array.from(
    document.querySelectorAll(".filterOption:checked")
  ).map(cb => cb.value);

  const results = await fetchResults(query);
  let filteredResults = [...results];

// Filtrera på e-post
  if (checkedOptions.includes("email")) {
    filteredResults = filteredResults.filter(r => r.email && r.email.toLowerCase().includes(query));
  }

// filtrera på namn
  if (checkedOptions.includes("namn")) {
    filteredResults = filteredResults.filter(r =>
      (r.firstName && r.firstName.toLowerCase().includes(query)) ||
      (r.lastName && r.lastName.toLowerCase().includes(query))
    );}

// visa filtrerade resultat
  displayResults(filteredResults);
  filterMenu.style.display = "none";
});

