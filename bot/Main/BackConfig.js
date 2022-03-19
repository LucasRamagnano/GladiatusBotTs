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
    analizarSubasta: false,
    correrFundicion: false
};
const prioridadesInfo = {
    arena: tareaPrioridad.NORMAL,
    calabozo: tareaPrioridad.NORMAL,
    curar: tareaPrioridad.MUY_ALTA,
    expedicion: tareaPrioridad.NORMAL,
    misiones: tareaPrioridad.BAJA,
    turma: tareaPrioridad.NORMAL,
    paquete: tareaPrioridad.NORMAL,
    evento: tareaPrioridad.NORMAL,
    fundicion: tareaPrioridad.ALTA,
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
const perfil = 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=player&p=15855';
const globalFiltros = [new FiltroPaquete(calidadesItemsPaquetes.PURPURA, ''),
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Gaius'),
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Titus'),
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Manius'),
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Lucius'),
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Marcelo'),
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Quinto'),
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Tellus'),
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Constancio'),
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Mateus'),
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Dexterus'),
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Servius'),
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Giganticus'),
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Sentarions'),
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Tantus'),
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'del misterio'),
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'del veneno'),
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'de la fragmentación'),
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'del silencio'),
    new FiltroPaquete(calidadesItemsPaquetes.AZUL, ''),
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, '')].reverse();
