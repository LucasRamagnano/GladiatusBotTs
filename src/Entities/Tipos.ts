interface ConfiguracionStruct {
    personaje: PersonajeStruct,
    expedicion: ExpedicionStruct,
    mazmorra: CalabazoStruct,
    prioridades: PrioridadesConfig,
    arenaTipoInput: string,
    circoTipoInput: string,
    modulos: ModulosEstados

}

interface PrioridadesConfig {
    curar: tareaPrioridad,
    misiones: tareaPrioridad,
    arena: tareaPrioridad,
    turma: tareaPrioridad,
    expedicion: tareaPrioridad,
    calabozo: tareaPrioridad,
    paquete: tareaPrioridad,
    evento: tareaPrioridad,
    fundicion: tareaPrioridad
}

interface EjecucionEstado {
    indiceArenaProximo: ResultadoAnalisisPvP,
    indiceTurmaProximo: ResultadoAnalisisPvP,
    analisisInicial: boolean,
    lugarFundicionDisponible: number
}

interface ModulosEstados {
    correrPaquetes: boolean,
    correrExpedicion: boolean,
    correrMazmorra: boolean,
    correrArena: boolean,
    correrTurma: boolean,
    correrMisiones: boolean,
    correrEvento: boolean,
    analizarSubasta: boolean,
    correrFundicion:boolean
}

interface  ExpedicionStruct {
    lugarNu: number,
    enemigoNu: number,
    lugar: string,
    enemigo: string
}

interface  CalabazoStruct {
    calabozo: number,
    dificultad: string,
    vencerBoss: boolean
}

interface PersonajeStruct {
    nombre: string,
    oroBaseParaPaquete: number,
    valorMinimoPaquete: number,
    porcentajeMinimoParaCurar: number
}

interface ResultadoAnalisisPvP {
    nombre: string,
    puntaje: number
}

interface Tarea extends Guardable {
    estado: tareaEstado,
    prioridad: tareaPrioridad,
    timed_out_miliseconds: number,
    getProximoClick(): Promise<HTMLElement>,
    seCancela(): boolean,
    equals(t: Tarea): boolean,
    getHomeClick(): HTMLElement,
    puedeDesbloquearse():boolean
}

class Guardable {
    tipo_class: string;
    fromJsonString(guardado: any): Guardable {
        return null;
    };
}

class AuctionKey {
    key: string;
    contador: number = 0;
    levelMaximo: number = 0;

    constructor(key: string) {
        this.key = key;
    }

    encontrado() {
        this.contador++;
    }

    analizarNivel(nuevoLevel: string) {
        try{
            if(parseInt(nuevoLevel)>this.levelMaximo) {
                this.levelMaximo = parseInt(nuevoLevel);
            }
        }catch (e){
            //console.log(e);
        }
    }
}

class SubastaResultado {
    busquedas: {key: string,contador: number, levelMaximo: number}[];
    busquedaFecha: Date;
    tusSubastas :string[] = [];

    constructor()
    constructor(busquedas: { key: string; contador: number, levelMaximo: number }[], busquedaFecha: Date, tusSubastas: string[])
    constructor(busquedas?: { key: string; contador: number, levelMaximo: number }[], busquedaFecha?: Date, tusSubastas?: string[]) {
        this.busquedas = busquedas;
        this.busquedaFecha = busquedaFecha;
        this.tusSubastas = tusSubastas;
    }

    sortResultado(e1:{key: string,contador: number, levelMaximo: number}, e2:{key: string,contador: number, levelMaximo: number}) {
        let numberOfWordE1 = Math.min(e1.key.split(' ').length,2);
        let numberOfWordE2 = Math.min(e2.key.split(' ').length,2);
        let w1Analyze = e1.key.split(' ').reverse()[0].toLocaleLowerCase();
        let w2Analyze = e2.key.split(' ').reverse()[0].toLocaleLowerCase();
        if(numberOfWordE1 != numberOfWordE2){
            return  numberOfWordE1 > numberOfWordE2 ? 1 : -1;
        }else if(e1.contador != 0 && e2.contador != 0) {
            return  w1Analyze > w2Analyze ? 1 : -1;
        }else if(e1.contador != 0) {
            return -1;
        }else if(e2.contador != 0){
            return 1;
        } else {
            return w1Analyze > w2Analyze ? 1 : -1;
        }
    }

