var correrDeNuevo = true;
var ejecutarReload = true;
//var tareasCtrl: ControladorTareas;
var globalConfig: ConfiguracionStruct = backgroundConfig;
var estadoEjecucion: EjecucionEstado = {hayComida: false, paquete: undefined, paqueteEstado: paquete_estados.COMPRAR,
	indiceArenaProximo: { nombre: 'nada', puntaje: 999999},
	indiceTurmaProximo: {nombre: 'nada', puntaje: 999999}, analisisInicial : false, lugarFundicionDisponible: 0};
var relojes = {
	relojArena: new Reloj('cooldown_bar_text_arena'),
	relojTurma: new Reloj('cooldown_bar_text_ct'),
	relojExpediciones: new Reloj('cooldown_bar_text_expedition'),
	relojMazmorras: new Reloj('cooldown_bar_text_dungeon')
};
var tareasControlador;
let itemsTeam: TurmaTeam;

async function tomarDecision() {
	actualizarOroFB();
	if(estadoEjecucion.analisisInicial) {
		let linkArena = $('#cooldown_bar_arena a').attr('href');
		let linkTurma = $('#cooldown_bar_ct a').attr('href');
		mandarMensajeBackground({header: MensajeHeader.ANALIZAR_ARENA, link:linkArena })
		mandarMensajeBackground({header: MensajeHeader.ANALIZAR_TURMA, linkTurma:linkTurma })
		mandarMensajeBackground({header: MensajeHeader.ANALISIS_INICIAL_MANDADO})
	}
	if(hayPopUp()) {
		cerrarPopUps();
	} else {
		let ctrlTareas = await ControladorTareas.loadTareas();
		ctrlTareas = calcularTareas(ctrlTareas);//append all doable tasks
		ctrlTareas.preprocesarTareas();
		window.setTimeout(()=>reloadPag(),ctrlTareas.tareas[0].timed_out_miliseconds);
		ctrlTareas.correrTareaActual();
	}
}

function cerrarPopUps() {
	$('#linkbod')[0].click();
}

function hayPopUp() {
	return $('#blackoutDialogbod.cancel_confirm[style*="display: block"]').length > 0;
}

function calcularTareas(tareasCtrl: ControladorTareas) {
	tareasControlador = tareasCtrl;

	if(hacerPaquete()) {
		tareasCtrl.appendTarea(new ControladorDePaquetes(paquete_estados.COMPRAR, null));
	}
	if(hayQueCurar()){
		tareasCtrl.ponerTareaPrimera(new Inventario());
	}
	if(sePuedeCorrerExpedicion()) {
		tareasCtrl.appendTarea(new LuchaExpedicion(globalConfig.expedicion.lugarNu, globalConfig.expedicion.enemigoNu-1));
	}
	if(sePuedeCorrerMazmorra()) {
		tareasCtrl.appendTarea(new LuchaMazmorra(globalConfig.mazmorra.dificultad, globalConfig.mazmorra.vencerBoss, globalConfig.mazmorra.calabozo));
	}
	if(sePuedeCorrerFundicion()) {
		let tareaEstado : fundicionEstados = fundicionEstados.AGARRAR_ITEMS;
		let ldispo = lugarEnFundicion();
		let tarea = new ControladorDeFundicion(ldispo, tareaEstado);
		//console.log(tarea);
		tareasCtrl.appendTarea(tarea);
	}
	if(sePuedeCorrerEvento()) {
		tareasCtrl.appendTarea(new LuchaEvento());
	}
	if(sePuedeCorrerArena()) {
		tareasCtrl.appendTarea(new LuchaPVP(globalConfig.arenaTipoInput, '#cooldown_bar_arena .cooldown_bar_link'));
	}
	if(sePuedeCorrerTurma()) {
		tareasCtrl.appendTarea(new LuchaPVP(globalConfig.circoTipoInput,'#cooldown_bar_ct .cooldown_bar_link'));
	}
	if(hacerMisiones()) {
		tareasCtrl.appendTarea(new ControladorDeMisiones());
	}
	if(analizarSubasta()) {
		tareasCtrl.appendTarea(new ControladorSubastas());
	}
	return tareasCtrl;
}

