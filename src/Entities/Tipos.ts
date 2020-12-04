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
    evento: tareaPrioridad
}

interface EjecucionEstado {
    paqueteEstado: paquete_estados,
    hayComida: boolean,
    paquete: Paquete,
    intestosPaquetes: number,
    indiceArenaProximo: ResultadoAnalisisPvP,
    indiceTurmaProximo: ResultadoAnalisisPvP,
    analisisInicial: boolean
}

interface ModulosEstados {
    correrPaquetes: boolean,
    correrExpedicion: boolean,
    correrMazmorra: boolean,
    correrArena: boolean,
    correrTurma: boolean,
    correrMisiones: boolean,
    correrEvento: boolean,
    analizarSubasta: boolean
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
    getProximoClick(): Promise<HTMLElement>,
    seCancela(): boolean,
    equals(t: Tarea): boolean,
    getHomeClick(): HTMLElement
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


    constructor(key: string) {
        this.key = key;
    }

    encontrado() {
        this.contador++;
    }

}

class SubastaResultado {
    busquedas: {key: string,contador: number}[];
    busquedaFecha: Date;
    constructor()
    constructor(busquedas: { key: string; contador: number }[], busquedaFecha: Date)
    constructor(busquedas?: { key: string; contador: number }[], busquedaFecha?: Date) {
        this.busquedas = busquedas;
        this.busquedaFecha = busquedaFecha;
    }

    getMostrable() :HTMLElement[] {
        return this.busquedas.map((e)=>
                                        {
                                            let p = document.createElement('p');
                                            p.textContent = e.key + ': ' + e.contador;
                                            return p;
                                        })

    }

    getMostrableFecha(): HTMLElement {
        let p = document.createElement('p');
        p.textContent = this.busquedaFecha.toString()
        return p;
    }
}

