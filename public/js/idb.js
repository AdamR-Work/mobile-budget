//Global
let db;

const request = indexedDB.open('mobile-budget', 1);

// Requests
request.onupgradeneeded = function(event){
    const db = event.target.result;
    db.createObjectStore('new-budget', {autoIncrement: true});
};
request.onsuccess = function(event){
    db = event.target.result;
        if(navigator.onLine){
            uploadBudget();
        }
};
request.onerror = function(event){
    console.log(event.target.errorCode);
};
// APP Functions
//  SAVES THE DEPOSIT in the indexDB
function saveRecord(record){
    const transaction = db.transaction(['new-budget'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new-budget');
    budgetObjectStore.add(record);
    
}
//  SAVES THE DEPOSIT in the APPs Storage
function uploadBudget(){
    const transaction = db.transaction(['new-budget'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new-budget');
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function(){
        if(getAll.result.length >0){
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message){
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new-budget'], 'readwrite');
                const budgetObjectStore = transaction.objectStore('new-budget');

                budgetObjectStore.clear();
                alert("Data saved offline has now been sent");
            })
            .catch(err =>{
                console.log(err);
            });
        };
    };
};
// When the Browser realizes its online it will attempt to upload the data that was offline.
window.addEventListener('online', uploadBudget);