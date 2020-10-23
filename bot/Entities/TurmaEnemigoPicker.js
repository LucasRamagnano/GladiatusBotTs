var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class TurmaEnemigoPicker {
    constructor() {
        this.enemigos = [];
        this.pesos = {
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
        };
    }
    cargarDatos() {
        return __awaiter(this, void 0, void 0, function* () {
            $('#own3 a').toArray().forEach((e, index) => {
                this.enemigos.push(new TurmaTeam(e.textContent.trim(), 'http://localhost:8080/' + $(e).attr('href'), $('.attack')[index]));
            });
            let toDo = [];
            for (const e of this.enemigos) {
                toDo.push(e.cargarEquipo());
            }
            yield Promise.all(toDo);
            console.log('Datos cargados.');
        });
    }
    elegirMasFacil() {
        return __awaiter(this, void 0, void 0, function* () {
            this.miTeam = new TurmaTeam(null, 'https://s29-ar.gladiatus.gameforge.com/game/index.php?mod=player&p=15850', null);
            yield this.miTeam.cargarEquipo();
            let mejorEnemigo;
            let mejorPuntaje = null;
            for (const enemigo of this.enemigos) {
                let puntajeCalculado = (this.miTeam.fuerza() - enemigo.fuerza()) * this.pesos.difFuerza +
                    (this.miTeam.habilidad() - enemigo.habilidad()) * this.pesos.difHabilidad +
                    (this.miTeam.agilidad() - enemigo.agilidad()) * this.pesos.difAgilidad +
                    (this.miTeam.carisma() - enemigo.carisma()) * this.pesos.difCarisma +
                    (this.miTeam.inteligencia() - enemigo.inteligencia()) * this.pesos.difInteligencia +
                    (this.miTeam.danioPromedio() - enemigo.danioPromedio()) * this.pesos.difDanio +
                    (this.miTeam.danioArmaduraEquiv() - enemigo.danioArmaduraEquiv()) * this.pesos.difArmadura +
                    (this.miTeam.porcentajeCritico() - enemigo.porcentajeCritico()) * this.pesos.difCritico +
                    (this.miTeam.porcentajeBloqueo() - enemigo.porcentajeBloqueo()) * this.pesos.difBloqueo +
                    (this.miTeam.porcentajeBloqueo() - enemigo.porcentajeBloqueo()) * this.pesos.difBloqueo +
                    (this.miTeam.curandose() - enemigo.curandose()) * this.pesos.difCuracion;
                console.log(enemigo.nombre + ': ' + puntajeCalculado);
                enemigo.puntaje = puntajeCalculado;
                if (mejorPuntaje === null || mejorPuntaje < puntajeCalculado) {
                    mejorPuntaje = puntajeCalculado;
                    mejorEnemigo = enemigo;
                }
            }
            console.log('---------------------------');
            console.log('Pick: ' + mejorEnemigo.nombre + ': ' + mejorPuntaje);
            yield this.guardar();
            console.log('Historia actualizada.');
            return mejorEnemigo;
        });
    }
    correrTodo() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.cargarDatos();
            return yield this.elegirMasFacil();
        });
    }
    guardar() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res) => {
                chrome.storage.local.get(Keys.TURMA_HISTORY, (result) => {
                    let turmaHistoria = result.turma_enemigos_historia;
                    let nuevoBatalla = this;
                    if (turmaHistoria === undefined) {
                        turmaHistoria = [];
                    }
                    else if (turmaHistoria.length == 25) {
                        turmaHistoria.pop();
                    }
                    turmaHistoria = [nuevoBatalla].concat(turmaHistoria);
                    let toSave = {};
                    toSave[Keys.TURMA_HISTORY] = turmaHistoria;
                    chrome.storage.local.set(toSave, () => { res(); });
                });
            });
        });
    }
    static loadHistoria() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res) => {
                chrome.storage.local.get(Keys.TURMA_HISTORY, (result) => {
                    let turmaHistoria = result.turma_enemigos_historia;
                    res(turmaHistoria);
                });
            });
        });
    }
}
