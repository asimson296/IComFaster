const imageInput = document.getElementById("imageInput");
const compressBtn = document.getElementById("compressBtn");
const compressionLevel = document.getElementById("compressionLevel");
const result = document.getElementById("result");
const downloadBtn = document.getElementById("downloadBtn");

let compressedUrl = null;

compressBtn.addEventListener("click", function () {
    const file = imageInput.files[0];

    if (!file) {
        alert("Please select an image first.");
        return;
    }

    const targetReduction = Number(compressionLevel.value);
    const targetSize = file.size * (1 - targetReduction / 100);

    const reader = new FileReader();

    reader.onload = function (event) {
        const img = new Image();

        img.onload = function () {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Try many quality levels and choose the result
            // closest to the requested target size.
            let bestBlob = null;
            let bestDifference = Infinity;

            const qualities = [];

            for (let i = 1; i <= 100; i++) {
                qualities.push(i / 100);
            }

            let completed = 0;

            qualities.forEach(function (quality) {
                canvas.toBlob(function (blob) {
                    if (!blob) return;

                    const difference = Math.abs(blob.size - targetSize);

                    if (difference < bestDifference) {
                        bestDifference = difference;
                        bestBlob = blob;
                    }

                    completed++;

                    if (completed === qualities.length) {
                        finishCompression(bestBlob);
                    }
                }, "image/jpeg", quality);
            });

            function finishCompression(blob) {
                if (!blob) {
                    alert("Compression failed. Please try another image.");
                    return;
                }

                if (compressedUrl) {
                    URL.revokeObjectURL(compressedUrl);
                }

                compressedUrl = URL.createObjectURL(blob);
                document.getElementById("compressedPreview").src = compressedUrl;

                const originalSize = (file.size / 1024).toFixed(2);
                const compressedSize = (blob.size / 1024).toFixed(2);
                document.getElementById("compressedSize").textContent =
    "Size: " + compressedSize + " KB";
                const reduction = ((1 - blob.size / file.size) * 100).toFixed(1);

                result.innerHTML =
                    `Original: ${originalSize} KB<br>
                     Compressed: ${compressedSize} KB<br>
                     Size reduced: ${reduction}%`;

                downloadBtn.href = compressedUrl;
                downloadBtn.download = "IComFaster-compressed.jpg";
                downloadBtn.style.display = "inline-block";
            }
        };

        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
});
const dropZone = document.getElementById("dropZone");

function showSelectedFile(file) {
    if (!file) return;

    dropZone.innerHTML = `
    <p>${imageInput.files.length} image(s) selected</p>
`;

    const originalPreview = document.getElementById("originalPreview");

originalPreview.src = URL.createObjectURL(file);
document.getElementById("compressedPreview").src = "";
document.getElementById("compressedSize").textContent = "";

document.getElementById("originalSize").textContent =
    "Size: " + (file.size / 1024).toFixed(2) + " KB";

document.getElementById("previewContainer").style.display = "flex";
}

dropZone.addEventListener("click", function () {
    imageInput.click();
});

dropZone.addEventListener("dragover", function (event) {
    event.preventDefault();
    dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", function () {
    dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", function (event) {
    event.preventDefault();
    dropZone.classList.remove("drag-over");

    const files = event.dataTransfer.files;

    if (files.length > 0) {
        imageInput.files = files;
        showSelectedFile(files[0]);
    }
});

imageInput.addEventListener("change", function () {
    if (imageInput.files.length > 0) {
        showSelectedFile(imageInput.files[0]);
    }
});
