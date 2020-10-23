var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class ArenaEnemigoPicker {
    constructor() {
        this.enemigos = [];
        this.pesos = {
            difHabilidad: 2.4,
            difAgilidad: 2.25,
            difFuerza: 0.3,
            difCarisma: 1.5,
            difInteligencia: 1.7,
            difArmadura: 3.3,
            difDanio: 3.3,
            difCritico: 3.5,
            difBloqueo: 2.3
        };
    }
    //$('')
    cargarDatos() {
        return __awaiter(this, void 0, void 0, function* () {
            $('#own2 a').toArray().forEach((e, index) => {
                let link = $(e).attr('href');
                link = this.insertInString(link, '&doll=1', link.indexOf('&'));
                this.enemigos.push(new ArenaPlayer('http://localhost:8080/' + link, $('.attack')[index]));
            });
            let toDo = [];
            for (const e of this.enemigos) {
                toDo.push(e.loadData());
            }
            yield Promise.all(toDo);
            console.log('Datos cargados.');
        });
    }
    elegirMasFacil() {
        return __awaiter(this, void 0, void 0, function* () {
            let miJugador = new ArenaPlayer('https://s29-ar.gladiatus.gameforge.com/game/index.php?mod=player&doll=1&p=15850', null);
            yield miJugador.loadData();
            let mejorEnemigo;
            let mejorPuntaje = null;
            for (const enemigo of this.enemigos) {
                let puntajeCalculado = this.enfrentar(miJugador, enemigo);
                console.log(enemigo.nombre + ': ' + puntajeCalculado);
                enemigo.puntaje = puntajeCalculado;
                if (mejorPuntaje === null || mejorPuntaje < puntajeCalculado) {
                    mejorPuntaje = puntajeCalculado;
                    mejorEnemigo = enemigo;
                }
            }
            console.log('---------------------------');
            console.log('Pick: ' + mejorEnemigo.nombre + ': ' + mejorPuntaje);
            return mejorEnemigo;
        });
    }
    correrTodo() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.cargarDatos();
            return yield this.elegirMasFacil();
        });
    }
    insertInString(stringBase, stringAPoner, posicion) {
        return stringBase.substring(0, posicion) + stringAPoner + stringBase.substring(posicion);
    }
    enfrentar(jugadorBase, jugadorVersus) {
        return (jugadorBase.fuerza - jugadorVersus.fuerza) * this.pesos.difFuerza +
            (jugadorBase.habilidad - jugadorVersus.habilidad) * this.pesos.difHabilidad +
            (jugadorBase.agilidad - jugadorVersus.agilidad) * this.pesos.difAgilidad +
            (jugadorBase.carisma - jugadorVersus.carisma) * this.pesos.difCarisma +
            (jugadorBase.inteligencia - jugadorVersus.inteligencia) * this.pesos.difInteligencia +
            (jugadorBase.danioPromedio - jugadorVersus.danioPromedio) * this.pesos.difDanio +
            (jugadorBase.danioArmaduraEquiv - jugadorVersus.danioArmaduraEquiv) * this.pesos.difArmadura +
            (jugadorBase.porcentajeCritico - jugadorVersus.porcentajeCritico) * this.pesos.difCritico +
            (jugadorBase.porcentajeBloqueo - jugadorVersus.porcentajeBloqueo) * this.pesos.difBloqueo;
    }
}
