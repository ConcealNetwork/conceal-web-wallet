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

export
// window.iOS = ['iPad', 'iPhone', 'iPod'].indexOf(navigator.platform) >= 0;



class QRReader{
	active = false;
	webcam : HTMLVideoElement|null = null;
	canvas : HTMLCanvasElement|null = null;
	ctx : CanvasRenderingContext2D|null = null;
	decoder : Worker|null = null;
	inited = false;

	setCanvas(){
		this.canvas = document.createElement("canvas");
		this.ctx = this.canvas.getContext("2d");
	}

	support(){
		return typeof navigator !== 'undefined' && typeof navigator.mediaDevices !== 'undefined';
	}

	init(baseUrl : string){
		if(!this.inited)
			this.inited=true;
		else
			return;

		if(!this.support())
			return false;


		let streaming = false;
		let self = this;

		this.webcam = document.querySelector("#cameraVideoFluxForDelivery");

		this.setCanvas();
		
		// Optimize canvas size for QR detection - using square dimensions
		if (this.canvas !== null) {
			// Use square dimensions for better QR code scanning
			const size = 1024;  // Square size that's good for QR detection
			this.canvas.width = size;
			this.canvas.height = size;
		}

		this.decoder = new Worker(baseUrl + "decoder.min.js");

		if(this.canvas === null || this.webcam === null)
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


		function startCapture(constraints : MediaStreamConstraints) {
			// Enhanced constraints for better QR detection
			const enhancedConstraints: MediaStreamConstraints = {
				audio: false,
				video: {
					facingMode: 'environment',
					width: { ideal: 1920 },  // High square resolution
					height: { ideal: 1920 }, // High square resolution
					...(constraints.video as MediaTrackConstraints)  // Merge with any existing constraints
				}
			};

			navigator.mediaDevices.getUserMedia(enhancedConstraints)
				.then(function (stream) {
					if(self.webcam !== null) {
						self.webcam.srcObject = stream;
						// Set video element properties for better quality
						self.webcam.setAttribute('playsinline', 'true');  // Important for iOS
						self.webcam.setAttribute('autoplay', 'true');
					}
				})
				.catch(function(err) {
					showErrorMsg(err);
				});
		}

		navigator.mediaDevices.enumerateDevices().then(function (devices) {
			let supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
			let device = devices.filter(function(device) {
				let deviceLabel = device.label.split(',')[1];
				if (device.kind == "videoinput") {
					return device;
				}
			});

			if (device.length) {
				startCapture({
					audio: false,
					video: {
						facingMode: 'environment'
					}
				});
			} else {
				startCapture({video:true});
			}      
		}).catch(function (error) {
			showErrorMsg(error);
		});

		function showErrorMsg(error : string) {
			if(''+error === 'DOMException: Permission denied'){
				swal({
					type: 'error',
					title:i18n.t('global.permissionRequiredForCameraModal.title'),
					html:i18n.t('global.permissionRequiredForCameraModal.content'),
					confirmButtonText:i18n.t('global.permissionRequiredForCameraModal.confirmText'),
				});
			}
			//console.log('unable access camera');
		}
	}

	stop() {
		this.active = false;
		if (this.webcam !== null) {
			if(this.webcam.srcObject!==null && this.webcam.srcObject instanceof MediaStream)
				this.webcam.srcObject.getVideoTracks()[0].stop();
			this.webcam.srcObject = null;
		}
	}

	scan(callback : Function) {
		if(this.decoder === null)
			return;
		let self = this;

		// Add frame rate control for better performance
		let lastFrameTime = 0;
		const targetFrameRate = 30; // 30 FPS
		const frameInterval = 1000 / targetFrameRate;

		// Start QR-decoder
		function newDecoderFrame() {
			const now = performance.now();
			if (now - lastFrameTime < frameInterval) {
				requestAnimationFrame(newDecoderFrame);
				return;
			}
			lastFrameTime = now;

			if(self.ctx === null || self.webcam === null || self.canvas === null || self.decoder === null)
				return;

			try {
				// Draw the video frame to the canvas
				const videoWidth = self.webcam.videoWidth;
				const videoHeight = self.webcam.videoHeight;
				const size = Math.min(videoWidth, videoHeight); // largest possible square

				const sx = (videoWidth - size) / 2;
				const sy = (videoHeight - size) / 2;

				// Draw the centered square from the video to the square canvas
				self.ctx.drawImage(self.webcam, sx, sy, size, size, 0, 0, self.canvas.width, self.canvas.height);
				let imgData = self.ctx.getImageData(0, 0, self.canvas.width, self.canvas.height);

				if (imgData.data) {
					self.decoder.postMessage(imgData);
				}
			} catch(e) {
				let errorName = "";
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
		this.decoder.onmessage = function(event) {
			if (event.data.length > 0) {
				let qrid = event.data[0][2];
				self.active = false;
				callback(qrid);
			}
			setTimeout(newDecoderFrame, 0);
		};

		newDecoderFrame();
	}
}