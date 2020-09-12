class ControladorDePaquetes {
    constructor(estadoPaquete, paqueteComprado) {
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
        //PONER HOJA 4
        let todosLosPaquetes = $('.ui-droppable').toArray();
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
            console.log(this.paqueteComprado);
            let paqueteAMover = this.buscarPaqueteComprado();
            console.log(paqueteAMover);
            if (paqueteAMover == null) {
                this.actualizarEstadoPaquete(paquete_estados.COMPRAR);
                this.estado = tareaEstado.finalizada;
                return Promise.resolve($('#menue_packages')[0]);
            }
            else {
                $(paqueteAMover).simulate("drag-n-drop", { dragTarget: $("#sstat_gold_val") });
                return new Promise((resolve) => window.setTimeout(() => {
                    this.actualizarEstadoPaquete(paquete_estados.DEVOLVER);
                    $(paqueteAMover).simulate("drag-n-drop", { dragTarget: $("#inv > div:nth-child(9)") });
                    window.setTimeout(() => { resolve($(".icon.market-icon")[0]); }, 1000);
                }, 1500));
            }
        }
    }
    devolver() {
        if (!this.estamosEnMercado()) {
            return Promise.resolve($(".icon.market-icon")[0]);
        }
        else {
            let itemAVender = this.buscarPaqueteCompradoEnInventario();
            if (itemAVender == null) {
                this.actualizarEstadoPaquete(paquete_estados.COMPRAR);
                this.estado = tareaEstado.finalizada;
                return Promise.resolve($('#menue_packages')[0]);
            }
            else if (this.paqueteComprado.precio * 0.04 > this.getOroActual()) {
                this.actualizarEstadoPaquete(paquete_estados.JUNTAR_PLATA);
                this.estado = tareaEstado.cancelada;
                return Promise.resolve($('#menue_packages')[0]);
            }
            else {
                $(itemAVender).simulate("drag-n-drop", { dragTarget: $("#market_sell") });
                this.estado = tareaEstado.finalizada;
                return new Promise((resolve) => window.setTimeout(() => { this.ponerALaVenta(resolve); }, 1000));
            }
        }
    }
    ponerALaVenta(resolve) {
        $('#preis')[0].value = this.paqueteComprado.precio.toString();
        $('#dauer')[0].value = '3';
        this.actualizarEstadoPaquete(paquete_estados.COMPRAR);
        window.setTimeout(() => { resolve($('#market_sell_box .awesome-button')[0]); }, 500);
    }
    actualizarEstadoPaquete(estadoNuevo) {
        this.estadoPaquete = estadoNuevo;
        mandarMensajeBackground({ header: MensajeHeader.CONTENT_SCRIPT_CAMBIO_PKT, estadoPaquete: estadoNuevo });
    }
    getProximoClick() {
        let hoja = 1; //cero es la primera
        let jQueryResult = $('a.awesome-tabs[data-available*=\"true\"]');
        if (jQueryResult.length >= hoja + 1)
            jQueryResult[hoja].click();
        if (this.estadoPaquete === paquete_estados.COMPRAR && this.getOroActual() > globalConfig.personaje.oroBaseParaPaquete) {
            return this.comprar();
        }
        else if (this.estadoPaquete === paquete_estados.VERIFICAR_COMPRA) {
            return this.agarrarPaquete();
        }
        else if (this.estadoPaquete === paquete_estados.DEVOLVER) {
            return this.devolver();
        }
        else {
            this.estado = tareaEstado.cancelada;
            return Promise.resolve($('#mainmenu > div:nth-child(1) a')[0]);
        }
    }
    seCancela() {
        return !globalConfig.modulos.correrPaquetes;
    }
    equals(t) {
        return t.tipo_class == this.tipo_class;
    }
}