    getMostrable(link_subasta, isMercenario: boolean) :HTMLElement[] {
        return this.busquedas.sort((e1,e2)=>this.sortResultado(e1,e2)).map((e)=>
                                        {
                                            let lastWord = e.key.split(' ').pop();
                                            let a = document.createElement('a');
                                            a.textContent = e.key + ': ' + e.contador + ' ('+e.levelMaximo + ')';
                                            a.target = '_self';
                                            e.contador > 0 ? a.classList.add("hay-items") : a.classList.add("vacio");
                                            if (!isMercenario)
                                                a.href = 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=auction&qry='+encodeURIComponent(lastWord)+'&itemLevel=00&itemType=0&itemQuality=-1&sh=' + link_subasta.split('=')[link_subasta.split('=').length-1];
                                            else
                                                a.href = 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=auction&qry='+encodeURIComponent(lastWord)+'&itemLevel=00&itemType=0&itemQuality=-1&ttype=3&sh=' + link_subasta.split('=')[link_subasta.split('=').length-1];
                                            return a;
                                        })

    }

    getTusSubastas() :HTMLElement[] {
        return this.tusSubastas.map((e)=> {
                                        let p = document.createElement('p');
                                        p.textContent = e;
                                        return p;
                                    })

    }

    getMostrableFecha(): HTMLElement {
        let p = document.createElement('p');
        console.log('busqueda fecha' + this.busquedaFecha.getMilliseconds());
        let diffMilliseconds = Math.abs(Date.now()-this.busquedaFecha.valueOf());
        console.log('Dif millli ' + diffMilliseconds);
        let diferenciaSegundos: number = Math.floor((diffMilliseconds/1000));
        p.textContent = 'Actualizado hace ' + diferenciaSegundos + ' segundos';
        return p;
    }
}

class Consola {
    static log(mostrar:boolean, mensaje){
        if(mostrar)
            console.log(mensaje);
    }
}

enum itemContainerNumber {
    CASCO = 2, ARMA = 3, ARMADURA = 5, ESCUDO = 4, GUANTE = 9,
    ZAPATO = 10, ANILLO_1 = 6, ANILLO_2 = 7, AMULETO = 11
}

class ItemsPlayers {
    casco: StatsItems;
    arma: StatsItems;
    armadura: StatsItems;
    escudo: StatsItems;
    guante: StatsItems;
    zapato: StatsItems;
    anillo_1: StatsItems;
    anillo_2: StatsItems;
    amuleto: StatsItems;


    constructor(casco: string, arma: string, armadura: string, escudo: string, guante: string, zapato: string, anillo_1: string, anillo_2: string, amuleto: string) {
        this.casco = new StatsItems(casco);
        this.arma = new StatsItems(arma);
        this.armadura = new StatsItems(armadura);
        this.escudo = new StatsItems(escudo);
        this.guante = new StatsItems(guante);
        this.zapato = new StatsItems(zapato);
        this.anillo_1 = new StatsItems(anillo_1);
        this.anillo_2 = new StatsItems(anillo_2);
        this.amuleto = new StatsItems(amuleto);
    }
}

class StatsItems {
    stasToInclude = ['daño', 'armadura', 'salud', 'fuerza', 'habilidad', 'agilidad', 'constitución', 'carisma', 'inteligencia', 'ataque',
        'curación', 'bloqueo', 'endurecimiento', 'amenaza', 'nivel']
    statsFinales = [];
    rawData :string;

    constructor(rawData: string) {
        this.rawData = rawData;
    }

    procesarRawData() {
        let estadisticasSinProcesar = this.rawData.split('"');
        estadisticasSinProcesar = estadisticasSinProcesar.map(e=>{
                                                                    try {
                                                                        return decodeURIComponent(JSON.parse('"'+e.replace(/\%/g, 'porcentaje')+'"')).replace('porcentaje', '\%');
                                                                    } catch(e){
                                                                        return 'error';
                                                                    }
                                                                 }
                                                             )
        let name = estadisticasSinProcesar[1];
        let estadisticas = estadisticasSinProcesar.filter(elem => this.stasToInclude.some(estat => elem.toLocaleLowerCase().includes(estat)))
        this.statsFinales = [name].concat(estadisticas);
    }

    getMostrableElement():HTMLElement[] {
        try {
            this.procesarRawData();
            return this.statsFinales.map((e)=> {
                let p = document.createElement('p');
                p.textContent = e;
                return p;
            });
        }catch (e){
            let p = document.createElement('p');
            p.textContent = e;
            return [p];
        }


    }
}