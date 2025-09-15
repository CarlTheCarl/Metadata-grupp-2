// search-function
async function search() {
    const query = document.getElementById('searchInput').value;
    const response = await fetch(`http://localhost:3000/search?term=${query}`);
    const results = await response.json();

    // document.getElementById('results').innerHTML = JSON.stringify(await results);
}

// // Beutify results
// async function cards(headline, infotext) {
  
// }