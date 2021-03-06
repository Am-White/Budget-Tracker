//Database for functionality of offline usage
let db;

const request = window.indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;
    const objectStore = db.createObjectStore("pending", {autoIncrement: true});

}

request.onsuccess = function (event) {
    db = event.target.result;
    if (navigator.onLine) {
        checkDatabase();
    }
}
//If error = message
request.onerror = function (event) {
    console.log("Error: " + event)
}