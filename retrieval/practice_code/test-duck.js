// import { search, safeSearch, SafeSearchType } from 'duck-duck-scrape';
import pkg from 'duck-duck-scrape';
const { search, safeSearch, SafeSearchType } = pkg;

const searchstring = ".wav"

const searchResults = await search(searchstring, {
    safeSearch: SafeSearchType.STRICT
});