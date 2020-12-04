const personajeInfo = {
    nombre: 'JayemsBons',
    oroBaseParaPaquete: 50000,
    porcentajeMinimoParaCurar: 30,
    valorMinimoPaquete: 50000
};
const expedicionInfo = {
    enemigo: "Datos de fabrica",
    enemigoNu: 0,
    lugar: "Datos de fabrica",
    lugarNu: 0
};
const calabozoInfo = {
    calabozo: 3,
    dificultad: "Normal",
    vencerBoss: false
};
const moduloInfo = {
    correrArena: false,
    correrExpedicion: false,
    correrMazmorra: false,
    correrMisiones: false,
    correrPaquetes: false,
    correrTurma: false,
    correrEvento: false,
    analizarSubasta: false
};
const prioridadesInfo = {
    arena: tareaPrioridad.ALTA,
    calabozo: tareaPrioridad.NORMAL,
    curar: tareaPrioridad.MUY_ALTA,
    expedicion: tareaPrioridad.NORMAL,
    misiones: tareaPrioridad.BAJA,
    turma: tareaPrioridad.ALTA,
    paquete: tareaPrioridad.ALTA,
    evento: tareaPrioridad.NORMAL
};
const backgroundConfig = {
    personaje: personajeInfo,
    expedicion: expedicionInfo,
    mazmorra: calabozoInfo,
    modulos: moduloInfo,
    prioridades: prioridadesInfo,
    arenaTipoInput: 'Arena Provinciarum',
    circoTipoInput: 'Circo Provinciarum'
};
const perfil = 'https://s29-ar.gladiatus.gameforge.com/game/index.php?mod=player&p=15850';
