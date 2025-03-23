function generateQR() {
    let imgBox = document.getElementById("imgBox");
    let qrImage = document.getElementById("qrImage");
    let qrText = document.getElementById("qrText");
    
    let inputText = qrText.value.trim();
    if (inputText) {
        qrImage.src = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + encodeURIComponent(inputText);
        imgBox.style.display = "block";
    } else {
        imgBox.style.display = "none";
    }
}