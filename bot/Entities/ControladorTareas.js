var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class ControladorTareas {
    constructor(tareas) {
        this.tareas = [];
        this.tareasFinalizadas = [];
        this.tareasCanceladas = [];
        this.tareasBloqueadas = [];
        this.delayPostTask = 1000;
        this.delayPreTask = 1000;
        this.tareas = tareas;
    }
    getPronosticoClick() {
        if (this.tareas.length >= 2) {
            return this.tareas[1].getHomeClick();
        }
        else {
            return $('#mainmenu > div:nth-child(1) a')[0];
        }
    }
    appendTarea(tarea) {
        this.tareas.push(tarea);
    }
    correrTareaActual() {
        return __awaiter(this, void 0, void 0, function* () {
            let clickeableElement;
            yield this.wait(this.delayPreTask);
            if (this.tareas.length == 0) {
                clickeableElement = $('#mainmenu > div:nth-child(1) a')[0];
            }
            else {
                clickeableElement = yield this.tareas[0].getProximoClick();
            }
            yield this.guardarTareas();
            yield this.wait(this.delayPostTask);
            clickeableElement.click();
        });
    }
    guardarTareas() {
        let toSave = {};
        toSave[Keys.TAREAS] = this.tareas;
        toSave[Keys.TAREAS_CANCELADAS] = this.tareasCanceladas;
        toSave[Keys.TAREAS_FINALIZADAS] = this.tareasFinalizadas;
        toSave[Keys.TAREAS_BLOQUEADAS] = this.tareasBloqueadas;
        return new Promise((resolve) => {
            chrome.storage.local.set(toSave, () => { resolve(); });
        });
    }
    preprocesarTareas() {
        this.analizarTareasBloqueadas();
        this.ordenarTareas();
        if (this.tareas.length != 0)
            this.tareas[0].changeEstado(tareaEstado.corriendo);
    }
    tiene(tarea) {
        return this.tareas.some(e => e.equals(tarea)) || this.tareasBloqueadas.some(e => e.equals(tarea));
    }
    static loadTareas() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                let keysToLoad = [Keys.TAREAS, Keys.TAREAS_CANCELADAS, Keys.TAREAS_FINALIZADAS, Keys.TAREAS_BLOQUEADAS];
                chrome.storage.local.get(keysToLoad, (resultado) => {
                    let tareas = resultado[Keys.TAREAS] != undefined ? resultado[Keys.TAREAS] : [];
                    let tareasF = resultado[Keys.TAREAS_FINALIZADAS] != undefined ? resultado[Keys.TAREAS_FINALIZADAS] : [];
                    let tareasC = resultado[Keys.TAREAS_CANCELADAS] != undefined ? resultado[Keys.TAREAS_CANCELADAS] : [];
                    let tareasB = resultado[Keys.TAREAS_BLOQUEADAS] != undefined ? resultado[Keys.TAREAS_BLOQUEADAS] : [];
                    let tareasCasteadas = tareas.map(e => (new guardables[e.tipo_class]).fromJsonString(e));
                    let tareasCasteadasC = tareasC.map(e => (new guardables[e.tipo_class]).fromJsonString(e));
                    let tareasCasteadasF = tareasF.map(e => (new guardables[e.tipo_class]).fromJsonString(e));
                    let tareasCasteadasB = tareasB.map(e => (new guardables[e.tipo_class]).fromJsonString(e));
                    let controladorTareas = new ControladorTareas();
                    controladorTareas.tareasFinalizadas = tareasCasteadasF;
                    controladorTareas.tareasCanceladas = tareasCasteadasC;
                    controladorTareas.tareasBloqueadas = tareasCasteadasB;
                    controladorTareas.tareas = tareasCasteadas;
                    resolve(controladorTareas);
                });
            });
        });
    }
    ordenarTareas() {
        //Filter task that cant run
        let allDoableTasks = this.tareas.concat(this.tareasBloqueadas);
        let tareasACancelar = allDoableTasks.filter(e => e.seCancela());
        let tareasToTheEnd = allDoableTasks.filter(e => e.getEstado() == tareaEstado.toTheEnd && !e.seCancela());
        let tareasFinalizada = allDoableTasks.filter(e => e.getEstado() == tareaEstado.finalizada);
        let tareasCorriendo = allDoableTasks.filter(e => e.getEstado() == tareaEstado.corriendo && !e.seCancela());
        let tareasBloqueadas = allDoableTasks.filter(e => e.getEstado() == tareaEstado.bloqueada && !e.seCancela());
        let tareasNoAplicaPrioridad = tareasCorriendo.concat(tareasACancelar).concat(tareasToTheEnd).concat(tareasFinalizada).concat(tareasBloqueadas);
        //Only order the task than can run
        let tareasAplicaPrioridad = allDoableTasks.filter(tap => tareasNoAplicaPrioridad.every(tnap => !tnap.equals(tap)));
        let tareasPrioridadMuyAlta = tareasAplicaPrioridad.filter(e => e.prioridad == tareaPrioridad.MUY_ALTA);
        let tareasPrioridadAlta = tareasAplicaPrioridad.filter(e => e.prioridad == tareaPrioridad.ALTA);
        let tareasPrioridadNormal = tareasAplicaPrioridad.filter(e => e.prioridad == tareaPrioridad.NORMAL);
        let tareasPrioridadBaja = tareasAplicaPrioridad.filter(e => e.prioridad == tareaPrioridad.BAJA);
        tareasToTheEnd.map(e => e.changeEstado(tareaEstado.enEspera));
        this.tareasCanceladas = this.tareasCanceladas.concat(tareasACancelar);
        this.tareasFinalizadas = this.tareasFinalizadas.concat(tareasFinalizada);
        this.tareasBloqueadas = tareasBloqueadas;
        this.tareas = tareasCorriendo.concat(tareasPrioridadMuyAlta).concat(tareasPrioridadAlta).concat(tareasPrioridadNormal).concat(tareasPrioridadBaja).concat(tareasToTheEnd);
    }
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    getControladorPaquete() {
        return this.tareas.concat(this.tareasBloqueadas).find(e => e.equals(new ControladorDePaquetes()));
    }
    analizarTareasBloqueadas() {
        this.tareasBloqueadas.forEach(tarea => {
            if (tarea.puedeDesbloquearse()) {
                tarea.changeEstado(tareaEstado.enEspera);
            }
        });
    }
    getAllDoableTask() {
        return this.tareas.concat(this.tareasBloqueadas);
    }
}
