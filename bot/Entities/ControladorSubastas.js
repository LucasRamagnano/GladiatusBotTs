var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class ControladorSubastas {
    constructor() {
        this.tipo_class = 'ControladorSubastas';
        this.link = $('#submenu1 a').toArray().find(e => e.textContent == 'Edificio de subastas').href;
        this.aBuscar = [new AuctionKey('Ichorus'), new AuctionKey('Antonius'), new AuctionKey('Taliths'),
            new AuctionKey('Lulus'), new AuctionKey('delicadeza'), new AuctionKey('Lucius'),
            new AuctionKey('Gaius'), new AuctionKey('asesinato')];
    }
    equals(t) {
        return t.tipo_class == this.tipo_class;
    }
    fromJsonString(guardado) {
        this.estado = guardado.estado;
        this.link = guardado.link;
        return this;
    }
    getProximoClick() {
        let aClickear = this.analizarSubasta();
        return aClickear;
    }
    seCancela() {
        return false;
    }
    gettTds() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield fetch(this.link);
            let text = yield response.text();
            this.tds = $(text).find('#auction_table td');
            return Promise.resolve();
        });
    }
    analizarSubasta() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.gettTds();
            this.tds.toArray().forEach(elem => {
                if ($(elem).find('.auction_item_div .ui-draggable')[0] !== undefined) {
                    let desc = $(elem).find('.auction_item_div .ui-draggable')[0].getAttribute('data-tooltip');
                    desc = desc.substring(0, desc.indexOf('icon_gold'));
                    desc = desc.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    this.aBuscar.forEach((e) => {
                        if (desc.toLocaleLowerCase().includes(e.key.toLocaleLowerCase())) {
                            e.encontrado();
                        }
                    });
                }
            });
            let resultado = new SubastaResultado();
            resultado.busquedas = this.aBuscar.map(e => { return { key: e.key, contador: e.contador }; });
            resultado.busquedaFecha = new Date();
            let aClickear = yield new Promise(resolve => { mandarMensajeBackground({ header: MensajeHeader.RESULTADO_SUBASTA, resultado: resultado }, () => resolve()); })
                .then((e) => Promise.resolve($('#mainmenu > div:nth-child(1) a')[0]))
                .catch((e) => Promise.resolve($('#mainmenu > div:nth-child(1) a')[0]));
            //los vacio para no llenar de data el local storage
            this.aBuscar = [];
            this.tds = null;
            this.estado = tareaEstado.finalizada;
            return aClickear;
            //console.log(this.aBuscar);
        });
    }
}
