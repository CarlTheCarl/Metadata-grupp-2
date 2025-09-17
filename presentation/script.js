// Elementreferenser
const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");
const filterBtn = document.getElementById("filterBtn");
const filterWrapper = document.querySelector(".filter-wrapper");

// Variabler för att hålla koll vilken den valda kategorin är
let selectedCategory = null; // håller koll på det tekniska namnet (pictures, pdfs, movies, etc)
let selectedCategoryName = null; // håller koll på användarvänliga namnet, det som visas i webbläsaren (bilder, dokument, etc)

// ___________________________
// Filtreringsalternativ per kategori
const categoryFilters = {
  Bilder: ["Filnamn", "Metadata"],
  Böcker: ["Titel", "Författare (förnamn)", "Författare (efternamn)", "Genre", "ISBN"],
  Musik: ["Titel", "Artist", "Album", "Genre"],
  Filmer: ["Titel", "Regissör", "Genre", "IMDB-ID"],
  Dokument: ["Filnamn", "Textinnehåll", "Metadata"]
};

// ___________________________
// Dynamiskt skapande så man slipper HTML och lätt kan lägga till eller ta bort knappar senare
// Med unika ID kan man lätt lägga till event listeners = enklare att styra
// Filtermeny 
const filterMenu = document.createElement("div"); // skapar elementet 
filterMenu.id = "filterMenu"; // ger det ett uniikt ID så att man lätt kan hitta och styra den senare
filterMenu.classList.add("filter-menu"); // lägger till en CSS-klass sp man kan styla den
document.body.appendChild(filterMenu); // så att den blir synlig i webbläsaren

// Tillämpa-knapp
const applyFilterBtn = document.createElement("button");
applyFilterBtn.id = "applyFilter"; 
applyFilterBtn.textContent = "Tillämpa";
filterMenu.appendChild(applyFilterBtn);

// Återställ-knapp
const resetFilterBtn = document.createElement("button");
resetFilterBtn.id = "resetFilter";
resetFilterBtn.textContent = "Återställ";
filterMenu.appendChild(resetFilterBtn);

// ___________________________
// Hjälpfunktioner
// Visa eller göm element, med detta räcker det att skriva true eller false för att visa eller gömma element
function toggleElement(el, show, displayType = "block") { // el = html element, show = boolean (true = visas/false = göms), displayType = valfri
  el.style.display = show ? displayType : "none"; // om show är true --> el.style.display = displayType || om show är false --> el.style.display = "none" 
}
// Highlighta sökord i text
function highlightMatch(text, query) { 
  if (!text || !query) return text || ""; // om text eller sökord är tomt = markera inget
  
  // som en avancerad sökfunktion som letar efter ALLA matchningar. 
  const regex = new RegExp(`(${query})`, "gi"); // "gi": g (global) = leta efter alla matchningar, i (case-insensitive) = skilja inte på stora/små bokstäver
  return text.replace(regex, "<mark>$1</mark>"); // makera orden, $1 ska representera sökordet som markeras
} // utan regex = mycket längre kod


