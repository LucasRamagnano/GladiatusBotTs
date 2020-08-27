function guardarLog() {
    var value = [{hola: "pepe", numero: 5},{hola: "pepa", numero: 10}];
    chrome.storage.local.set({"test": value}, function() {
        console.log('Value is set to ' + value);
    });
}

function leerLog() {
    chrome.storage.local.get(['test'], function(result) {
        console.log(result.test);
    });
}