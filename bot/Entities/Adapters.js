function mandarMensajeBackground(mensaje, callback) {
    chrome.runtime.sendMessage(mensaje, callback);
}
