class ControladorTareas {
    tareas: Tarea[] = [];
    tareasFinalizadas: Tarea[] = [];
    tareasCanceladas: Tarea[] = [];
    tareasBloqueadas: Tarea[] = [];

    constructor();
    constructor(tareas?:Tarea[]) {
        this.tareas = tareas;
    }

    getPronosticoClick() {
        if(this.tareas.length >= 2) {
            return this.tareas[1].getHomeClick();
        }else {
            return $('#mainmenu > div:nth-child(1) a')[0];
        }
    }

    appendTarea(tarea: Tarea): void {
        tarea.estado = tareaEstado.enEspera;
        this.tareas.push(tarea);
    }

    ponerTareaPrimera(tarea: Tarea): void {
        this.tareas.filter(e=>e.estado == tareaEstado.corriendo).forEach(e=> e.estado = tareaEstado.enEspera);
        tarea.estado = tareaEstado.corriendo;
        this.tareas = [tarea].concat(this.tareas);
    }

    correrTareaActual(): void {
        let clickeableElement: Promise<HTMLElement>;
        let delayClick = 500;
        if(this.tareas.length == 0) {
            clickeableElement = Promise.resolve($('#mainmenu > div:nth-child(1) a')[0]);
        } else {
            clickeableElement = this.tareas[0].getProximoClick();
        }
        clickeableElement
            .then((e) => this.guardarTareas(e))
            .then((click) => {
                return new Promise<void>((res) => {
                    window.setTimeout(() => {
                        click.click();
                        res();
                    }, delayClick)
                })
            })
    }

    guardarTareas(elemento: HTMLElement):Promise<HTMLElement>{
        let toSave = {};
        toSave[Keys.TAREAS] = this.tareas;
        toSave[Keys.TAREAS_CANCELADAS] = this.tareasCanceladas;
        toSave[Keys.TAREAS_FINALIZADAS] = this.tareasFinalizadas;
        toSave[Keys.TAREAS_BLOQUEADAS] = this.tareasBloqueadas;
        return new Promise<HTMLElement>((resolve) => {
            chrome.storage.local.set(toSave,()=> {resolve(elemento)});
        });
    }

    preprocesarTareas() {
        this.analizarTareasBloqueadas();
        this.ordenarTareas();
        if(this.tareas.length != 0)
            this.tareas[0].estado = tareaEstado.corriendo;
    }

    tiene(tarea: Tarea) {
        return this.tareas.some(e=> e.equals(tarea)) || this.tareasBloqueadas.some(e=> e.equals(tarea));
    }

    static async loadTareas(): Promise<ControladorTareas> {
        return new Promise((resolve) => {
            let keysToLoad = [Keys.TAREAS, Keys.TAREAS_CANCELADAS, Keys.TAREAS_FINALIZADAS, Keys.TAREAS_BLOQUEADAS];
            chrome.storage.local.get(keysToLoad,
                (resultado) => {
                    let tareas: Guardable[] = resultado[Keys.TAREAS] != undefined ? resultado[Keys.TAREAS] : [];
                    let tareasF: Guardable[] = resultado[Keys.TAREAS_FINALIZADAS] != undefined ? resultado[Keys.TAREAS_FINALIZADAS] : [];
                    let tareasC: Guardable[] = resultado[Keys.TAREAS_CANCELADAS] != undefined ? resultado[Keys.TAREAS_CANCELADAS] : [];
                    let tareasB: Guardable[] = resultado[Keys.TAREAS_BLOQUEADAS] != undefined ? resultado[Keys.TAREAS_BLOQUEADAS] : [];
                    let tareasCasteadas: Tarea[] = tareas.map(e => (new guardables[e.tipo_class]).fromJsonString(e) as Tarea);
                    let tareasCasteadasC: Tarea[] = tareasC.map(e => (new guardables[e.tipo_class]).fromJsonString(e) as Tarea);
                    let tareasCasteadasF: Tarea[] = tareasF.map(e => (new guardables[e.tipo_class]).fromJsonString(e) as Tarea);
                    let tareasCasteadasB: Tarea[] = tareasB.map(e => (new guardables[e.tipo_class]).fromJsonString(e) as Tarea);
                    let controladorTareas = new ControladorTareas();
                    controladorTareas.tareasFinalizadas = tareasCasteadasF;
                    controladorTareas.tareasCanceladas = tareasCasteadasC;
                    controladorTareas.tareasBloqueadas = tareasCasteadasB;
                    controladorTareas.tareas = tareasCasteadas;
                    resolve(controladorTareas);
                })
            }
        )
    }

    ordenarTareas() {
        //Filter task that cant run
        let allDoableTasks = this.tareas.concat(this.tareasBloqueadas);
        let tareasACancelar: Tarea[] = allDoableTasks.filter(e=>e.seCancela());
        let tareasToTheEnd: Tarea[] = allDoableTasks.filter(e=>e.estado == tareaEstado.toTheEnd && !e.seCancela());
        let tareasFinalizada: Tarea[] = allDoableTasks.filter(e=>e.estado == tareaEstado.finalizada);
        let tareasCorriendo: Tarea[] = allDoableTasks.filter(e=>e.estado == tareaEstado.corriendo && !e.seCancela());
        let tareasBloqueadas: Tarea[] = allDoableTasks.filter(e=>e.estado == tareaEstado.bloqueada && !e.seCancela());
        let tareasNoAplicaPrioridad = tareasCorriendo.concat(tareasACancelar).concat(tareasToTheEnd).concat(tareasFinalizada).concat(tareasBloqueadas);

        //Only order the task than can run
        let tareasAplicaPrioridad = allDoableTasks.filter(tap=>tareasNoAplicaPrioridad.every(tnap => !tnap.equals(tap)));
        let tareasPrioridadMuyAlta: Tarea[] = tareasAplicaPrioridad.filter(e=>e.prioridad == tareaPrioridad.MUY_ALTA);
        let tareasPrioridadAlta: Tarea[] = tareasAplicaPrioridad.filter(e=>e.prioridad == tareaPrioridad.ALTA);
        let tareasPrioridadNormal: Tarea[] = tareasAplicaPrioridad.filter(e=>e.prioridad == tareaPrioridad.NORMAL);
        let tareasPrioridadBaja: Tarea[] = tareasAplicaPrioridad.filter(e=>e.prioridad == tareaPrioridad.BAJA);

        tareasToTheEnd.map(e=>e.estado = tareaEstado.enEspera);

        this.tareasCanceladas = this.tareasCanceladas.concat(tareasACancelar);
        this.tareasFinalizadas = this.tareasFinalizadas.concat(tareasFinalizada);
        this.tareasBloqueadas = tareasBloqueadas;
        this.tareas = tareasCorriendo.concat(tareasPrioridadMuyAlta).concat(tareasPrioridadAlta).concat(tareasPrioridadNormal).concat(tareasPrioridadBaja).concat(tareasToTheEnd);
    }



    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private analizarTareasBloqueadas() {
        this.tareasBloqueadas.forEach(tarea => {
            if(tarea.puedeDesbloquearse()) {
                tarea.estado = tareaEstado.enEspera;
            }
        })
    }
}