// ___________________________
// Syfte: Uppdatera filtreringsmenyn baserat på vald kategori
function updateFilterMenu(category) {
  filterMenu.innerHTML = `<h3>${category ? `Filtrera på (${category}):` : "Välj filter:"}</h3>`; // lägger till ny rubrik i filtreringsmenyn, t.ex "Filtrera på (Bilder)"
  
  // om ingen kategori är vald så ska menyn visa generella filter: 
  if (!category) { 
    const excludeDropdownLabel = document.createElement("label"); //skapar en label med texten "Exkludera kategorier" i fetstil (<strong>)
    excludeDropdownLabel.innerHTML = `<strong>Exkludera kategorier:</strong>`;
    filterMenu.appendChild(excludeDropdownLabel);
    filterMenu.appendChild(document.createElement("br")); // "br": lägger till en radbrytning efter labeln
    
    // Dropdown för att exkludera kategorier
    const excludeDropdownContainer = document.createElement("div"); // skapar en container 
    excludeDropdownContainer.className = "exclude-dropdown-container"; 

    const excludeDropdownButton = document.createElement("button"); // skapar en knapp
    excludeDropdownButton.type = "button";
    excludeDropdownButton.textContent = "Välj kategorier att exkludera"; // texten på knappen
    excludeDropdownButton.className = "exclude-dropdown-button";

    const excludeDropdownContent = document.createElement("div");
    excludeDropdownContent.id = "excludeDropdownContent"; // skapar en dold meny som visas när användaren klickar på knappen

    // Syfte: lägger till checkboxar för varje kategori i dropdown-menyn 
    ["Bilder", "Böcker", "Musik", "Filmer", "Dokument"].forEach(cat => { // loopar igenom listan
      const label = document.createElement("label"); 
      label.innerHTML = `
        <input type="checkbox" value="${cat}" class="excludeCategory"> ${cat}`;  // för varje kategori skapa en checkbox med kategorins namn som värde
      excludeDropdownContent.appendChild(label); // lägg till checkboxen i ID:et excludeDropdownContent
    });

    // lägger till en klick-hanterare på knappen som visar/gömmer dropdown vid klick på den
    excludeDropdownButton.addEventListener("click", () => {
      if (excludeDropdownContent.style.display === "block") {
        excludeDropdownContent.style.display = "none";
      } else {
        excludeDropdownContent.style.display = "block";
      }
    });

    excludeDropdownContainer.appendChild(excludeDropdownButton);  // lägger till knappen 
    excludeDropdownContainer.appendChild(excludeDropdownContent); // och menyn i exclude dropdown containern
    filterMenu.appendChild(excludeDropdownContainer);             // lägger till containern i filterMenu för bättre stuktur då alla filter ligger samlade där

    // Skapar en label för datumfiltret
    const dateLabel = document.createElement("label");
    dateLabel.innerHTML = `<strong>Datum (år):</strong><br>`;
    filterMenu.appendChild(dateLabel);

    // skapar en range slider och dess innehåll
    const dateSlider = document.createElement("input"); 
    dateSlider.type = "range";
    dateSlider.min = "1900";
    dateSlider.max = "2025";
    dateSlider.value = "2000";
    dateSlider.className = "filter-slider";
    dateSlider.id = "dateSlider";
    filterMenu.appendChild(dateSlider);

    // visar det valda året i en span och lägger till radbrytning (<br>) under slidern 
    const dateValue = document.createElement("span");
    dateValue.id = "dateValue";
    dateValue.textContent = `Valt år: ${dateSlider.value}`;
    filterMenu.appendChild(dateValue);
    filterMenu.appendChild(document.createElement("br"));

    // Filstorlek, likt datum range slider
    const sizeLabel = document.createElement("label");
    sizeLabel.innerHTML = `<strong>Filstorlek (MB):</strong><br>`;
    filterMenu.appendChild(sizeLabel);

    const sizeSlider = document.createElement("input");
    sizeSlider.type = "range";
    sizeSlider.min = "0";
    sizeSlider.max = "100";
    sizeSlider.value = "10";
    sizeSlider.className = "filter-slider";
    sizeSlider.id = "sizeSlider";
    filterMenu.appendChild(sizeSlider);

    const sizeValue = document.createElement("span");
    sizeValue.id = "sizeValue";
    sizeValue.textContent = `Vald storlek: ${sizeSlider.value} MB`;
    filterMenu.appendChild(sizeValue);
    filterMenu.appendChild(document.createElement("br"));

    // Sliders event listeners: för att uppdatera datum/filstorlek när användaren drar i slidern
    dateSlider.addEventListener("input", () => {
      dateValue.textContent = `Valt år: ${dateSlider.value}`;
    });
    sizeSlider.addEventListener("input", () => {
      sizeValue.textContent = `Vald storlek: ${sizeSlider.value} MB`;
    });

    // Men om en kategori är vald ska menyn visa kategorispecifika filter (filtreringsalternativen per kategori längre upp i filen)
  } else {
    categoryFilters[category].forEach(filter => {
      const label = document.createElement("label");
      label.className = "filter-option-label";
      label.innerHTML = `<input type="checkbox" value="${filter}" class="filterOption"> ${filter} <br>`; // checkbox skapas för varje kategori
      filterMenu.appendChild(label);
    });
  }
  filterMenu.appendChild(applyFilterBtn);
  filterMenu.appendChild(resetFilterBtn);
}


