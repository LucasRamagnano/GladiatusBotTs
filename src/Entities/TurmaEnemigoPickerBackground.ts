class TurmaEnemigoPickerBackground {
    enemigos: TurmaTeam[] = [];
    miTeam: TurmaTeam;
    link: string;
    pesos = {
        difHabilidad: 1.5,
        difAgilidad: 1.5,
        difFuerza: 0.7,
        difCarisma: 1.3,
        difInteligencia: 1,
        difArmadura: 3.8,
        difDanio: 3.8,
        difCritico: 3.5,
        difBloqueo: 2.3,
        difCuracion: 0.7
    }

    constructor(link: string) {
        this.link = link;
    }

    async cargarDatos() {
        //console.log(this.link)
        let response = await fetch(this.link, {cache: "no-store"});
        let paginaPlayer = await response.text();
        $(paginaPlayer).find('#own3 a').toArray().forEach((e,index)=>{
            this.enemigos.push(new TurmaTeam(e.textContent.trim(),'' +  $(e).attr('href'),$('.attack')[index]))
        })
        let toDo: Promise<void>[] = [];
        for (const e of this.enemigos) {
            toDo.push(e.cargarEquipo());
        }
        await Promise.all(toDo);
        //console.log(this.enemigos);
    }

    async elegirMasFacil(): Promise<TurmaTeam> {
        this.miTeam = new TurmaTeam(null,perfil,null);
        await this.miTeam.cargarEquipo();
        let mejorEnemigo: TurmaTeam;
        let mejorPuntaje: number = null;
        for (const enemigo of this.enemigos) {
            let puntajeCalculado =
                (this.miTeam.fuerza() - enemigo.fuerza()) * this.pesos.difFuerza +
                (this.miTeam.habilidad() - enemigo.habilidad()) * this.pesos.difHabilidad +
                (this.miTeam.agilidad() - enemigo.agilidad()) * this.pesos.difAgilidad +
                (this.miTeam.carisma() - enemigo.carisma()) * this.pesos.difCarisma +
                (this.miTeam.inteligencia() - enemigo.inteligencia()) * this.pesos.difInteligencia +
                (this.miTeam.danioPromedio() - enemigo.danioPromedio()) * this.pesos.difDanio +
                (this.miTeam.danioArmaduraEquiv() - enemigo.danioArmaduraEquiv()) * this.pesos.difArmadura +
                (this.miTeam.porcentajeCritico() - enemigo.porcentajeCritico()) * this.pesos.difCritico +
                (this.miTeam.porcentajeBloqueo() - enemigo.porcentajeBloqueo()) * this.pesos.difBloqueo +
                (this.miTeam.porcentajeBloqueo() - enemigo.porcentajeBloqueo()) * this.pesos.difBloqueo +
                (this.miTeam.curandose() - enemigo.curandose()) * this.pesos.difCuracion
            //console.log(enemigo.nombre +': '+ puntajeCalculado);
            enemigo.puntaje = puntajeCalculado;
            if(mejorPuntaje===null || mejorPuntaje < puntajeCalculado) {
                mejorPuntaje = puntajeCalculado;
                mejorEnemigo = enemigo;
            }
        }
        console.log('Pick Turma: ' + mejorEnemigo.nombre +': '+ mejorPuntaje);
        await this.guardar();
        return mejorEnemigo;
    }

    async correrTodo() {
        await this.cargarDatos();
        return await this.elegirMasFacil();
    }

    async guardar() {
        return new Promise<void>((res) => {
            chrome.storage.local.get(Keys.TURMA_HISTORY, (result) => {
                let turmaHistoria: TurmaEnemigoPicker[] = result.turma_enemigos_historia;
                let nuevoBatalla: TurmaEnemigoPicker = this;
                if (turmaHistoria === undefined) {
                    turmaHistoria = [];
                } else if (turmaHistoria.length == 25) {
                    turmaHistoria.pop()
                }
                turmaHistoria = [nuevoBatalla].concat(turmaHistoria);
                let toSave = {};
                toSave[Keys.TURMA_HISTORY] = turmaHistoria;
                chrome.storage.local.set(toSave, () => {res()})
            });
        });
    }

    static async loadHistoria(): Promise<TurmaEnemigoPicker[]> {
        return new Promise<TurmaEnemigoPicker[]>((res) => {
            chrome.storage.local.get(Keys.TURMA_HISTORY, (result) => {
                let turmaHistoria: TurmaEnemigoPicker[] = result.turma_enemigos_historia;
                res(turmaHistoria);
            });
        });
    }
}