import { search, SafeSearchType, searchImages } from 'duck-duck-scrape';
// import * as DDG from 'duck-duck-scrape';

const searchQuery = "hej";

// const searchResults = await search(searchQuery, {
//   safeSearch: SafeSearchType.OFF
// });

const searchResults = await searchImages(searchQuery
    // SafeSearchType.OFF
);

console.log(searchResults);