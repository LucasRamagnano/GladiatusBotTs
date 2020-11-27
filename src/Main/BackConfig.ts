const personajeInfo: PersonajeStruct = {
    nombre: 'JayemsBons',
    oroBaseParaPaquete: 50000,
    porcentajeMinimoParaCurar: 30,
    valorMinimoPaquete: 50000
}

const expedicionInfo: ExpedicionStruct = {
    enemigo: "Datos de fabrica",
    enemigoNu: 0,
    lugar: "Datos de fabrica",
    lugarNu: 0
}

const calabozoInfo: CalabazoStruct = {
    calabozo: 3,
    dificultad: "Normal",
    vencerBoss: false
}

const moduloInfo: ModulosEstados = {
    correrArena: false,
    correrExpedicion: false,
    correrMazmorra: false,
    correrMisiones: false,
    correrPaquetes: false,
    correrTurma: false,
    correrEvento: false,
    analizarSubasta: false
}

const backgroundConfig: ConfiguracionStruct = {
    personaje: personajeInfo,
    expedicion: expedicionInfo,
    mazmorra: calabozoInfo,
    modulos: moduloInfo,
    arenaTipoInput: 'Arena Provinciarum',
    circoTipoInput: 'Circo Provinciarum'
}

const perfil: string = 'https://s29-ar.gladiatus.gameforge.com/game/index.php?mod=player&p=15850';