function analizarSubasta() {
	return globalConfig.modulos.analizarSubasta &&  !tareasControlador.tiene(new ControladorSubastas())
}

function hayQueCurar() {
	return getPorcentajeVida() < globalConfig.personaje.porcentajeMinimoParaCurar &&
			estadoEjecucion.hayComida &&
			!tareasControlador.tiene(new Inventario())
}

function hacerMisiones() {
	return globalConfig.modulos.correrMisiones &&  !tareasControlador.tiene(new ControladorDeMisiones())
}

function hacerPaquete() {
	let configInicial = estadoEjecucion.paqueteEstado === paquete_estados.COMPRAR &&
		getOroActualFB() > globalConfig.personaje.oroBaseParaPaquete;
	return globalConfig.modulos.correrPaquetes &&  configInicial &&
			!tareasControlador.tiene(new ControladorDePaquetes())
}

function sePuedeCorrerExpedicion(): boolean {
	return globalConfig.modulos.correrExpedicion &&
		!relojes.relojExpediciones.estasEnCooldDown() &&
		getPorcentajeVida()>=globalConfig.personaje.porcentajeMinimoParaCurar &&
		!tareasControlador.tiene(new LuchaExpedicion())
}

function sePuedeCorrerArena(): boolean {
	return globalConfig.modulos.correrArena &&
		!relojes.relojArena.estasEnCooldDown() &&
		getPorcentajeVida()>=globalConfig.personaje.porcentajeMinimoParaCurar &&
		!tareasControlador.tiene(new LuchaPVP(globalConfig.arenaTipoInput,'#cooldown_bar_arena .cooldown_bar_link')) &&
		estadoEjecucion.indiceArenaProximo.puntaje != 999999
}

function sePuedeCorrerMazmorra(): boolean {
	return globalConfig.modulos.correrMazmorra &&
			!relojes.relojMazmorras.estasEnCooldDown() &&
			!tareasControlador.tiene(new LuchaMazmorra())
}

function sePuedeCorrerTurma(): boolean {
	return globalConfig.modulos.correrTurma  &&
		!relojes.relojTurma.estasEnCooldDown() &&
		!tareasControlador.tiene(new LuchaPVP(globalConfig.circoTipoInput,'#cooldown_bar_ct .cooldown_bar_link')) &&
		estadoEjecucion.indiceTurmaProximo.puntaje != 999999
}

function sePuedeCorrerFundicion(): boolean {
	console.log('Lugar en fundicion: ' + lugarEnFundicion());
	let ldispo = lugarEnFundicion();
	return globalConfig.modulos.correrFundicion  &&
		ldispo > 0 &&
		!tareasControlador.tiene(new ControladorDeFundicion())
}

function sePuedeCorrerEvento(): boolean {
	return globalConfig.modulos.correrEvento  &&
		!LuchaEvento.estasEnCooldown() &&
		!tareasControlador.tiene(new LuchaEvento())
}

function estaEnVisionGeneral() {
	return $('#overviewPage #avatar').length == 1;
}

function lugarEnFundicion() {
	let disponibles = 0;
	if($('.advanced_menu_side_icon').length <= 1) {
		disponibles =  6;
	} else {
		let terminados = $('.advanced_menu_side_icon')[1].getAttribute('data-tooltip').replace(/\[/g,'').replace(/\]/g,'').trim().split('"#DDD","#DDD"').filter(e => e.includes('Enhorabuena')).length;
		disponibles = 6 - $('.advanced_menu_side_icon')[1].getAttribute('data-tooltip').replace(/\[/g,'').replace(/\]/g,'').trim().split('"#DDD","#DDD"').filter(e => e.includes(':')).length;
	}
	return disponibles;
}

function estaApuntandoPersonaje() {
	let jQueryResult = $('.charmercsel');
	return jQueryResult[0] === undefined ||
			jQueryResult[0].classList.contains('active');
}

function getPorcentajeVida() {
	return parseInt($('#header_values_hp_percent').html());
}

