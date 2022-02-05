class ControladorSubastas implements Tarea{
    prioridad : tareaPrioridad = tareaPrioridad.BAJA;
    link: string;
    tds: JQuery<HTMLElement>;
    aBuscar: AuctionKey[];
    estado: tareaEstado;
    tipo_class: string = 'ControladorSubastas';

    equals(t: Tarea): boolean {
        return t.tipo_class == this.tipo_class;
    }

    fromJsonString(guardado: any): Guardable {
        this.estado = guardado.estado;
        this.link = guardado.link;
        return this;
    }

    getProximoClick(): Promise<HTMLElement> {
        let aClickear = this.analizarSubasta();
        return aClickear;
    }

    seCancela(): boolean {
        return false;
    }

    constructor() {
        this.link =  (<any>$('#submenu1 a').toArray().find(e=>e.textContent == 'Edificio de subastas')).href
        this.aBuscar = [new AuctionKey('Ichorus'),new AuctionKey('Antonius'), new AuctionKey('Taliths'),
                        new AuctionKey('Lulus'), new AuctionKey('delicadeza'), new AuctionKey('Lucius'),
                        new AuctionKey('Gaius'), new AuctionKey('asesinato')];
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
                this.aBuscar.forEach((e) => {
                    if(desc.toLocaleLowerCase().includes(e.key.toLocaleLowerCase())){
                        e.encontrado();
                    }
                })
            }
        })
        let resultado: SubastaResultado = new SubastaResultado();
        resultado.busquedas = this.aBuscar.map(e=>{return {key: e.key, contador: e.contador}})
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

    getHomeClick(): HTMLElement {
        return undefined;
    }


}