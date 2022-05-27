class ControladorDeFundicion implements Tarea{
    //link : string = 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=forge&submod=smeltery&sh=202d551151ed895739913f0618b78290';
    private estado: tareaEstado = tareaEstado.enEspera;
    prioridad: tareaPrioridad = datosContext.prioridades.fundicion;
    estadoFundicion: fundicionEstados = fundicionEstados.AGARRAR_ITEMS;
    itemsAFundir: string[] = [];
    tipo_class: string = 'ControladorDeFundicion';
    numeroDeItemsAFundir: number;
    debuguear = true;
    timed_out_miliseconds = 60000;
    indicePagina = -1;
    indiceFiltro = -1;
    filtrosToUse:FiltroPaquete[] = [];
    static namesNotTuMelt = []
    blockTime: number;
    procesadoTerminado: boolean = false;

    constructor()
    constructor(numeroItems:number, estadoFundicion: fundicionEstados)
    constructor(numeroItems?:number, estadoFundicion?: fundicionEstados) {
        this.numeroDeItemsAFundir = numeroItems;
        this.estadoFundicion = estadoFundicion;
    };

    fromJsonString(jsonGuardado: any): Guardable {
        this.estado = jsonGuardado.estado;
        this.estadoFundicion = jsonGuardado.estadoFundicion;
        this.itemsAFundir  = jsonGuardado.itemsAFundir;
        this.tipo_class = jsonGuardado.tipo_class;
        this.numeroDeItemsAFundir = jsonGuardado.numeroDeItemsAFundir;
        this.indicePagina = jsonGuardado.indicePagina;
        this.indiceFiltro = jsonGuardado.indiceFiltro;
        this.blockTime = jsonGuardado.blockTime;
        this.procesadoTerminado = jsonGuardado.procesadoTerminado;
        this.filtrosToUse = jsonGuardado.filtrosToUse.map(e=>new FiltroPaquete(e.calidad,e.query));
        this.filtrosToUse = this.filtrosToUse.sort((e1,e2)=> {
                                                        if(e1.calidad > e2.calidad) {
                                                            return 1;
                                                        }else if(e1.query.length != 0 && e2.query.length == 0){
                                                            return 1;
                                                        }
                                                    });
        return this;
    }

    changeEstado(newEstado: tareaEstado): void {
        this.estado = newEstado;
    }

    getEstado(): tareaEstado {
        return this.estado;
    }

    equals(t: Tarea): boolean {
        return t.tipo_class == this.tipo_class;
    }

    getHomeClick(): HTMLElement {
        if(this.estadoFundicion == fundicionEstados.FUNDIR)
            return $('a').filter((i,e) => e.textContent == 'Fundición')[0];
        else
            return $('#menue_packages')[0];
    }

    getProximoClick(): Promise<HTMLElement> {
        if(this.estadoFundicion == fundicionEstados.AGARRAR_ITEMS && this.hayLugar()) {
            if($('#packagesPage').length==1)
                return this.filtrarYagarrarItems();
            else
                return Promise.resolve($('#menue_packages')[0]);
        } else if(this.estadoFundicion == fundicionEstados.FUNDIR){
            if($('#forgePage').length == 0) {//tamos en fundicion?
                return Promise.resolve(this.getHomeClick());
            }else if($('#mainnav .awesome-tabs')[1].classList.contains('current') && !this.hayRecursosReclamar()){//tamos en fundicion pestania?
                return this.fundir();
            }else if($('#mainnav .awesome-tabs')[1].classList.contains('current') && this.hayRecursosReclamar()){
                return this.agarrarRecursos();
            } else {
                return Promise.resolve($('#mainnav .awesome-tabs')[1]);
            }
        } else {
            return Promise.resolve(this.getHomeClick());
        }
    }

    seCancela(): boolean {
        return !datosContext.modulos.correrFundicion;
    }

    hayItems():boolean {
        return this.itemsAFundir.length != 0;
    }

    hayLugar():boolean{
        return this.itemsAFundir.length <= this.numeroDeItemsAFundir;
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async filtrarYagarrarItems(): Promise<HTMLElement> {
        //&& this.indicePagina == -1
        await this.filtersBackgroundAnalyze();
        if(this.indiceFiltro == -1 )
            this.indiceFiltro = this.filtrosToUse.length;
        if(this.indicePagina > -1 && this.indiceFiltro >= 0 && this.filtrosToUse[this.indiceFiltro].isFilterSeteado()){
            if(this.indicePagina == 9999) this.indicePagina = -1;//change to identify filter new and then -1 like before
            return this.agarrarItems();
        } else if(this.indicePagina == -1 &&
                        this.indiceFiltro != 0 &&
                        !this.filtrosToUse[this.indiceFiltro-1].isFilterSeteado()) { //Si hoja es -1 bajo uno, Empieza y bajo ya que el lenght es mas uno, y despues llegamos
            Consola.log(this.debuguear, 'Seteando filtro...');
            this.indiceFiltro--;
            this.filtrosToUse[this.indiceFiltro].setearFiltro();
            this.indicePagina = 9999;//change to identify filter new
            await this.wait(200);
            if($('input[value="Filtro"]').length != 0) {
                return $('input[value="Filtro"]')[0];
            } else {
                Consola.log(this.debuguear, 'Error seteando filtro...');
                return Promise.resolve($('#menue_packages')[0]);
            }
        } else if(this.indiceFiltro == 0 && this.indicePagina == -1) {
            Consola.log(this.debuguear, 'No hay mas paquetes');
            if(this.itemsAFundir.length > 0) {
                Consola.log(this.debuguear, 'Fundiendo paquetes agarrados');
                this.estadoFundicion = fundicionEstados.FUNDIR;
                return this.getHomeClick();
            }else {
                Consola.log(this.debuguear, 'No hay nada para fundir');
                this.estado = tareaEstado.bloqueada;
                this.blockTime = Date.now().valueOf();
                return tareasControlador.getPronosticoClick();
            }
        } else {
            Consola.log(this.debuguear, 'Entro else agarre');
            this.estado = tareaEstado.finalizada;
            return tareasControlador.getPronosticoClick();
        }

    }

    async filtersBackgroundAnalyze() {
        if(this.procesadoTerminado)
            return;

        let link = 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=packages&f=0&fq=-1&qry=&sh=&page=1';
        link = link.replace('sh=','sh='+estadoEjecucion.sh);
        let analizador = new AnalisisPaquetesBackground(link);
        let oroEmpaquetado = await analizador.analizarPaquetes();
        let itemsUsables : ItemUsable[] = analizador.getItemsUsables();

        Consola.log(this.debuguear,'Analizando filtros background');
        let allFilters = await ControladorDeFundicion.getFilters();
        allFilters.forEach(e=>e.hayItemsFundibles = e.hayItemsUsablesFundibles(itemsUsables))
        Consola.log(this.debuguear,'Filtros analizados');
        this.filtrosToUse = allFilters.filter(e=>e.hayItemsFundibles).sort((e1,e2)=> {
                                                                                if(e1.calidad > e2.calidad) {
                                                                                    return 1;
                                                                                }else if(e1.query.length != 0 && e2.query.length == 0){
                                                                                    return 1;
                                                                                }
                                                                            }).reverse();
        this.procesadoTerminado = true;
        mandarMensajeBackground({header: MensajeHeader.ACTUALIZAR_OROPKTS, oroPkt: oroEmpaquetado})
    }

    async agarrarItems(): Promise<HTMLElement> {
        let hoja = 0; //cero es la primera
        let resultado : Promise<HTMLElement> ;
        let jQueryResult = $('a.awesome-tabs[data-available*=\"true\"]');
        let allFilters = await ControladorDeFundicion.getFilters();
        let intentosCambioHoja = 1
        let itemsToGrab: HTMLElement[];
        let hayHojas: boolean = true;
        //Agarro paquetes de la ultima pagina, si no estoy ahi, voy para alla
        await this.wait(1000);
        if(this.indicePagina == -1 ) {
            this.indicePagina = Math.max(($($('.paging_numbers')[0]).children().length - 1),0);
            console.log(this.indicePagina)
            if($($('.paging_numbers')[0]).children().length<=2) {
                hayHojas = false;
            }
        }

        let continue_cheking = true;
        let initValue = this.indicePagina
        while(continue_cheking && initValue >= 13) {
            try {
                $($('.paging_numbers')[0]).children()[this.indicePagina].classList;
                continue_cheking = false;
            }catch (e) {
                this.indicePagina--;
            }
        }
        if(hayHojas && !$($('.paging_numbers')[0]).children()[this.indicePagina].classList.contains('paging_numbers_current')) {//funciona de pedo, chequear todo
            Consola.log(this.debuguear ,'Yendo a la pagina numero: ' + this.indicePagina);
            return Promise.resolve($($('.paging_numbers')[0]).children()[this.indicePagina]);
        } else if(await this.hayItemsFundiblesNow()) {
            Consola.log(this.debuguear ,'Comienza agarre de items');
            while (jQueryResult.length >= hoja + 1 && !jQueryResult[hoja].classList.contains('current') && intentosCambioHoja <= 5 ) {
                Consola.log(this.debuguear, 'Poniendo hoja numero: ' + hoja);
                jQueryResult[hoja].click();
                //each try, wait a little more
                await this.wait(1000 + (1000 * intentosCambioHoja));
                intentosCambioHoja++;
                if (!jQueryResult[hoja].classList.contains('current') && intentosCambioHoja > 5) {
                    Consola.log(this.debuguear, 'Error al cambiar de hoja!');
                    return Promise.resolve($('#menue_packages')[0]); //go to package again
                }
            }
            //await this.wait(1000);--already check arriba, nothing to wait
            let itemsAgarrados = 0;
            let itemsToGrab = ItemBuilder.createItemFromPackageItem($('#packages .packageItem').toArray().reverse())
                                    .filter(e=>e.getTipo()==ItemTypes.ItemUsable)
                                    .map(e=>{return <ItemUsable>e})
                                    .filter((elem, index) => {
                                            let hayEspacio = itemsAgarrados + 1 <= (this.numeroDeItemsAFundir-this.itemsAFundir.length);
                                            if(this.filtrosToUse[this.indiceFiltro].puedoFundirItem(elem) && hayEspacio) {
                                                itemsAgarrados++;
                                                return true;
                                            }
                                            return false;
                                    });
            let moving = true;
            let goNext = false;
            let i = 0;
            let tries = 0;
            Consola.log(this.debuguear,'Items a mover: ' + itemsToGrab.length);
            while(moving) {
                Consola.log(this.debuguear,'Moviendo item numero: ' + itemsToGrab.length + ' intento: ' + tries);
                goNext ? i++ : i;
                goNext = false;
                let elemToMove = itemsToGrab[i];
                let nameItem = elemToMove.getName();
                let doubleClickEvent = new MouseEvent('dblclick', {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                });
                let result = $(elemToMove.getHtmlElement()).find('.ui-draggable')[0].dispatchEvent(doubleClickEvent)
                Consola.log(this.debuguear,'Resultado dispatch: ' + result);
                tries++;
                await this.wait(2000);
                if($('#inv')[0].innerHTML.includes(nameItem)) {//se movio el item?
                    Consola.log(this.debuguear,'Se agarro correctamente el item: ' + nameItem);
                    goNext = true;
                    tries = 0;
                    this.itemsAFundir.push(nameItem);
                } else if (tries == 3) {
                    Consola.log(this.debuguear,'No se pudo mover el item: ' + nameItem);
                    goNext = true;
                    tries = 0;
                }
                //check de seguir
                Consola.log(this.debuguear,'Validando si hay mas items...');
                if(goNext && i+1 == itemsToGrab.length) {
                    moving = false;
                }else if(!await this.hayItemsFundiblesNow()) {
                    Consola.log(this.debuguear,'No hay items a fundir y no hay mas paginas...');
                    //this.estado = tareaEstado.enEspera;
                    this.estado = tareaEstado.finalizada;
                    return Promise.resolve(tareasControlador.getPronosticoClick());
                }
            }

        }


        if(!await this.hayItemsFundiblesNow() && this.indicePagina > 0 && this.numeroDeItemsAFundir != this.itemsAFundir.length && hayHojas) {
            Consola.log(this.debuguear,'No hay mas items en la pagina pero hay lugar, buscando mas items...');
            this.indicePagina--;
            let nextPage:any = $($('.paging_numbers')[0]).children()[this.indicePagina];
            if(nextPage.href!=undefined)
                return Promise.resolve(nextPage);
            else {
                this.indicePagina = -1;
                return this.filtrarYagarrarItems();
            }
        } else if(!await this.hayItemsFundiblesNow() && (this.indicePagina == 0 || !hayHojas) && this.numeroDeItemsAFundir != this.itemsAFundir.length) {
            Consola.log(this.debuguear,'No hay items a fundir y no hay mas paginas, viendo si hay mas filtros...');
            //this.estado = tareaEstado.enEspera;
            this.indicePagina = -1;
            return this.filtrarYagarrarItems();
        } else if(this.numeroDeItemsAFundir == this.itemsAFundir.length){
            Consola.log(this.debuguear,'Items completados');
            this.estadoFundicion = fundicionEstados.FUNDIR;
            return this.getHomeClick();
        } else {
            Consola.log(this.debuguear,'Entro else en agarrar items...');
            return Promise.resolve(tareasControlador.getPronosticoClick());
        }
    }

    async fundir(): Promise<HTMLElement> {
        let espaciosDisponibles = $('#forge_nav div.forge_closed');
        Consola.log(this.debuguear,'Entrando a fundir items...');
        if(espaciosDisponibles.length != 0 && this.itemsAFundir.length != 0) {
            let intentosCambioHoja = 0;
            //Changing forge page
            while (!espaciosDisponibles[0].classList.contains('tabActive') && intentosCambioHoja <= 5) {
                Consola.log(this.debuguear ,'Poniendo forja disponible.');
                espaciosDisponibles[0].click();
                //each try, wait a little more
                await this.wait(1000 + (1000 * intentosCambioHoja));
                intentosCambioHoja++;
                if (!espaciosDisponibles[0].classList.contains('tabActive') && intentosCambioHoja > 5) {
                    Consola.log(this.debuguear, 'Error al cambiar de hoja!');
                    return Promise.resolve($('#mainnav .awesome-tabs')[1]); //go to fundition again
                }
            }
            Consola.log(this.debuguear ,'Fundicion pagina pickeada.');
            //Changing inv page
            //inventory_nav
            let jQueryResult = $('#inventory_nav a.awesome-tabs[data-available*=\"true\"]');
            let hoja = 0;
            intentosCambioHoja = 0;
            while (jQueryResult.length >= hoja + 1 && !jQueryResult[hoja].classList.contains('current') && intentosCambioHoja <= 5) {
                Consola.log(this.debuguear ,'Comienza agarre de items');
                Consola.log(this.debuguear, 'Poniendo hoja numero: ' + hoja);
                jQueryResult[hoja].click();
                //each try, wait a little more
                await this.wait(1000 + (1000 * intentosCambioHoja));
                intentosCambioHoja++;
                if (!jQueryResult[hoja].classList.contains('current') && intentosCambioHoja > 5) {
                    Consola.log(this.debuguear, 'Error al cambiar de hoja!');
                    return Promise.resolve($('#mainnav .awesome-tabs')[1]); //go to package again
                }
            }
            Consola.log(this.debuguear ,'Inventorio pagina pickeada.');
            Consola.log(this.debuguear ,'Empezando a mover el item.');
            let elemToMove = $('#inv .ui-droppable').filter((index,e) => {
                return e.getAttribute('data-tooltip').toLocaleLowerCase().includes(this.itemsAFundir[0].toLocaleLowerCase());
            });
            if(elemToMove.length == 0) {
                Consola.log(this.debuguear, 'No se encontro el item ' + this.itemsAFundir[0]);
                this.itemsAFundir.shift();
                return Promise.resolve($('#mainnav .awesome-tabs')[1]);
            }
            let intentoDropItem = 0;
            while ($('#itembox').children().length == 0 //item forge has nothing
                    && intentoDropItem <= 5) {
                Consola.log(this.debuguear, 'Dropeando item');
                let doubleClickEvent = new MouseEvent('dblclick', {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                });
                //let result = elemToMove[0].dispatchEvent(doubleClickEvent)
                this.moverItemAFundidora(elemToMove[0]);
                //each try, wait a little more
                await this.wait(1000 + (1000 * intentoDropItem));
                intentoDropItem++;
                if ($('#itembox').children().length == 0 && intentoDropItem > 5) {
                    Consola.log(this.debuguear, 'Error al dropear el item!');
                    this.itemsAFundir.shift();
                    return Promise.resolve($('#mainnav .awesome-tabs')[1]); //go to package again
                }
            }
            this.itemsAFundir.shift();
            await this.wait(500);
            return Promise.resolve($('#rent .awesome-button')[0]);


        } else if (espaciosDisponibles.length == 0 && this.itemsAFundir.length == 0) {
            //TERMINA ALL OK
            Consola.log(this.debuguear, 'Entro a no hay ni items ni espacios');
            this.estado = tareaEstado.finalizada;
            return Promise.resolve(tareasControlador.getPronosticoClick());
        } else if(espaciosDisponibles.length == 0 && this.itemsAFundir.length != 0) {
            Consola.log(this.debuguear, 'Hay items y no hay lugar para fundir.');
            //this.estado = tareaEstado.enEspera;
            this.estado = tareaEstado.finalizada;
            return Promise.resolve(tareasControlador.getPronosticoClick());
        } else {
            Consola.log(this.debuguear, 'Entro else');
            this.estado = tareaEstado.finalizada;
            return Promise.resolve(tareasControlador.getPronosticoClick());
        }
    }

    async agarrarRecursos() {
        let agarrarRecursosElement = $('.background_trader .awesome-button').filter(function(){
            return this.textContent.includes('× Guardar recursos');
        })
        if(agarrarRecursosElement.length != 0) {
            return Promise.resolve(agarrarRecursosElement[0]);
        } else {
            return Promise.resolve($('#mainnav .awesome-tabs')[1]);
        }
    }

    hayRecursosReclamar() {
        let agarrarRecursosElement = $('.background_trader .awesome-button').filter(function(){
            return this.textContent.includes('× Guardar recursos');
        })
        return agarrarRecursosElement.length != 0;
    }

    moverItemAFundidora(item) {
        let spot = {
            parent : $('#itembox'),
            x : ($('#itembox').offset().left + ($('#itembox').width() / 2)),
            y : ($('#itembox').offset().top + ($('#itembox').height() / 2))
        }
        this.drag(item, spot.parent, spot.x, spot.y);
    }

    drag(item, parent, x, y){
        let cords_item = $(item).offset();
        let cords_item_xy = {x: cords_item.left, y: cords_item.top};
        let cords_target = {x: x, y: y};
        this.fireMouseEvent(item, 'mousedown', {clientX: cords_item_xy.x - window.scrollX, clientY: cords_item_xy.y - window.scrollY});
        this.fireMouseEvent(document, 'mousemove', {clientX: cords_target.x - window.scrollX, clientY: cords_target.y - window.scrollY});
        this.fireMouseEvent(document, 'mouseup', {clientX: cords_target.x - window.scrollX, clientY: cords_target.y - window.scrollY});
    }

    fireMouseEvent(elem, type, opt) {
        let options = {
            bubbles: true,
            cancelable: (type !== 'mousemove'),
            view: window,
            detail: 0,
            screenX: 0,
            screenY: 0,
            clientX: 1,
            clientY: 1,
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            metaKey: false,
            button: 0,
            relatedTarget: undefined
        };
        options.clientX = opt.clientX;
        options.clientY = opt.clientY;
        let event = document.createEvent('MouseEvents');
        event.initMouseEvent( type, options.bubbles, options.cancelable,
        options.view, options.detail,
        options.screenX, options.screenY, options.clientX, options.clientY,
        options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
        options.button, options.relatedTarget || document.body.parentNode );
        elem.dispatchEvent(event);
    }

    async hayItemsFundiblesNow():Promise<boolean> {
        let filtroActual = this.filtrosToUse[this.indiceFiltro];
        let paquetesTd = $('#packages .packageItem').toArray();
        let items = ItemBuilder.createItemFromPackageItem(paquetesTd).filter(e=>e.getTipo()==ItemTypes.ItemUsable).map(e=>{return <ItemUsable>e});
        return filtroActual.hayItemsUsablesFundibles(items)
    }

    static esItemToWarn(item:HTMLElement, filtros) {//todo ver donde poner
        let nameitem = item.getAttribute('data-tooltip').split('"')[1];
        let categoria = getItemCategoria(nameitem);
        let ToKeep = this.namesNotTuMelt.some((e)=>nameitem.includes(e)) && (categoria.nombreCategoria == 'Fundible' || categoria.subCategoria == 'Joya');
        let esWaringFundible = categoria.nombreCategoria == 'Fundible' && filtros.filter(e=>e.query.length>0).some(e=>nameitem.toLowerCase().includes(e.query.toLowerCase()));
        let esWaringJoyaFundible = categoria.subCategoria == 'Joya' && filtros.filter(e=>e.query.length>0).some(e=>nameitem.toLowerCase().includes(e.query.toLowerCase()));
        return ToKeep || esWaringFundible || esWaringJoyaFundible;
    }

    puedeDesbloquearse(): boolean {
        let milisecondsNow = Date.now().valueOf();
        let dif = milisecondsNow - this.blockTime;
        return Math.floor(dif/60000) >= 10;
    }

    static async getFilters() {
        let filtros = await this.getFiltrosFundicionItems();
        filtros = filtros.sort((e1,e2)=> {
            if(e1.calidad > e2.calidad) {
                return 1;
            }else if(e1.query.length != 0 && e2.query.length == 0){
                return 1;
            }
        }).reverse();
        return filtros;
    }

    private static getFiltrosFundicionItems():Promise<FiltroPaquete[]> {
        return new Promise((resolve) => chrome.storage.local.get(Keys.FILTRO_ITEMS,(result)=>{
            let filtroRaw = result[Keys.FILTRO_ITEMS];
            let filtros: FiltroPaquete[] = [];
            if(filtroRaw===undefined) {
                filtros = globalFiltros;
                this.resetFiltrosItems();
            } else {
                for(const fraw of filtroRaw) {
                    filtros.push(<FiltroPaquete>new FiltroPaquete(null,null).fromJsonString(fraw));
                }
            }
            resolve(filtros);
        }))
    }

    static async resetFiltrosItems() {
        let toSave = {};
        toSave[Keys.FILTRO_ITEMS] = globalFiltros;
        new Promise((resolve) => {
            chrome.storage.local.set(toSave);
            resolve(toSave[Keys.FILTRO_ITEMS]);
        })
    }

    static async removerFundicionFiltro(query:string):Promise<FiltroPaquete[]> {
        let filtros = await this.getFiltrosFundicionItems();
        let existeFiltro = filtros.some(e=>e.query == query);
        if(existeFiltro) {
            let toSave = {};
            toSave[Keys.FILTRO_ITEMS] = filtros.filter(e=>e.query.toLowerCase() != query.toLowerCase());
            return new Promise((resolve => {
                chrome.storage.local.set(toSave, ()=> {
                        console.log('Removido correctamente.')});
                        resolve(toSave[Keys.FILTRO_ITEMS]);
            }))
        }else {
            console.log('No se encontro el filtro.')
            return filtros;
        }
    }
}