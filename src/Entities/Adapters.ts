function mandarMensajeBackground(mensaje: Mensaje, callback?: (response: any) => void) {
    chrome.runtime.sendMessage(mensaje,callback);
}