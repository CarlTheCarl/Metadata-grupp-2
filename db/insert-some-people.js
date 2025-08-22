let aLotOfPeople = [
    {
      "firstName": "Ty"
    },
    {
      "firstName": "Abigael"
    },
    {
      "firstName": "Gus"
    },
    {
      "firstName": "Brunhilda"
    },
    {
      "firstName": "Amble"
    },
    {
      "firstName": "Ted"
    },
    {
      "firstName": "Rolf"
    },
    {
      "firstName": "Hastings"
    },
    {
      "firstName": "Chas"
    },
    {
      "firstName": "Hephzibah"
    },
    {
      "firstName": "Valera"
    },
    {
      "firstName": "Goldina"
    },
    {
      "firstName": "Erskine"
    },
    {
      "firstName": "Kat"
    },
    {
      "firstName": "Gracia"
    },
    {
      "firstName": "Jasun"
    },
    {
      "firstName": "Rogerio"
    },
    {
      "firstName": "Clarissa"
    },
    {
      "firstName": "Kattie"
    },
    {
      "firstName": "Julienne"
    },
    {
      "firstName": "Juline"
    },
    {
      "firstName": "Rolph"
    },
    {
      "firstName": "Rock"
    },
    {
      "firstName": "Cinnamon"
    },
    {
      "firstName": "Evey"
    },
    {
      "firstName": "Ram"
    },
    {
      "firstName": "Nicola"
    },
    {
      "firstName": "Neil"
    },
    {
      "firstName": "Kean"
    },
    {
      "firstName": "Casar"
    },
    {
      "firstName": "Byron"
    },
    {
      "firstName": "Hogan"
    },
    {
      "firstName": "Goldina"
    },
    {
      "firstName": "Veronika"
    },
    {
      "firstName": "Tabbi"
    },
    {
      "firstName": "Yevette"
    },
    {
      "firstName": "Celestyna"
    },
    {
      "firstName": "Jolee"
    },
    {
      "firstName": "Drusi"
    },
    {
      "firstName": "Josee"
    },
    {
      "firstName": "Phillip"
    },
    {
      "firstName": "Judd"
    },
    {
      "firstName": "Whitman"
    },
    {
      "firstName": "Jessika"
    },
    {
      "firstName": "Stevena"
    },
    {
      "firstName": "Garey"
    },
    {
      "firstName": "Jenda"
    },
    {
      "firstName": "Alessandro"
    },
    {
      "firstName": "Jerrie"
    },
    {
      "firstName": "Henrik"
    },
    {
      "firstName": "Mirilla"
    },
    {
      "firstName": "Alanson"
    },
    {
      "firstName": "Matthaeus"
    },
    {
      "firstName": "Stephan"
    },
    {
      "firstName": "Emera"
    },
    {
      "firstName": "Standford"
    },
    {
      "firstName": "Verine"
    },
    {
      "firstName": "Lawton"
    },
    {
      "firstName": "Clari"
    },
    {
      "firstName": "Shaw"
    },
    {
      "firstName": "Frederich"
    },
    {
      "firstName": "Ruby"
    },
    {
      "firstName": "Tyson"
    },
    {
      "firstName": "Elga"
    },
    {
      "firstName": "Heddie"
    },
    {
      "firstName": "Cherlyn"
    },
    {
      "firstName": "Dorrie"
    },
    {
      "firstName": "Abby"
    },
    {
      "firstName": "Brant"
    },
    {
      "firstName": "Bibby"
    },
    {
      "firstName": "Philip"
    },
    {
      "firstName": "Worthington"
    },
    {
      "firstName": "Efrem"
    },
    {
      "firstName": "Hilly"
    },
    {
      "firstName": "Waldo"
    },
    {
      "firstName": "Rafa"
    },
    {
      "firstName": "Candie"
    },
    {
      "firstName": "Portia"
    },
    {
      "firstName": "Johannes"
    },
    {
      "firstName": "Gussie"
    },
    {
      "firstName": "Lelah"
    },
    {
      "firstName": "Ron"
    },
    {
      "firstName": "Marlow"
    },
    {
      "firstName": "Oralia"
    },
    {
      "firstName": "Talyah"
    },
    {
      "firstName": "Tawsha"
    },
    {
      "firstName": "Fernanda"
    },
    {
      "firstName": "Oralia"
    },
    {
      "firstName": "Garrard"
    },
    {
      "firstName": "Fraze"
    },
    {
      "firstName": "Malynda"
    }
  ]


  // Import the database driver
import mysql from 'mysql2/promise';

// Create a connection 'db' to the database
const db = await mysql.createConnection({
    host:'161.97.144.27', 
    port: 'PLEASE CHANGE TO YOUR OWN DB:s PORT',
    user: 'root', 
    password: 'PLEASE CHANGE TO YOUR OWN DB:s PASSWORD',
    database: 'test'
});

// A small function for a query
async function query(sql){
    let result = await db.execute(sql);
    return result[0];
 
 }

 console.log(aLotOfPeople.length)
for(let person of aLotOfPeople){
    let result = await query(
      'INSERT INTO persons (name) VALUES ("' + person.firstName +'")'
    );
    console.log(result);
}