// ___________________________
// Mock-data för alla kategorier
function getMockData(query) {
  const mockData = [
    // Böcker
    {
      id: 1,
      book_title: "Harry Potter och De Vises Sten",
      author_first_name: "J.K.",
      author_last_name: "Rowling",
      source: "books",
      genre: "Fantasy",
      isbn: "978-9176370000",
      year: 1997,
      size: 5
    },
    {
      id: 2,
      book_title: "Sagan om Ringen",
      author_first_name: "J.R.R.",
      author_last_name: "Tolkien",
      source: "books",
      genre: "Fantasy",
      isbn: "978-9177010000",
      year: 1954,
      size: 8
    },
    {
      id: 15,
      book_title: "1984",
      author_first_name: "George",
      author_last_name: "Orwell",
      source: "books",
      genre: "Dystopian",
      isbn: "978-0451524935",
      year: 1949,
      size: 6
    },
    // Filmer
    {
      id: 3,
      imdb_id: "tt0111161",
      title: "The Shawshank Redemption",
      director: "Frank Darabont",
      source: "movies",
      genre: "Drama",
      year: 1994,
      size: 200
    },
    {
      id: 4,
      imdb_id: "tt0068646",
      title: "The Godfather",
      director: "Francis Ford Coppola",
      source: "movies",
      genre: "Crime",
      year: 1972,
      size: 150
    },
    {
      id: 14,
      imdb_id: "tt0108052",
      title: "Pulp Fiction",
      director: "Quentin Tarantino",
      source: "movies",
      genre: "Crime",
      year: 1994,
      size: 180
    },
    // Musik
    {
      id: 5,
      title: "Bohemian Rhapsody",
      artists: "Queen",
      album: "A Night at the Opera",
      source: "sounds",
      genre: "Rock",
      year: 1975,
      size: 12
    },
    {
      id: 6,
      title: "Imagine",
      artists: "John Lennon",
      album: "Imagine",
      source: "sounds",
      genre: "Pop",
      year: 1971,
      size: 10
    },
    {
      id: 13,
      title: "Smells Like Teen Spirit",
      artists: "Nirvana",
      album: "Nevermind",
      source: "sounds",
      genre: "Grunge",
      year: 1991,
      size: 11
    },
    // Bilder
    {
      id: 7,
      filename: "sunset.jpg",
      all_metadata: "Solnedgång över havet, taget 2023-08-15, Canon EOS R5, f/8, 1/250s, ISO 100",
      source: "pictures",
      year: 2023,
      size: 5
    },
    {
      id: 8,
      filename: "mountain.png",
      all_metadata: "Bergstoppar i Alperna, taget 2023-07-20, Sony A7 III, f/11, 1/125s, ISO 200",
      source: "pictures",
      year: 2023,
      size: 8
    },
    {
      id: 11,
      filename: "forest.jpg",
      all_metadata: "Skog i höstfärger, taget 2023-10-05, Nikon D850, f/11, 1/60s, ISO 400",
      source: "pictures",
      year: 2023,
      size: 6
    },
    // Dokument (PDF)
    {
      id: 9,
      filename: "rapport_klimat.pdf",
      first_part_of_text: "En omfattande rapport om klimatförändringar och dess effekter på den globala ekonomin. Publicerad 2023-05-10.",
      source: "pdfs",
      year: 2023,
      size: 3
    },
    {
      id: 10,
      filename: "studie_tips.pdf",
      first_part_of_text: "En guide för effektiv studieteknik och tidsplanering för universitetsstudenter. Publicerad 2023-09-01.",
      source: "pdfs",
      year: 2023,
      size: 2
    },
    {
      id: 12,
      filename: "ocean.pdf",
      first_part_of_text: "En studie om havets ekosystem och dess betydelse för klimatet. Publicerad 2023-06-15.",
      source: "pdfs",
      year: 2023,
      size: 4
    },
    
  ];
  // Syfte: Filtrera mock-data baserat på sökfrågan
  const queryLower = query.toLowerCase(); // konverterar sökfrågan till små bokstäver för att göra sökningen case-insensitive
  // använder array.filter för att skapa en ny lista med endast de objekt (item) som matchar sökfrågan
  return mockData.filter(item => {
    return (
      // kollar om någon av objektets egenskaper innehåller sökfrågan
      // "||" = logiken är om något av villkoren är true så inkluderas objektet i resultatet 
      (item.book_title && item.book_title.toLowerCase().includes(queryLower)) || 
      (item.author_first_name && item.author_first_name.toLowerCase().includes(queryLower)) ||
      (item.author_last_name && item.author_last_name.toLowerCase().includes(queryLower)) ||
      (item.title && item.title.toLowerCase().includes(queryLower)) ||
      (item.director && item.director.toLowerCase().includes(queryLower)) ||
      (item.artists && item.artists.toLowerCase().includes(queryLower)) ||
      (item.album && item.album.toLowerCase().includes(queryLower)) ||
      (item.filename && item.filename.toLowerCase().includes(queryLower)) ||
      (item.all_metadata && item.all_metadata.toLowerCase().includes(queryLower)) ||
      (item.first_part_of_text && item.first_part_of_text.toLowerCase().includes(queryLower)) ||
      (item.genre && item.genre.toLowerCase().includes(queryLower)) ||
      (item.isbn && item.isbn.toLowerCase().includes(queryLower)) ||
      (item.imdb_id && item.imdb_id.toLowerCase().includes(queryLower))
    );
  });
}
/*
// ___________________________
// API-anrop
async function fetchResults(query) {
  try {
    let url = `http://localhost:3000/search?term=${encodeURIComponent(query)}`; // encodeURIComponent: Konverterar söktermen så att specialtecken (t.ex. mellanslag) fungerar i URL:en
    // Om kategori är vald, lägg till kategori i url:en 
    if (selectedCategory) {
      url += `&source=${encodeURIComponent(selectedCategory)}`;
    }
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Error fetching results:", error);
    return [];
  }
}
*/
// ___________________________
// Resultatvisning
let allResults = []; // Alla sökresultat
let currentIndex = 0; // Hur många som visas just nu
const pageSize = 5; // visa 5 åt gången

