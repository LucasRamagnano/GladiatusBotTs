var estadoArena = {valor: false, tipo: 'arena'};
var estadoTurma = {valor: false, tipo: 'turma'};
var estadoExpedicion = {valor: false, tipo: 'expedicion'};
var estadoMazmorra = {valor: false, tipo: 'mazmorra'};
var estadoMisiones = {valor: false, tipo: 'misiones'};
var estadoPaquetes = {valor: false, tipo: 'paquetes'};
var estados = [estadoTurma, estadoArena, estadoExpedicion,estadoMazmorra, estadoMisiones, estadoPaquetes];
var tabId = -1;
var paquete_estado = paquete_estados.COMPRAR;
var paqueteComprado = null;
var oroJugador = 0;
var datos = loadLastConfig();
var hayComida = true;

chrome.runtime.onMessage.addListener(
	function (request, sender,sendResponse) {
		console.log(request.tipoMensaje);
		switch (request.tipoMensaje) {
			case MensajeHeader.POP_UP_SEABRIO:
				sendResponse({arena: estadoArena.valor, 
							 turma: estadoTurma.valor, 
							 expedicion: estadoExpedicion.valor, 
							 mazmorra: estadoMazmorra.valor, 
							 misiones: estadoMisiones.valor,
							 paquetes: estadoPaquetes.valor,
							 config: datos,
							 tabDondeEstaActivado: tabId});
				break;
			case MensajeHeader.POP_UP_OPTIONCHANGE:
				estados.find(e=>e.tipo==request.lugarCheckBox).valor = request.valor;
				setTabId();
				break;
			case MensajeHeader.CONTENT_SCRIPT_ASK_EMPIEZO:
				if(sender.tab.id == tabId) {
					sendResponse({
						correr:'si', 
						correrArena: estadoArena.valor, 
						correrTurma: estadoTurma.valor, 
						correrExpedicion: estadoExpedicion.valor,
						correrMazmorra:  estadoMazmorra.valor, 
						correrMisiones: estadoMisiones.valor,
						correrPaquetes: estadoPaquetes.valor,
						paqueteEstado: paquete_estado,
						paquete: paqueteComprado,
						hayFood: hayComida,
						config: datos
					});
				}
				else {
					sendResponse({correr:'no'});
				}
				break;
			case MensajeHeader.CONTENT_SCRIPT_CAMBIO_PKT:
				paquete_estado = request.estadoPaquete;
				break;
			case MensajeHeader.CONTENT_SCRIPT_PKT_COMPRADO:
				paqueteComprado = request.paqueteComprado;
				guardarPaquete(paqueteComprado);
				break;
			case MensajeHeader.DEBUGUEAR:
				mandarDebug();
				break;
			case MensajeHeader.ACTUALIZAR:
				actualizarConfig(request.nuevosDatos);
				break;
			case MensajeHeader.CAMBIO_ORO:
				actualizarOro(request.oro)
				break;
			case MensajeHeader.NO_HAY_COMIDA:
				hayComida = false;
				break;
			case MensajeHeader.HAY_COMIDA:
				hayComida = true;
				break;
			case MensajeHeader.ACTUALIZAR_EXPEDICION:
				datos.lugar = request.lugar;
				datos.enemigo = request.enemigo;
				chrome.storage.local.set({"configuracion": datos});
				break;
			case MensajeHeader.LOG_IN:
				window.setTimeout(()=>{actualizarTabId();},400);
				break;
			default:
				break;
		}
	}
);

function actualizarTabId() {
	var pestaniaActual = {
		currentWindow: true,
		active: true
	}
	chrome.tabs.query(pestaniaActual,
		(elegida)=> {
			tabId = elegida[0].id
		})

}

function guardarPaquete(paqueteComprado) {
	chrome.storage.local.get('paquetes', (result) => {
		var paquetes = result.paquetes;
		if(paquetes===undefined) {
			paquetes = [];
		}
		paquetes.push(paqueteComprado);
		chrome.storage.local.set({"paquetes": paquetes});
	});
}

function actualizarConfig(nuevosDatos) {
	nuevosDatos.lugar = datos.lugar;
	nuevosDatos.enemigo = datos.enemigo;
	datos = nuevosDatos;
	chrome.tabs.sendMessage(tabId, {tipoMensaje: MensajeHeader.ACTUALIZAR, nuevaConfig: nuevosDatos});
	chrome.storage.local.set({"configuracion": nuevosDatos});
}

function mandarDebug() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {tipoMensaje: MensajeHeader.DEBUGUEAR})
	});
}

function mandarEstadoNuevo(estadoNuevo) {
	chrome.tabs.sendMessage(tabId, {tipoMensaje: MensajeHeader.CONTENT_SCRIPT_CAMBIO_PKT, estadoPaquete: estadoNuevo});
}

function setTabId()  {
	chrome.tabs.query({
		currentWindow: true,
		active: true
	},(a) => tabId = a[0].id);
}

function actualizarOro(oroNuevo) {
	if(oroNuevo > oroJugador) {
		if(paquete_estado === paquete_estados.JUNTAR_PLATA) {
			paquete_estado = paquete_estados.DEVOLVER;
			mandarEstadoNuevo(paquete_estado);
		}else if(paquete_estado === paquete_estados.NO_HAY_DISPONIBLES){ 
			paquete_estado = paquete_estados.COMPRAR;
			mandarEstadoNuevo(paquete_estado);
		}
	}
	oroJugador = oroNuevo;
}

function loadLastConfig() {
	chrome.storage.local.get('configuracion', (result) => {
		var lastConfig = result;
		if(lastConfig.configuracion === undefined) {
			datos = backgroundConfig;
			console.log('No hay datos guardados, se carga la info por primera vez.')
		}else {
			datos = lastConfig.configuracion;
			if(datos.lugar === undefined)
				datos.lugar = 'lugar';
			if(datos.enemigo === undefined)
				datos.enemigo = 'nombre';
			console.log('Se cargo la ultima info.! :)')
		}
	});
}