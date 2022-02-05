var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class AuctionItem extends Guardable {
    constructor() {
        super();
        this.oroTotalGastado = 0;
        this.vecesSubastado = 0;
        this.ultimaSubasta = 0;
        this.tipo_class = 'AuctionItem';
    }
    ;
    inicializar(name, auctionIds, qry, itemType, itemLevel, itemQuality, buyouthd, bid, url) {
        this.name = name;
        this.auctionIds = auctionIds;
        this.qry = qry;
        this.itemType = itemType;
        this.itemLevel = itemLevel;
        this.itemQuality = itemQuality;
        this.buyouthd = buyouthd;
        this.bid = bid;
        this.url = url;
    }
    getPostData(amountBid) {
        let data = "auctionid=" + this.auctionIds +
            "&qry=" + this.qry +
            "&itemType=" + this.itemType +
            "&itemLevel=" + this.itemLevel +
            "&itemQuality=" + this.itemQuality +
            "&buyouthd=" + this.buyouthd +
            "&bid_amount=" + amountBid +
            "&bid=" + this.bid;
        return data;
    }
    getUrl() {
        return this.url;
    }
    fromJsonString(jsonGuardado) {
        this.auctionIds = jsonGuardado.auctionIds;
        this.qry = jsonGuardado.qry;
        this.itemType = jsonGuardado.itemType;
        this.itemLevel = jsonGuardado.itemLevel;
        this.itemQuality = jsonGuardado.itemQuality;
        this.buyouthd = jsonGuardado.buyouthd;
        this.bid = jsonGuardado.bid;
        this.url = jsonGuardado.url;
        this.tipo_class = jsonGuardado.tipo_class;
        this.name = jsonGuardado.name;
        this.oroTotalGastado = jsonGuardado.oroTotalGastado;
        this.vecesSubastado = jsonGuardado.vecesSubastado;
        this.ultimaSubasta = jsonGuardado.ultimaSubasta;
        return this;
    }
    guardate() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res) => {
                chrome.storage.local.get(Keys.AUCTION_ITEMS, (result) => {
                    let auctionItemsJsons = result.auction_items;
                    let nuevoAuctionItem = this;
                    if (auctionItemsJsons === undefined) {
                        auctionItemsJsons = [];
                    }
                    else if (auctionItemsJsons.length == 5) {
                        //no can do
                    }
                    auctionItemsJsons = [nuevoAuctionItem].concat(auctionItemsJsons);
                    let toSave = {};
                    toSave[Keys.AUCTION_ITEMS] = auctionItemsJsons;
                    chrome.storage.local.set(toSave, () => { res(); });
                });
            });
        });
    }
    static loadAuctionItems() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                let keysToLoad = [Keys.AUCTION_ITEMS];
                chrome.storage.local.get(keysToLoad, (resultado) => {
                    let itemsJson = resultado[Keys.AUCTION_ITEMS] != undefined ? resultado[Keys.AUCTION_ITEMS] : [];
                    let auctionItems = itemsJson.map(e => new AuctionItem().fromJsonString(e));
                    resolve(auctionItems);
                });
            });
        });
    }
    //does not work
    subastar(oroToPut) {
        this.vecesSubastado++;
        this.oroTotalGastado = this.oroTotalGastado + oroToPut;
        this.ultimaSubasta = oroToPut;
        $.ajax({
            type: "POST",
            url: 'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=auction&' + this.url,
            data: this.getPostData(oroToPut)
        })
            .done(e => 1 + 1)
            .fail(e => 1 + 1);
    }
}
