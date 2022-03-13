var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class ControladorDePaquetes {
    constructor() {
        this.prioridad = datosContext.prioridades.paquete;
        this.estadoPaquete = paquete_estados.COMPRAR;
        this.estado = tareaEstado.enEspera;
        this.tipo_class = 'ControladorDePaquetes';
        this.intentosPaquetes = 0;
        this.timed_out_miliseconds = 30000;
        this.minimoPrecioPaquete = 50000;
        this.hojaInvetario = 0;
        this.timeRecheck = 5;
        this.oroToKeep = 80000;
    }
    fromJsonString(guardado) {
        this.estado = guardado.estado;
        this.paqueteComprado = guardado.paqueteComprado;
        this.estadoPaquete = guardado.estadoPaquete;
        this.intentosPaquetes = guardado.intentosPaquetes;
        this.timeBlocked = guardado.timeBlocked;
        return this;
    }
    changeEstado(newEstado) {
        this.estado = newEstado;
    }
    getEstado() {
        return this.estado;
    }
    getOroActual() {
        let oroHtml = $('#sstat_gold_val').html();
        return Number.parseInt(oroHtml.replace(/\./g, ''));
    }
    estamosEnMercado() {
        return $('#guildMarketPage').length > 0;
    }
    puedeDesbloquearse() {
        if (this.estadoPaquete == paquete_estados.NO_HAY_DISPONIBLES) {
            let milisecondsNow = Date.now().valueOf();
            let dif = milisecondsNow - this.timeBlocked;
            if (Math.floor(dif / 60000) >= this.timeRecheck) {
                this.estadoPaquete = paquete_estados.COMPRAR;
                return true;
            }
        }
        else if (this.estadoPaquete == paquete_estados.JUNTAR_PLATA) {
            if (this.paqueteComprado.precio * 0.04 < this.getOroActual()) {
                this.estadoPaquete = paquete_estados.DEVOLVER;
                return true;
            }
        }
        return false;
    }
    buscarMejorPaquete(oroActual) {
        let minPrecioPaquete = this.minimoPrecioPaquete;
        let oroToKeep = this.oroToKeep;
        let mejorPaquete = null;
        $('#market_item_table tr').each(function () {
            if ($(this).find('th').length == 0) {
                let paquete = crearPackDesdeTr(this);
                if (paquete.precio > oroActual || paquete.precio < minPrecioPaquete || oroActual - paquete.precio < oroToKeep || paquete.origen === datosContext.personaje.nombre) {
                    //nada
                }
                else if (mejorPaquete === null && paquete.nivel == 1) {
                    mejorPaquete = paquete;
                }
                else if (paquete.nivel == 1 && Math.abs((mejorPaquete.precio - oroActual)) > Math.abs((paquete.precio - oroActual))) {
                    mejorPaquete = paquete;
                }
            }
        });
        return mejorPaquete;
    }
    buscarPaqueteComprado() {
        let todosLosPaquetes = $('.packageItem .ui-draggable').toArray();
        return todosLosPaquetes.find(elem => elem.getAttribute('data-tooltip').split('"')[1].trim().toLowerCase() == this.paqueteComprado.itemNombre.toLowerCase());
    }
    buscarPaqueteCompradoEnInventario() {
        let todosLosPaquetes = $('#inv .ui-droppable').toArray();
        return todosLosPaquetes.filter(elem => elem.getAttribute('data-tooltip') != null).find(elem => elem.getAttribute('data-tooltip').split('"')[1].trim().toLowerCase() == this.paqueteComprado.itemNombre.toLowerCase());
    }
    comprar() {
        if (!this.estamosEnMercado()) {
            return $(".icon.market-icon")[0];
        }
        else {
            let paquete = this.buscarMejorPaquete(this.getOroActual());
            if (paquete === null) {
                this.estadoPaquete = paquete_estados.NO_HAY_DISPONIBLES;
                this.timeBlocked = Date.now().valueOf();
                this.estado = tareaEstado.bloqueada;
                return tareasControlador.getPronosticoClick();
            }
            else {
                this.paqueteComprado = paquete;
                this.estadoPaquete = paquete_estados.VERIFICAR_COMPRA;
                return paquete.link;
            }
        }
    }
    agarrarPaquete() {
        return __awaiter(this, void 0, void 0, function* () {
            if ($('#packagesPage').length == 0) {
                return $('#menue_packages')[0];
            }
            else {
                yield this.ponerHojaInventario(this.hojaInvetario);
                let paqueteAMover = this.buscarPaqueteComprado();
                if (paqueteAMover == null) {
                    this.actualizarEstadoPaquete(paquete_estados.VERIFICAR_AGARRE);
                }
                else {
                    let doubleClickEvent = new MouseEvent('dblclick', {
                        'view': window,
                        'bubbles': true,
                        'cancelable': true
                    });
                    paqueteAMover.dispatchEvent(doubleClickEvent);
                    this.actualizarEstadoPaquete(paquete_estados.VERIFICAR_AGARRE);
                    yield this.wait(2000);
                }
                return $('#menue_packages')[0];
            }
        });
    }
    verificarAgarre() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ponerHojaInventario(this.hojaInvetario);
            let estaEnELInventario = $('#inv .ui-droppable').toArray().some(e => e.getAttribute('data-tooltip').split('"')[1].trim().toLowerCase() == this.paqueteComprado.itemNombre.toLowerCase());
            if (estaEnELInventario) {
                this.actualizarEstadoPaquete(paquete_estados.DEVOLVER);
                this.intentosPaquetes = 0;
                return $(".icon.market-icon")[0];
            }
            else {
                this.actualizarEstadoPaquete(paquete_estados.VERIFICAR_COMPRA);
                this.intentosPaquetes++;
                return $('#menue_packages')[0];
            }
        });
    }
    devolver() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.estamosEnMercado()) {
                return Promise.resolve($(".icon.market-icon")[0]);
            }
            else {
                yield this.ponerHojaInventario(this.hojaInvetario);
                let itemAVender = this.buscarPaqueteCompradoEnInventario();
                if (this.paqueteComprado.precio * 0.04 > this.getOroActual()) {
                    this.actualizarEstadoPaquete(paquete_estados.JUNTAR_PLATA);
                    this.estado = tareaEstado.bloqueada;
                    return tareasControlador.getPronosticoClick();
                }
                else {
                    let intentosPutGridMarket = 0;
                    while ($('#market_sell').children().first().children().length == 0 && intentosPutGridMarket <= 3) {
                        let doubleClickEvent = new MouseEvent('dblclick', {
                            'view': window,
                            'bubbles': true,
                            'cancelable': true
                        });
                        itemAVender.dispatchEvent(doubleClickEvent);
                        intentosPutGridMarket++;
                        yield this.wait(1000 + (1000 * intentosPutGridMarket));
                    }
                    if ($('#market_sell').children().first().children().length == 0) {
                        throw 'Error al colocar paquete en el grid del mercado';
                    }
                    return yield this.ponerALaVenta();
                }
            }
        });
    }
    verificarDevolucion() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.estamosEnMercado()) {
                return $(".icon.market-icon")[0];
            }
            else {
                yield this.ponerHojaInventario(this.hojaInvetario);
                let estaEnELInventario = $('#inv .ui-droppable').toArray().some(e => e.getAttribute('data-tooltip').includes(this.paqueteComprado.itemNombre));
                if (estaEnELInventario) {
                    this.actualizarEstadoPaquete(paquete_estados.DEVOLVER);
                    this.intentosPaquetes++;
                    return $(".icon.market-icon")[0];
                }
                else {
                    this.estado = tareaEstado.finalizada;
                    return tareasControlador.getPronosticoClick();
                }
            }
        });
    }
    ponerALaVenta() {
        return __awaiter(this, void 0, void 0, function* () {
            let intentosVenta = 0;
            while ($('#preis')[0].value != this.paqueteComprado.precio.toString() &&
                $('#dauer')[0].value != '3' &&
                intentosVenta <= 3) {
                $('#preis')[0].value = this.paqueteComprado.precio.toString();
                $('#dauer')[0].value = '3';
                intentosVenta++;
                yield this.wait(1000 + (1000 * intentosVenta));
            }
            if ($('#preis')[0].value != this.paqueteComprado.precio.toString() &&
                $('#dauer')[0].value != '3') {
                throw 'Error al configurar la venta';
            }
            this.actualizarEstadoPaquete(paquete_estados.VERIFICAR_DEVOLUCION);
            return Promise.resolve($('#market_sell_box .awesome-button')[0]);
        });
    }
    actualizarEstadoPaquete(estadoNuevo) {
        this.estadoPaquete = estadoNuevo;
        //mandarMensajeBackground({header: MensajeHeader.CONTENT_SCRIPT_CAMBIO_PKT, estadoPaquete: estadoNuevo});
    }
    esperarInventariorAvailable() {
        return __awaiter(this, void 0, void 0, function* () {
            let chequeos = 0;
            while ($('#inv')[0].classList.contains('unavailable') && chequeos <= 8) {
                chequeos++;
                yield this.wait(500);
            }
            if ($('#inv')[0].classList.contains('unavailable')) {
                throw 'Can not load inventory';
            }
        });
    }
    ponerHojaInventario(nroHoja) {
        return __awaiter(this, void 0, void 0, function* () {
            let hoja = nroHoja; //cero es la primera
            let jQueryResult = $('a.awesome-tabs[data-available*=\"true\"]');
            let intentosCambioHoja = 0;
            yield this.esperarInventariorAvailable();
            while (jQueryResult.length >= hoja + 1 && !jQueryResult[hoja].classList.contains('current') && intentosCambioHoja <= 3) {
                jQueryResult[hoja].click();
                yield this.wait(1000 + (1000 * intentosCambioHoja));
                intentosCambioHoja++;
            }
            if (!jQueryResult[hoja].classList.contains('current')) {
                throw 'Error al cambiar la hoja del inventario.';
            }
        });
    }
    getProximoClick() {
        return __awaiter(this, void 0, void 0, function* () {
            let resultado;
            if (this.estadoPaquete === paquete_estados.COMPRAR && this.getOroActual() > datosContext.personaje.oroBaseParaPaquete) {
                this.intentosPaquetes = 0;
                resultado = this.comprar();
            }
            else if (this.intentosPaquetes == 5) {
                this.estado = tareaEstado.cancelada;
                resultado = tareasControlador.getPronosticoClick();
            }
            else if (this.estadoPaquete === paquete_estados.VERIFICAR_COMPRA) {
                resultado = yield this.agarrarPaquete();
            }
            else if (this.estadoPaquete === paquete_estados.DEVOLVER) {
                resultado = yield this.devolver();
            }
            else if (this.estadoPaquete === paquete_estados.JUNTAR_PLATA || this.estadoPaquete === paquete_estados.NO_HAY_DISPONIBLES) {
                this.estado = tareaEstado.bloqueada;
                resultado = tareasControlador.getPronosticoClick();
            }
            else if (this.estadoPaquete === paquete_estados.VERIFICAR_AGARRE) {
                resultado = yield this.verificarAgarre();
            }
            else if (this.estadoPaquete === paquete_estados.VERIFICAR_DEVOLUCION) {
                resultado = yield this.verificarDevolucion();
            }
            else {
                this.estado = tareaEstado.cancelada;
                resultado = tareasControlador.getPronosticoClick();
            }
            return Promise.resolve(resultado);
        });
    }
    seCancela() {
        return !datosContext.modulos.correrPaquetes ||
            (this.getOroActual() < datosContext.personaje.oroBaseParaPaquete && this.estadoPaquete === paquete_estados.COMPRAR);
    }
    equals(t) {
        return t.tipo_class == this.tipo_class;
    }
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    getHomeClick() {
        return $(".icon.market-icon")[0];
    }
}