const showMoreBtn = document.createElement("button"); 
showMoreBtn.id = "showMoreBtn";
showMoreBtn.textContent = "Visa fler";
showMoreBtn.classList.add("show-more-btn");
toggleElement(showMoreBtn, false); // göm knappen från början
resultsDiv.insertAdjacentElement("afterend", showMoreBtn); // lägg knappen efter/under sökresultaten

// Syfte: Återställa eller fortsätta visa resultat
function displayResults(results, reset = true) { // 
  if (reset) {
    resultsDiv.innerHTML = ""; 
    currentIndex = 0;     
    allResults = results;  
  }
// Tar ut en liten del av listan
  const nextResults = allResults.slice(currentIndex, currentIndex + pageSize);
  currentIndex += pageSize; 
  //Om det inte finns n¨gra resultat och det är en ny sökning, visa "inga resultat hittades"
  if (nextResults.length === 0 && reset) {
    resultsDiv.innerHTML = "<p>Inga resultat hittades.</p>";
    toggleElement(showMoreBtn, false); // göm 
    toggleElement(filterWrapper, false); // göm
    toggleElement(filterBtn, false); // göm för att det inte finns resultat att visa eller filtrera på
    return;
  }
// Loopar igenom resultaten och skapar ett kort för varje resultat
  const query = input.value.trim().toLowerCase();
  nextResults.forEach(r => {
    const card = document.createElement("div");
    card.classList.add("result-card");

    // Anpassa kortet baserat på kategorin (r.source)
    if (r.source === "books") {
      card.innerHTML = `
        <h2>${highlightMatch(r.book_title, query)}</h2>
        <p><strong>Författare:</strong> ${highlightMatch(r.author_first_name, query)} ${highlightMatch(r.author_last_name, query)}</p>
        <p><strong>Genre:</strong> ${highlightMatch(r.genre, query)}, <strong>ISBN:</strong> ${highlightMatch(r.isbn, query)}</p>
        <p><strong>År:</strong> ${r.year}, <strong>Storlek:</strong> ${r.size} MB</p>
      `;
    } else if (r.source === "movies") {
      card.innerHTML = `
        <h2>${highlightMatch(r.title, query)}</h2>
        <p><strong>Regissör:</strong> ${highlightMatch(r.director, query)}</p>
        <p><strong>Genre:</strong> ${highlightMatch(r.genre, query)}, <strong>IMDB-ID:</strong> ${highlightMatch(r.imdb_id, query)}</p>
        <p><strong>År:</strong> ${r.year}, <strong>Storlek:</strong> ${r.size} MB</p>
      `;
    } else if (r.source === "sounds") {
      card.innerHTML = `
        <h2>${highlightMatch(r.title, query)}</h2>
        <p><strong>Artist:</strong> ${highlightMatch(r.artists, query)}</p>
        <p><strong>Album:</strong> ${highlightMatch(r.album, query)}, <strong>Genre:</strong> ${highlightMatch(r.genre, query)}</p>
        <p><strong>År:</strong> ${r.year}, <strong>Storlek:</strong> ${r.size} MB</p>
      `;
    } else if (r.source === "pdfs") {
      card.innerHTML = `
        <h2>${highlightMatch(r.filename, query)}</h2>
        <p>${highlightMatch(r.first_part_of_text, query).substring(0, 150)}...</p>
        <p><strong>År:</strong> ${r.year}, <strong>Storlek:</strong> ${r.size} MB</p>
      `;
    } else if (r.source === "pictures") {
      card.innerHTML = `
        <h2>${highlightMatch(r.filename, query)}</h2>
        <p>${highlightMatch(r.all_metadata, query).substring(0, 150)}...</p>
        <p><strong>År:</strong> ${r.year}, <strong>Storlek:</strong> ${r.size} MB</p>
      `;
    }
    resultsDiv.appendChild(card);
  });
  toggleElement(showMoreBtn, currentIndex < allResults.length);
  toggleElement(filterWrapper, allResults.length > 0, "flex");
  toggleElement(filterBtn, allResults.length > 0, "inline-block");
}

