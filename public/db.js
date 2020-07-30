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
