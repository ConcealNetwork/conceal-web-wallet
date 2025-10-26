/*
 * Copyright (c) 2018 Gnock
 * Copyright (c) 2018-2019 The Masari Project
 * Copyright (c) 2018-2020 The Karbo developers
 * Copyright (c) 2018-2025 Conceal Community, Conceal.Network & Conceal Devs
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QRReader = void 0;
    var QRReader = /** @class */ (function () {
        function QRReader() {
            this.active = false;
            this.webcam = null;
            this.canvas = null;
            this.ctx = null;
            this.decoder = null;
            this.inited = false;
        }
        QRReader.prototype.setCanvas = function () {
            this.canvas = document.createElement("canvas");
            this.ctx = this.canvas.getContext("2d");
        };
        QRReader.prototype.support = function () {
            return typeof navigator !== "undefined" && typeof navigator.mediaDevices !== "undefined";
        };
        QRReader.prototype.init = function (baseUrl) {
            if (!this.inited)
                this.inited = true;
            else
                return;
            if (!this.support())
                return false;
            var streaming = false;
            var self = this;
            this.webcam = document.querySelector("#cameraVideoFluxForDelivery");
            this.setCanvas();
            // Optimize canvas size for QR detection - using square dimensions
            if (this.canvas !== null) {
                // Use square dimensions for better QR code scanning
                var size = 1024; // Square size that's good for QR detection
                this.canvas.width = size;
                this.canvas.height = size;
            }
            this.decoder = new Worker(baseUrl + "decoder.min.js");
            if (this.canvas === null || this.webcam === null)
                return;
            /*if (!window.iOS) {
                    // Resize webcam according to input
                    this.webcam.addEventListener("play", function (ev) {
                        if(self.canvas !== null)
                        if (!streaming) {
                            self.canvas.width = window.innerWidth;
                            self.canvas.height = window.innerHeight;
                            streaming = true;
                        }
                    }, false);
                }
                else {*/
            //this.canvas.width = window.innerWidth;
            //this.canvas.height = window.innerHeight;
            // }
            function startCapture(constraints) {
                // Enhanced constraints for better QR detection
                var enhancedConstraints = {
                    audio: false,
                    video: __assign({ facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1920 } }, constraints.video),
                };
                navigator.mediaDevices
                    .getUserMedia(enhancedConstraints)
                    .then(function (stream) {
                    if (self.webcam !== null) {
                        self.webcam.srcObject = stream;
                        // Set video element properties for better quality
                        self.webcam.setAttribute("playsinline", "true"); // Important for iOS
                        self.webcam.setAttribute("autoplay", "true");
                    }
                })
                    .catch(function (err) {
                    showErrorMsg(err);
                });
            }
            navigator.mediaDevices
                .enumerateDevices()
                .then(function (devices) {
                var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
                var device = devices.filter(function (device) {
                    var deviceLabel = device.label.split(",")[1];
                    if (device.kind == "videoinput") {
                        return device;
                    }
                });
                if (device.length) {
                    startCapture({
                        audio: false,
                        video: {
                            facingMode: "environment",
                        },
                    });
                }
                else {
                    startCapture({ video: true });
                }
            })
                .catch(function (error) {
                showErrorMsg(error);
            });
            function showErrorMsg(error) {
                if ("" + error === "DOMException: Permission denied") {
                    swal({
                        type: "error",
                        title: i18n.t("global.permissionRequiredForCameraModal.title"),
                        html: i18n.t("global.permissionRequiredForCameraModal.content"),
                        confirmButtonText: i18n.t("global.permissionRequiredForCameraModal.confirmText"),
                    });
                }
                //console.log('unable access camera');
            }
        };
        QRReader.prototype.stop = function () {
            this.active = false;
            if (this.webcam !== null) {
                if (this.webcam.srcObject !== null && this.webcam.srcObject instanceof MediaStream)
                    this.webcam.srcObject.getVideoTracks()[0].stop();
                this.webcam.srcObject = null;
            }
        };
        QRReader.prototype.scan = function (callback) {
            if (this.decoder === null)
                return;
            var self = this;
            // Add frame rate control for better performance
            var lastFrameTime = 0;
            var targetFrameRate = 30; // 30 FPS
            var frameInterval = 1000 / targetFrameRate;
            // Start QR-decoder
            function newDecoderFrame() {
                var now = performance.now();
                if (now - lastFrameTime < frameInterval) {
                    requestAnimationFrame(newDecoderFrame);
                    return;
                }
                lastFrameTime = now;
                if (self.ctx === null || self.webcam === null || self.canvas === null || self.decoder === null)
                    return;
                try {
                    // Draw the video frame to the canvas
                    var videoWidth = self.webcam.videoWidth;
                    var videoHeight = self.webcam.videoHeight;
                    var size = Math.min(videoWidth, videoHeight); // largest possible square
                    var sx = (videoWidth - size) / 2;
                    var sy = (videoHeight - size) / 2;
                    // Draw the centered square from the video to the square canvas
                    self.ctx.drawImage(self.webcam, sx, sy, size, size, 0, 0, self.canvas.width, self.canvas.height);
                    var imgData = self.ctx.getImageData(0, 0, self.canvas.width, self.canvas.height);
                    if (imgData.data) {
                        self.decoder.postMessage(imgData);
                    }
                }
                catch (e) {
                    var errorName = "";
                    if (e instanceof Error) {
                        errorName = e.name;
                    }
                    // Try-Catch to circumvent Firefox Bug #879717
                    if (errorName == "NS_ERROR_NOT_AVAILABLE") {
                        setTimeout(newDecoderFrame, 0);
                    }
                }
            }
            this.active = true;
            this.setCanvas();
            this.decoder.onmessage = function (event) {
                if (event.data.length > 0) {
                    var qrid = event.data[0][2];
                    self.active = false;
                    callback(qrid);
                }
                setTimeout(newDecoderFrame, 0);
            };
            newDecoderFrame();
        };
        return QRReader;
    }());
    exports.QRReader = QRReader;
});