// ___________________________
// Sökfunktion
async function performSearch() {
   // hämta söktermen och stäng ner historik-dropdown
  const query = input.value.trim().toLowerCase(); 
  toggleElement(historyDropdown, false);
  if (query) updateSearchHistory(query); // uppdatera sökhistoriken om det finns sökterm

  // API-anrop istället för mock-data
  //const results = await fetchResults(query); 

  // Mock-data istället för API-anrop
  const results = getMockData(query);

  // Filtrera resultat baserat på vald kategori
  let filteredResults = results;
  if (selectedCategory) {
    filteredResults = results.filter(result => result.source === selectedCategory);
  }
  displayResults(filteredResults, true);
}

// Sök med Enter-tangenten
input.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    await performSearch();
  }
});

// ___________________________
// Sök-historik
// Ladda historiken från webbläsarens lagring
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
// Skapa elementet
const historyDropdown = document.createElement("div"); 
historyDropdown.id = "historyDropdown";
historyDropdown.classList.add("history-dropdown");
document.body.appendChild(historyDropdown);

// Uppdaterar positionen för sökhistoriken
function updateHistoryPosition() {
  const rect = input.getBoundingClientRect(); // hämtar positinen ich storleken på sökfältet
  historyDropdown.style.top = `${rect.bottom + window.scrollY}px`; // avståndet från toppen av sidan till botten av sökfältet
  historyDropdown.style.left = `${rect.left + window.scrollX}px`; // avståndet från vänster kant av sidan till vänster kant av sökfältet
  historyDropdown.style.width = `${rect.width}px`; // bredden på sökfältet
}

// Syfte: Rendera - så att menyn alltid visar den senaste historiken och inte lägger till dubbletter
function renderHistory() {
  historyDropdown.innerHTML = ""; // töm menyn så den är ren innan nya sökningar läggs
  if (searchHistory.length === 0) { // om det inte finns någon historik, göm menyn och avsluta funktionen
    toggleElement(historyDropdown, false);
    return;

  }

  // Syfte: Så att man kan klicka på objekten som redan finns i historiken -> söka efter det direkt
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

// Uppdatera sökhistoriken
function updateSearchHistory(query) {
  if (!searchHistory.includes(query)) { // kollar om söktermen redan finns i historiken, om den inte finns lägg till den
    searchHistory.push(query); // lägger till den nya söktermen i slutet av arrayen
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory)); // spara den uppdaterade sökhistoriken i lokala lagring och omvandla till en textsträng
  }
}



