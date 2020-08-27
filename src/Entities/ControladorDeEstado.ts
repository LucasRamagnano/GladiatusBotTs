class ControladorDeEstado {
    keysToLoad: String[] = []
    
    guardarObjeto(key: string, objeto: any) {
        let objToSave = {};
        objToSave[key] = JSON.stringify(objeto);
        chrome.storage.local.set(objToSave, () => console.log(objToSave));
    }

    loadObjeto(key: string) {
        chrome.storage.local.get(key, (cargado) => console.log(cargado));
    }

    loadEstado() {
        chrome.storage.local.get(Keys.TAREAS, (cargado) => {
            let expe: Guardable[] = JSON.parse(cargado[Keys.TAREAS])
            let tareasParseada: Tarea[] = 
            expe.map(e=>(new guardables[e.tipo_class]).fromJsonString(e) as Tarea);
            console.log(tareasParseada);
        });
    }
}