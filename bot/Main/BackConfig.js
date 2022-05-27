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
const globalFiltros = [new FiltroPaquete(QualityColors.PURPLE, ''),
    new FiltroPaquete(QualityColors.BLUE, 'Gaius'),
    new FiltroPaquete(QualityColors.BLUE, 'Titus'),
    new FiltroPaquete(QualityColors.BLUE, 'Manius'),
    new FiltroPaquete(QualityColors.BLUE, 'Lucius'),
    new FiltroPaquete(QualityColors.BLUE, 'Marcelo'),
    new FiltroPaquete(QualityColors.BLUE, 'Quinto'),
    new FiltroPaquete(QualityColors.BLUE, 'Tellus'),
    new FiltroPaquete(QualityColors.BLUE, 'Constancio'),
    new FiltroPaquete(QualityColors.BLUE, 'Mateus'),
    new FiltroPaquete(QualityColors.BLUE, 'Dexterus'),
    new FiltroPaquete(QualityColors.BLUE, 'Servius'),
    new FiltroPaquete(QualityColors.BLUE, 'Giganticus'),
    new FiltroPaquete(QualityColors.BLUE, 'Sentarions'),
    new FiltroPaquete(QualityColors.BLUE, 'Tantus'),
    new FiltroPaquete(QualityColors.BLUE, 'del misterio'),
    new FiltroPaquete(QualityColors.BLUE, 'del veneno'),
    new FiltroPaquete(QualityColors.BLUE, 'de la fragmentación'),
    new FiltroPaquete(QualityColors.BLUE, 'del silencio'),
    new FiltroPaquete(QualityColors.BLUE, ''),
    new FiltroPaquete(QualityColors.GREEN, '')].reverse();
