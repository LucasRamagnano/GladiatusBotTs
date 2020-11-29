class ControladorTareas {
    tareas: Tarea[] = [];
    tareasFinalizadas: Tarea[] = [];
    tareasCanceladas: Tarea[] = [];

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
                return new Promise((res) => {
                    window.setTimeout(() => {
                        click.click();
                        res();
                    }, delayClick)
                })
            })
            .then(()=> {
                window.setTimeout(()=> {
                    if (hayPopUp()) {
                        cerrarPopUps();
                    }
                },1500)
            });
    }

    guardarTareas(elemento: HTMLElement):Promise<HTMLElement>{
        let toSave = {};
        toSave[Keys.TAREAS] = this.tareas;
        toSave[Keys.TAREAS_CANCELADAS] = this.tareasCanceladas;
        toSave[Keys.TAREAS_FINALIZADAS] = this.tareasFinalizadas;
        return new Promise<HTMLElement>((resolve) => {
            chrome.storage.local.set(toSave,()=> {resolve(elemento)});
        });
    }

    preprocesarTareas() {
        let tareasACancelar: Tarea[] = this.tareas.filter(e=>e.seCancela());
        let tareasToTheEnd: Tarea[] = this.tareas.filter(e=>e.estado == tareaEstado.toTheEnd && !e.seCancela());
        let tareasFinalizada: Tarea[] = this.tareas.filter(e=>e.estado == tareaEstado.finalizada);
        let tareasEnEspera: Tarea[] = this.tareas.filter(e=>e.estado == tareaEstado.enEspera && !e.seCancela());
        let tareaCorriendo: Tarea[] = this.tareas.filter(e=>e.estado == tareaEstado.corriendo && !e.seCancela());
        tareasToTheEnd.map(e=>e.estado = tareaEstado.enEspera);
        this.tareasCanceladas = this.tareasCanceladas.concat(tareasACancelar);
        this.tareasFinalizadas = this.tareasFinalizadas.concat(tareasFinalizada);
        this.tareas = tareaCorriendo.concat(tareasEnEspera).concat(tareasToTheEnd);
        if(this.tareas.length != 0)
            this.tareas[0].estado = tareaEstado.corriendo;
    }

    tiene(tarea: Tarea) {
        return this.tareas.some(e=> e.equals(tarea));
    }

    static loadTareas(): Promise<ControladorTareas> {
        return new Promise((resolve) => {
            let keysToLoad = [Keys.TAREAS, Keys.TAREAS_CANCELADAS, Keys.TAREAS_FINALIZADAS];
            chrome.storage.local.get(keysToLoad,
                (resultado) => {
                    let tareas: Guardable[] = resultado[Keys.TAREAS] != undefined ? resultado[Keys.TAREAS] : [];
                    let tareasF: Guardable[] = resultado[Keys.TAREAS_FINALIZADAS] != undefined ? resultado[Keys.TAREAS_FINALIZADAS] : [];
                    let tareasC: Guardable[] = resultado[Keys.TAREAS_CANCELADAS] != undefined ? resultado[Keys.TAREAS_CANCELADAS] : [];
                    let tareasCasteadas: Tarea[] = tareas.map(e => (new guardables[e.tipo_class]).fromJsonString(e) as Tarea);
                    let tareasCasteadasC: Tarea[] = tareasC.map(e => (new guardables[e.tipo_class]).fromJsonString(e) as Tarea);
                    let tareasCasteadasF: Tarea[] = tareasF.map(e => (new guardables[e.tipo_class]).fromJsonString(e) as Tarea);
                    let controladorTareas = new ControladorTareas();
                    controladorTareas.tareasFinalizadas = tareasCasteadasF;
                    controladorTareas.tareasCanceladas = tareasCasteadasC;
                    controladorTareas.tareas = tareasCasteadas;
                    resolve(controladorTareas);
                })
            }
        )
    }
}