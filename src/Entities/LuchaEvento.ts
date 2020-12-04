class LuchaEvento implements Tarea{
    estado: tareaEstado;
    prioridad : tareaPrioridad = globalConfig.prioridades.evento;
    tipo_class: string = 'LuchaEvento';

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
            return Promise.resolve($('.awesome-button.expedition_button:not(.disabled)')[0]);
        }
    }

    seCancela(): boolean {
        return LuchaEvento.estasEnCooldown();
    }

    estamosEnTuLugar(): boolean {
        return window.location.href.includes('serverQuest');
    }

    static estasEnCooldown() {
        return $('#ServerQuestTime span').length <= 1 ||
                $('#ServerQuestTime span')[1].textContent.includes(':') ||
                $('#ServerQuestTime span')[1].textContent.includes('-') ||
                $('#ServerQuestTime span')[0].textContent.includes('0');
    }

}