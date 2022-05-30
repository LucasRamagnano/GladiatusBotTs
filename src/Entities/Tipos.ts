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
    refinamiento: tareaPrioridad;
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
    lugarFundicionDisponible: number,
    sh: string,
    oroTotalEmpaquetado: number
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
    correrFundicion:boolean,
    correrRefinamiento: boolean
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
    prioridad: tareaPrioridad,
    timed_out_miliseconds: number,
    getProximoClick(): Promise<HTMLElement>,
    seCancela(): boolean,
    equals(t: Tarea): boolean,
    getHomeClick(): HTMLElement,
    puedeDesbloquearse():boolean,
    changeEstado(newEstado: tareaEstado):void,
    getEstado():tareaEstado
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
    maxLevel: number = 0;
    statItems: ItemUsable[] = [];

    constructor(key: string) {
        this.key = key;
    }

    encontrado() {
        this.contador++;
    }

    analizarNivel(nuevoLevel: string) {
        try{
            if(parseInt(nuevoLevel)>this.maxLevel) {
                this.maxLevel = parseInt(nuevoLevel);
            }
        }catch (e){
            //console.log(e);
        }
    }

    getMaxColor() {
        if(this.statItems.some(e=>e.getCalidad().color == 'gold')) {
            return 'gold';
        }
        if(this.statItems.some(e=>e.getCalidad().color == 'purple')) {
            return 'purple';
        }
        if(this.statItems.some(e=>e.getCalidad().color == 'blue')) {
            return 'blue';
        }
        if(this.statItems.some(e=>e.getCalidad().color == 'green')) {
            return 'green';
        }
    }
    //let colors:{code:string,color:string,index:number}[] = [{code:'lime',color:'green',index:0}, {code:'#5159F7',color:'blue',index:0}, {code:'#E303E0',color:'purple',index:0}, {code:'#FF6A00',color:'gold',index:0}];
    reset() {
        this.contador = 0;
        this.maxLevel = 0;
        this.statItems = [];
    }
}

class SubastaResultado implements Guardable{
    busquedas: AuctionKey[];
    busquedaFecha: Date;
    tusSubastas :string[] = [];
    totalItems: number = 0;
    desc:string;
    tipo_class: string = 'SubastaResultado';

    constructor()
    constructor(busquedas: AuctionKey[], busquedaFecha: Date, tusSubastas: string[],desc: string)
    constructor(busquedas?: AuctionKey[], busquedaFecha?: Date, tusSubastas?: string[], desc?: string) {
        this.busquedas = busquedas;
        this.busquedaFecha = busquedaFecha;
        this.tusSubastas = tusSubastas;
        this.desc = desc;

    }

    sortResultado(e1:AuctionKey, e2:AuctionKey) {
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
                                            a.textContent = e.key + ': ' + e.contador + ' ('+e.maxLevel + ')';
                                            a.target = '_self';
                                            e.contador > 0 ? a.classList.add("hay-items") : a.classList.add("vacio");
                                            a.setAttribute('data-tipo-subasta',this.desc);
                                            a.classList.add(e.getMaxColor());
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

    fromJsonString(guardado: any): Guardable {
        this.busquedas = guardado.busquedas.map(e=>{
            let tempKey = new AuctionKey(e.key);
            tempKey.maxLevel = e.maxLevel;
            tempKey.contador = e.contador;
            tempKey.statItems = e.statItems.map(st=> new ItemUsable(st.rawData));
            return tempKey;
        });
        this.busquedaFecha = new Date(guardado.busquedaFecha);
        this.tusSubastas = guardado.tusSubastas;
        this.desc = guardado.desc;
        return this;
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
    casco: ItemUsable;
    arma: ItemUsable;
    armadura: ItemUsable;
    escudo: ItemUsable;
    guante: ItemUsable;
    zapato: ItemUsable;
    anillo_1: ItemUsable;
    anillo_2: ItemUsable;
    amuleto: ItemUsable;


    constructor(casco: string, arma: string, armadura: string, escudo: string, guante: string, zapato: string, anillo_1: string, anillo_2: string, amuleto: string) {
        this.casco = new ItemUsable(casco);
        this.arma = new ItemUsable(arma);
        this.armadura = new ItemUsable(armadura);
        this.escudo = new ItemUsable(escudo);
        this.guante = new ItemUsable(guante);
        this.zapato = new ItemUsable(zapato);
        this.anillo_1 = new ItemUsable(anillo_1);
        this.anillo_2 = new ItemUsable(anillo_2);
        this.amuleto = new ItemUsable(amuleto);
    }
}