// Flickr demands a PRO account for API token and every endpoint demands for API token
// thus is this file obsolete
fetch('https://jsonplaceholder.typicode.com/posts/1')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
