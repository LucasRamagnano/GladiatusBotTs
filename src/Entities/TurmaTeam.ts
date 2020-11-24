class TurmaTeam {
    nombre: string;
    turmaPlayers: TurmaPlayer[] = [];
    link: string;
    boton: HTMLElement;
    puntaje: number;

    constructor(nombre: string, link: string, boton: HTMLElement) {
        this.nombre = nombre;
        this.link = link;
        this.boton = boton;
    }

    async cargarEquipo() {
        let i: number = 2;
        let toLoad: Promise<void>[] = [];
        for (; i <= 6 ; i++) {
            let linkPersonajeTurma = this.insertInString(this.link,'&doll='+i,this.link.indexOf('&'))
            let personaje = new TurmaPlayer(linkPersonajeTurma);
            this.turmaPlayers.push(personaje);
            toLoad.push(personaje.loadData());
        }
        await Promise.all(toLoad);
        //console.log('Equipo cargado');
    }

    insertInString(stringBase, stringAPoner, posicion) {
        return stringBase.substring(0, posicion) + stringAPoner + stringBase.substring(posicion);
    }

    fuerza() {
        return this.turmaPlayers.map(e=>e.fuerza).reduce((acc,val)=>acc+val);
    }

    habilidad() {
        return this.turmaPlayers.map(e=>e.habilidad).reduce((acc,val)=>acc+val);
    }

    agilidad() {
        return this.turmaPlayers.map(e=>e.agilidad).reduce((acc,val)=>acc+val);
    }

    carisma() {
        return this.turmaPlayers.map(e=>e.carisma).reduce((acc,val)=>acc+val);
    }

    inteligencia() {
        return this.turmaPlayers.map(e=>e.inteligencia).reduce((acc,val)=>acc+val);
    }

    danioPromedio() {
        return this.turmaPlayers.map(e=>e.danioPromedio).reduce((acc,val)=>acc+val);
    }

    danioArmaduraEquiv() {
        return this.turmaPlayers.map(e=>e.danioArmaduraEquiv).reduce((acc,val)=>acc+val);
    }

    porcentajeCritico() {
        return this.turmaPlayers.map(e=>e.porcentajeCritico).reduce((acc,val)=>acc+val);
    }

    porcentajeBloqueo() {
        return this.turmaPlayers.map(e=>e.porcentajeBloqueo).reduce((acc,val)=>acc+val);
    }

    curandose() {
        return this.turmaPlayers.map(e=>e.curandose).reduce((acc,val)=>acc+val);
    }
}