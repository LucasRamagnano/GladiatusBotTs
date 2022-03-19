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
const globalFiltros: FiltroPaquete[] = [new FiltroPaquete(calidadesItemsPaquetes.PURPURA, ''),
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Gaius'),//crystal, antonius
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Titus'),//crystal, antonius
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Manius'),//crystal, antonius
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Lucius'),//crystal, antonius
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Marcelo'),//crystal, antonius
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Quinto'),//crystal, antonius
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Tellus'),//crystal, antonius
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Constancio'),//crystal, antonius

    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Mateus'),//Amethyst, antonius
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Dexterus'),//Amethyst, antonius
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Servius'),//Amethyst, antonius
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Giganticus'),//Amethyst, antonius

    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Sentarions'),//tint resitencia, lucius
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'Tantus'),//tint resitencia, lucius

    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'del misterio'),//scorpion veneno, assesination
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'del veneno'),//scorpion veneno, assesination

    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'de la fragmentación'),//fortune stone, lucius
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'del silencio'),//fortune stone, lucius
    new FiltroPaquete(calidadesItemsPaquetes.AZUL, ''),
    new FiltroPaquete(calidadesItemsPaquetes.VERDE, '')].reverse()