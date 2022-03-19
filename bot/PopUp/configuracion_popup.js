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
let linkSubasta = '';
let resultadosSubasta = { gladiador: null, mercenario: null, fundicionGladiador: null, fundicionMercenario: null, guerreroMercenario: null };
function debuguear(evento) {
    let stats = resultadosSubasta.gladiador.busquedas[1].statItems;
    let toShow = stats.sort((e1, e2) => e1.getNivel() > e2.getNivel() ? -1 : 1).map(e => {
        let contenido = e.getMostrableElement();
        let div = document.createElement('div');
        div.classList.add('item_estadisticas');
        $(div).append(contenido);
        return div;
    });
    $('#item_container_preview').append(toShow);
    $('#prev_subasta').removeClass('no_mostrar');
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
    let mensaje = {
        header: MensajeHeader.ACTUALIZAR,
        configuracionToSend: configuracionDuplicada
    };
    mandarMensajeBackground(mensaje);
    $('#update_ok').css({ 'display': 'inline' });
}
window.onload = function () {
    mandarMensajeBackground({ header: MensajeHeader.POP_UP_SEABRIO }, (respuesta) => {
        if (respuesta.subasta != undefined) {
            resultadosSubasta.gladiador = new SubastaResultado().fromJsonString(respuesta.subasta);
            resultadosSubasta.mercenario = new SubastaResultado().fromJsonString(respuesta.subastaMercenario);
            resultadosSubasta.fundicionGladiador = new SubastaResultado().fromJsonString(respuesta.subastaFundicion);
            resultadosSubasta.fundicionMercenario = new SubastaResultado().fromJsonString(respuesta.subastaFundicionMercenario);
            resultadosSubasta.guerreroMercenario = new SubastaResultado().fromJsonString(respuesta.subastaGuerrerosMercenarios);
        }
        linkSubasta = respuesta.linkSubasta;
        init(respuesta.datos, respuesta.tabIdActiva);
    });
};
function init(datos, tabIdActiva) {
    return __awaiter(this, void 0, void 0, function* () {
        tabToFocus = tabIdActiva;
        configuracionDuplicada = JSON.parse(JSON.stringify(datos));
        initCentro();
        initIzquierda();
        initDerecha();
        initSubastas();
    });
}
function initSubastas() {
    return __awaiter(this, void 0, void 0, function* () {
        initSubasta('subasta', false, resultadosSubasta.gladiador);
        initSubasta('subasta_mercenario', true, resultadosSubasta.mercenario);
        initSubasta('subasta_fundicion', false, resultadosSubasta.fundicionGladiador);
        initSubasta('subasta_fundicion_mercenario', true, resultadosSubasta.fundicionMercenario);
        initSubasta('subasta_guerrero_mercenario', false, resultadosSubasta.guerreroMercenario);
        let tusSubastas = resultadosSubasta.gladiador.getTusSubastas().concat(resultadosSubasta.mercenario.getTusSubastas());
        tusSubastas = [...new Set(tusSubastas)];
        $('#subasta_por_vos h3').after(tusSubastas);
        $('.analizar_subasta').last().after(resultadosSubasta.gladiador.getMostrableFecha());
        $('a.vacio').on('click', (e) => linkToSubasta(e));
        $('a.hay-items').on('click', (e) => preview(e));
        //Prev subasta
        $('#close_prev_subasta').on('click', () => {
            $('#prev_subasta').addClass('no_mostrar');
            $('.item_estadisticas').remove();
        });
    });
}
function initSubasta(idSubasta, esMercenario, resultados) {
    return __awaiter(this, void 0, void 0, function* () {
        $('#' + idSubasta + ' h3').after(resultados.getMostrable(linkSubasta, esMercenario));
        $('#' + idSubasta + ' .analizar_subasta')[0].after(resultados.getMostrableFecha());
    });
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
    toInputArray($('#fundicion_cb'))[0].checked = configuracionDuplicada.modulos.correrFundicion;
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
function preview(e) {
    // @ts-ignore
    let title = e.currentTarget.textContent;
    let tipoSubasta = $(e.currentTarget).attr('data-tipo-subasta');
    let toAnalyze = resultadosSubasta[tipoSubasta];
    let stats = toAnalyze.busquedas.find(e => title.includes(e.key)).statItems;
    let toShow = stats.sort((e1, e2) => e1.getNivel() > e2.getNivel() ? -1 : 1).map(e => {
        let contenido = e.getMostrableElement();
        let div = document.createElement('div');
        div.classList.add('item_estadisticas');
        $(div).append(contenido);
        return div;
    });
    $('#item_container_preview').append(toShow);
    $('#header_subasta a').attr('href', e.currentTarget.href);
    $('#header_subasta a').on('click', (e) => linkToSubasta(e));
    $('#prev_subasta').removeClass('no_mostrar');
}
function linkToSubasta(e) {
    // @ts-ignore
    let linkSubasta = e.currentTarget.href;
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, (a) => {
        let tabToRefresh = a[0].id;
        if (tabToRefresh != tabToFocus) {
            chrome.tabs.sendMessage(tabToRefresh, {
                header: MensajeHeader.IR_SUBASTA_ITEM,
                link: linkSubasta
            });
        }
        else {
            // @ts-ignore
            window.open(linkSubasta, '_blank');
        }
    });
}
