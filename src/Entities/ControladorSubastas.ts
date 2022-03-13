class ControladorSubastas extends Guardable{
    private link: string;
    aBuscar: AuctionKey[];
    lastEstado: SubastaEstado = SubastaEstado.UNKNOWN;
    lastResult: SubastaResultado;
    tipo_class: string = 'ControladorSubastas';
    timed_out_miliseconds = 5000;
    subastadosPorVos: string[] = [];
    timeToNextRecheck = 500;
    descSubasta:string;


    fromJsonString(guardado: any): Guardable {
        this.link = guardado.link;
        return this;
    }

    constructor()
    constructor(aBuscar: AuctionKey[], descSubasta)
    constructor(aBuscar?: AuctionKey[], descSubasta?: string) {
        super();
        this.descSubasta = descSubasta;
        this.aBuscar = aBuscar;
        this.lastResult = new SubastaResultado([],new Date(),[], this.descSubasta);
    }


    setLink(link: string) {
        this.link = link;
    }

    resetResult() {
        this.aBuscar.forEach(e=>e.reset());
        this.subastadosPorVos = [];
    }

    async analizarSubastaBackground() {

        let response = await fetch(this.link);
        let subastaHTML = await response.text()
        let remainingTime = $(subastaHTML).find('.description_span_right')[0].textContent;
        let tds = $(subastaHTML).find('#auction_table td');
        let estadoActual = this.calcularEstadoSubastaActual(remainingTime);
        this.resetResult();
        tds.toArray().forEach(elem => this.analizarSubastaTdElement(elem));
        let resultado: SubastaResultado = new SubastaResultado();
        resultado.totalItems = tds.length;
        resultado.busquedas = this.aBuscar;
        resultado.busquedaFecha = new Date();
        resultado.tusSubastas = this.subastadosPorVos;
        resultado.desc = this.descSubasta;
        this.lastResult = resultado;
        this.lastEstado = estadoActual;
        this.timeToNextRecheck = this.estaEnMuyCorto() ? 1000 : 10000;
        return this.lastResult;
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

    private analizarSubastaTdElement(elem:HTMLElement){
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
                    //saco comidas
                    if(!descFull.toLocaleLowerCase().includes('ndose: Cura'.toLocaleLowerCase())) {
                        e.encontrado();
                        e.analizarNivel(level);
                        e.statItems.push(new StatsItems(descFull));
                    }
                }
            })
            let subastador = $(elem).find('.auction_bid_div > div')[0].textContent.trim().toLocaleLowerCase();
            let personajeNombre = datosBackground.personaje.nombre.toLocaleLowerCase();
            if(subastador.includes(personajeNombre) && this.subastadosPorVos.every(e=>e!=desc)) {
                this.subastadosPorVos.push(desc);
            }
        }
    }

    private estaEnMuyCorto() {
        return this.lastEstado == SubastaEstado.MUY_CORTO;
    }

    private async calcularEstadoSubastaActualFetching(): Promise<SubastaEstado> {
        let response = await fetch(this.link.replace('qry=','qry=asdasdasdasd'));//this filter for a fastest state auction check
        let subastaHTML = await response.text()
        let remainingTime = $(subastaHTML).find('.description_span_right')[0].textContent;
        return this.calcularEstadoSubastaActual(remainingTime);
    }

    private calcularEstadoSubastaActual(remainingTime:string): SubastaEstado {
        switch (remainingTime.toLowerCase().trim()){
            case 'muy corto':
                return SubastaEstado.MUY_CORTO;
            case 'corto':
                return SubastaEstado.CORTO;
            case 'medio':
                return SubastaEstado.MEDIO;
            case 'largo':
                return SubastaEstado.LARGO;
            case 'muy largo':
                return SubastaEstado.MUY_LARGO;
            default:
                return SubastaEstado.UNKNOWN;
        }
    }

    static getKeysSubasta(): AuctionKey[] {
        return [new AuctionKey('Ichorus'),new AuctionKey('Antonius'), new AuctionKey('Táliths'),
            new AuctionKey('Decimus'), new AuctionKey('Lucius'), new AuctionKey('Gaius'),
            new AuctionKey('Titus'), new AuctionKey('Mateus'),new AuctionKey('Sextus'),
            new AuctionKey('de la delicadeza'),  new AuctionKey('de asesinato'),new AuctionKey('del Dragon'),
            new AuctionKey('de la agresión'), new AuctionKey('la eliminación'), new AuctionKey('de la Tierra'),
            new AuctionKey('del infierno'), new AuctionKey('Marcelo'), new AuctionKey('Constancio'),new AuctionKey('de la amazona'),
            new AuctionKey('de la soledad'), new AuctionKey('del Amor'), new AuctionKey('del Chacra'), new AuctionKey('del sufrimiento'),
            new AuctionKey('de la antigüedad')];
    }

    static getKeysFundicion(): AuctionKey[] {
        return  ControladorDeFundicion.getFilters().filter(e=>e.query.length > 0).map(e=>new AuctionKey(e.query));
    }

    static getKeysTiposMercenario(): AuctionKey[] {
        return  [new AuctionKey('Samnit'), new AuctionKey('Lanza Elite'), new AuctionKey('Gran Maestro'), new AuctionKey('Hombre Medicinal')];
    }


}