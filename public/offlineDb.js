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

//Saving the record
function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const pendingStore = transaction.objectStore("pending");
    pendingStore.add(record);
}
// checkDatabase - when back online post saved transactions and clear indexedDB
function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const pendingStore = transaction.objectStore("pending");
    const getAll = pendingStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*', 'Content-Type': 'application/json',

                },
            })
            .then((response) => response.json())
            .then(() => {
                // open transaction on pending db, access pending object store and clear all items 
                const transaction = db.transaction(["pending"], "readwrite");
                const objectStore = transaction.objectStore("pending");
                objectStore.clear();
            });
        }
    };
}
// listener
window.addEventListener('online', checkDatabase);