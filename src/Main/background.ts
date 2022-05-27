let tabId = -1;
let intentoArena = 0;
let intentoTurma = 0;
let intentosMaximosPvp = 3;
let continuar_analizando = true;
let oroJugador = 0;
let datosBackground: ConfiguracionStruct ;
let estadoEjecucionBjs: EjecucionEstado = {
			indiceArenaProximo: { nombre: 'nada', puntaje: 999999},
			indiceTurmaProximo:{ nombre: 'nada', puntaje: 999999},
			analisisInicial: false, lugarFundicionDisponible: 0,
			sh:'', oroTotalEmpaquetado:0};
let auctionItems: AuctionItem[] = [];
let teamTurmaPersonaje :TurmaTeam;
let link_subasta;
let lastTimeAlive: number;
let ctrlSubastaGladiador: ControladorSubastas = new ControladorSubastas(undefined,undefined);
let ctrlSubastaMercenario: ControladorSubastas = new ControladorSubastas(undefined,undefined);
let ctrlSubastaFundicion: ControladorSubastas = new ControladorSubastas(undefined,undefined);
let ctrlSubastaFundicionMercenario: ControladorSubastas  = new ControladorSubastas(undefined,undefined);
let ctrlSubastaGuerrerosMercenario: ControladorSubastas = new ControladorSubastas(undefined,undefined);
let cmd = new Comandos();
//CUANDO SE CARGA PONER
//= loadLastConfig();

chrome.runtime.onInstalled.addListener(function() {
	loadLastConfig();
  });

chrome.runtime.onStartup.addListener(function() {
	loadLastConfig();
});

async function initBackgroundProcces() {
	let toSave = {};
	toSave[Keys.TAREAS] = [];
	toSave[Keys.TAREAS_BLOQUEADAS] = [];
	toSave[Keys.TAREAS_CANCELADAS] = [];
	toSave[Keys.TAREAS_FINALIZADAS] = [];
	chrome.storage.local.set(toSave);
	AuctionItem.loadAuctionItems().then((e) => {
		auctionItems = e;
		window.setTimeout(runAnalisisSubastaGladiador,500);
		window.setTimeout(runAnalisisSubastaMercenario,500);
		window.setTimeout(runAnalisisSubastaFundicion,1500);
		window.setTimeout(runAnalisisSubastaFundicionMercenario,1500);
		window.setTimeout(runAnalisisSubastaGuerreroMercenario,2000);
		window.setTimeout(runCheckPluginAlive,1000);
		window.setTimeout(runItemsAnalizer,5000);
	});

	ctrlSubastaGladiador = new ControladorSubastas(ControladorSubastas.getKeysSubasta(),'gladiador');
	ctrlSubastaMercenario = new ControladorSubastas(ControladorSubastas.getKeysSubasta(),'mercenario');
	ctrlSubastaFundicion = new ControladorSubastas(await ControladorSubastas.getKeysFundicion(),'fundicionGladiador');
	ctrlSubastaFundicionMercenario = new ControladorSubastas(await ControladorSubastas.getKeysFundicion(),'fundicionMercenario');
	ctrlSubastaGuerrerosMercenario = new ControladorSubastas(ControladorSubastas.getKeysTiposMercenario(),'guerreroMercenario');
	continuar_analizando = true;
}

