class ControladorSubastas implements Tarea{
    prioridad : tareaPrioridad = tareaPrioridad.BAJA;
    link: string;
    tds: JQuery<HTMLElement>;
    aBuscar: AuctionKey[];
    estado: tareaEstado;
    tipo_class: string = 'ControladorSubastas';
    timed_out_miliseconds = 5000;

    equals(t: Tarea): boolean {
        return t.tipo_class == this.tipo_class;
    }

    fromJsonString(guardado: any): Guardable {
        this.estado = guardado.estado;
        this.link = guardado.link;
        return this;
    }

    puedeDesbloquearse(): boolean {
        return true;
    }

    getProximoClick(): Promise<HTMLElement> {
        let aClickear = this.analizarSubasta();
        return aClickear;
    }

    seCancela(): boolean {
        return false;
    }

    constructor() {
        //this.link =  (<any>$('#submenu1 a').toArray().find(e=>e.textContent == 'Edificio de subastas')).href
        this.aBuscar = [new AuctionKey('Ichorus'),new AuctionKey('Antonius'), new AuctionKey('Táliths'),
                        new AuctionKey('Decimus'), new AuctionKey('Lucius'), new AuctionKey('Gaius'),
                        new AuctionKey('Titus'), new AuctionKey('Mateus'),new AuctionKey('Sextus'),
                        new AuctionKey('de la delicadeza'),  new AuctionKey('de asesinato'),new AuctionKey('del Dragon'),
                        new AuctionKey('de la agresión'), new AuctionKey('la eliminación'), new AuctionKey('de la Tierra'),
                        new AuctionKey('del infierno'), new AuctionKey('Marcelo'), new AuctionKey('Constancio'),
                        new AuctionKey('de la soledad'), new AuctionKey('del Amor'), new AuctionKey('del sufrimiento')];
    }

    async gettTds(){
        let response = await fetch(this.link);
        let text = await response.text();
        this.tds = $(text).find('#auction_table td');
        return Promise.resolve();
    }

    async analizarSubasta() {
        await this.gettTds();
        this.tds.toArray().forEach(elem=>{
            if($(elem).find('.auction_item_div .ui-draggable')[0] !== undefined) {
                let desc = $(elem).find('.auction_item_div .ui-draggable')[0].getAttribute('data-tooltip');
                desc = desc.substring(0, desc.indexOf('icon_gold'));
                desc = desc.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                console.log(desc);
                this.aBuscar.forEach((e) => {
                    if(desc.toLocaleLowerCase().includes(e.key.toLocaleLowerCase())){
                        e.encontrado();
                    }
                })
            }
        })
        let resultado: SubastaResultado = new SubastaResultado();
        resultado.busquedas = this.aBuscar.map(e=>{return {key: e.key, contador: e.contador, levelMaximo: e.levelMaximo}})
        resultado.busquedaFecha = new Date();
        let aClickear = await  new Promise<void>(resolve => {mandarMensajeBackground({header:MensajeHeader.RESULTADO_SUBASTA, resultado: resultado},()=> resolve() )})
                                    .then((e) => Promise.resolve($('#mainmenu > div:nth-child(1) a')[0]))
                                    .catch((e) => Promise.resolve($('#mainmenu > div:nth-child(1) a')[0]))
        //los vacio para no llenar de data el local storage
        this.aBuscar = [];
        this.tds = null;
        this.estado = tareaEstado.finalizada;
        return aClickear;
        //console.log(this.aBuscar);
    }

    analizarSubastaBackground(tds, player_name:string) {
        //.find('.section-header form').attr('data-item_name')
        let subastadosPorVos: string[] = [];
        tds.toArray().forEach(elem=>{
            if($(elem).find('.section-header form')[0] !== undefined) {
                let descFull = $(elem).find('.auction_item_div .ui-draggable')[0].getAttribute('data-tooltip');
                let desc = $(elem).find('.auction_item_div .ui-draggable')[0].getAttribute('data-tooltip');
                let level = $(elem).find('.auction_item_div .ui-draggable')[0].getAttribute('data-level')
                let splitsDesce = desc.split('"');
                desc = splitsDesce[1];
                desc = desc.normalize("NFC").replace(/[\u0300-\u036f]/g, "");
                desc = desc.replace(/\\u00e1/g,'á').replace(/\\u00f3/g,'ó');
                this.aBuscar.forEach((e) => {
                    if(desc.toLocaleLowerCase().includes(e.key.toLocaleLowerCase())){
                        e.encontrado();
                        //saco comidas
                        if(!descFull.toLocaleLowerCase().includes('ndose: Cura'.toLocaleLowerCase())) {
                            e.analizarNivel(level);
                        }
                        //console.log($(elem).find('.auction_bid_div > div')[0].textContent.toLocaleLowerCase());
                    }
                })
                if($(elem).find('.auction_bid_div > div')[0].textContent.trim().toLocaleLowerCase().includes(player_name.toLocaleLowerCase())) {
                    subastadosPorVos.push(desc);
                }
            }
        })
        let resultado: SubastaResultado = new SubastaResultado();
        resultado.busquedas = this.aBuscar.map(e=>{return {key: e.key, contador: e.contador, levelMaximo: e.levelMaximo}})
        resultado.busquedaFecha = new Date();
        //console.log(subastadosPorVos);
        resultado.tusSubastas = subastadosPorVos;
        return resultado;
    }

    apostarItemsWith(tds, itemsToBid: string[], mercenario:boolean, itemsApostados:AuctionItem[]) {
        let autoApostados :AuctionItem[] = [];
        tds.toArray().forEach(elem=>{
            if($(elem).find('.section-header form')[0] !== undefined) {
                let desc = $(elem).find('.auction_item_div .ui-draggable')[0].getAttribute('data-tooltip');
                let splitsDesce = desc.split('"');
                desc = splitsDesce[1];
                desc = desc.normalize("NFC").replace(/[\u0300-\u036f]/g, "");
                desc = desc.replace(/\\u00e1/g,'á').replace(/\\u00f3/g,'ó');
                itemsToBid.forEach((e) => {
                    let noEstaApostado = $(elem)
                        .find('.auction_bid_div > div')[0].textContent.search('No hay pujas') != -1;

                    let apostadoXRandom = $(elem)
                        .find('.auction_bid_div > div')[0].textContent.search('existentes') != -1;

                    let yaEstaApostado = itemsApostados.some(e=>desc.includes(e.name));
                    if(desc.toLocaleLowerCase().includes(e.toLocaleLowerCase()) && (noEstaApostado || apostadoXRandom) && !yaEstaApostado){
                        let aI = new AuctionItem();
                        let inputs : HTMLInputElement[] = $(elem).find('.section-header form input').toArray().map(elem=> <HTMLInputElement>elem);
                        let itemUrl = $(elem).find('.section-header form').attr('action');
                        let oroStringApostar = (<HTMLInputElement>$(elem).find('input[name="bid_amount"]')[0]).value;
                        let oroNumberApostar = parseInt(oroStringApostar)+100;
                        aI.inicializar(
                            desc, inputs[0].value, inputs[1].value,
                            inputs[2].value, inputs[3].value, inputs[4].value,
                            inputs[5].value, inputs[7].value, itemUrl, mercenario
                        );
                        aI.subastaBasica = oroNumberApostar;
                        autoApostados.push(aI);
                    }
                })
            }
        })
        return autoApostados;
    }

    getHomeClick(): HTMLElement {
        return undefined;
    }


}