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
    constructor(estadoPaquete, paqueteComprado) {
        this.prioridad = globalConfig.prioridades.paquete;
        this.tipo_class = 'ControladorDePaquetes';
        this.estadoPaquete = estadoPaquete;
        this.paqueteComprado = paqueteComprado;
    }
    fromJsonString(guardado) {
        this.estado = guardado.estado;
        this.estadoPaquete = guardado.estadoPaquete;
        this.paqueteComprado = guardado.paqueteComprado;
        return this;
    }
    getOroActual() {
        let oroHtml = $('#sstat_gold_val').html();
        return Number.parseInt(oroHtml.replace(/\./g, ''));
    }
    estamosEnMercado() {
        return $('#guildMarketPage').length > 0;
    }
    buscarMejorPaquete(oroActual) {
        let mejorPaquete = null;
        $('#market_item_table tr').each(function () {
            if ($(this).find('th').length == 0) {
                let paquete = crearPackDesdeTr(this);
                if (paquete.precio > oroActual || paquete.precio < 50000 || paquete.origen === globalConfig.personaje.nombre) {
                    //nada
                }
                else if (mejorPaquete === null) {
                    mejorPaquete = paquete;
                }
                else if (Math.abs((mejorPaquete.precio - oroActual)) > Math.abs((paquete.precio - oroActual))) {
                    mejorPaquete = paquete;
                }
            }
        });
        return mejorPaquete;
    }
    buscarPaqueteComprado() {
        let todosLosPaquetes = $('.packageItem .ui-draggable').toArray();
        return todosLosPaquetes.find(elem => elem.getAttribute('data-tooltip').includes(this.paqueteComprado.itemNombre));
    }
    buscarPaqueteCompradoEnInventario() {
        let todosLosPaquetes = $('#inv .ui-droppable').toArray();
        return todosLosPaquetes.filter(elem => elem.getAttribute('data-tooltip') != null).find(elem => elem.getAttribute('data-tooltip').includes(this.paqueteComprado.itemNombre));
    }
    comprar() {
        if (!this.estamosEnMercado()) {
            return Promise.resolve($(".icon.market-icon")[0]);
        }
        else {
            let paquete = this.buscarMejorPaquete(this.getOroActual());
            if (paquete === null) {
                this.actualizarEstadoPaquete(paquete_estados.NO_HAY_DISPONIBLES);
                this.estado = tareaEstado.toTheEnd;
                return Promise.resolve($(".icon.market-icon")[0]);
            }
            else {
                mandarMensajeBackground({
                    header: MensajeHeader.CONTENT_SCRIPT_PKT_COMPRADO,
                    paqueteComprado: paquete
                });
                this.paqueteComprado = paquete;
                this.actualizarEstadoPaquete(paquete_estados.VERIFICAR_COMPRA);
                return Promise.resolve(paquete.link);
            }
        }
    }
    agarrarPaquete() {
        if ($('#packagesPage').length == 0) {
            return Promise.resolve($('#menue_packages')[0]);
        }
        else {
            let paqueteAMover = this.buscarPaqueteComprado();
            if (paqueteAMover == null) {
                this.actualizarEstadoPaquete(paquete_estados.VERIFICAR_AGARRE);
                return Promise.resolve($('#menue_packages')[0]);
            }
            else {
                $(paqueteAMover).simulate("drag-n-drop", { dragTarget: $("#sstat_gold_val") });
                return new Promise((resolve) => window.setTimeout(() => {
                    this.actualizarEstadoPaquete(paquete_estados.VERIFICAR_AGARRE);
                    $(paqueteAMover).simulate("drag-n-drop", { dragTarget: $("#inv > div:nth-child(9)") });
                    window.setTimeout(() => { resolve($('#menue_packages')[0]); }, 1000);
                }, 1500));
            }
        }
    }
    verificarAgarre() {
        let estaEnELInventario = $('#inv .ui-droppable').toArray().some(e => e.getAttribute('data-tooltip').includes(this.paqueteComprado.itemNombre));
        if (estaEnELInventario) {
            this.actualizarEstadoPaquete(paquete_estados.DEVOLVER);
            estadoEjecucion.intestosPaquetes = 0;
            return Promise.resolve($(".icon.market-icon")[0]);
        }
        else {
            this.actualizarEstadoPaquete(paquete_estados.VERIFICAR_COMPRA);
            estadoEjecucion.intestosPaquetes = estadoEjecucion.intestosPaquetes + 1;
            return Promise.resolve($('#menue_packages')[0]);
        }
    }
    devolver() {
        if (!this.estamosEnMercado()) {
            return Promise.resolve($(".icon.market-icon")[0]);
        }
        else {
            let itemAVender = this.buscarPaqueteCompradoEnInventario();
            /*
            Ak llega siempre con paquete o por lo menos deberia ser asi.
            if(itemAVender == null) {
                this.actualizarEstadoPaquete(paquete_estados.COMPRAR);
                this.estado = tareaEstado.finalizada;
                return Promise.resolve($('#menue_packages')[0]);
            }else */
            if (this.paqueteComprado.precio * 0.04 > this.getOroActual()) {
                this.actualizarEstadoPaquete(paquete_estados.JUNTAR_PLATA);
                this.estado = tareaEstado.toTheEnd;
                return Promise.resolve($('a[title=\'Panteón\']')[0]);
            }
            else {
                $(itemAVender).simulate("drag-n-drop", { dragTarget: $("#market_sell") });
                this.actualizarEstadoPaquete(paquete_estados.VERIFICAR_DEVOLUCION);
                return new Promise((resolve) => window.setTimeout(() => { this.ponerALaVenta(resolve); }, 1000));
            }
        }
    }
    verificarDevolucion() {
        if (!this.estamosEnMercado()) {
            return Promise.resolve($(".icon.market-icon")[0]);
        }
        else {
            let estaEnELInventario = $('#inv .ui-droppable').toArray().some(e => e.getAttribute('data-tooltip').includes(this.paqueteComprado.itemNombre));
            if (estaEnELInventario) {
                this.actualizarEstadoPaquete(paquete_estados.DEVOLVER);
                estadoEjecucion.intestosPaquetes = estadoEjecucion.intestosPaquetes + 1;
                return Promise.resolve($(".icon.market-icon")[0]);
            }
            else {
                this.estado = tareaEstado.finalizada;
                this.actualizarEstadoPaquete(paquete_estados.COMPRAR);
                return Promise.resolve($(".icon.market-icon")[0]);
            }
        }
    }
    ponerALaVenta(resolve) {
        $('#preis')[0].value = this.paqueteComprado.precio.toString();
        $('#dauer')[0].value = '3';
        window.setTimeout(() => { resolve($('#market_sell_box .awesome-button')[0]); }, 500);
    }
    actualizarEstadoPaquete(estadoNuevo) {
        this.estadoPaquete = estadoNuevo;
        mandarMensajeBackground({ header: MensajeHeader.CONTENT_SCRIPT_CAMBIO_PKT, estadoPaquete: estadoNuevo });
    }
    getProximoClick() {
        return __awaiter(this, void 0, void 0, function* () {
            let hoja = 1; //cero es la primera
            let resultado;
            let jQueryResult = $('a.awesome-tabs[data-available*=\"true\"]');
            if (jQueryResult.length >= hoja + 1 && !jQueryResult[hoja].classList.contains('current')) {
                jQueryResult[hoja].click();
                yield this.wait(2000);
            }
            this.paqueteComprado = estadoEjecucion.paquete;
            this.estadoPaquete = estadoEjecucion.paqueteEstado;
            if (this.estadoPaquete === paquete_estados.COMPRAR && this.getOroActual() > globalConfig.personaje.oroBaseParaPaquete) {
                estadoEjecucion.intestosPaquetes = 0;
                resultado = this.comprar();
            }
            else if (estadoEjecucion.intestosPaquetes == 5) {
                this.estado = tareaEstado.cancelada;
                this.actualizarEstadoPaquete(paquete_estados.COMPRAR);
                console.log("REVISAR PAQUETES.");
                resultado = Promise.resolve($('#mainmenu > div:nth-child(1) a')[0]);
            }
            else if (this.estadoPaquete === paquete_estados.VERIFICAR_COMPRA) {
                resultado = this.agarrarPaquete();
            }
            else if (this.estadoPaquete === paquete_estados.DEVOLVER) {
                resultado = this.devolver();
            }
            else if (this.estadoPaquete === paquete_estados.JUNTAR_PLATA || this.estadoPaquete === paquete_estados.NO_HAY_DISPONIBLES) {
                this.estado = tareaEstado.toTheEnd;
                resultado = Promise.resolve($('a[title=\'Panteón\']')[0]);
            }
            else if (this.estadoPaquete === paquete_estados.VERIFICAR_AGARRE) {
                resultado = this.verificarAgarre();
            }
            else if (this.estadoPaquete === paquete_estados.VERIFICAR_DEVOLUCION) {
                resultado = this.verificarDevolucion();
            }
            else {
                this.estado = tareaEstado.cancelada;
                this.actualizarEstadoPaquete(paquete_estados.COMPRAR);
                resultado = Promise.resolve($('#mainmenu > div:nth-child(1) a')[0]);
            }
            console.log(estadoEjecucion);
            mandarMensajeBackground({ header: MensajeHeader.CAMBIO_INTENTO_PAQUETES, intentos: estadoEjecucion.intestosPaquetes });
            return resultado;
        });
    }
    seCancela() {
        return !globalConfig.modulos.correrPaquetes;
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