chrome.runtime.onMessage.addListener(
	function (request: Mensaje, sender,sendResponse) {
				switch (request.header) {
					case MensajeHeader.POP_UP_SEABRIO:
						sendResponse({datos:datosBackground, tabIdActiva:tabId,
												subasta:ctrlSubastaGladiador.lastResult,
												subastaMercenario:ctrlSubastaMercenario.lastResult,
												subastaFundicion:ctrlSubastaFundicion.lastResult,
												subastaFundicionMercenario:ctrlSubastaFundicionMercenario.lastResult,
												subastaGuerrerosMercenarios:ctrlSubastaGuerrerosMercenario.lastResult,
												linkSubasta:link_subasta});
						break;
					case MensajeHeader.CONTENT_SCRIPT_ASK_EMPIEZO:
						if(sender.tab.id == tabId) {
							lastTimeAlive = Date.now().valueOf();
							estadoEjecucionBjs.sh = request.sh;
							sendResponse({
								correr:true,
								configuracionToSend: datosBackground,
								header: MensajeHeader.RESPUESTA,
								estadoEjecucion:estadoEjecucionBjs
							}  as BotInjectMensaje);
						}
						else {
							sendResponse({correr:false});
						}
						break;
					case MensajeHeader.DEBUGUEAR:
						mandarDebug();
						break;
					case MensajeHeader.ACTUALIZAR:
						actualizarConfig(request.configuracionToSend);
						break;
					case MensajeHeader.CAMBIO_ORO:
						actualizarOro(request.oro)
						break;
					case MensajeHeader.ACTIVAR_AK:
						setTabId();
						estadoEjecucionBjs.analisisInicial = true;
						if(tabId == -1) {
							lastTimeAlive = Date.now().valueOf();
							estadoEjecucionBjs.sh = request.sh;
							initBackgroundProcces();
						}
						break;
					case MensajeHeader.STOP:
						tabId = -1
						continuar_analizando = false;
						break;
					case MensajeHeader.ACTUALIZAR_EXPEDICION:
						datosBackground.expedicion.lugar = request.lugar;
						datosBackground.expedicion.enemigo = request.enemigo;
						let aGuardar = {};
						aGuardar[Keys.CONFIGURACION] = datosBackground
						chrome.storage.local.set(aGuardar);
						break;
					case MensajeHeader.LOG_IN:
						window.setTimeout(()=>{actualizarTabId();},400);
						break;
					case MensajeHeader.ANALIZAR_ARENA:
						let a = request.link;
						let sh = a.split('=')[a.split('=').length-1]
						let link = 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=arena&submod=serverArena&aType=2&sh='+sh;
						analizarArena(link);
						break;
					case MensajeHeader.ANALIZAR_TURMA:
						let b = request.linkTurma;
						let shb = b.split('=')[b.split('=').length-1]
						let linkTurma = 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=arena&submod=serverArena&aType=3&sh='+shb;
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
					case MensajeHeader.ITEMS_ANALIZER:
						sendResponse({
							items:teamTurmaPersonaje
						})
						break;
					case MensajeHeader.ACTUALIZAR_OROPKTS:
						estadoEjecucionBjs.oroTotalEmpaquetado = request.oroPkt;
						break;
					default:
						break;
				}
			}
);

function analizarTurma(link: string) {
	estadoEjecucionBjs.indiceTurmaProximo = { nombre: 'nada', puntaje: 999999}
	let picker = new TurmaEnemigoPickerBackground(link);
	picker.correrTodo().then(e => {
		estadoEjecucionBjs.indiceTurmaProximo.nombre = e.nombre;
		estadoEjecucionBjs.indiceTurmaProximo.puntaje = e.puntaje;
		intentoTurma = 0;
	}).catch(() => {
		if(intentosMaximosPvp >= intentoTurma) {
			intentoTurma++;
			window.setTimeout(analizarTurma, 3000, link);
		}else {
			window.setTimeout(analizarTurma, 30000, link);
			intentoTurma = 0;
		}
	});
}

function analizarArena(link: string) {
	estadoEjecucionBjs.indiceArenaProximo = {nombre: 'nada', puntaje: 999999}
	let picker = new ArenaEnemigoPickerBackground(link);
	picker.correrTodo().then(e => {
		estadoEjecucionBjs.indiceArenaProximo.nombre = e.nombre;
		estadoEjecucionBjs.indiceArenaProximo.puntaje = e.puntaje;
		intentoArena = 0;
	}).catch(() => {
		if(intentosMaximosPvp >= intentoArena) {
			intentoArena++;
			window.setTimeout(analizarArena, 3000, link);
		}else {
			window.setTimeout(analizarArena, 30000, link);
			intentoArena = 0;
		}
		window.setTimeout(analizarArena,3000,link);
	});
}

function actualizarTabId() {
	let pestaniaActual = {
		currentWindow: true,
		active: true
	}
	chrome.tabs.query(pestaniaActual,
		(elegida)=> {
			tabId = elegida[0].id
		})

}

function guardarPaquete(paqueteComprado) {
	chrome.storage.local.get(Keys.PAQUETES, (result) => {
		let paquetes = result.paquetes;
		if(paquetes===undefined) {
			paquetes = [];
		}
		paquetes.push(paqueteComprado);
		let toSave = {};
		toSave[Keys.PAQUETES] = paquetes;
		chrome.storage.local.set(toSave);
	});
}

function actualizarConfig(nuevosDatos) {
	datosBackground = nuevosDatos;
	let toSave = {};
	toSave[Keys.CONFIGURACION] = datosBackground;
	chrome.storage.local.set(toSave);
}

function mandarDebug() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {header: MensajeHeader.DEBUGUEAR})
	});
}

function mandarEstadoNuevo(estadoNuevo) {
	chrome.tabs.sendMessage(tabId, {header: MensajeHeader.CONTENT_SCRIPT_CAMBIO_PKT, estadoPaquete: estadoNuevo});
}

