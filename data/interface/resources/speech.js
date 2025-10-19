config.speech = {
  "webapi": {
    "recognizing": false,
    "ignore": {
      "onend": null
    },
    "final": {
      "transcript": ''
    },
    "start": {
      "timestamp": null
    },
    "init": function () {
      config.button.language.textContent = '';
      config.element.buttons.setAttribute("loading", '');
      config.element.results.setAttribute("loading", '');
      document.documentElement.setAttribute("engine", config.app.prefs.engine);
      /*  */
      for (let i = 0; i < config.language.webapi.length; i++) {
        config.button.language.add(new Option(config.language.webapi[i][0], i));
      }
      /*  */
      config.update.dialect(config.language.webapi[config.app.prefs.webapi.language]);
      config.button.language.selectedIndex = config.app.prefs.webapi.language;
      config.button.dialect.selectedIndex = config.app.prefs.webapi.dialect;
      config.button.font.selectedIndex = config.app.prefs.font;
      config.button.backend.value = config.app.prefs.backend;
      config.button.engine.value = config.app.prefs.engine;
      config.button.size.value = config.app.prefs.size;
      /*  */
      config.speech.webapi.methods.oninit();
    },
    "methods": {
      "onstart": function () {
        config.flash.start();
        config.selection.remove();
        config.speech.webapi.recognizing = true;
        config.button.talk.src = "images/micactive.png";
        /*  */
        const dialect = config.button.dialect[config.button.dialect.selectedIndex].textContent;
        const language = config.button.language[config.button.language.selectedIndex].textContent;
        /*  */
        config.show.info("speak", "Input language: " + language + ' > ' + dialect);
      },
      "onend": function () {
        config.speech.webapi.recognizing = false;
        if (config.speech.webapi.ignore.onend) return;
        /*  */
        config.flash.stop();
        config.button.talk.src = "images/mic.png";
        if (!config.speech.webapi.final.transcript) {
          config.show.info("end", "No results to show! please try again later.");
          return;
        }
        /*  */
        config.selection.add();
        config.show.info("copy");
      },
      "onresult": function (e) {
        const error = e.results === undefined || (typeof e.results) === "undefined";
        if (error) {
          config.speech.webapi.instance.onend = null;
          config.speech.webapi.instance.stop();
          config.nosupport();
          return;
        }
        /*  */
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            config.speech.webapi.final.transcript += e.results[i][0].transcript;
          } else {
            interim += e.results[i][0].transcript;
          }
        }
        /*  */
        config.speech.webapi.final.transcript = config.capitalize(config.speech.webapi.final.transcript);
        config.element.final.textContent = config.linebreak(config.speech.webapi.final.transcript);
        config.element.interim.textContent = config.linebreak(interim);
      },
      "onerror": function (e) {
        if (e.error === "no-speech") {
          config.flash.stop();
          config.speech.webapi.ignore.onend = true;
          config.button.talk.src = "images/mic.png";
          config.show.info("no_speech", "Please click on the microphone button again.");
        }
        /*  */
        if (e.error === "audio-capture") {
          config.flash.stop();
          config.show.info("no_microphone");
          config.button.talk.src = "images/mic.png";
          config.speech.webapi.ignore.onend = true;
        }
        /*  */
        if (e.error === "not-allowed") {
          const diff = e.timeStamp - config.speech.webapi.start.timestamp;
          config.show.info(diff < 100 ? "blocked" : "denied");
          config.speech.webapi.ignore.onend = true;
        }
      },
      "oninit": function () {
        window.SpeechRecognition = window.webkitSpeechRecognition || window.mozSpeechRecognition || window.SpeechRecognition;
        /*  */
        if (window.SpeechRecognition === undefined) {
          config.nosupport();
        } else {
          if (navigator.getUserMedia) {
            config.show.info("allow");
            navigator.getUserMedia({"audio": true}, function (stream) {
              if (stream.active) {
                config.speech.webapi.instance = new window.SpeechRecognition();
                /*  */
                config.speech.webapi.instance.continuous = true;
                config.speech.webapi.instance.interimResults = true;
                config.speech.webapi.instance.lang = config.button.dialect.value;
                config.speech.webapi.instance.onend = config.speech.webapi.methods.onend;
                config.speech.webapi.instance.onstart = config.speech.webapi.methods.onstart;
                config.speech.webapi.instance.onerror = config.speech.webapi.methods.onerror;
                config.speech.webapi.instance.onresult = config.speech.webapi.methods.onresult;
                config.show.info("start", "Please click on the microphone button to start speaking.");
              } else {
                config.show.info("blocked", "Please reload the app and try again.");
                config.speech.webapi.ignore.onend = true;
              }
            }, function () {
              config.show.info("blocked", "Please reload the app and try again.");
              config.speech.webapi.ignore.onend = true;
            });
          } else {
            config.nosupport();
          }
        }
        /*  */
        config.element.results.removeAttribute("loading");
        config.element.buttons.removeAttribute("loading");
      }
    }
  },
  "whisper": {
    "drop": {},
    "recognizing": false,
    "ignore": {
      "onend": null
    },
    "final": {
      "transcript": ''
    },
    "start": {
      "timestamp": null
    },
    "init": function () {
      config.button.language.textContent = '';
      config.element.buttons.setAttribute("loading", '');
      config.element.results.setAttribute("loading", '');
      document.documentElement.setAttribute("engine", config.app.prefs.engine);
      /*  */
      for (let key in config.language.whisper) {
        config.button.language.add(new Option(config.language.whisper[key], key));
      }
      /*  */
      config.button.language.selectedIndex = config.app.prefs.whisper.language;
      config.button.font.selectedIndex = config.app.prefs.font;
      config.button.backend.value = config.app.prefs.backend;
      config.button.engine.value = config.app.prefs.engine;
      config.button.size.value = config.app.prefs.size;
      /*  */
      config.speech.whisper.methods.oninit();
    },
    "instance": {
      "lang": '',
      "node": null,
      "stream": null,
      "source": null,
      "context": null,
      "transcriber": null,
      "stop": function (copy) {
        if (config.speech.whisper.instance.stream) {
          config.speech.whisper.instance.stream.getTracks().forEach(track => track.stop());
          config.speech.whisper.instance.stream = null;
        }
        /*  */
        if (config.speech.whisper.instance.context) {            
          config.speech.whisper.instance.context.close();
          config.speech.whisper.instance.context = null;
        }
        /*  */
        if (config.speech.whisper.instance.source) {
          config.speech.whisper.instance.source.disconnect();
          config.speech.whisper.instance.source = null;
        }
        /*  */
        if (config.speech.whisper.instance.node) {
          config.speech.whisper.instance.node.disconnect();
          config.speech.whisper.instance.node = null;
        }
        /*  */
        config.speech.whisper.recognizing = false;
        if (config.speech.whisper.ignore.onend) return;
        /*  */
        config.flash.stop();
        config.speech.whisper.drop.buffer = null;
        config.button.talk.src = "images/mic.png";
        config.element.placeholder.style.display = "none";
        /*  */
        config.selection.add();
        if (copy) config.show.info("copy");
      },
      "start": function () {
        config.button.talk.src = "images/micactive.png";
        const worklet = chrome.runtime.getURL("/data/interface/resources/audio-worklet.js");
        const language = config.button.language[config.button.language.selectedIndex].textContent;
        /*  */
        if (config.speech.whisper.drop.buffer) {
          config.element.placeholder.style.display = "flex";
          const duration = (config.speech.whisper.drop.buffer.length / 16000).toFixed(1);
          /*  */
          config.speech.whisper.methods.processing = false;
          const details = "Audio buffer size: " + duration + " second" + (duration > 1 ? 's' : '');
          config.show.info("audio", "Input language: " + language + ' > ' + details);
          config.speech.whisper.methods.onqueue(duration);
        } else {
          config.speech.whisper.drop.buffer = null;
          config.element.placeholder.style.display = "none";
          navigator.getUserMedia({"audio": true}, async function (stream) {
            config.flash.start();
            config.selection.remove();
            config.speech.whisper.recognizing = true;
            config.speech.whisper.instance.stream = stream;
            const details = "Audio buffer chunk size: " + config.app.prefs.whisper.chunk + " second" + (config.app.prefs.whisper.chunk > 1 ? 's' : '');
            config.show.info("speak", "Input language: " + language + ' > ' + details);
            /*  */
            if (config.speech.whisper.instance.stream.active) {
              config.speech.whisper.methods.queue = [];
              config.speech.whisper.methods.processing = false;
              config.speech.whisper.instance.context = new AudioContext({"sampleRate": 16000});
              /*  */
              await config.speech.whisper.instance.context.audioWorklet.addModule(worklet);
              config.speech.whisper.instance.source = config.speech.whisper.instance.context.createMediaStreamSource(config.speech.whisper.instance.stream);
              config.speech.whisper.instance.node = new AudioWorkletNode(config.speech.whisper.instance.context, "mic-processor");
              /*  */
              config.speech.whisper.instance.node.port.postMessage({
                "command": "chunkSize",
                "value": config.app.prefs.whisper.chunk // second
              });
              /*  */
              config.speech.whisper.instance.node.port.onmessage = async function (e) {
                config.speech.whisper.methods.queue.push(e.data);
                config.speech.whisper.methods.onqueue(null);
              };
              /*  */
              config.speech.whisper.instance.source.connect(config.speech.whisper.instance.node);
              config.speech.whisper.instance.node.connect(config.speech.whisper.instance.context.destination);
            } else {
              config.speech.whisper.instance.stop(false);
              config.show.info("blocked", "Please reload the app and try again.");
            }
          }, function () {
            config.show.info("blocked", "Please reload the app and try again.");
          });
        }
      }
    },
    "methods": {
      "queue": [],
      "progress": 0,
      "processing": false,
      "onqueue": async function (duration) {
        if (config.speech.whisper.methods.processing || config.speech.whisper.methods.queue.length === 0) return;
        /*  */
        config.speech.whisper.methods.processing = true;
        const chunk = config.speech.whisper.methods.queue.shift();
        const language = config.button.language[config.app.prefs.whisper.language].value;
        /*  */
        try {
          if (duration) {
            config.speech.whisper.methods.progress = 0;
            config.element.results.setAttribute("loading", '');
            /*  */
            const start = Date.now();
            const interval = window.setInterval(function () {
              const elapsed = (Date.now() - start) / 1000;
              const details = "The input audio duration is: " + duration + " second" + (duration > 1 ? 's' : '');
              /*  */
              config.speech.whisper.methods.progress = Math.min((elapsed / duration) * 100, 99.9);
              config.show.info(details, `Audio transcribing in progress: ${config.speech.whisper.methods.progress.toFixed(1)}%, please wait...`);
            }, 1000);
            /*  */
            const result = await config.speech.whisper.instance.transcriber(chunk, {
              "language": language,
              "task": "transcribe",
              "chunk_length_s": 30,
              "stride_length_s": 10,
              "return_timestamps": false,
              "temperature": 0 // deterministic transcription
            });
            /*  */
            window.clearInterval(interval);
            config.speech.whisper.methods.progress = 0;
            config.element.results.removeAttribute("loading");
            config.element.final.textContent = result.text.replace(/\[.*?\]/g, '').trim();
          } else {
            const result = await config.speech.whisper.instance.transcriber(chunk, {
              "language": language,
              "task": "transcribe",
              "return_timestamps": false
            });
            /*  */
            const cond_1 = result.text.trim() !== "[CLICK]";
            const cond_2 = result.text.trim() !== "[BLANK_AUDIO]";
            if (cond_1 && cond_2) {
              config.element.final.textContent += ' ' + result.text.replace(/\[.*?\]/g, '').trim();
            }
          }
        } catch (e) {
          config.flash.stop();
          config.button.talk.src = "images/mic.png";
          config.speech.whisper.ignore.onend = true;
          config.speech.whisper.methods.processing = false;
          config.show.info("no_speech", e && e.message ? e.message : "Please click on the microphone button again.");
        } finally {
          if (config.speech.whisper.instance.stream) {
            config.speech.whisper.methods.onqueue(null);
            config.speech.whisper.methods.processing = false;
          } else {
            config.speech.whisper.drop.buffer = null;
            config.speech.whisper.instance.stop(true);
            config.show.info("copy");
          }
        }
      },
      "drop": async function (e) {
        if (document.documentElement.getAttribute("engine") === "webapi") {
          e.preventDefault();
          e.stopPropagation()
          return;
        }
        /*  */
        const _getMonoFloat32 = function (audioBuffer) {
          const channelData = audioBuffer.numberOfChannels > 1 ? _averageChannels(audioBuffer) : audioBuffer.getChannelData(0);
          return Float32Array.from(channelData);
        };
        /*  */
        const _formatFileSize = function (bytes) {
          const units = ['B', "KB", "MB", "GB", "TB"];
          /*  */
          let i = 0;
          while (bytes >= 1024 && i < units.length - 1) {
            bytes /= 1024;
            i++;
          }
          /*  */
          return `${bytes.toFixed(2)} ${units[i]}`;
        }
        /*  */
        const _averageChannels = function (audioBuffer) {
          const left = audioBuffer.getChannelData(0);
          const right = audioBuffer.getChannelData(1);
          const length = Math.min(left.length, right.length);
          const output = new Float32Array(length);
          /*  */
          for (let i = 0; i < length; i++) {
            output[i] = (left[i] + right[i]) / 2;
          }
          /*  */
          return output;
        };
        /*  */
        const _resampleBuffer = function (buffer, originalSampleRate, targetSampleRate = 16000) {
          if (originalSampleRate === targetSampleRate) return buffer;
          /*  */
          const ratio = originalSampleRate / targetSampleRate;
          const newLength = Math.round(buffer.length / ratio);
          const resampled = new Float32Array(newLength);
          /*  */
          for (let i = 0; i < newLength; i++) {
            const idx = i * ratio;
            const i0 = Math.floor(idx);
            const i1 = Math.min(Math.ceil(idx), buffer.length - 1);
            const weight = idx - i0;
            resampled[i] = buffer[i0] * (1 - weight) + buffer[i1] * weight;
          }
          /*  */
          return resampled;
        }
        /*  */
        let float32Array = null;
        const file = e.dataTransfer.files[0];
        const size = _formatFileSize(file.size);
        /*  */
        config.element.fileinfo.textContent = "File name: " + file.name + '\n' + "File type: " + file.type + '\n' + "File size: " + size;
        /*  */
        const buffer = await file.arrayBuffer();
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(buffer);
        /*  */
        float32Array = _getMonoFloat32(audioBuffer);
        float32Array = _resampleBuffer(float32Array, audioBuffer.sampleRate, 16000);
        /*  */
        config.speech.whisper.drop.buffer = float32Array;
        config.speech.whisper.methods.queue.push(float32Array);
        window.setTimeout(function () {
          config.button.start.click();
        }, 300);
      },
      "oninit": async function () {
        const remote = {};
        /*  */
        remote.host = "https://huggingface.co/onnx-community/whisper-base";
        remote.permission = "Whisper speech recognition engine needs to download pre-trained model for: " + remote.host + " \n\nTo continue, press OK. Otherwise, press Cancel and change the speech recognition engine. \n\nOnce downloaded, the data will be cached in memory, allowing the Speech to Text application to function offline."
        config.app.prefs.whisper.permission = config.app.prefs.whisper.permission || window.confirm(remote.permission);
        /*  */
        if (config.app.prefs.whisper.permission) {
          try {
            const progress = {};
            const module = await import(chrome.runtime.getURL("/data/interface/vendor/transformers.js"));
            /*  */
            module.env.useBrowserCache = true;
            module.env.allowLocalModels = false;
            module.env.allowRemoteModels = true;
            module.env.remoteHost = (new URL(remote.host)).origin;
            module.env.remotePathTemplate = "onnx-community/whisper-base/resolve/main";
            /*  */
            module.env.backends.onnx.wasm.simd = true;
            module.env.backends.onnx.logLevel = "error";
            module.env.backends.onnx.wasm.proxy = true; // for multi-threaded speedup
            module.env.backends.onnx.wasm.numThreads = navigator.hardwareConcurrency || 4;
            module.env.backends.onnx.wasm.wasmPaths = {
              "mjs": chrome.runtime.getURL("/data/interface/vendor/wasm/ort-wasm-simd-threaded.jsep.mjs"),
              "wasm": chrome.runtime.getURL("/data/interface/vendor/wasm/ort-wasm-simd-threaded.jsep.wasm")
            };
            /*  */
            progress.size = {'a': 0, 'b': 0, 'c': 0};
            progress.percent = {'a': 0, 'b': 0, 'c': 0};
            config.show.info("loading", "Loading Whisper pre-trained model with 74 billion parameters.");
            await new Promise(resolve => window.setTimeout(resolve, 300));
            /*  */
            config.speech.whisper.instance.transcriber = await module.pipeline("automatic-speech-recognition", "whisper-base", {
              "dtype": "fp32",
              "quantized": false,
              "device": config.app.prefs.backend,
              "progress_callback": async function (data) {
                if (data) {
                  if (data.status === "ready") {
                    const usermedia = navigator.getUserMedia;
                    const gpuadapter = "gpu" in navigator ? await navigator.gpu.requestAdapter() : null;
                    const gpudevice = gpuadapter ? await gpuadapter.requestDevice() : null;
                    const supported = config.app.prefs.backend === "wasm" ? true : gpuadapter && gpudevice;
                    /*  */
                    if (usermedia && supported) {
                      config.show.info("start", "Please click on the microphone button to start speaking.");
                    } else {
                      config.nosupport();
                      config.show.info("no_gpu", "Please reload the app or try a different browser.");
                    }
                  } else {
                    if (data.file) {
                      progress.encoder = data.file.indexOf("encoder_model.onnx");
                      progress.decoder = data.file.indexOf("decoder_model_merged.onnx");
                      progress.other = progress.encoder === -1 && progress.decoder === -1;
                      progress.valid = data.loaded !== undefined && data.total !== undefined;
                      /*  */
                      if (progress.valid) {
                        if (progress.other) progress.size.a = (data.total / (1024 * 1024)).toFixed(1);
                        if (progress.other) progress.percent.a = ((data.loaded / data.total) * 100).toFixed(1);
                        if (progress.encoder !== -1) progress.size.b = (data.total / (1024 * 1024)).toFixed(1);
                        if (progress.decoder !== -1) progress.size.c = (data.total / (1024 * 1024)).toFixed(1);
                        if (progress.encoder !== -1) progress.percent.b = ((data.loaded / data.total) * 100).toFixed(1);
                        if (progress.decoder !== -1) progress.percent.c = ((data.loaded / data.total) * 100).toFixed(1);
                      }
                      /*  */
                      progress.text = 
                        "Downloading model data for: " + remote.host + '\n' + ">> " + 
                        (progress.other ? "Loading " + data.file + ' ' + progress.percent.a + '%' + '\n' + ">> " : '') + 
                        "Loading encoder_model.onnx" + (progress.size.b ? " (" + progress.size.b + " MB)" : '') + ' ' + progress.percent.b + '%' + '\n' + ">> " + 
                        "Loading decoder_model_merged.onnx" + (progress.size.c ? " (" + progress.size.c + " MB)" : '') + ' ' + progress.percent.c + '%';
                      /*  */
                      config.show.info("loading", progress.text);
                    }
                  }
                }
              }
            });
          } catch (e) {
            config.nosupport();
            config.show.info("error", "Please reload the app or try a different browser.");
          }
        } else {
          config.show.info("no_permission", "Please reload the app or change the speech recognition engine and try again.");
        }
        /*  */
        config.element.results.removeAttribute("loading");
        config.element.buttons.removeAttribute("loading");
      }
    }
  }
};
