class AuctionItem extends Guardable{
    name: string;
    auctionIds: string;
    qry: string;
    itemType: string;
    itemLevel: string;
    itemQuality: string;
    buyouthd: string;
    bid : string;
    url : string;
    oroTotalGastado: number = 0;
    vecesSubastado: number = 0;
    ultimaSubasta: number = 0;
    tipo_class: string = 'AuctionItem'
    mercenario: boolean;
    subastaBasica: number;

    constructor(){
        super();
    };
    inicializar(name: string, auctionIds: string, qry: string, itemType: string, itemLevel: string, itemQuality: string, buyouthd: string, bid: string, url: string, mercenario: boolean) {
        this.name = name;
        this.auctionIds = auctionIds;
        this.qry = qry;
        this.itemType = itemType;
        this.itemLevel = itemLevel;
        this.itemQuality = itemQuality;
        this.buyouthd = buyouthd;
        this.bid = bid;
        this.url = url;
        this.mercenario = mercenario;
    }

    getPostData(amountBid): string {
        let data =
            "auctionid=" + this.auctionIds +
            "&qry=" + this.qry +
            "&itemType=" + this.itemType +
            "&itemLevel=" + this.itemLevel +
            "&itemQuality=" + this.itemQuality +
            "&buyouthd=" + this.buyouthd +
            "&bid_amount=" + amountBid +
            "&bid="+ this.bid;
        return data;
    }

    getUrl(): string {
        return this.url
    }

    fromJsonString(jsonGuardado: any): Guardable {
        this.auctionIds  = jsonGuardado.auctionIds;
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
        this.mercenario = jsonGuardado.mercenario;
        return this;
    }

    async guardate() {
        return new Promise<void>((res) => {
            chrome.storage.local.get(Keys.AUCTION_ITEMS, (result) => {
                let auctionItemsJsons: AuctionItem[] = result.auction_items;
                let nuevoAuctionItem: AuctionItem = this;
                if (auctionItemsJsons === undefined) {
                    auctionItemsJsons = [];
                } else if (auctionItemsJsons.length == 5) {
                    //no can do
                }
                auctionItemsJsons = [nuevoAuctionItem].concat(auctionItemsJsons);
                let toSave = {};
                toSave[Keys.AUCTION_ITEMS] = auctionItemsJsons;
                chrome.storage.local.set(toSave, () => {res()})
            });
        });
    }

    static async loadAuctionItems(): Promise<AuctionItem[]> {
        return new Promise((resolve) => {
                let keysToLoad = [Keys.AUCTION_ITEMS];
                chrome.storage.local.get(keysToLoad,
                    (resultado) => {
                        let itemsJson: Guardable[] = resultado[Keys.AUCTION_ITEMS] != undefined ? resultado[Keys.AUCTION_ITEMS] : [];
                        let auctionItems: AuctionItem[] = itemsJson.map(e => (<AuctionItem>new AuctionItem().fromJsonString(e)));
                        resolve(auctionItems);
                    })
            }
        )
    }

    //does not work
    subastar(oroToPut: number) {
       this.vecesSubastado++;
       this.oroTotalGastado = this.oroTotalGastado + oroToPut;
       this.ultimaSubasta = oroToPut;
       $.ajax({
            type: "POST",
            url:  'https://s36-ar.gladiatus.gameforge.com/game/index.php?mod=auction&'+this.url,
            data: this.getPostData(oroToPut)
        }
       )
           .done(e => 1+1)
           .fail(e=> 1+1);
    }

}