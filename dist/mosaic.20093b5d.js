// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"mosaic.js":[function(require,module,exports) {
// 모자이크 처리할 픽셀 크기
// const pixelSize = 10;
// 이미지에 대한 모자이크 처리 수행
// const img = new Image();
// img.crossOrigin = "anonymous";
// img.src = 'https://picsum.photos/500/500';
// imgSrc = img.src;
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d'); // const img = new Image();
// img.crossOrigin = "anonymous";
// img.src = 'https://picsum.photos/500/500';

var isMouseDown = false;
var startX = 0;
var startY = 0;
var endX = 0;
var endY = 0;
var fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.addEventListener('change', handleFileSelect);
document.querySelector('#btn-loc').appendChild(fileInput);

function handleFileSelect(e) {
  var file = e.target.files[0];
  var reader = new FileReader();

  reader.onload = function (event) {
    var img = new Image();

    img.onload = function () {
      var imgWidth = img.naturalWidth;
      var imgHeight = img.naturalHeight;
      canvas.width = imgWidth;
      canvas.height = imgHeight;
      ctx.drawImage(img, 0, 0);
      document.querySelector('#canvas-container').appendChild(canvas);
      canvas.addEventListener('mousedown', function (e) {
        isMouseDown = true;
        startX = e.offsetX;
        startY = e.offsetY;
        endX = e.offsetX;
        endY = e.offsetY;
      });
      canvas.addEventListener('mousemove', function (e) {
        if (!isMouseDown) return;
        var imgRect = img.getBoundingClientRect();
        var x = Math.min(Math.max(e.clientX - imgRect.left, 0), imgWidth);
        var y = Math.min(Math.max(e.clientY - imgRect.top, 0), imgHeight);
        endX = x;
        endY = y;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        var width = Math.abs(startX - endX);
        var height = Math.abs(startY - endY);
        var size = Math.min(width, height);
        if (size < 10) return;
        var clipX = Math.min(startX, endX);
        var clipY = Math.min(startY, endY);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(clipX, clipY, size, size);
      });
      canvas.addEventListener('mouseup', function (e) {
        isMouseDown = false;
        var width = Math.abs(startX - endX);
        var height = Math.abs(startY - endY);
        var size = Math.min(width, height);
        if (size < 10) return;
        var clipX = Math.min(startX, endX);
        var clipY = Math.min(startY, endY);
        var imageData = ctx.getImageData(clipX, clipY, size, size);
        var pixelSize = 5;

        for (var dy = 0; dy < size; dy += pixelSize) {
          for (var dx = 0; dx < size; dx += pixelSize) {
            var avgRGB = getAverageRGB(imageData.data, dx, dy, size, size, pixelSize);
            ctx.fillStyle = "rgb(".concat(avgRGB.r, ", ").concat(avgRGB.g, ", ").concat(avgRGB.b, ")");
            ctx.fillRect(clipX + dx, clipY + dy, pixelSize, pixelSize);
          }
        }
      }); // // 특정 영역의 평균 RGB 값을 계산하는 함수

      function getAverageRGB(pixels, x, y, width, height, size) {
        var r = 0,
            g = 0,
            b = 0;
        var count = 0;

        for (var dy = 0; dy < size; dy++) {
          for (var dx = 0; dx < size; dx++) {
            var px = x + dx;
            var py = y + dy;

            if (px >= 0 && px < width && py >= 0 && py < height) {
              var i = (py * width + px) * 4;
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
        return {
          r: r,
          g: g,
          b: b
        };
      }
    };

    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
} // 이미지 다운로드 함수


function downloadMosaic() {
  var link = document.createElement('a');
  link.download = 'mosaic.png';
  link.href = canvas.toDataURL();
  link.click();
} // 다운로드 버튼 생성


var downloadBtn = document.querySelector('button');
downloadBtn.textContent = 'download';
downloadBtn.addEventListener('click', downloadMosaic);
document.querySelector('#btn-loc').appendChild(downloadBtn); // const canvas = document.createElement('canvas');
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
},{}],"../../../.nvm/versions/node/v16.16.0/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "51628" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../.nvm/versions/node/v16.16.0/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","mosaic.js"], null)
//# sourceMappingURL=/mosaic.20093b5d.js.map