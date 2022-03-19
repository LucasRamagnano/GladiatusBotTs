var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class ArenaEnemigoPickerBackground {
    //$('')
    constructor(linkArena) {
        this.enemigos = [];
        this.pesos = {
            difHabilidad: 1.9,
            difAgilidad: 1.7,
            difFuerza: 0.3,
            difCarisma: 1.3,
            difInteligencia: 1.5,
            difArmadura: 4.2,
            difDanio: 4.2,
            difCritico: 3.5,
            difBloqueo: 2.5
        };
        this.linkArena = linkArena;
    }
    cargarDatos() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield fetch(this.linkArena, { cache: "no-store" });
            let paginaPlayer = yield response.text();
            $(paginaPlayer).find('#own2 a').toArray().forEach((e, index) => {
                let link = $(e).attr('href');
                link = this.insertInString(link, '&doll=1', link.indexOf('&'));
                this.enemigos.push(new ArenaPlayer('http://localhost:8080/' + link, $('.attack')[index], index));
            });
            let toDo = [];
            for (const e of this.enemigos) {
                toDo.push(e.loadData());
            }
            yield Promise.all(toDo);
            //console.log('Datos cargados.');
        });
    }
    elegirMasFacil() {
        return __awaiter(this, void 0, void 0, function* () {
            let link = this.insertInString(perfil, '&doll=1', perfil.indexOf('&'));
            let miJugador = new ArenaPlayer(link, null, null);
            yield miJugador.loadData();
            let mejorEnemigo;
            let mejorPuntaje = null;
            for (const enemigo of this.enemigos) {
                let puntajeCalculado = this.enfrentar(miJugador, enemigo);
                //console.log(enemigo.nombre +': '+ puntajeCalculado + ' Indice: ' + enemigo.indice);
                enemigo.puntaje = puntajeCalculado;
                if (mejorPuntaje === null || mejorPuntaje < puntajeCalculado) {
                    mejorPuntaje = puntajeCalculado;
                    mejorEnemigo = enemigo;
                }
            }
            console.log('Pick Arena: ' + mejorEnemigo.nombre + ': ' + mejorPuntaje);
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
