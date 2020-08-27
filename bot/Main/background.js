var estadoArena = { valor: false, tipo: 'arena' };
var estadoTurma = { valor: false, tipo: 'turma' };
var estadoExpedicion = { valor: false, tipo: 'expedicion' };
var estadoMazmorra = { valor: false, tipo: 'mazmorra' };
var estadoMisiones = { valor: false, tipo: 'misiones' };
var estadoPaquetes = { valor: false, tipo: 'paquetes' };
var estados = [estadoTurma, estadoArena, estadoExpedicion, estadoMazmorra, estadoMisiones, estadoPaquetes];
var tabId = -1;
var oroJugador = 0;
var datos;
var estadoEjecucionBjs = { hayComida: true, paquete: undefined, paqueteEstado: paquete_estados.COMPRAR };
var resultadoSubasta = new SubastaResultado([], new Date());
//CUANDO SE CARGA PONER
//= loadLastConfig();
chrome.runtime.onInstalled.addListener(function () {
    loadLastConfig();
});
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request.header);
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
            if (tabId == -1) {
                let toSave = {};
                toSave[Keys.TAREAS] = [];
                chrome.storage.local.set(toSave);
            }
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
        default:
            break;
    }
});
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
