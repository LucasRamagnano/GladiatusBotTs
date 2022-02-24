let tabToFocus = -1
let configuracionDuplicada: ConfiguracionStruct;
let linkSubasta ='';
function debuguear(evento) {
	//chrome.runtime.sendMessage({tipoMensaje: mensajes.DEBUGUEAR});
	//imprimirPaquetes();
	let toSave = {};
	toSave[Keys.AUCTION_ITEMS] = [];
	chrome.storage.local.set(toSave);
	mandarMensajeBackground({header: MensajeHeader.AUTOOFFER});
	console.log('items deleted');
}

function actualizar() {
	//Izquierda
	configuracionDuplicada.modulos.correrExpedicion = toInputArray($('#expedicion_cb'))[0].checked;
	configuracionDuplicada.modulos.correrMazmorra = toInputArray($('#mazmorra_cb'))[0].checked;
	configuracionDuplicada.modulos.correrArena = toInputArray($('#arena_cb'))[0].checked;
	configuracionDuplicada.modulos.correrTurma = toInputArray($('#turma_cb'))[0].checked;
	configuracionDuplicada.modulos.correrMisiones = toInputArray($('#misiones_cb'))[0].checked;
	configuracionDuplicada.modulos.correrEvento = toInputArray($('#evento_cb'))[0].checked;
	configuracionDuplicada.modulos.correrPaquetes = toInputArray($('#paquetes_cb'))[0].checked;
	configuracionDuplicada.modulos.correrFundicion = toInputArray($('#fundicion_cb'))[0].checked;
	//Centro
	configuracionDuplicada.personaje.nombre = toInputArray($('#nombre_input'))[0].value;
	configuracionDuplicada.personaje.oroBaseParaPaquete = Number.parseInt(toInputArray($('#oro_input'))[0].value);
	configuracionDuplicada.personaje.porcentajeMinimoParaCurar = Number.parseInt(toInputArray($('#curacion_input'))[0].value);
	configuracionDuplicada.expedicion.lugarNu = Number.parseInt(toInputArray($('#expedicion_input'))[0].value);
	configuracionDuplicada.expedicion.enemigoNu = Number.parseInt(toInputArray($('#enemigo_input'))[0].value);
	configuracionDuplicada.mazmorra.calabozo = Number.parseInt(toInputArray($('#calabazo_input'))[0].value);
	configuracionDuplicada.mazmorra.dificultad = toInputArray($('#dificultad_calabozo_input'))[0].value;
	configuracionDuplicada.mazmorra.vencerBoss = toInputArray($('#vencer_boss_input'))[0].value === "true";
	configuracionDuplicada.arenaTipoInput = toInputArray($('#tipo_arena_input'))[0].value;
	configuracionDuplicada.circoTipoInput = toInputArray($('#tipo_circo_input'))[0].value;
	let mensaje : PasajeConfigMensaje = {
		header: MensajeHeader.ACTUALIZAR,
		configuracionToSend: configuracionDuplicada
	}
	mandarMensajeBackground(mensaje);
	$('#update_ok').css({'display':'inline'});
}

window.onload = function() {
	mandarMensajeBackground({header: MensajeHeader.POP_UP_SEABRIO},
		(respuesta) => {
			let subastaResultado = new SubastaResultado();
			let subastaResultadoMercenario = new SubastaResultado();
			subastaResultado.busquedas = respuesta.subasta.busquedas;
			subastaResultado.busquedaFecha = new Date(respuesta.subasta.busquedaFecha);
			subastaResultado.tusSubastas = respuesta.subasta.tusSubastas;
			subastaResultadoMercenario.busquedas = respuesta.subastaMercenario.busquedas;
			subastaResultadoMercenario.busquedaFecha = new Date(respuesta.subastaMercenario.busquedaFecha);
			subastaResultadoMercenario.tusSubastas = respuesta.subastaMercenario.tusSubastas;
			linkSubasta = respuesta.linkSubasta;
			init(respuesta.datos, respuesta.tabIdActiva, subastaResultado, subastaResultadoMercenario);

	});
};

async function init(datos: ConfiguracionStruct, tabIdActiva: number, resultadoSubasta :SubastaResultado, subastaResultadoMercenario : SubastaResultado) {
	tabToFocus = tabIdActiva;
	configuracionDuplicada = JSON.parse(JSON.stringify(datos));
	initCentro();
	initIzquierda();
	initDerecha();
	$('#subasta h3').after(resultadoSubasta.getMostrable(linkSubasta, false));
	$('.analizar_subasta')[0].after(resultadoSubasta.getMostrableFecha());
	$('#subasta_mercenario h3').after(subastaResultadoMercenario.getMostrable(linkSubasta, true));
	$('.analizar_subasta')[1].after(subastaResultadoMercenario.getMostrableFecha());
	$('#subasta_por_vos h3').after(resultadoSubasta.getTusSubastas().concat(subastaResultadoMercenario.getTusSubastas()));
	$('.analizar_subasta')[2].after(subastaResultadoMercenario.getMostrableFecha());
	//$('.analizar_subasta').on('click', () => {mandarMensajeBackground({header: MensajeHeader.ANALIZAR_SUBASTA})});
	$('a').on('click',(e)=>linkToSubasta(e));


}

