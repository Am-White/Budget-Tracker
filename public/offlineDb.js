// db file for functionality offline

let db;

// Create a new db request for a offlineDb database.
const request = window.indexedDB.open("offlineDb", 1);


request.onupgradeneeded = function (event) {
    db = event.target.result;
    const objectStore = db.createObjectStore("pending", {autoIncrement: true});
}

// if success
request.onsuccess = function (event) {
    db = event.target.result;
    if (navigator.onLine) {
        checkDatabase();
    }
}

// if error
request.onerror = function (event) {
    console.log("Error: " + event)
}

// saveRecord
function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const pendingStore = transaction.objectStore("pending");
    pendingStore.add(record);
}

// checkDatabase
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