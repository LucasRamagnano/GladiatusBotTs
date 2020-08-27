class Guardable {
    fromJsonString(guardado) {
        return null;
    }
    ;
}
class AuctionKey {
    constructor(key) {
        this.contador = 0;
        this.key = key;
    }
    encontrado() {
        this.contador++;
    }
}
class SubastaResultado {
    constructor(busquedas, busquedaFecha) {
        this.busquedas = busquedas;
        this.busquedaFecha = busquedaFecha;
    }
    getMostrable() {
        return this.busquedas.map((e) => {
            let p = document.createElement('p');
            p.textContent = e.key + ': ' + e.contador;
            return p;
        });
    }
    getMostrableFecha() {
        let p = document.createElement('p');
        p.textContent = this.busquedaFecha.toString();
        return p;
    }
}