function initCentro() {
	//$(@)
	toInputArray($('#nombre_input'))[0].value = configuracionDuplicada.personaje.nombre;
	toInputArray($('#oro_input'))[0].value = configuracionDuplicada.personaje.oroBaseParaPaquete.toString();
	toInputArray($('#curacion_input'))[0].value = configuracionDuplicada.personaje.porcentajeMinimoParaCurar.toString();
	toInputArray($('#expedicion_input'))[0].value = configuracionDuplicada.expedicion.lugarNu.toString();
	toInputArray($('#enemigo_input'))[0].value = configuracionDuplicada.expedicion.enemigoNu.toString();
	toInputArray($('#calabazo_input'))[0].value = configuracionDuplicada.mazmorra.calabozo.toString();
	toInputArray($('#dificultad_calabozo_input'))[0].value = configuracionDuplicada.mazmorra.dificultad;
	toInputArray($('#vencer_boss_input'))[0].value = configuracionDuplicada.mazmorra.vencerBoss.toString();
	toInputArray($('#tipo_arena_input'))[0].value = configuracionDuplicada.arenaTipoInput;
	toInputArray($('#tipo_circo_input'))[0].value = configuracionDuplicada.circoTipoInput;

	$('#update')[0].addEventListener('click',actualizar);
	$('#izquierda input, #centro input, #centro select').on('change',function() {
		$('#update_ok').css({'display':'none'});
		$('#update_error').css({'display':'none'});
	})
}

function initIzquierda() {
	toInputArray($('#expedicion_cb'))[0].checked = configuracionDuplicada.modulos.correrExpedicion;
	toInputArray($('#mazmorra_cb'))[0].checked = configuracionDuplicada.modulos.correrMazmorra;
	toInputArray($('#arena_cb'))[0].checked = configuracionDuplicada.modulos.correrArena;
	toInputArray($('#turma_cb'))[0].checked = configuracionDuplicada.modulos.correrTurma;
	toInputArray($('#misiones_cb'))[0].checked = configuracionDuplicada.modulos.correrMisiones;
	toInputArray($('#paquetes_cb'))[0].checked = configuracionDuplicada.modulos.correrPaquetes;
	toInputArray($('#evento_cb'))[0].checked = configuracionDuplicada.modulos.correrEvento;
	toInputArray($('#fundicion_cb'))[0].checked = configuracionDuplicada.modulos.correrFundicion;
	$('#debugear').on('click',debuguear);
	$('#activar').on('click',() => {
		mandarMensajeBackground({header:MensajeHeader.ACTIVAR_AK});
		chrome.tabs.reload();
	});
	$('#stop').on('click',() => {
		mandarMensajeBackground({header:MensajeHeader.STOP});
		chrome.tabs.reload();
	});
	if(tabToFocus === -1) {
		//(<HTMLInputElement><any>$('#update'))[0].disabled = true;
		(<HTMLInputElement><any>$('#focus'))[0].disabled = true;
	} else {
		$('#focus')[0].addEventListener('click',()=>chrome.tabs.update(tabToFocus, {selected: true}));
	}
	//$('#debugear')[0].disabled = true;
	chrome.tabs.query(
		{currentWindow: true, active: true},
		(a) => $('#tabId')[0].textContent = a[0].id.toString());
}

async function initDerecha() {
	let items = await AuctionItem.loadAuctionItems();
	let sizeItems = items.length;
	console.log(items);
	$('.item_name').toArray().forEach((element, index) => {
		if(index < sizeItems)
			element.textContent = items[index].name;
	})
	$('.extra_info').toArray().forEach((element, index) => {
		if(index < sizeItems)
			element.textContent = 'NS:'+items[index].vecesSubastado +'|TG:' +items[index].oroTotalGastado;
	})
}

function imprimirPaquetes() {
	chrome.storage.local.get(Keys.PAQUETES, (result) => {
		let paquetes = result.paquetes;
		if(paquetes===undefined) {
			paquetes = [];
		}
		console.log(paquetes.reverse());
	});
}

function linkToSubasta(e) {
		// @ts-ignore
		let linkSubasta = e.currentTarget.href;
		chrome.tabs.query({
			currentWindow: true,
			active: true
		},(a) =>
		{
			let tabToRefresh = a[0].id
			if(tabToRefresh != tabToFocus) {
				chrome.tabs.sendMessage(tabToRefresh, {
					header: MensajeHeader.IR_SUBASTA_ITEM,
					link:linkSubasta
				});
			}
			else {
				// @ts-ignore
				window.open(linkSubasta, '_blank');
			}
		});
}