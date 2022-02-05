class Inventario implements Tarea{
    prioridad : tareaPrioridad = globalConfig.prioridades.curar;
    estado: tareaEstado;
    tipo_class: string = 'Inventario';
    vecesABuscar: number = 10;

    getProximoClick(): Promise<HTMLElement> {
        if(this.estamosEnVisionGeneral() && estaApuntandoPersonaje()){
            //TODO VER QUE HACER CON CORRER DE NUEVO
            correrDeNuevo = false;
            return new Promise<HTMLElement>((resolve,fallo) => {this.buscarComidaYCurar(resolve,fallo)});
        }else if(estaEnVisionGeneral()){
            return Promise.resolve($('.charmercsel')[0]);
        } else {
            return Promise.resolve($('#mainmenu > div:nth-child(1) a')[0]);
        }
    }


    buscarComidaYCurar(resolve,reject): void {
        if(this.vecesABuscar <= 0) {
            //Mando no hay comida
            //Voy a vision general
            mandarMensajeBackground({header: MensajeHeader.NO_HAY_COMIDA});
            this.estado = tareaEstado.cancelada;
            resolve($('#mainmenu > div:nth-child(1) a')[0]);
        }else if($('#inv div[data-tooltip*=\'ndose: Cura\']').length === 0) {
            $('a.awesome-tabs[data-available*=\"true\"]')[this.proximaHoja()].click();
            setTimeout(()=>{
                this.buscarComidaYCurar(resolve,reject);
                }, 250);
            this.vecesABuscar = this.vecesABuscar-1;
        }else{
            this.curar();
            this.estado = tareaEstado.finalizada;
            window.setTimeout(()=>resolve($('#mainmenu > div:nth-child(1) a')[0]),500);
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
        return this;
    }

    seCancela(): boolean {
        return false;
    }

    equals(t: Tarea): boolean {
        return t.tipo_class == this.tipo_class;
    }

    getHomeClick(): HTMLElement {
        return $('#mainmenu > div:nth-child(1) a')[0];
    }


}
