let db;

// IndexedDB request
const request = window.indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result

    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function(event) {
    console.log(`ERROR: ${event.target.errorCode}`);
};

// Create and save pending transaction to pendingStore
function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const pendingStore = transaction.objectStore("pending");

    pendingStore.add(record);
}

// Check pendingStore for records and post to database through API, then clear pendingStore
function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const pendingStore = transaction.objectStore("pending");
    const getAll = pendingStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*", "Content-Type": "application/json"
                }
            }).then(response => response.json()).then(() => {
                const transaction = db.transaction(["pending"], "readwrite");
                const pendingStore = transaction.objectStore("pending");
                pendingStore.clear();
            });
        }
    }
}

// listen for online status to run checkDatabase
window.addEventListener("online", checkDatabase);