function setTabId()  {
	chrome.tabs.query({
		currentWindow: true,
		active: true
	},(a) => tabId = a[0].id);
}

function actualizarOro(oroNuevo) {
	oroJugador = oroNuevo;
}

function loadLastConfig(): void {
	chrome.storage.local.get(Keys.CONFIGURACION, (result) => {
		let lastConfig = result[Keys.CONFIGURACION];
		if(lastConfig == undefined) {
			datosBackground = backgroundConfig;
			console.log('No hay datos guardados, se carga la info por primera vez.')
		}else {
			datosBackground = lastConfig;
			datosBackground.prioridades = backgroundConfig.prioridades;
			console.log('Se cargo la ultima info.! :)');
			console.log(lastConfig);
		}
	});
}

async function subastaAnalizar(linkAllItems:string, mercenario:boolean) {
	let allItemsLink = linkAllItems;
	let response = await fetch(allItemsLink, {cache: "no-store"})
	let subastaHTML = await response.text()
	let remainingTime = $(subastaHTML).find('.description_span_right')[0].textContent;
	let oroActual = 0;
	let jQueryResult = $(subastaHTML).find('#sstat_gold_val');
	let autoSubasta = [];
	if(jQueryResult.length === 0)
		oroActual = 0;
	else {
		let oroHtml = jQueryResult.html();
		oroActual = Number.parseInt(oroHtml.replace(/\./g, ''));
	}
	let copyAI = auctionItems;
	let resultadoSubastaLocal: SubastaResultado;
	if(remainingTime == 'muy corto') {
		//let sizeItems = $(subastaHTML).find('#auction_table td').length;
		//console.log(sizeItems);
		copyAI.forEach(e =>
			{
				if($(subastaHTML).find('#auctionForm'+e.auctionIds).length != 0) {//item still on auction
					//4 estados: no apostado, apostado por random, yo, alianza, estos dos ultimos no se subasta => estaApostado || apostadoXRandom
					//Ya hay pujas existentes.
					let noEstaApostado = $(subastaHTML)
						.find('#auctionForm'+e.auctionIds)
						.parents('td')
						.find('.auction_bid_div > div')[0].textContent.search('No hay pujas') != -1;

					let apostadoXRandom = $(subastaHTML)
						.find('#auctionForm'+e.auctionIds)
						.parents('td')
						.find('.auction_bid_div > div')[0].textContent.search('existentes') != -1;

					if(noEstaApostado || apostadoXRandom) {
						//apostar
						let oroStringApostar = (<HTMLInputElement>$(subastaHTML).find('#auctionForm'+e.auctionIds).parents('td').find('input[name="bid_amount"]')[0]).value;
						let oroNumberApostar = parseInt(oroStringApostar)+100;
						if(oroActual >= oroNumberApostar) {
							console.log('Subastar: ' + e.name);
							e.subastar(oroNumberApostar);
						}else {
							console.log('No hay oro ('+oroNumberApostar+') para: ' + e.name);
						}
					}
				}
			}
		)
	}
	else{
		resultadoSubastaLocal = await ctrlSubastaGladiador.analizarSubastaBackground();
		//autoSubasta = controladorSubasta.apostarItemsWith(tdsItems,[], mercenario, copyAI);
		if(autoSubasta.length > 0) {
			auctionItems = auctionItems.concat(autoSubasta);
			let oroPivote = oroActual;
			for (let i = 0; i<autoSubasta.length;i++) {
				if(oroPivote>= autoSubasta[i]) {
					await autoSubasta[i].subastar(autoSubasta[i].subastaBasica + 500);
					oroPivote = oroPivote-autoSubasta[i].subastaBasica;
				}
			}
		}
	}

	let finalItems = auctionItems.filter(e=> ($(subastaHTML).find('#auctionForm'+e.auctionIds).length != 0 || ($(subastaHTML).find('#auctionForm'+e.auctionIds).length == 0 && e.mercenario != mercenario)));

	if(finalItems.length != auctionItems.length || autoSubasta.length != 0){
		console.log('Removing some items')
		let toSave = {};
		toSave[Keys.AUCTION_ITEMS] = finalItems;
		chrome.storage.local.set(toSave);
		auctionItems = finalItems;
	}

	if (remainingTime == 'muy corto')
		return Promise.resolve({time:500, result:null});
	else if (remainingTime == 'corto')
		return Promise.resolve({time:2000, result: resultadoSubastaLocal});
	else
		return Promise.resolve({time:5000, result: resultadoSubastaLocal});
}

async function itemsTurmaAnalizar() {
	let newTeam = new TurmaTeam(null,perfil,null);
	await newTeam.cargarEquipoItems();
	teamTurmaPersonaje = newTeam;
}