async function getItems() {
	itemsTeam = null;
	let seguirChequando = true;
	let timeOut = 3000;
	mandarMensajeBackground({header: MensajeHeader.ITEMS_ANALIZER},(e) => {
		let turmaTeam = e.items;
		itemsTeam = new TurmaTeam(turmaTeam.nombre,turmaTeam.link,turmaTeam.boton);
		itemsTeam.loadFromJson(turmaTeam);
	});
	while(seguirChequando && timeOut>0) {
		await wait(10);
		timeOut = timeOut - 10;
		try {
			seguirChequando = !itemsTeam.cargadoJsonEnd;
		}catch (e){
			seguirChequando = true;
		}
	}
	return Promise.resolve();
}

window.onload = function() {
	mandarMensajeBackground({header: MensajeHeader.CONTENT_SCRIPT_ASK_EMPIEZO},injectBot);
	chrome.runtime.onMessage.addListener(
		function(mensaje: Mensaje) {
			switch (mensaje.header) {
				case MensajeHeader.DEBUGUEAR:
					debugMostrarPaquetes();
					break;
				case MensajeHeader.CONTENT_SCRIPT_CAMBIO_PKT:
					estadoEjecucion.paqueteEstado = mensaje.estadoPaquete;
					break;
				case MensajeHeader.ACTUALIZAR:
					globalConfig = mensaje.globalConfig;
					break;
				case MensajeHeader.IR_SUBASTA_ITEM:
					window.open(mensaje.link,'_self');
					break;
			}
		});
	
};

function injectBot(ans: BotInjectMensaje) {
	if(ans.correr) {
		globalConfig = ans.configuracionToSend;
		estadoEjecucion = ans.estadoEjecucion;
		injectPagina();
		window.setTimeout(mandarMensajeBackground,100, {header:MensajeHeader.LINK_SUBASTA, subasta_link: (<any>$('#submenu1 a').toArray().find(e=>e.textContent == 'Edificio de subastas')).href});
		window.setTimeout(tomarDecision,500);
	}else {
		if (estamosEnSubasta()) {
			injectAutoOffer();
		}
		if (estamosEnOverview()) {
			injectItemComparison();
		}
	}
}

function reloadPag() {
	location.reload();
}

function injectPagina() {
	$.get(chrome.runtime.getURL('Recursos/ConsolaVisible/estadisticas_generales.html'), function(data) {
		$(data).appendTo('body');
		initEstadisticasGenerales();
		//initEstadisticasGenerales();
		// Or if you're using jQuery 1.8+:
		// $($.parseHTML(data)).appendTo('body');
	});
}

function debugMostrarPaquetes() {
	$('#market_item_table tr').each( function() {
		if($(this).find('th').length == 0)
			console.log(crearPackDesdeTr(this));
	})
}

function getOroActualFB() {
	let jQueryResult = $('#sstat_gold_val');
	if( jQueryResult.length === 0)
		return 0;
	let oroHtml = jQueryResult.html();
	return Number.parseInt(oroHtml.replace(/\./g, ''));
}

function actualizarOroFB() {
	let valor = getOroActualFB();
	mandarMensajeBackground({header: MensajeHeader.CAMBIO_ORO,oro:valor});
}

function initEstadisticasGenerales() {
	$('#nombre')[0].innerText = "Nombre: " + globalConfig.personaje.nombre;
	$('#oro')[0].innerText = "Oro: " + getOroActualFB();
	$('#estado_paquete span')[0].innerText = estadoEjecucion.paqueteEstado;
	$('#vida_para_curar')[0].innerText = "VidaToHeal: " + globalConfig.personaje.porcentajeMinimoParaCurar + '%';
	$('#oro_para_paquete')[0].innerText = 'Paquete despues de ' + globalConfig.personaje.oroBaseParaPaquete;
	$('#lugar_expedicion')[0].innerText = globalConfig.expedicion.lugar;
	$('#enemigo_expedicion')[0].innerText = globalConfig.expedicion.enemigo;

	if(estadoEjecucion.paquete != null) {
		$('#origen')[0].innerText = estadoEjecucion.paquete.origen;
		$('#valor')[0].innerText = estadoEjecucion.paquete.precio.toString();
		$('#fecha')[0].innerText = estadoEjecucion.paquete.fecha.toString();
		$('#paquete_desc')[0].innerText = estadoEjecucion.paquete.itemNombre;
	}
}

