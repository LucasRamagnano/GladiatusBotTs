class Comandos {
    fundicion = new ComandosModuloFundicion();
}

class ComandosModuloFundicion {
    async agregarFiltro(query: string, calidad: number = 1) {
        let filtros = await ControladorDeFundicion.getFilters();
        if (query.length < 4) {
            console.log('Filtro muy corto, minimo 4 caracteres.')
        } else if (!(calidad >= 0 && calidad <= 5)) {
            console.log('Calidad invalidad, 0:blanca, [...], 5:rojo')
        } else if (filtros.some(e=>e.query==query)) {//TODO , perimir por calidad, pero repite subasta, probar ...Set
            console.log('Ya existe este filtro.');
        } else {
            filtros.push(new FiltroPaquete(calidad,query));
            let toSave = {};
            toSave[Keys.FILTRO_ITEMS] = filtros;
            chrome.storage.local.set(toSave, ()=>{this.actualizarSubastasFundibles()});
        }
    }

    async removerFiltro(query:string) {
        await ControladorDeFundicion.removerFundicionFiltro(query);
        this.actualizarSubastasFundibles();
    }

    async mostrarFiltros(query:string='') {
        let filtros = await ControladorDeFundicion.getFilters();
        let toShow = filtros.filter(e=>e.query.toLowerCase().includes(query.toLowerCase()));
        if(toShow.length>0)
            toShow.forEach(e=>{console.log(e.toString())})
        else
            console.log('No se encontraron filtros...')
    }

    async resetFiltros() {
        await ControladorDeFundicion.resetFiltrosItems();
        this.actualizarSubastasFundibles();
    }

    async actualizarSubastasFundibles() {
        ctrlSubastaFundicion.aBuscar = await ControladorSubastas.getKeysFundicion();
        ctrlSubastaFundicionMercenario.aBuscar = await ControladorSubastas.getKeysFundicion();
    }
}

//class OtrosModulos{}