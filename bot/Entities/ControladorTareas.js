class ControladorTareas {
    constructor(tareas) {
        this.tareas = [];
        this.tareasFinalizadas = [];
        this.tareasCanceladas = [];
        this.tareas = tareas;
    }
    appendTarea(tarea) {
        tarea.estado = tareaEstado.enEspera;
        this.tareas.push(tarea);
    }
    ponerTareaPrimera(tarea) {
        this.tareas.filter(e => e.estado == tareaEstado.corriendo).forEach(e => e.estado = tareaEstado.enEspera);
        tarea.estado = tareaEstado.corriendo;
        this.tareas = [tarea].concat(this.tareas);
    }
    correrTareaActual() {
        let clickeableElement;
        let delayClick = 1000;
        if (this.tareas.length == 0) {
            window.setTimeout(() => {
                ($('#mainmenu > div:nth-child(1) a')[0]).click();
            }, delayClick);
        }
        else {
            clickeableElement = this.tareas[0].getProximoClick();
            clickeableElement
                .then((e) => this.guardarTareas(e))
                .then((click) => {
                window.setTimeout(() => click.click(), delayClick);
            });
        }
    }
    guardarTareas(elemento) {
        let toSave = {};
        toSave[Keys.TAREAS] = this.tareas;
        toSave[Keys.TAREAS_CANCELADAS] = this.tareasCanceladas;
        toSave[Keys.TAREAS_FINALIZADAS] = this.tareasFinalizadas;
        return new Promise((resolve) => {
            chrome.storage.local.set(toSave, () => { resolve(elemento); });
        });
    }
    preprocesarTareas() {
        let tareasACancelar = this.tareas.filter(e => e.seCancela());
        let tareasToTheEnd = this.tareas.filter(e => e.estado == tareaEstado.toTheEnd && !e.seCancela());
        let tareasFinalizada = this.tareas.filter(e => e.estado == tareaEstado.finalizada);
        let tareasEnEspera = this.tareas.filter(e => e.estado == tareaEstado.enEspera && !e.seCancela());
        let tareaCorriendo = this.tareas.filter(e => e.estado == tareaEstado.corriendo && !e.seCancela());
        tareasToTheEnd.map(e => e.estado = tareaEstado.enEspera);
        this.tareasCanceladas = this.tareasCanceladas.concat(tareasACancelar);
        this.tareasFinalizadas = this.tareasFinalizadas.concat(tareasFinalizada);
        this.tareas = tareaCorriendo.concat(tareasEnEspera).concat(tareasToTheEnd);
        if (this.tareas.length != 0)
            this.tareas[0].estado = tareaEstado.corriendo;
    }
    tiene(tarea) {
        return this.tareas.some(e => e.equals(tarea));
    }
    static loadTareas() {
        return new Promise((resolve) => {
            let keysToLoad = [Keys.TAREAS, Keys.TAREAS_CANCELADAS, Keys.TAREAS_FINALIZADAS];
            chrome.storage.local.get(keysToLoad, (resultado) => {
                let tareas = resultado[Keys.TAREAS] != undefined ? resultado[Keys.TAREAS] : [];
                let tareasF = resultado[Keys.TAREAS_FINALIZADAS] != undefined ? resultado[Keys.TAREAS_FINALIZADAS] : [];
                let tareasC = resultado[Keys.TAREAS_CANCELADAS] != undefined ? resultado[Keys.TAREAS_CANCELADAS] : [];
                let tareasCasteadas = tareas.map(e => (new guardables[e.tipo_class]).fromJsonString(e));
                let tareasCasteadasC = tareasC.map(e => (new guardables[e.tipo_class]).fromJsonString(e));
                let tareasCasteadasF = tareasF.map(e => (new guardables[e.tipo_class]).fromJsonString(e));
                let controladorTareas = new ControladorTareas();
                controladorTareas.tareasFinalizadas = tareasCasteadasF;
                controladorTareas.tareasCanceladas = tareasCasteadasC;
                controladorTareas.tareas = tareasCasteadas;
                resolve(controladorTareas);
            });
        });
    }
}
