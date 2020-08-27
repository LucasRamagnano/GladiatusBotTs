class Paquete {
    constructor(itemNombre, itemId, origen, precio, nivel, link) {
        this.itemNombre = itemNombre;
        this.itemId = itemId;
        this.origen = origen;
        this.precio = precio;
        this.nivel = nivel;
        this.link = link;
        this.fecha = new Date();
    }
}
