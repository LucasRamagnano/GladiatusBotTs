class Inventario implements Tarea{
    prioridad : tareaPrioridad = datosContext.prioridades.curar;
    private estado: tareaEstado = tareaEstado.enEspera;
    tipo_class: string = 'Inventario';
    vecesABuscar: number = 10;
    timed_out_miliseconds = 10000;
    timeBlocked: number;

    changeEstado(newEstado: tareaEstado): void {
        this.estado = newEstado;
    }

    getEstado(): tareaEstado {
        return this.estado;
    }

    getProximoClick(): Promise<HTMLElement> {
        if(this.estamosEnVisionGeneral() && estaApuntandoPersonaje()){
            return this.buscarComidaYCurar();
        }else if(estaEnVisionGeneral()){
            return Promise.resolve($('.charmercsel')[0]);
        } else {
            return Promise.resolve($('#mainmenu > div:nth-child(1) a')[0]);
        }
    }

    async buscarComidaYCurar(): Promise<HTMLElement> {
        if(this.vecesABuscar <= 0) {
            //Mando no hay comida
            //Voy a vision general
            this.estado = tareaEstado.bloqueada;
            this.timeBlocked = Date.now().valueOf();
            return tareasControlador.getPronosticoClick();
        }else if($('#inv div[data-tooltip*=\'ndose: Cura\']').length === 0) {
            $('a.awesome-tabs[data-available*=\"true\"]')[this.proximaHoja()].click();
            this.vecesABuscar--;
            await this.wait(250);
            return await this.buscarComidaYCurar();
        }else{
            this.curar();
            this.estado = tareaEstado.finalizada;
            await this.wait(500);
            return tareasControlador.getPronosticoClick();
        }
    }

    curar(): void{
        this.ponerIdDeComida();
        ($('#a_comer') as any).simulate("drag-n-drop", { dragTarget: $("#avatar")});
    }

    proximaHoja(): number {
        let hojaAt = this.getHojaAt();
        if(hojaAt + 1 >= this.cantidadHojaDisponibles())
            return 0;
        else
            return hojaAt + 1;
    }

    getHojaAt(): number {
        return Array.from($('a.awesome-tabs[data-available*=\"true\"]')).findIndex(e=>e.classList.contains('current'));
    };

    cantidadHojaDisponibles(): number {
        return $('a.awesome-tabs[data-available*=\"true\"]').length;
    }

    ponerIdDeComida(): void {
        //Selecciono el que esta sobresaltado amarillo, sino agarro cuallquiera que en el atributo de html tenga "ndose: Cura"
        if($('div[style*="filter: drop-shadow(black 0px 0px 1px) drop-shadow(yellow 0px 0px 3px) drop-shadow(yellow 0px 0px 3px);"]').length !== 0)
            $('div[style*="filter: drop-shadow(black 0px 0px 1px) drop-shadow(yellow 0px 0px 3px) drop-shadow(yellow 0px 0px 3px);"]').attr('id','a_comer');
        else
            $('#inv div[data-tooltip*=\'ndose: Cura\']').first().attr('id','a_comer');
    }

    estamosEnVisionGeneral(): boolean {
        return $('#overviewPage #avatar').length == 1;
    }

    fromJsonString(guardado: any): Guardable {
        this.estado  = guardado.estado;
        this.tipo_class  = guardado.tipo_class;
        this.vecesABuscar  = guardado.vecesABuscar;
        this.timeBlocked = guardado.timeBlocked;
        return this;
    }

    seCancela(): boolean {
        return getPorcentajeVida() > datosContext.personaje.porcentajeMinimoParaCurar;
    }

    equals(t: Tarea): boolean {
        return t.tipo_class == this.tipo_class;
    }

    getHomeClick(): HTMLElement {
        return $('#mainmenu > div:nth-child(1) a')[0];
    }

    puedeDesbloquearse(): boolean {
        let milisecondsNow = Date.now().valueOf();
        let dif = milisecondsNow - this.timeBlocked;
        return Math.floor(dif/60000) >= 10;
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
