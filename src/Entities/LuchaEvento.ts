class LuchaEvento implements Tarea{
    private estado: tareaEstado = tareaEstado.enEspera;
    prioridad : tareaPrioridad = datosContext.prioridades.evento;
    tipo_class: string = 'LuchaEvento';
    timed_out_miliseconds = 5000;

    changeEstado(newEstado: tareaEstado): void {
        this.estado = newEstado;
    }

    getEstado(): tareaEstado {
        return this.estado;
    }

    getHomeClick(): HTMLElement {
        return $('#banner_event_link')[0];
    }

    equals(t: Tarea): boolean {
        return this.tipo_class === t.tipo_class;
    }

    fromJsonString(guardado: any): Guardable {
        this.estado = guardado.estado;
        return this;
    }

    getProximoClick(): Promise<HTMLElement> {
        if(!this.estamosEnTuLugar()) {
            return  Promise.resolve(this.getHomeClick());
        }else {
            this.estado = tareaEstado.finalizada;
            //
            return Promise.resolve($('.awesome-button.expedition_button:not(.disabled)')[2]);
        }
    }

    seCancela(): boolean {
        return LuchaEvento.estasEnCooldown();
    }

    estamosEnTuLugar(): boolean {
        return window.location.href.includes('serverQuest') || window.location.href.includes('wild_farm');
    }

    static estasEnCooldown() {
        return $('#ServerQuestTime span').length <= 1 ||
                $('#ServerQuestTime span')[1].textContent.includes(':') ||
                $('#ServerQuestTime span')[1].textContent.includes('-') ||
                $('#ServerQuestTime span')[0].textContent == '0';
    }


    puedeDesbloquearse(): boolean {
        return true;
    }
}