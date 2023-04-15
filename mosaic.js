// 모자이크 처리할 픽셀 크기
// const pixelSize = 10;
// 이미지에 대한 모자이크 처리 수행
// const img = new Image();
// img.crossOrigin = "anonymous";
// img.src = 'https://picsum.photos/500/500';
// imgSrc = img.src;

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
// const img = new Image();
// img.crossOrigin = "anonymous";
// img.src = 'https://picsum.photos/500/500';

let isMouseDown = false;
let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;

const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.addEventListener('change', handleFileSelect);
document.querySelector('#btn-loc').appendChild(fileInput);

function handleFileSelect(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function () {
            const imgWidth = img.naturalWidth;
            const imgHeight = img.naturalHeight;
            canvas.width = imgWidth;
            canvas.height = imgHeight;
            ctx.drawImage(img, 0, 0);

            document.querySelector('#canvas-container').appendChild(canvas);

            canvas.addEventListener('mousedown', e => {
                isMouseDown = true;
                startX = e.offsetX;
                startY = e.offsetY;
                endX = e.offsetX;
                endY = e.offsetY;
            });

            canvas.addEventListener('mousemove', e => {
                if (!isMouseDown) return;

                const imgRect = img.getBoundingClientRect();
                const x = Math.min(Math.max(e.clientX - imgRect.left, 0), imgWidth);
                const y = Math.min(Math.max(e.clientY - imgRect.top, 0), imgHeight);

                endX = x;
                endY = y;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);

                const width = Math.abs(startX - endX);
                const height = Math.abs(startY - endY);
                const size = Math.min(width, height);
                if (size < 10) return;

                const clipX = Math.min(startX, endX);
                const clipY = Math.min(startY, endY);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.fillRect(clipX, clipY, size, size);
            });

            canvas.addEventListener('mouseup', e => {
                isMouseDown = false;
                const width = Math.abs(startX - endX);
                const height = Math.abs(startY - endY);
                const size = Math.min(width, height);
                if (size < 10) return;

                const clipX = Math.min(startX, endX);
                const clipY = Math.min(startY, endY);
                const imageData = ctx.getImageData(clipX, clipY, size, size);
                const pixelSize = 5;

                for (let dy = 0; dy < size; dy += pixelSize) {
                    for (let dx = 0; dx < size; dx += pixelSize) {
                        const avgRGB = getAverageRGB(imageData.data, dx, dy, size, size, pixelSize);
                        ctx.fillStyle = `rgb(${avgRGB.r}, ${avgRGB.g}, ${avgRGB.b})`;
                        ctx.fillRect(clipX + dx, clipY + dy, pixelSize, pixelSize);
                    }
                }
            });

            // // 특정 영역의 평균 RGB 값을 계산하는 함수
            function getAverageRGB(pixels, x, y, width, height, size) {
                let r = 0,
                    g = 0,
                    b = 0;
                let count = 0;
                for (let dy = 0; dy < size; dy++) {
                    for (let dx = 0; dx < size; dx++) {
                        const px = x + dx;
                        const py = y + dy;
                        if (px >= 0 && px < width && py >= 0 && py < height) {
                            const i = (py * width + px) * 4;
                            r += pixels[i];
                            g += pixels[i + 1];
                            b += pixels[i + 2];
                            count++;
                        }
                    }
                }
                r = Math.round(r / count);
                g = Math.round(g / count);
                b = Math.round(b / count);
                return {r, g, b};
            }
        };
        img.src = event.target.result;
    }
    reader.readAsDataURL(file);
}

// 이미지 다운로드 함수
function downloadMosaic() {
    const link = document.createElement('a');
    link.download = 'mosaic.png';
    link.href = canvas.toDataURL();
    link.click();
}

// 다운로드 버튼 생성
const downloadBtn = document.querySelector('button');
downloadBtn.textContent = 'download';
downloadBtn.addEventListener('click', downloadMosaic);
document.querySelector('#btn-loc').appendChild(downloadBtn);


