// ----------------------------------------------
// STOP BROWSER FROM CACHING THE OLD MODEL
// ----------------------------------------------

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js")
    .then(() => console.log("Service Worker registered"));
}
tf.env().set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0);

let model = null;

// =====================================================
// LOAD MODEL (always fresh, no browser cache)
// =====================================================
async function loadModel() {
    model = await tf.loadLayersModel("./model/model.json", {
        requestInit: { cache: "no-store" }
    });
    console.log("Model Loaded (no cache)");
    return model;
}

// =====================================================
// HANDLE IMAGE PREVIEW (FILE UPLOAD)
// =====================================================
document.getElementById("imageInput").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        document.getElementById("preview").src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// =====================================================
// CENTER CROP HELPER (MATCHES TRAINING LOGIC)
// =====================================================
function cropCenterToCanvas(source, size) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    const sw = source.videoWidth || source.width;
    const sh = source.videoHeight || source.height;

    const r = Math.min(sw, sh);
    const sx = (sw - r) / 2;
    const sy = (sh - r) / 2;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(source, sx, sy, r, r, 0, 0, size, size);

    return canvas;
}

// =====================================================
// COMMON PREDICTION FUNCTION (FILE + CAMERA)
// =====================================================
async function runPrediction(imgElement) {

    if (!model) await loadModel();

    let tensor = tf.browser.fromPixels(imgElement)
        .resizeBilinear([64, 64])
        .toFloat()
        .div(255)
        .expandDims(0);

    const output = model.predict(tensor);
    const data = await output.data();

    const dataArr = Array.from(data);
    const index = dataArr.indexOf(Math.max(...dataArr));

    const labelsResponse = await fetch("./model/labels.json", { cache: "no-store" });
    const labels = await labelsResponse.json();

    document.getElementById("result").innerText =
        `Prediction: ${labels[index]} (score: ${dataArr[index].toFixed(3)})`;

    tensor.dispose();
    output.dispose();
}

// =====================================================
// FILE UPLOAD PREDICTION
// =====================================================
async function predict() {
    const img = document.getElementById("preview");

    if (!img.src || img.src.length < 10) {
        alert("Select an image first!");
        return;
    }

    runPrediction(img);
}

// =====================================================
// CAMERA SUPPORT
// =====================================================
const video = document.getElementById("video");

// Start camera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });
        video.srcObject = stream;
        await video.play();
    } catch (err) {
        alert("Camera access failed");
        console.error(err);
    }
}

// Capture image from camera and predict
function captureImage() {
    if (!video.videoWidth) {
        alert("Camera not ready");
        return;
    }

    const croppedCanvas = cropCenterToCanvas(video, 64);

    const img = new Image();
    img.src = croppedCanvas.toDataURL("image/png");

    img.onload = () => {
        runPrediction(img);
    };
}




function stopCamera() {
    if (video && video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
        console.log("Camera stopped");
    }
}

function refreshPage() {
    window.location.reload(); // reloads the current page
}




window.startCamera = startCamera;
window.captureImage = captureImage;
window.predict = predict;
window.clearInput = clearInput;
window.stopCamera = stopCamera;


