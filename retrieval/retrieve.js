import axios from 'axios';

async function duckDuckGoSearch(query) {
  const response = await axios.get('https://duckduckgo.com/', {
    params: { q: query },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    }
  });
  return response.data;
}

const searchQuery = "rapport hej pdf";
const results = await duckDuckGoSearch(searchQuery);
console.log(results);
