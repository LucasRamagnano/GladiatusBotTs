class Paquete {
    itemNombre: string;
    itemId: number;
    origen: string;
    precio: number;
    nivel: number;
    link: HTMLElement;
    fecha: Date;

    constructor(itemNombre: string, itemId: number, origen : string, 
                precio: number, nivel: number, link: HTMLElement){
        this.itemNombre = itemNombre;
        this.itemId = itemId;
        this.origen = origen;
        this.precio = precio;
        this.nivel = nivel;
        this.link = link;
        this.fecha = new Date();
    }
}