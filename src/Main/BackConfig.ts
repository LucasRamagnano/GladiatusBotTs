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
    analizarSubasta: false,
    correrFundicion: false
}

const prioridadesInfo: PrioridadesConfig = {
    arena: tareaPrioridad.NORMAL,
    calabozo: tareaPrioridad.NORMAL,
    curar: tareaPrioridad.MUY_ALTA,
    expedicion: tareaPrioridad.NORMAL,
    misiones: tareaPrioridad.BAJA,
    turma: tareaPrioridad.NORMAL,
    paquete: tareaPrioridad.NORMAL,
    evento: tareaPrioridad.NORMAL,
    fundicion: tareaPrioridad.ALTA,
}

const backgroundConfig: ConfiguracionStruct = {
    personaje: personajeInfo,
    expedicion: expedicionInfo,
    mazmorra: calabozoInfo,
    modulos: moduloInfo,
    prioridades: prioridadesInfo,
    arenaTipoInput: 'Arena Provinciarum',
    circoTipoInput: 'Circo Provinciarum'




}

const perfil: string = 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=player&p=15855';
const globalFiltros: FiltroPaquete[] = [new FiltroPaquete(QualityColors.PURPLE, ''),
    new FiltroPaquete(QualityColors.BLUE, 'Gaius'),//crystal, antonius
    new FiltroPaquete(QualityColors.BLUE, 'Titus'),//crystal, antonius
    new FiltroPaquete(QualityColors.BLUE, 'Manius'),//crystal, antonius
    new FiltroPaquete(QualityColors.BLUE, 'Lucius'),//crystal, antonius
    new FiltroPaquete(QualityColors.BLUE, 'Marcelo'),//crystal, antonius
    new FiltroPaquete(QualityColors.BLUE, 'Quinto'),//crystal, antonius
    new FiltroPaquete(QualityColors.BLUE, 'Tellus'),//crystal, antonius
    new FiltroPaquete(QualityColors.BLUE, 'Constancio'),//crystal, antonius

    new FiltroPaquete(QualityColors.BLUE, 'Mateus'),//Amethyst, antonius
    new FiltroPaquete(QualityColors.BLUE, 'Dexterus'),//Amethyst, antonius
    new FiltroPaquete(QualityColors.BLUE, 'Servius'),//Amethyst, antonius
    new FiltroPaquete(QualityColors.BLUE, 'Giganticus'),//Amethyst, antonius

    new FiltroPaquete(QualityColors.BLUE, 'Sentarions'),//tint resitencia, lucius
    new FiltroPaquete(QualityColors.BLUE, 'Tantus'),//tint resitencia, lucius

    new FiltroPaquete(QualityColors.BLUE, 'del misterio'),//scorpion veneno, assesination
    new FiltroPaquete(QualityColors.BLUE, 'del veneno'),//scorpion veneno, assesination

    new FiltroPaquete(QualityColors.BLUE, 'de la fragmentación'),//fortune stone, lucius
    new FiltroPaquete(QualityColors.BLUE, 'del silencio'),//fortune stone, lucius
    new FiltroPaquete(QualityColors.BLUE, ''),
    new FiltroPaquete(QualityColors.GREEN, '')].reverse()