function backUpServer() {
	return $('.imperator_infobox').length > 0;
}

function ponerFiltroSubasta() {
	return $('#auctionPage').length > 0 && toInputArray($('select'))[1].value == '0';
}

function estamosEnSubasta() {
	return $('#auctionPage').length > 0;
}

function estamosEnOverview() {
	return $('#overviewPage').length > 0;
}


function injectSubasta() {
	let path = chrome.extension.getURL('Recursos/FiltroSubasta/filtro_subasta.css');
	$('head').append($('<link>')
		.attr("rel","stylesheet")
		.attr("type","text/css")
		.attr("href", path));
	$.get(chrome.runtime.getURL('Recursos/FiltroSubasta/filtro_subasta.html'), function(data) {
		$(data).appendTo('body');
		window.setTimeout(() => {console.log('iniciado');inicializarFiltros();}, 300)
	});
}

function injectItemComparison() {
	let path = chrome.extension.getURL('Recursos/ItemsComparison/item_container.css');
	$('head').append($('<link>')
		.attr("rel","stylesheet")
		.attr("type","text/css")
		.attr("href", path));
	$.get(chrome.runtime.getURL('Recursos/ItemsComparison/item_container.html'), function(data) {
		$('#content > table').after(data);
		$('.item_boton').on('click', (e) => {
			let nombre = e.target.textContent;
			injectItemComparisonEstadisticas(nombre);
			console.log(nombre)
		});
		getItems().then(() => {
								injectItemComparisonEstadisticas('arma');
								}
		);

	});
}

function injectItemComparisonEstadisticas(elemToSee) {
	itemsTeam.turmaPlayers.forEach((elem,index) => {
		let a = elem.itemsTooltip[elemToSee.toLocaleLowerCase()].getMostrableElement();
		$('.item_estadisticas:nth-child('+(index+1)+')').empty();
		$('.item_estadisticas:nth-child('+(index+1)+')').append(a);
	})
}

function injectAutoOffer() {
	let path = chrome.extension.getURL('Recursos/AutoOfertar/auto_offer.css');
	$('head').append($('<link>')
		.attr("rel","stylesheet")
		.attr("type","text/css")
		.attr("href", path));

	$('.awesome-button[value=Ofertar]').each(function() {
			let boton = document.createElement("input");
			boton.type = 'button';
			boton.value = 'Auto Bid';
			boton.classList.add("awesome-button");
			boton.classList.add("auto-offer-button");
			boton.onclick = autoOfferItem;
			$(boton).insertAfter(this);
		}
	)
	AuctionItem.loadAuctionItems().then((e) => {
		e.forEach(item => {
			let elem = $('#auctionForm'+item.auctionIds).parents('td').find('.auto-offer-button')[0];
			elem.classList.add("disable-ao");
		})
	});

}

function hayPaqueteEnCurso() {
	return this.estadoEjecucion.paqueteEstado != paquete_estados.COMPRAR &&
		this.estadoEjecucion.paqueteEstado != paquete_estados.NO_HAY_DISPONIBLES &&
		this.tareasControlador.tiene(new ControladorDePaquetes())
}

function autoOfferItem(ev) {
	let botonClick = ev.target;
	botonClick.classList.add("disable-ao");
	let tdBid = $(botonClick).parents('td')[0];
	let itemName = $(tdBid).find('.section-header form').attr('data-item_name');
	let itemUrl = $(tdBid).find('.section-header form').attr('action');
	let inputs : HTMLInputElement[] = $(tdBid).find('.section-header form input').toArray().map(elem=> <HTMLInputElement>elem);
	let item = new AuctionItem();
	item.inicializar(
		itemName, inputs[0].value, inputs[1].value,
		inputs[2].value, inputs[3].value, inputs[4].value,
		inputs[5].value, inputs[7].value, itemUrl, window.location.href.includes('ttype=3')
	)
	item.guardate().then(()=> mandarMensajeBackground({header: MensajeHeader.AUTOOFFER}));
}

function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}