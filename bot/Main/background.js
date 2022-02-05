var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var estadoArena = { valor: false, tipo: 'arena' };
var estadoTurma = { valor: false, tipo: 'turma' };
var estadoExpedicion = { valor: false, tipo: 'expedicion' };
var estadoMazmorra = { valor: false, tipo: 'mazmorra' };
var estadoMisiones = { valor: false, tipo: 'misiones' };
var estadoPaquetes = { valor: false, tipo: 'paquetes' };
var estados = [estadoTurma, estadoArena, estadoExpedicion, estadoMazmorra, estadoMisiones, estadoPaquetes];
var tabId = -1;
let intentoArena = 0;
let intentoTurma = 0;
let intentosMaximosPvp = 3;
let continuar_analizando = false;
var oroJugador = 0;
var datos;
var estadoEjecucionBjs = { hayComida: true, paquete: undefined, paqueteEstado: paquete_estados.COMPRAR,
    intestosPaquetes: 0, indiceArenaProximo: { nombre: 'nada', puntaje: 999999 },
    indiceTurmaProximo: { nombre: 'nada', puntaje: 999999 }, analisisInicial: false };
var resultadoSubasta = new SubastaResultado([], new Date());
let auctionItems = [];
let link_subasta;
//CUANDO SE CARGA PONER
//= loadLastConfig();
chrome.runtime.onInstalled.addListener(function () {
    loadLastConfig();
});
chrome.runtime.onStartup.addListener(function () {
    loadLastConfig();
});
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.header) {
        case MensajeHeader.POP_UP_SEABRIO:
            sendResponse({ datos: datos, tabIdActiva: tabId, subasta: resultadoSubasta });
            break;
        case MensajeHeader.CONTENT_SCRIPT_ASK_EMPIEZO:
            if (sender.tab.id == tabId) {
                sendResponse({
                    correr: true,
                    configuracionToSend: datos,
                    header: MensajeHeader.RESPUESTA,
                    estadoEjecucion: estadoEjecucionBjs
                });
            }
            else {
                sendResponse({ correr: false });
            }
            break;
        case MensajeHeader.CONTENT_SCRIPT_CAMBIO_PKT:
            estadoEjecucionBjs.paqueteEstado = request.estadoPaquete;
            break;
        case MensajeHeader.CONTENT_SCRIPT_PKT_COMPRADO:
            estadoEjecucionBjs.paquete = request.paqueteComprado;
            guardarPaquete(estadoEjecucionBjs.paquete);
            break;
        case MensajeHeader.DEBUGUEAR:
            mandarDebug();
            break;
        case MensajeHeader.ACTUALIZAR:
            actualizarConfig(request.configuracionToSend);
            break;
        case MensajeHeader.CAMBIO_ORO:
            actualizarOro(request.oro);
            break;
        case MensajeHeader.NO_HAY_COMIDA:
            estadoEjecucionBjs.hayComida = false;
            break;
        case MensajeHeader.HAY_COMIDA:
            estadoEjecucionBjs.hayComida = true;
            break;
        case MensajeHeader.ACTIVAR_AK:
            setTabId();
            estadoEjecucionBjs.analisisInicial = true;
            if (tabId == -1) {
                let toSave = {};
                toSave[Keys.TAREAS] = [];
                chrome.storage.local.set(toSave);
                AuctionItem.loadAuctionItems().then((e) => {
                    auctionItems = e;
                    window.setTimeout(runAnalisisSubasta, 5000);
                });
                continuar_analizando = true;
            }
            break;
        case MensajeHeader.STOP:
            let toSave = {};
            toSave[Keys.TAREAS] = [];
            tabId = -1;
            continuar_analizando = false;
            chrome.storage.local.set(toSave);
            break;
        case MensajeHeader.ACTUALIZAR_EXPEDICION:
            datos.expedicion.lugar = request.lugar;
            datos.expedicion.enemigo = request.enemigo;
            let aGuardar = {};
            aGuardar[Keys.CONFIGURACION] = datos;
            chrome.storage.local.set(aGuardar);
            break;
        case MensajeHeader.LOG_IN:
            window.setTimeout(() => { actualizarTabId(); }, 400);
            break;
        case MensajeHeader.RESULTADO_SUBASTA:
            resultadoSubasta.busquedas = request.resultado.busquedas;
            resultadoSubasta.busquedaFecha = request.resultado.busquedaFecha;
            datos.modulos.analizarSubasta = false;
            break;
        case MensajeHeader.ANALIZAR_SUBASTA:
            datos.modulos.analizarSubasta = true;
            break;
        case MensajeHeader.CAMBIO_INTENTO_PAQUETES:
            estadoEjecucionBjs.intestosPaquetes = request.intentos;
            break;
        case MensajeHeader.ANALIZAR_ARENA:
            //console.log(request.header);
            let a = request.link;
            let sh = a.split('=')[a.split('=').length - 1];
            //console.log(sh);
            let link = 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=arena&submod=serverArena&aType=2&sh=' + sh;
            analizarArena(link);
            break;
        case MensajeHeader.ANALIZAR_TURMA:
            let b = request.linkTurma;
            let shb = b.split('=')[b.split('=').length - 1];
            let linkTurma = 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=arena&submod=serverArena&aType=3&sh=' + shb;
            analizarTurma(linkTurma);
            break;
        case MensajeHeader.AUTOOFFER:
            AuctionItem.loadAuctionItems().then((e) => auctionItems = e);
            break;
        case MensajeHeader.ANALISIS_INICIAL_MANDADO:
            estadoEjecucionBjs.analisisInicial = false;
            break;
        case MensajeHeader.LINK_SUBASTA:
            link_subasta = request.subasta_link;
            break;
        default:
            break;
    }
});
function analizarTurma(link) {
    estadoEjecucionBjs.indiceTurmaProximo = { nombre: 'nada', puntaje: 999999 };
    let picker = new TurmaEnemigoPickerBackground(link);
    picker.correrTodo().then(e => {
        estadoEjecucionBjs.indiceTurmaProximo.nombre = e.nombre;
        estadoEjecucionBjs.indiceTurmaProximo.puntaje = e.puntaje;
        intentoTurma = 0;
    }).catch(() => {
        if (intentosMaximosPvp >= intentoTurma) {
            intentoTurma++;
            window.setTimeout(analizarTurma, 3000, link);
        }
        else {
            window.setTimeout(analizarTurma, 30000, link);
            intentoTurma = 0;
        }
    });
}
function analizarArena(link) {
    estadoEjecucionBjs.indiceArenaProximo = { nombre: 'nada', puntaje: 999999 };
    let picker = new ArenaEnemigoPickerBackground(link);
    picker.correrTodo().then(e => {
        estadoEjecucionBjs.indiceArenaProximo.nombre = e.nombre;
        estadoEjecucionBjs.indiceArenaProximo.puntaje = e.puntaje;
        intentoArena = 0;
    }).catch(() => {
        if (intentosMaximosPvp >= intentoArena) {
            intentoArena++;
            window.setTimeout(analizarArena, 3000, link);
        }
        else {
            window.setTimeout(analizarArena, 30000, link);
            intentoArena = 0;
        }
        window.setTimeout(analizarArena, 3000, link);
    });
}
function actualizarTabId() {
    let pestaniaActual = {
        currentWindow: true,
        active: true
    };
    chrome.tabs.query(pestaniaActual, (elegida) => {
        tabId = elegida[0].id;
    });
}
function guardarPaquete(paqueteComprado) {
    chrome.storage.local.get(Keys.PAQUETES, (result) => {
        let paquetes = result.paquetes;
        if (paquetes === undefined) {
            paquetes = [];
        }
        paquetes.push(paqueteComprado);
        let toSave = {};
        toSave[Keys.PAQUETES] = paquetes;
        chrome.storage.local.set(toSave);
    });
}
function actualizarConfig(nuevosDatos) {
    datos = nuevosDatos;
    let toSave = {};
    toSave[Keys.CONFIGURACION] = datos;
    console.log('Guardando config:');
    console.log(toSave);
    //chrome.tabs.sendMessage(tabId, {tipoMensaje: MensajeHeader.ACTUALIZAR, nuevaConfig: nuevosDatos});
    chrome.storage.local.set(toSave);
}
function mandarDebug() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { header: MensajeHeader.DEBUGUEAR });
    });
}
function mandarEstadoNuevo(estadoNuevo) {
    chrome.tabs.sendMessage(tabId, { header: MensajeHeader.CONTENT_SCRIPT_CAMBIO_PKT, estadoPaquete: estadoNuevo });
}
function setTabId() {
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, (a) => tabId = a[0].id);
}
function actualizarOro(oroNuevo) {
    if (oroNuevo > oroJugador) {
        if (estadoEjecucionBjs.paqueteEstado === paquete_estados.JUNTAR_PLATA) {
            estadoEjecucionBjs.paqueteEstado = paquete_estados.DEVOLVER;
            mandarEstadoNuevo(estadoEjecucionBjs.paqueteEstado);
        }
        else if (estadoEjecucionBjs.paqueteEstado === paquete_estados.NO_HAY_DISPONIBLES) {
            estadoEjecucionBjs.paqueteEstado = paquete_estados.COMPRAR;
            mandarEstadoNuevo(estadoEjecucionBjs.paqueteEstado);
        }
    }
    oroJugador = oroNuevo;
}
function loadLastConfig() {
    chrome.storage.local.get(Keys.CONFIGURACION, (result) => {
        let lastConfig = result[Keys.CONFIGURACION];
        if (lastConfig == undefined) {
            datos = backgroundConfig;
            console.log('No hay datos guardados, se carga la info por primera vez.');
        }
        else {
            datos = lastConfig;
            console.log('Se cargo la ultima info.! :)');
        }
    });
}
function runAnalisisSubasta() {
    return __awaiter(this, void 0, void 0, function* () {
        let time = 1000;
        try {
            time = yield subastaAnalizar();
        }
        catch (e) {
            console.log(e);
            console.log("Error analizyng auction");
        }
        finally {
            if (continuar_analizando)
                window.setTimeout(runAnalisisSubasta, time);
        }
    });
}
function subastaAnalizar() {
    return __awaiter(this, void 0, void 0, function* () {
        let allItemsLink = 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=auction&qry=&itemLevel=00&itemType=0&itemQuality=-1&sh=' + link_subasta.split('=')[link_subasta.split('=').length - 1];
        let response = yield fetch(allItemsLink);
        let subastaHTML = yield response.text();
        let remainingTime = $(subastaHTML).find('.description_span_right')[0].textContent;
        let oroActual = 0;
        let jQueryResult = $(subastaHTML).find('#sstat_gold_val');
        if (jQueryResult.length === 0)
            oroActual = 0;
        else {
            let oroHtml = jQueryResult.html();
            oroActual = Number.parseInt(oroHtml.replace(/\./g, ''));
        }
        if (remainingTime == 'muy corto') {
            auctionItems.forEach(e => {
                if ($(subastaHTML).find('#auctionForm' + e.auctionIds).length != 0) { //item still on auction
                    //4 estados: no apostado, apostado por random, yo, alianza, estos dos ultimos no se subasta => estaApostado || apostadoXRandom
                    //Ya hay pujas existentes.
                    let noEstaApostado = $(subastaHTML)
                        .find('#auctionForm' + e.auctionIds)
                        .parents('td')
                        .find('.auction_bid_div > div')[0].textContent.search('No hay pujas') != -1;
                    let apostadoXRandom = $(subastaHTML)
                        .find('#auctionForm' + e.auctionIds)
                        .parents('td')
                        .find('.auction_bid_div > div')[0].textContent.search('existentes') != -1;
                    if (noEstaApostado || apostadoXRandom) {
                        //apostar
                        let oroStringApostar = $(subastaHTML).find('#auctionForm' + e.auctionIds).parents('td').find('input[name="bid_amount"]')[0].value;
                        let oroNumberApostar = parseInt(oroStringApostar) + 100;
                        if (oroActual >= oroNumberApostar) {
                            console.log('Subastar: ' + e.name);
                            e.subastar(oroNumberApostar);
                        }
                        else {
                            console.log('No hay oro (' + oroNumberApostar + ') para: ' + e.name);
                        }
                    }
                }
            });
        }
        if (auctionItems.some(e => $(subastaHTML).find('#auctionForm' + e.auctionIds).length == 0)) {
            console.log('Removing items');
            let toSave = {};
            toSave[Keys.AUCTION_ITEMS] = [];
            chrome.storage.local.set(toSave);
            auctionItems = [];
        }
        if (remainingTime == 'muy corto')
            return Promise.resolve(500);
        else if (remainingTime == 'corto')
            return Promise.resolve(2000);
        else
            return Promise.resolve(5000);
    });
}
