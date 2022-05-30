interface Item extends Guardable {
    setHtmlElement(elem:HTMLElement):void;
    getHtmlElement():HTMLElement;
    getCalidad():QualityItem;
    getTipo():ItemTypes;
    esAgarrable():boolean;
    getTimeAgarre():number;
    getName(): string;
}