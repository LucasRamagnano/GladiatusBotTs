class ControladorDePaquetes implements Tarea{
    prioridad : tareaPrioridad = globalConfig.prioridades.paquete;
    estadoPaquete: paquete_estados = paquete_estados.COMPRAR;
    paqueteComprado: Paquete;
    estado: tareaEstado;
    tipo_class: string = 'ControladorDePaquetes';
    intentosPaquetes: number = 0;
    timed_out_miliseconds = 20000;
    minimoPrecioPaquete = 50000;
    hojaInvetario = 0;
    timeBlocked: number;
    timeRecheck: number = 5;

    fromJsonString(guardado: any): Guardable {
        this.estado = guardado.estado;
        this.paqueteComprado = guardado.paqueteComprado;
        this.estadoPaquete = guardado.estadoPaquete;
        this.intentosPaquetes = guardado.intentosPaquetes;
        this.timeBlocked = guardado.timeBlocked;
        return this;
    }
    /*this.paqueteComprado = new Paquete("[[[\"Madera\",\"white\"],[\"Valor 36 <div class=\\\"",111,
                                        "JTU",5000,1,null);*/

    getOroActual(): number {
        let oroHtml = $('#sstat_gold_val').html();
        return Number.parseInt(oroHtml.replace(/\./g,''));
    }

    estamosEnMercado(): boolean {
        return $('#guildMarketPage').length > 0
    }

    puedeDesbloquearse(): boolean {
        if(this.estadoPaquete == paquete_estados.NO_HAY_DISPONIBLES) {
            let milisecondsNow = Date.now().valueOf();
            let dif = milisecondsNow - this.timeBlocked;
            if(Math.floor(dif/60000) >= this.timeRecheck) {
                this.estadoPaquete = paquete_estados.COMPRAR;
                return true;
            }
        }else if(this.estadoPaquete == paquete_estados.JUNTAR_PLATA) {
            if(this.paqueteComprado.precio*0.04<this.getOroActual()) {
                this.estadoPaquete = paquete_estados.DEVOLVER;
                return true;
            }
        }
        return false;
    }

    buscarMejorPaquete(oroActual): Paquete{
        let minPrecioPaquete = this.minimoPrecioPaquete;
        let mejorPaquete = null;
        $('#market_item_table tr').each(function() {
            if($(this).find('th').length == 0) {
                let paquete = crearPackDesdeTr(this);
                if (paquete.precio > oroActual || paquete.precio < minPrecioPaquete || paquete.origen === globalConfig.personaje.nombre) {
                    //nada
                }else if(mejorPaquete===null && paquete.nivel == 1) {
                    mejorPaquete = paquete;
                }else if(paquete.nivel == 1 && Math.abs((mejorPaquete.precio-oroActual))>Math.abs((paquete.precio-oroActual))) {
                    mejorPaquete = paquete;
                }
            }
        });
        return mejorPaquete;
    }

    buscarPaqueteComprado(): HTMLElement {
        let todosLosPaquetes =  $('.packageItem .ui-draggable').toArray();
        return todosLosPaquetes.find(elem => elem.getAttribute('data-tooltip').includes(this.paqueteComprado.itemNombre))
    } 

    buscarPaqueteCompradoEnInventario(): HTMLElement {
        let todosLosPaquetes =  $('#inv .ui-droppable').toArray();
        return todosLosPaquetes.filter(elem=>elem.getAttribute('data-tooltip')!=null).find(elem => elem.getAttribute('data-tooltip').includes(this.paqueteComprado.itemNombre));
    } 

    comprar(): HTMLElement {
        if(!this.estamosEnMercado()) {
            return $(".icon.market-icon")[0];
        }else {
            let paquete = this.buscarMejorPaquete(this.getOroActual());
            if(paquete === null ) {
                this.estadoPaquete = paquete_estados.NO_HAY_DISPONIBLES;
                this.timeBlocked = Date.now().valueOf();
                this.estado = tareaEstado.bloqueada;
                return tareasControlador.getPronosticoClick();
            }else {
                this.paqueteComprado = paquete;
                this.estadoPaquete = paquete_estados.VERIFICAR_COMPRA;
                return paquete.link;
            }
        }
    }

    async agarrarPaquete(): Promise<HTMLElement> {
        if($('#packagesPage').length == 0) {
            return $('#menue_packages')[0];
        }else {
            await this.ponerHojaInventario(this.hojaInvetario);
            let paqueteAMover = this.buscarPaqueteComprado();
            if(paqueteAMover == null) {
                this.actualizarEstadoPaquete(paquete_estados.VERIFICAR_AGARRE);
            }else {
                let doubleClickEvent = new MouseEvent('dblclick', {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                });
                paqueteAMover.dispatchEvent(doubleClickEvent);
                this.actualizarEstadoPaquete(paquete_estados.VERIFICAR_AGARRE);
                await this.wait(2000);
            }
            return $('#menue_packages')[0];
        }
    }

    verificarAgarre(): HTMLElement  {
        let estaEnELInventario = $('#inv .ui-droppable').toArray().some(e=>e.getAttribute('data-tooltip').includes(this.paqueteComprado.itemNombre));
        if(estaEnELInventario) {
            this.actualizarEstadoPaquete(paquete_estados.DEVOLVER);
            this.intentosPaquetes = 0;
            return $(".icon.market-icon")[0];
        }else {
            this.actualizarEstadoPaquete(paquete_estados.VERIFICAR_COMPRA);
            this.intentosPaquetes++;
            return $('#menue_packages')[0];
        }
    }

    async devolver(): Promise<HTMLElement> {
        if(!this.estamosEnMercado()) {
            return Promise.resolve($(".icon.market-icon")[0]);
        }else {
            let itemAVender = this.buscarPaqueteCompradoEnInventario();
            /*
            Ak llega siempre con paquete o por lo menos deberia ser asi.
            if(itemAVender == null) {
                this.actualizarEstadoPaquete(paquete_estados.COMPRAR);
                this.estado = tareaEstado.finalizada;
                return Promise.resolve($('#menue_packages')[0]);
            }else */
            if(this.paqueteComprado.precio*0.04>this.getOroActual()){
                this.actualizarEstadoPaquete(paquete_estados.JUNTAR_PLATA);
                this.estado = tareaEstado.bloqueada;
                return tareasControlador.getPronosticoClick();
            }else {
                let intentosPutGridMarket = 0;
                while($('#market_sell').children().first().children().length==0 && intentosPutGridMarket <= 3) {
                    let doubleClickEvent = new MouseEvent('dblclick', {
                        'view': window,
                        'bubbles': true,
                        'cancelable': true
                    });
                    itemAVender.dispatchEvent(doubleClickEvent);
                    intentosPutGridMarket++;
                    await this.wait(1000+(1000*intentosPutGridMarket));
                }
                if($('#market_sell').children().first().children().length==0) {
                    throw 'Error al colocar paquete en el grid del mercado';
                }
                return await this.ponerALaVenta();
            }
        }
    }

    verificarDevolucion() : HTMLElement {
        if(!this.estamosEnMercado()) {
            return $(".icon.market-icon")[0];
        }else {
            let estaEnELInventario = $('#inv .ui-droppable').toArray().some(e=>e.getAttribute('data-tooltip').includes(this.paqueteComprado.itemNombre));
            if(estaEnELInventario) {
                this.actualizarEstadoPaquete(paquete_estados.DEVOLVER);
                this.intentosPaquetes++;
                return $(".icon.market-icon")[0];
            }else {
                this.estado = tareaEstado.finalizada;
                this.actualizarEstadoPaquete(paquete_estados.COMPRAR);
                return $(".icon.market-icon")[0];
            }
        }
    }

    async ponerALaVenta() {
        let intentosVenta = 0;
        while(  (<HTMLInputElement[]><unknown>$('#preis'))[0].value != this.paqueteComprado.precio.toString() &&
                (<HTMLInputElement[]><unknown>$('#dauer'))[0].value != '3' &&
                intentosVenta <= 3)
        {
            (<HTMLInputElement[]><unknown>$('#preis'))[0].value = this.paqueteComprado.precio.toString();
            (<HTMLInputElement[]><unknown>$('#dauer'))[0].value = '3';
            intentosVenta++;
            await this.wait(1000+(1000*intentosVenta))
        }
        if((<HTMLInputElement[]><unknown>$('#preis'))[0].value != this.paqueteComprado.precio.toString() &&
            (<HTMLInputElement[]><unknown>$('#dauer'))[0].value != '3') {
            throw 'Error al configurar la venta';
        }
        this.actualizarEstadoPaquete(paquete_estados.VERIFICAR_DEVOLUCION);
        return Promise.resolve($('#market_sell_box .awesome-button')[0]);
    }


    actualizarEstadoPaquete(estadoNuevo) {
        this.estadoPaquete = estadoNuevo;
        //mandarMensajeBackground({header: MensajeHeader.CONTENT_SCRIPT_CAMBIO_PKT, estadoPaquete: estadoNuevo});
    }

    async ponerHojaInventario(nroHoja:number) {
        let hoja = nroHoja; //cero es la primera
        let jQueryResult = $('a.awesome-tabs[data-available*=\"true\"]');
        let intentosCambioHoja = 0;
        while (jQueryResult.length >= hoja + 1 && !jQueryResult[hoja].classList.contains('current') && intentosCambioHoja <= 3) {
            jQueryResult[hoja].click();
            await this.wait(1000+(1000*intentosCambioHoja));
            intentosCambioHoja++;
        }
        if(!jQueryResult[hoja].classList.contains('current')) {
            throw 'Error al cambiar la hoja del inventario.';
        }
    }

    async getProximoClick(): Promise<HTMLElement> {
        let resultado : HTMLElement ;
        console.log(this);
        /*this.paqueteComprado = estadoEjecucion.paquete;
        this.estadoPaquete = estadoEjecucion.paqueteEstado;*/

        if (this.estadoPaquete === paquete_estados.COMPRAR && this.getOroActual() > globalConfig.personaje.oroBaseParaPaquete) {
            this.intentosPaquetes = 0;
            resultado = this.comprar();
        }else if(this.intentosPaquetes == 5) {
            this.estado = tareaEstado.cancelada;
            resultado = tareasControlador.getPronosticoClick();
        }else if(this.estadoPaquete === paquete_estados.VERIFICAR_COMPRA) {
            resultado = await this.agarrarPaquete();
        }else if(this.estadoPaquete === paquete_estados.DEVOLVER) {
            resultado = await this.devolver();
        }else if(this.estadoPaquete === paquete_estados.JUNTAR_PLATA || this.estadoPaquete === paquete_estados.NO_HAY_DISPONIBLES) {
            this.estado = tareaEstado.bloqueada;
            resultado = tareasControlador.getPronosticoClick();
        }else if(this.estadoPaquete === paquete_estados.VERIFICAR_AGARRE) {
            resultado = this.verificarAgarre();
        }else if(this.estadoPaquete === paquete_estados.VERIFICAR_DEVOLUCION) {
            resultado = this.verificarDevolucion();
        }else {
            this.estado = tareaEstado.cancelada;
            resultado = tareasControlador.getPronosticoClick();
        }
        //console.log(estadoEjecucion);
        //mandarMensajeBackground({header: MensajeHeader.CAMBIO_INTENTO_PAQUETES, intentos: estadoEjecucion.intestosPaquetes})
        return Promise.resolve(resultado);
    }

    seCancela(): boolean {
        return !globalConfig.modulos.correrPaquetes;
    }

    equals(t: Tarea): boolean {
        return t.tipo_class == this.tipo_class;
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getHomeClick(): HTMLElement {
        return $(".icon.market-icon")[0];
    }


}