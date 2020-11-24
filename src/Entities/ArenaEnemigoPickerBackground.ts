class ArenaEnemigoPickerBackground {
    enemigos: ArenaPlayer[] = [];
    linkArena: string;
    pesos = {
        difHabilidad: 1.9,
        difAgilidad: 1.7,
        difFuerza: 0.3,
        difCarisma: 1.3,
        difInteligencia: 1.5,
        difArmadura: 4.2,
        difDanio: 4.2,
        difCritico: 3.5,
        difBloqueo: 2.5
    }
//$('')

    constructor(linkArena: string) {
        this.linkArena = linkArena;
    }

    async cargarDatos() {
        let response = await fetch(this.linkArena);
        let paginaPlayer = await response.text();
        $(paginaPlayer).find('#own2 a').toArray().forEach((e,index)=>{
            let link = $(e).attr('href');
            link =  this.insertInString(link,'&doll=1',link.indexOf('&'))
            this.enemigos.push(new ArenaPlayer('http://localhost:8080/' +  link,$('.attack')[index],index))
        })
        let toDo: Promise<void>[] = [];
        for (const e of this.enemigos) {
            toDo.push(e.loadData());
        }
        await Promise.all(toDo);
        //console.log('Datos cargados.');
    }

    async elegirMasFacil(): Promise<ArenaPlayer> {
        let link = this.insertInString(perfil,'&doll=1',perfil.indexOf('&'))
        let miJugador = new ArenaPlayer(link,null, null);
        await miJugador.loadData();
        let mejorEnemigo: ArenaPlayer;
        let mejorPuntaje: number = null;
        for (const enemigo of this.enemigos) {
            let puntajeCalculado = this.enfrentar(miJugador, enemigo);

            //console.log(enemigo.nombre +': '+ puntajeCalculado + ' Indice: ' + enemigo.indice);
            enemigo.puntaje = puntajeCalculado;
            if(mejorPuntaje===null || mejorPuntaje < puntajeCalculado) {
                mejorPuntaje = puntajeCalculado;
                mejorEnemigo = enemigo;
            }
        }
        console.log('Pick Arena: ' + mejorEnemigo.nombre +': '+ mejorPuntaje);
        return mejorEnemigo;
    }

    async correrTodo() {
        await this.cargarDatos();
        return await this.elegirMasFacil();
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