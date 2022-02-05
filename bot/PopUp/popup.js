var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let tabToFocus = -1;
let configuracionDuplicada;
function debuguear(evento) {
    //chrome.runtime.sendMessage({tipoMensaje: mensajes.DEBUGUEAR});
    //imprimirPaquetes();
    let toSave = {};
    toSave[Keys.AUCTION_ITEMS] = [];
    chrome.storage.local.set(toSave);
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
    let mensaje = {
        header: MensajeHeader.ACTUALIZAR,
        configuracionToSend: configuracionDuplicada
    };
    mandarMensajeBackground(mensaje);
    $('#update_ok').css({ 'display': 'inline' });
}
window.onload = function () {
    mandarMensajeBackground({ header: MensajeHeader.POP_UP_SEABRIO }, (respuesta) => {
        let subastaResultado = new SubastaResultado();
        subastaResultado.busquedas = respuesta.subasta.busquedas;
        subastaResultado.busquedaFecha = respuesta.subasta.busquedaFecha;
        init(respuesta.datos, respuesta.tabIdActiva, subastaResultado);
    });
};
function init(datos, tabIdActiva, resultadoSubasta) {
    tabToFocus = tabIdActiva;
    configuracionDuplicada = JSON.parse(JSON.stringify(datos));
    initCentro();
    initIzquierda();
    initDerecha();
    $('#subasta h3').after(resultadoSubasta.getMostrable());
    $('#analizar_subasta').after(resultadoSubasta.getMostrableFecha());
    $('#analizar_subasta').on('click', () => { mandarMensajeBackground({ header: MensajeHeader.ANALIZAR_SUBASTA }); });
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
    $('#update')[0].addEventListener('click', actualizar);
    $('#izquierda input, #centro input, #centro select').on('change', function () {
        $('#update_ok').css({ 'display': 'none' });
        $('#update_error').css({ 'display': 'none' });
    });
}
function initIzquierda() {
    toInputArray($('#expedicion_cb'))[0].checked = configuracionDuplicada.modulos.correrExpedicion;
    toInputArray($('#mazmorra_cb'))[0].checked = configuracionDuplicada.modulos.correrMazmorra;
    toInputArray($('#arena_cb'))[0].checked = configuracionDuplicada.modulos.correrArena;
    toInputArray($('#turma_cb'))[0].checked = configuracionDuplicada.modulos.correrTurma;
    toInputArray($('#misiones_cb'))[0].checked = configuracionDuplicada.modulos.correrMisiones;
    toInputArray($('#paquetes_cb'))[0].checked = configuracionDuplicada.modulos.correrPaquetes;
    toInputArray($('#evento_cb'))[0].checked = configuracionDuplicada.modulos.correrEvento;
    $('#debugear').on('click', debuguear);
    $('#activar').on('click', () => {
        mandarMensajeBackground({ header: MensajeHeader.ACTIVAR_AK });
        chrome.tabs.reload();
    });
    $('#stop').on('click', () => {
        mandarMensajeBackground({ header: MensajeHeader.STOP });
        chrome.tabs.reload();
    });
    if (tabToFocus === -1) {
        //(<HTMLInputElement><any>$('#update'))[0].disabled = true;
        $('#focus')[0].disabled = true;
    }
    else {
        $('#focus')[0].addEventListener('click', () => chrome.tabs.update(tabToFocus, { selected: true }));
    }
    //$('#debugear')[0].disabled = true;
    chrome.tabs.query({ currentWindow: true, active: true }, (a) => $('#tabId')[0].textContent = a[0].id.toString());
}
function initDerecha() {
    return __awaiter(this, void 0, void 0, function* () {
        let items = yield AuctionItem.loadAuctionItems();
        let sizeItems = items.length;
        console.log(items);
        $('.item_name').toArray().forEach((element, index) => {
            if (index < sizeItems)
                element.textContent = items[index].name;
        });
        $('.extra_info').toArray().forEach((element, index) => {
            if (index < sizeItems)
                element.textContent = 'NS:' + items[index].vecesSubastado + '|TG:' + items[index].oroTotalGastado;
        });
    });
}
function imprimirPaquetes() {
    chrome.storage.local.get(Keys.PAQUETES, (result) => {
        let paquetes = result.paquetes;
        if (paquetes === undefined) {
            paquetes = [];
        }
        console.log(paquetes.reverse());
    });
}