// ___________________________
// Filter
applyFilterBtn.addEventListener("click", async () => {
  const query = input.value.toLowerCase();
  const checkedOptions = Array.from(document.querySelectorAll(".filterOption:checked")).map(cb => cb.value);
  const excludedCategories = Array.from(document.querySelectorAll(".excludeCategory:checked")).map(cb => cb.value);
  const dateValue = parseInt(document.getElementById("dateSlider")?.value || 2000);
  const sizeValue = parseInt(document.getElementById("sizeSlider")?.value || 10);
  // const results = await fetchResults(query); // från APIet
  const results = getMockData(query); // nu används mockdata

  // Filtrera resultat
  let filteredResults = results;
  if (selectedCategory) {
    filteredResults = results.filter(result => result.source === selectedCategory);
  }
  if (excludedCategories.length > 0 && !selectedCategory) {
    const sourceMap = {
      "pictures": "Bilder",
      "books": "Böcker",
      "sounds": "Musik",
      "movies": "Filmer",
      "pdfs": "Dokument"
    };
    filteredResults = filteredResults.filter(r =>
      !excludedCategories.includes(Object.keys(sourceMap).find(key => sourceMap[key] === r.source))
    );
  }
  if (checkedOptions.length > 0) {
    filteredResults = filteredResults.filter(r => {
      const queryLower = query.toLowerCase();
      return checkedOptions.some(option => {
        if (option === "Titel" && r.title && r.title.toLowerCase().includes(queryLower)) return true;
        if (option === "Titel" && r.book_title && r.book_title.toLowerCase().includes(queryLower)) return true;
        if (option === "Författare (förnamn)" && r.author_first_name && r.author_first_name.toLowerCase().includes(queryLower)) return true;
        if (option === "Författare (efternamn)" && r.author_last_name && r.author_last_name.toLowerCase().includes(queryLower)) return true;
        if (option === "Genre" && r.genre && r.genre.toLowerCase().includes(queryLower)) return true;
        if (option === "ISBN" && r.isbn && r.isbn.toLowerCase().includes(queryLower)) return true;
        if (option === "Artist" && r.artists && r.artists.toLowerCase().includes(queryLower)) return true;
        if (option === "Album" && r.album && r.album.toLowerCase().includes(queryLower)) return true;
        if (option === "Regissör" && r.director && r.director.toLowerCase().includes(queryLower)) return true;
        if (option === "IMDB-ID" && r.imdb_id && r.imdb_id.toLowerCase().includes(queryLower)) return true;
        if (option === "Filnamn" && r.filename && r.filename.toLowerCase().includes(queryLower)) return true;
        if (option === "Metadata" && r.all_metadata && r.all_metadata.toLowerCase().includes(queryLower)) return true;
        if (option === "Textinnehåll" && r.first_part_of_text && r.first_part_of_text.toLowerCase().includes(queryLower)) return true;
        return false;
      });
    });
  }
  if (!selectedCategory) {
    filteredResults = filteredResults.filter(r => r.year <= dateValue);
  }
  if (!selectedCategory) {
    filteredResults = filteredResults.filter(r => r.size <= sizeValue);
  }
  displayResults(filteredResults, true);
});

// ___________________________
// Återställ-knapp
resetFilterBtn.addEventListener("click", async () => {
  await performSearch();
  toggleElement(filterMenu, false);
});


// ___________________________
// Kategorival
document.querySelectorAll(".category").forEach(category => {
  category.addEventListener("click", () => {
    // Ta bort .active-klassen från alla kategorier
    document.querySelectorAll(".category").forEach(cat => {
      cat.classList.remove("active");
    });
    // Lägg till .active-klassen på den valda kategorin
    category.classList.add("active");
    const categoryName = category.textContent;
    selectedCategoryName = categoryName;
    // Mappa kategorinamn till source
    selectedCategory = categoryName === "Dokument" ? "pdfs" :
                        categoryName === "Bilder" ? "pictures" :
                        categoryName === "Musik" ? "sounds" :
                        categoryName === "Filmer" ? "movies" :
                        "books";
    updateFilterMenu(categoryName);
    // Visa filtreringsmenyn
    const rect = filterBtn.getBoundingClientRect();
    filterMenu.style.top = `${rect.bottom + window.scrollY}px`;
    filterMenu.style.left = `${rect.left + window.scrollX}px`;
    toggleElement(filterMenu, true);

    // Utför en ny sökning med den valda kategorin
    performSearch();
  });
});


// ___________________________
// Filterknapp
filterBtn.addEventListener("click", () => {
  if (filterMenu.style.display === "block") {
    toggleElement(filterMenu, false);
  } else {
    updateFilterMenu(selectedCategoryName);
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
    const excludeDropdownContent = document.getElementById("excludeDropdownContent");
    if (excludeDropdownContent && !excludeDropdownContent.contains(e.target)) {
      excludeDropdownContent.style.display = "none";
    }
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
// Visa fler-knappens event listener
showMoreBtn.addEventListener("click", () => displayResults(allResults, false));