// const canvas = document.createElement('canvas');
// const ctx = canvas.getContext('2d');
//
// // 마우스 이벤트 등록
// let isMouseDown = false;
// let startX = 0;
// let startY = 0;
// let endX = 0;
// let endY = 0;
//
// // 이미지가 로딩된 후 캔버스에 출력
// img.onload = () => {
//     canvas.width = img.width;
//     canvas.height = img.height;
//     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//     document.body.appendChild(canvas);
// };
// canvas.addEventListener('mousedown', e => {
//     isMouseDown = true;
//     startX = e.offsetX;
//     startY = e.offsetY;
//     endX = e.offsetX;
//     endY = e.offsetY;
// });
//
// canvas.addEventListener('mousemove', e => {
//     if (!isMouseDown) return;
//
//     endX = e.offsetX;
//     endY = e.offsetY;
//
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//
//     const x = Math.min(startX, endX);
//     const y = Math.min(startY, endY);
//     const width = Math.abs(startX - endX);
//     const height = Math.abs(startY - endY);
//
//     ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
//     ctx.fillRect(x, y, width, height);
// });
//
// canvas.addEventListener('mouseup', e => {
//     if (!isMouseDown) return;
//     isMouseDown = false;
//
//     const x = Math.min(startX, endX);
//     const y = Math.min(startY, endY);
//     const width = Math.abs(startX - endX);
//     const height = Math.abs(startY - endY);
//
//     const imageData = ctx.getImageData(x, y, width, height);
//     const pixelSize = 5;
//
//     for (let dy = 0; dy < height; dy += pixelSize) {
//         for (let dx = 0; dx < width; dx += pixelSize) {
//             const avgRGB = getAverageRGB(imageData.data, dx + x, dy + y, width, height, pixelSize);
//             ctx.fillStyle = `rgb(${avgRGB.r}, ${avgRGB.g}, ${avgRGB.b})`;
//             ctx.fillRect(dx + x, dy + y, pixelSize, pixelSize);
//         }
//     }
// });
// // 특정 영역의 평균 RGB 값을 계산하는 함수
// function getAverageRGB(pixels, x, y, width, height, size) {
//     let r = 0,
//         g = 0,
//         b = 0;
//     let count = 0;
//     for (let dy = 0; dy < size; dy++) {
//         for (let dx = 0; dx < size; dx++) {
//             const px = x + dx;
//             const py = y + dy;
//             if (px >= 0 && px < width && py >= 0 && py < height) {
//                 const i = (py * width + px) * 4;
//                 r += pixels[i];
//                 g += pixels[i + 1];
//                 b += pixels[i + 2];
//                 count++;
//             }
//         }
//     }
//     r = Math.round(r / count);
//     g = Math.round(g / count);
//     b = Math.round(b / count);
//     return { r, g, b };
// }


// 모자이크 처리를 수행하는 함수
// function mosaicImage(img, pixelSize) {
//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");
//     canvas.width = img.width;
//     canvas.height = img.height;
//     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//     const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//     for (let y = 0; y < canvas.height; y += pixelSize) {
//         for (let x = 0; x < canvas.width; x += pixelSize) {
//             const avgRGB = getAverageRGB(
//                 imageData.data,
//                 x,
//                 y,
//                 canvas.width,
//                 canvas.height,
//                 pixelSize
//             );
//             ctx.fillStyle = `rgb(${avgRGB.r}, ${avgRGB.g}, ${avgRGB.b})`;
//             ctx.fillRect(x, y, pixelSize, pixelSize);
//         }
//     }
//     return canvas.toDataURL();
// }
//
// // 모자이크 처리할 영역을 선택하는 함수
// function selectMosaicArea(imgSrc, pixelSize, startX, startY, endX, endY) {
//     const img = new Image();
//     img.src = imgSrc;
//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");
//     canvas.width = img.width;
//     canvas.height = img.height;
//     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//     const imageData = ctx.getImageData(
//         startX,
//         startY,
//         endX - startX,
//         endY - startY
//     );
//     for (let y = startY; y < endY; y += pixelSize) {
//         for (let x = startX; x < endX; x += pixelSize) {
//             const avgRGB = getAverageRGB(
//                 imageData.data,
//                 x - startX,
//                 y - startY,
//                 imageData.width,
//                 imageData.height,
//                 pixelSize
//             );
//             ctx.fillStyle = `rgb(${avgRGB.r}, ${avgRGB.g}, ${avgRGB.b})`;
//             ctx.fillRect(x, y, pixelSize, pixelSize);
//         }
//     }
//     return canvas.toDataURL();
// }

// img.onload = () => {
//     // 이미지 전체에 대한 모자이크 처리
//     const mosaicImgSrc = mosaicImage(img, pixelSize);
//     const mosaicImg = new Image();
//     mosaicImg.src = mosaicImgSrc;
//     mosaicImg.onload = () => {
//         document.body.appendChild(mosaicImg);
//     };
//
//     // 선택된 영역에 대한 모자이크 처리
//     const startX = 100;
//     const startY = 100;
//     const endX = 200;
//     const endY = 200;
//     const mosaicAreaImgSrc = selectMosaicArea(
//         imgSrc,
//         pixelSize,
//         startX,
//         startY,
//         endX,
//         endY
//     );
//     const mosaicAreaImg = new Image();
//     mosaicAreaImg.src = mosaicAreaImgSrc;
//     mosaicAreaImg.onload = () => {
//         document.body.appendChild(mosaicAreaImg);
//     };
// };
