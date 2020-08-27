class ControladorDeEstado {
    constructor() {
        this.keysToLoad = [];
    }
    guardarObjeto(key, objeto) {
        let objToSave = {};
        objToSave[key] = JSON.stringify(objeto);
        chrome.storage.local.set(objToSave, () => console.log(objToSave));
    }
    loadObjeto(key) {
        chrome.storage.local.get(key, (cargado) => console.log(cargado));
    }
    loadEstado() {
        chrome.storage.local.get(Keys.TAREAS, (cargado) => {
            let expe = JSON.parse(cargado[Keys.TAREAS]);
            let tareasParseada = expe.map(e => (new guardables[e.tipo_class]).fromJsonString(e));
            console.log(tareasParseada);
        });
    }
}
