var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class TurmaTeam {
    constructor(nombre, link, boton) {
        this.turmaPlayers = [];
        this.nombre = nombre;
        this.link = link;
        this.boton = boton;
    }
    cargarEquipo() {
        return __awaiter(this, void 0, void 0, function* () {
            let i = 2;
            let toLoad = [];
            for (; i <= 6; i++) {
                let linkPersonajeTurma = this.insertInString(this.link, '&doll=' + i, this.link.indexOf('&'));
                let personaje = new TurmaPlayer(linkPersonajeTurma);
                this.turmaPlayers.push(personaje);
                toLoad.push(personaje.loadData());
            }
            yield Promise.all(toLoad);
            //console.log('Equipo cargado');
        });
    }
    insertInString(stringBase, stringAPoner, posicion) {
        return stringBase.substring(0, posicion) + stringAPoner + stringBase.substring(posicion);
    }
    fuerza() {
        return this.turmaPlayers.map(e => e.fuerza).reduce((acc, val) => acc + val);
    }
    habilidad() {
        return this.turmaPlayers.map(e => e.habilidad).reduce((acc, val) => acc + val);
    }
    agilidad() {
        return this.turmaPlayers.map(e => e.agilidad).reduce((acc, val) => acc + val);
    }
    carisma() {
        return this.turmaPlayers.map(e => e.carisma).reduce((acc, val) => acc + val);
    }
    inteligencia() {
        return this.turmaPlayers.map(e => e.inteligencia).reduce((acc, val) => acc + val);
    }
    danioPromedio() {
        return this.turmaPlayers.map(e => e.danioPromedio).reduce((acc, val) => acc + val);
    }
    danioArmaduraEquiv() {
        return this.turmaPlayers.map(e => e.danioArmaduraEquiv).reduce((acc, val) => acc + val);
    }
    porcentajeCritico() {
        return this.turmaPlayers.map(e => e.porcentajeCritico).reduce((acc, val) => acc + val);
    }
    porcentajeBloqueo() {
        return this.turmaPlayers.map(e => e.porcentajeBloqueo).reduce((acc, val) => acc + val);
    }
    curandose() {
        return this.turmaPlayers.map(e => e.curandose).reduce((acc, val) => acc + val);
    }
}
