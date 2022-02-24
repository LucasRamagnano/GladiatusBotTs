var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class ControladorDeFundicion {
    constructor(numeroItems, estadoFundicion) {
        //link : string = 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=forge&submod=smeltery&sh=202d551151ed895739913f0618b78290';
        this.estado = tareaEstado.enEspera;
        this.prioridad = globalConfig.prioridades.fundicion;
        this.estadoFundicion = fundicionEstados.AGARRAR_ITEMS;
        this.itemsAFundir = [];
        this.tipo_class = 'ControladorDeFundicion';
        this.debuguear = true;
        this.timed_out_miliseconds = 60000;
        this.indicePagina = -1;
        this.indiceFiltro = -1;
        this.filtrosToUse = [
            new FiltroPaquete(calidadesItemsPaquetes.PURPURA, ''),
            new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'sufrimiento'),
            new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'sextus'),
            new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'titus'),
            new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'mateus'),
            new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'decimus'),
            new FiltroPaquete(calidadesItemsPaquetes.VERDE, 'constancio'),
            new FiltroPaquete(calidadesItemsPaquetes.AZUL, ''),
            new FiltroPaquete(calidadesItemsPaquetes.VERDE, '')
        ].reverse();
        this.namesNotTuMelt = ['Antonius'];
        this.numeroDeItemsAFundir = numeroItems;
        this.estadoFundicion = estadoFundicion;
    }
    ;
    fromJsonString(jsonGuardado) {
        this.estado = jsonGuardado.estado;
        this.estadoFundicion = jsonGuardado.estadoFundicion;
        this.itemsAFundir = jsonGuardado.itemsAFundir;
        this.tipo_class = jsonGuardado.tipo_class;
        this.numeroDeItemsAFundir = jsonGuardado.numeroDeItemsAFundir;
        this.indicePagina = jsonGuardado.indicePagina;
        this.indiceFiltro = jsonGuardado.indiceFiltro;
        this.blockTime = jsonGuardado.blockTime;
        return this;
    }
    equals(t) {
        return t.tipo_class == this.tipo_class;
    }
    getHomeClick() {
        if (this.estadoFundicion == fundicionEstados.FUNDIR)
            return $('a').filter((i, e) => e.textContent == 'Fundición')[0];
        else
            return $('#menue_packages')[0];
    }
    getProximoClick() {
        if (this.estadoFundicion == fundicionEstados.AGARRAR_ITEMS && this.hayLugar()) {
            if ($('#packagesPage').length == 1)
                return this.filtrarYagarrarItems();
            else
                return Promise.resolve($('#menue_packages')[0]);
        }
        else if (this.estadoFundicion == fundicionEstados.FUNDIR) {
            if ($('#forgePage').length == 0) { //tamos en fundicion?
                return Promise.resolve(this.getHomeClick());
            }
            else if ($('#mainnav .awesome-tabs')[1].classList.contains('current') && !this.hayRecursosReclamar()) { //tamos en fundicion pestania?
                return this.fundir();
            }
            else if ($('#mainnav .awesome-tabs')[1].classList.contains('current') && this.hayRecursosReclamar()) {
                return this.agarrarRecursos();
            }
            else {
                return Promise.resolve($('#mainnav .awesome-tabs')[1]);
            }
        }
        else {
            return Promise.resolve(this.getHomeClick());
        }
    }
    seCancela() {
        return !globalConfig.modulos.correrFundicion;
    }
    hayItems() {
        return this.itemsAFundir.length != 0;
    }
    hayLugar() {
        return this.itemsAFundir.length <= this.numeroDeItemsAFundir;
    }
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    static lugarDisponibleBackground() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield fetch('https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=forge&submod=smeltery&sh=202d551151ed895739913f0618b78290');
            let htmlPage = yield response.text();
            let lugarDisponible = $(htmlPage).find('.forge_closed').length;
            return Promise.resolve(lugarDisponible);
        });
    }
    filtrarYagarrarItems() {
        return __awaiter(this, void 0, void 0, function* () {
            //&& this.indicePagina == -1
            if (this.indiceFiltro == -1)
                this.indiceFiltro = this.filtrosToUse.length;
            if (this.indicePagina > -1 && this.indiceFiltro >= 0 && this.filtrosToUse[this.indiceFiltro].isFilterSeteado()) {
                if (this.indicePagina == 9999)
                    this.indicePagina = -1; //change to identify filter new and then -1 like before
                return this.agarrarItems();
            }
            else if (this.indicePagina == -1 &&
                this.indiceFiltro != 0 &&
                !this.filtrosToUse[this.indiceFiltro - 1].isFilterSeteado()) { //Si hoja es -1 bajo uno, Empieza y bajo ya que el lenght es mas uno, y despues llegamos
                Consola.log(this.debuguear, 'Seteando filtro...');
                this.indiceFiltro--;
                this.filtrosToUse[this.indiceFiltro].setearFiltro();
                this.indicePagina = 9999; //change to identify filter new
                yield this.wait(200);
                if ($('input[value="Filtro"]').length != 0) {
                    return $('input[value="Filtro"]')[0];
                }
                else {
                    Consola.log(this.debuguear, 'Error seteando filtro...');
                    return Promise.resolve($('#menue_packages')[0]);
                }
                ;
            }
            else if (this.indiceFiltro == 0 && this.indicePagina == -1) {
                Consola.log(this.debuguear, 'No hay mas paquetes');
                if (this.itemsAFundir.length > 0) {
                    Consola.log(this.debuguear, 'Fundiendo paquetes agarrados');
                    this.estadoFundicion = fundicionEstados.FUNDIR;
                    return this.getHomeClick();
                }
                else {
                    Consola.log(this.debuguear, 'No hay nada para fundir');
                    this.estado = tareaEstado.bloqueada;
                    this.blockTime = Date.now().valueOf();
                    return tareasControlador.getPronosticoClick();
                }
            }
            else {
                Consola.log(this.debuguear, 'Entro else');
                this.estado = tareaEstado.finalizada;
                return tareasControlador.getPronosticoClick();
            }
        });
    }
    agarrarItems() {
        return __awaiter(this, void 0, void 0, function* () {
            let hoja = 0; //cero es la primera
            let resultado;
            let jQueryResult = $('a.awesome-tabs[data-available*=\"true\"]');
            let intentosCambioHoja = 1;
            let itemsToGrab;
            let hayHojas = true;
            //Agarro paquetes de la ultima pagina, si no estoy ahi, voy para alla
            yield this.wait(1000);
            if (this.indicePagina == -1) {
                this.indicePagina = Math.max(($($('.paging_numbers')[0]).children().length - 1), 0);
                console.log(this.indicePagina);
                if ($($('.paging_numbers')[0]).children().length <= 2) {
                    hayHojas = false;
                }
            }
            if (hayHojas && !$($('.paging_numbers')[0]).children()[this.indicePagina].classList.contains('paging_numbers_current')) { //funciona de pedo, chequear todo
                Consola.log(this.debuguear, 'Yendo a la pagina numero: ' + this.indicePagina);
                return Promise.resolve($($('.paging_numbers')[0]).children()[this.indicePagina]);
            }
            else if (this.hayItemsFundibles()) {
                Consola.log(this.debuguear, 'Comienza agarre de items');
                while (jQueryResult.length >= hoja + 1 && !jQueryResult[hoja].classList.contains('current') && intentosCambioHoja <= 5) {
                    Consola.log(this.debuguear, 'Poniendo hoja numero: ' + hoja);
                    jQueryResult[hoja].click();
                    //each try, wait a little more
                    yield this.wait(1000 + (1000 * intentosCambioHoja));
                    intentosCambioHoja++;
                    if (!jQueryResult[hoja].classList.contains('current') && intentosCambioHoja > 5) {
                        Consola.log(this.debuguear, 'Error al cambiar de hoja!');
                        return Promise.resolve($('#menue_packages')[0]); //go to package again
                    }
                }
                //await this.wait(1000);--already check arriba, nothing to wait
                let itemsAgarrados = 0;
                itemsToGrab = $('#packages_wrapper .ui-draggable').toArray().reverse()
                    .filter((elem, index) => {
                    let hayEspacio = itemsAgarrados + 1 <= (this.numeroDeItemsAFundir - this.itemsAFundir.length);
                    if (this.esItemFundible(elem) && hayEspacio) {
                        itemsAgarrados++;
                        return true;
                    }
                    return false;
                });
                let moving = true;
                let goNext = false;
                let i = 0;
                let tries = 0;
                Consola.log(this.debuguear, 'Items a mover: ' + itemsToGrab.length);
                while (moving) {
                    Consola.log(this.debuguear, 'Moviendo item numero: ' + itemsToGrab.length + ' intento: ' + tries);
                    goNext ? i++ : i;
                    goNext = false;
                    let elemToMove = itemsToGrab[i];
                    let nameItem = elemToMove.getAttribute('data-tooltip').split('"')[1];
                    let doubleClickEvent = new MouseEvent('dblclick', {
                        'view': window,
                        'bubbles': true,
                        'cancelable': true
                    });
                    let result = elemToMove.dispatchEvent(doubleClickEvent);
                    Consola.log(this.debuguear, 'Resultado dispatch: ' + result);
                    tries++;
                    yield this.wait(1500);
                    if (!elemToMove.classList.contains('ui-draggable')) { //se movio el item?
                        Consola.log(this.debuguear, 'Se agarro correctamente el item: ' + nameItem);
                        goNext = true;
                        tries = 0;
                        this.itemsAFundir.push(nameItem);
                    }
                    else if (tries == 3) {
                        Consola.log(this.debuguear, 'No se pudo mover el item: ' + nameItem);
                        goNext = true;
                        tries = 0;
                    }
                    //check de seguir
                    Consola.log(this.debuguear, 'Validando si hay mas items...');
                    if (goNext && i + 1 == itemsToGrab.length) {
                        moving = false;
                    }
                    else if (!this.hayItemsFundibles()) {
                        Consola.log(this.debuguear, 'No hay items a fundir y no hay mas paginas...');
                        //this.estado = tareaEstado.enEspera;
                        this.estado = tareaEstado.finalizada;
                        return Promise.resolve(tareasControlador.getPronosticoClick());
                    }
                }
            }
            if (!this.hayItemsFundibles() && this.indicePagina > 0 && this.numeroDeItemsAFundir != this.itemsAFundir.length && hayHojas) {
                Consola.log(this.debuguear, 'No hay mas items en la pagina pero hay lugar, buscando mas items...');
                this.indicePagina--;
                let nextPage = $($('.paging_numbers')[0]).children()[this.indicePagina];
                if (nextPage.href != undefined)
                    return Promise.resolve(nextPage);
                else {
                    this.indicePagina = -1;
                    return this.filtrarYagarrarItems();
                }
            }
            else if (!this.hayItemsFundibles() && (this.indicePagina == 0 || !hayHojas) && this.numeroDeItemsAFundir != this.itemsAFundir.length) {
                Consola.log(this.debuguear, 'No hay items a fundir y no hay mas paginas, viendo si hay mas filtros...');
                //this.estado = tareaEstado.enEspera;
                this.indicePagina = -1;
                return this.filtrarYagarrarItems();
            }
            else if (this.numeroDeItemsAFundir == this.itemsAFundir.length) {
                Consola.log(this.debuguear, 'Items completados');
                this.estadoFundicion = fundicionEstados.FUNDIR;
                return this.getHomeClick();
            }
            else {
                Consola.log(this.debuguear, 'Entro else en agarrar items...');
                return Promise.resolve(tareasControlador.getPronosticoClick());
            }
        });
    }
    fundir() {
        return __awaiter(this, void 0, void 0, function* () {
            let espaciosDisponibles = $('#forge_nav div.forge_closed');
            Consola.log(this.debuguear, 'Entrando a fundir items...');
            if (espaciosDisponibles.length != 0 && this.itemsAFundir.length != 0) {
                let intentosCambioHoja = 0;
                //Changing forge page
                while (!espaciosDisponibles[0].classList.contains('tabActive') && intentosCambioHoja <= 5) {
                    Consola.log(this.debuguear, 'Poniendo forja disponible.');
                    espaciosDisponibles[0].click();
                    //each try, wait a little more
                    yield this.wait(1000 + (1000 * intentosCambioHoja));
                    intentosCambioHoja++;
                    if (!espaciosDisponibles[0].classList.contains('tabActive') && intentosCambioHoja > 5) {
                        Consola.log(this.debuguear, 'Error al cambiar de hoja!');
                        return Promise.resolve($('#mainnav .awesome-tabs')[1]); //go to fundition again
                    }
                }
                Consola.log(this.debuguear, 'Fundicion pagina pickeada.');
                //Changing inv page
                //inventory_nav
                let jQueryResult = $('#inventory_nav a.awesome-tabs[data-available*=\"true\"]');
                let hoja = 0;
                intentosCambioHoja = 0;
                while (jQueryResult.length >= hoja + 1 && !jQueryResult[hoja].classList.contains('current') && intentosCambioHoja <= 5) {
                    Consola.log(this.debuguear, 'Comienza agarre de items');
                    Consola.log(this.debuguear, 'Poniendo hoja numero: ' + hoja);
                    jQueryResult[hoja].click();
                    //each try, wait a little more
                    yield this.wait(1000 + (1000 * intentosCambioHoja));
                    intentosCambioHoja++;
                    if (!jQueryResult[hoja].classList.contains('current') && intentosCambioHoja > 5) {
                        Consola.log(this.debuguear, 'Error al cambiar de hoja!');
                        return Promise.resolve($('#mainnav .awesome-tabs')[1]); //go to package again
                    }
                }
                Consola.log(this.debuguear, 'Inventorio pagina pickeada.');
                Consola.log(this.debuguear, 'Empezando a mover el item.');
                let elemToMove = $('#inv .ui-droppable').filter((index, e) => {
                    return e.getAttribute('data-tooltip').toLocaleLowerCase().includes(this.itemsAFundir[0].toLocaleLowerCase());
                });
                if (elemToMove.length == 0) {
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
                    yield this.wait(1000 + (1000 * intentoDropItem));
                    intentoDropItem++;
                    if ($('#itembox').children().length == 0 && intentoDropItem > 5) {
                        Consola.log(this.debuguear, 'Error al dropear el item!');
                        this.itemsAFundir.shift();
                        return Promise.resolve($('#mainnav .awesome-tabs')[1]); //go to package again
                    }
                }
                this.itemsAFundir.shift();
                yield this.wait(500);
                return Promise.resolve($('#rent .awesome-button')[0]);
            }
            else if (espaciosDisponibles.length == 0 && this.itemsAFundir.length == 0) {
                //TERMINA ALL OK
                Consola.log(this.debuguear, 'Entro a no hay ni items ni espacios');
                this.estado = tareaEstado.finalizada;
                return Promise.resolve(tareasControlador.getPronosticoClick());
            }
            else if (espaciosDisponibles.length == 0 && this.itemsAFundir.length != 0) {
                Consola.log(this.debuguear, 'Hay items y no hay lugar para fundir.');
                //this.estado = tareaEstado.enEspera;
                this.estado = tareaEstado.finalizada;
                return Promise.resolve(tareasControlador.getPronosticoClick());
            }
            else {
                Consola.log(this.debuguear, 'Entro else');
                this.estado = tareaEstado.finalizada;
                return Promise.resolve(tareasControlador.getPronosticoClick());
            }
        });
    }
    agarrarRecursos() {
        return __awaiter(this, void 0, void 0, function* () {
            let agarrarRecursosElement = $('.background_trader .awesome-button').filter(function () {
                return this.textContent.includes('× Guardar recursos');
            });
            if (agarrarRecursosElement.length != 0) {
                return Promise.resolve(agarrarRecursosElement[0]);
            }
            else {
                return Promise.resolve($('#mainnav .awesome-tabs')[1]);
            }
        });
    }
    hayRecursosReclamar() {
        let agarrarRecursosElement = $('.background_trader .awesome-button').filter(function () {
            return this.textContent.includes('× Guardar recursos');
        });
        return agarrarRecursosElement.length != 0;
    }
    moverItemAFundidora(item) {
        let spot = {
            parent: $('#itembox'),
            x: ($('#itembox').offset().left + ($('#itembox').width() / 2)),
            y: ($('#itembox').offset().top + ($('#itembox').height() / 2))
        };
        this.drag(item, spot.parent, spot.x, spot.y);
    }
    drag(item, parent, x, y) {
        let cords_item = $(item).offset();
        let cords_item_xy = { x: cords_item.left, y: cords_item.top };
        let cords_target = { x: x, y: y };
        this.fireMouseEvent(item, 'mousedown', { clientX: cords_item_xy.x - window.scrollX, clientY: cords_item_xy.y - window.scrollY });
        this.fireMouseEvent(document, 'mousemove', { clientX: cords_target.x - window.scrollX, clientY: cords_target.y - window.scrollY });
        this.fireMouseEvent(document, 'mouseup', { clientX: cords_target.x - window.scrollX, clientY: cords_target.y - window.scrollY });
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
        event.initMouseEvent(type, options.bubbles, options.cancelable, options.view, options.detail, options.screenX, options.screenY, options.clientX, options.clientY, options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, options.relatedTarget || document.body.parentNode);
        elem.dispatchEvent(event);
    }
    hayItemsFundibles() {
        return $('#packages_wrapper .ui-draggable').toArray()
            .some((elem, index) => {
            return this.esItemFundible(elem);
        });
    }
    esItemFundible(item) {
        let nameitem = item.getAttribute('data-tooltip').split('"')[1];
        let notToKeep = this.namesNotTuMelt.every((e) => !nameitem.includes(e));
        let categoria = getItemCategoria(nameitem);
        let esFundible = categoria.nombreCategoria == 'Fundible';
        let esJoyaFundible = categoria.subCategoria == 'Joya' && (this.filtrosToUse[this.indiceFiltro].calidad == calidadesItemsPaquetes.PURPURA || this.filtrosToUse[this.indiceFiltro].query != '');
        return notToKeep && (esFundible || esJoyaFundible);
    }
    puedeDesbloquearse() {
        let milisecondsNow = Date.now().valueOf();
        let dif = milisecondsNow - this.blockTime;
        return Math.floor(dif / 60000) >= 10;
    }
}