async function runCheckPluginAlive() {
	let time = 5000;
	try {
		if(tabId != -1) {
			let milisecondsNow = Date.now().valueOf();
			let dif = milisecondsNow - lastTimeAlive;
			let difMinutos =  Math.floor(dif / 60000);
			if(difMinutos >= 3) {
				lastTimeAlive = Date.now().valueOf();
				chrome.tabs.reload(tabId);
			}
		}
	}catch (e) {
		console.log(e);
		console.log("Error checking plugin live");
	}finally {
		if(continuar_analizando)
			window.setTimeout(runCheckPluginAlive, time);
	}
}

async function runItemsAnalizer() {
	let time = 10000;
	try {
		await itemsTurmaAnalizar();
	}catch (e) {
		console.log(e);
		console.log("Error analizyng items");
	}finally {
		if(continuar_analizando)
			window.setTimeout(runItemsAnalizer, time);
	}
}

async function runAnalisisSubastaGladiador() {
	let time = 1000;
	try {
		let link = 	'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=auction&qry=&itemLevel=00&itemType=0&itemQuality=-1&sh=' + estadoEjecucionBjs.sh;
		ctrlSubastaGladiador.setLink(link);
		await ctrlSubastaGladiador.analizarSubastaBackground();
		time = ctrlSubastaGladiador.timeToNextRecheck;
	}catch (e) {
		//console.log(e);
		console.log("Error analizyng auction");
	}finally {
		if(continuar_analizando)
			window.setTimeout(runAnalisisSubastaGladiador, time);
	}
}

async function runAnalisisSubastaMercenario() {
	let time = 1000;
	try {
		let link = 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=auction&qry=&itemLevel=00&itemType=0&itemQuality=-1&ttype=3&sh=' + estadoEjecucionBjs.sh;
		ctrlSubastaMercenario.setLink(link);
		await ctrlSubastaMercenario.analizarSubastaBackground();
		time = ctrlSubastaMercenario.timeToNextRecheck;
	}catch (e) {
		//console.log(e);
		console.log("Error analizyng auction");
	}finally {
		if(continuar_analizando)
			window.setTimeout(runAnalisisSubastaMercenario, time);
	}
}

async function runAnalisisSubastaFundicion() {
	let time = 10000;
	try {
		let link = 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=auction&qry=&itemLevel=00&itemType=0&itemQuality=-1&sh=' + estadoEjecucionBjs.sh;
		ctrlSubastaFundicion.setLink(link);
		await ctrlSubastaFundicion.analizarSubastaBackground();
	}catch (e) {
		//console.log(e);
		console.log("Error analizyng auction");
		time = 1000;
	}finally {
		if(continuar_analizando)
			window.setTimeout(runAnalisisSubastaFundicion, time);
	}
}

async function runAnalisisSubastaFundicionMercenario() {
	let time = 10000;
	try {
		let link = 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=auction&qry=&itemLevel=00&itemType=0&itemQuality=-1&ttype=3&sh=' + estadoEjecucionBjs.sh;
		ctrlSubastaFundicionMercenario.setLink(link);
		await ctrlSubastaFundicionMercenario.analizarSubastaBackground();
	}catch (e) {
		//console.log(e);
		console.log("Error analizyng auction");
		time = 1000;
	}finally {
		if(continuar_analizando)
			window.setTimeout(runAnalisisSubastaFundicionMercenario, time);
	}
}

async function runAnalisisSubastaGuerreroMercenario() {
	let time = 10000;
	try {
		let link = 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=auction&qry=&itemLevel=00&itemType=15&itemQuality=-1&sh=' + estadoEjecucionBjs.sh;
		ctrlSubastaGuerrerosMercenario.setLink(link);
		await ctrlSubastaGuerrerosMercenario.analizarSubastaBackground();
	}catch (e) {
		//console.log(e);
		console.log("Error analizyng auction");
		time = 1000;
	}finally {
		if(continuar_analizando)
			window.setTimeout(runAnalisisSubastaGuerreroMercenario, time);
	}
}
/*
async function getSh():Promise<string> {
	let promise = new Promise<string>((resolve)=>	chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
		let url = tabs[0].url
		estadoEjecucionBjs.sh = url.split('=')[url.split('=').length-1];
		console.log(estadoEjecucionBjs.sh);
		resolve(estadoEjecucionBjs.sh);
	}));
	return promise;
}*/

async function analizarPaquetes() {
	let link = 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=packages&f=0&fq=-1&qry=&sh=&page=1';
	link = link.replace('sh=','sh='+estadoEjecucionBjs.sh);
	new AnalisisPaquetesBackground(link).analizarPaquetes()
}