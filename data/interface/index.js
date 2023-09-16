var background = {
  "port": null,
  "message": {},
  "receive": function (id, callback) {
    if (id) {
      background.message[id] = callback;
    }
  },
  "connect": function (port) {
    chrome.runtime.onMessage.addListener(background.listener); 
    /*  */
    if (port) {
      background.port = port;
      background.port.onMessage.addListener(background.listener);
      background.port.onDisconnect.addListener(function () {
        background.port = null;
      });
    }
  },
  "post": function (id, data) {
    if (id) {
      if (background.port) {
        background.port.postMessage({
          "method": id,
          "data": data,
          "port": background.port.name,
          "path": "interface-to-background"
        });
      }
    }
  },
  "send": function (id, data) {
    if (id) {
      if (background.port) {
        if (background.port.name !== "webapp") {
          chrome.runtime.sendMessage({
            "method": id,
            "data": data,
            "path": "interface-to-background"
          }, function () {
            return chrome.runtime.lastError;
          });
        }
      }
    }
  },
  "listener": function (e) {
    if (e) {
      for (let id in background.message) {
        if (background.message[id]) {
          if ((typeof background.message[id]) === "function") {
            if (e.path === "background-to-interface") {
              if (e.method === id) {
                background.message[id](e.data);
              }
            }
          }
        }
      }
    }
  }
};

var config = {
  "current": {
    "style": '',
    "element": {
      "final": null,
      "interim": null
    }
  },
  "button": {
    "info": {},
    "talk": {},
    "font": {},
    "size": {},
    "final": {},
    "start": {},
    "dialect": {},
    "interim": {},
    "language": {}
  },
  "linebreak": function (e) {
    return e.replace(/\n\n/g, "<p></p>").replace(/\n/g, "<br>");
  },
  "addon": {
    "homepage": function () {
      return chrome.runtime.getManifest().homepage_url;
    }
  },
  "app": {
    "start": function () {
      config.update.size();
      config.update.font();
      config.speech.synthesis.init();
    }
  },
  "capitalize": function (e) {
    return e.replace(/\S/, function (m) {
      return m.toUpperCase();
    });
  },
  "show": {
    "info": function (i, q) {
      const comment = q ? '\n' + ">> " + q : '';
      config.button.info.textContent = ">> " + config.message[i] + comment;
    }
  },
  "nosupport": function (e) {
    config.button.size.disabled = true;
    config.button.font.disabled = true;
    config.button.start.disabled = true;
    config.button.dialect.disabled = true;
    config.button.language.disabled = true;
    config.button.talk.src = "images/nomic.png";
    config.show.info("no_support", e ? e : "Please either update your browser or try the app in a different browser.");
  },
  "selection": function () {
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
      /*  */
      const range = document.createRange();
      range.selectNode(config.button.final);
      window.getSelection().addRange(range);
    }
  },
  "fill": {
    "select": function () {
      config.button.language.textContent = '';
      for (let i = 0; i < config.language.length; i++) {
        config.button.language.add(new Option(config.language[i][0], i));
      }
      /*  */
      config.update.dialect(config.language[config.speech.synthesis.prefs.language]);
      config.button.language.selectedIndex = config.speech.synthesis.prefs.language;
      config.button.dialect.selectedIndex = config.speech.synthesis.prefs.dialect;
      config.button.font.selectedIndex = config.speech.synthesis.prefs.font;
      config.button.size.value = config.speech.synthesis.prefs.size;
    }
  },
  "message": {
    "end": "Speech recognition is ended.",
    "no_speech": "No speech was detected!",
    "no_microphone": "No microphone was found!",
    "speak": "Please speak into your microphone...",
    "denied": "Permission to use the microphone was denied!",
    "blocked": "Permission to use the microphone is blocked!",
    "copy": "Press (Ctrl + C) to copy text (Command + C on Mac)",
    "start": "Speech to Text (Voice Recognition) app is ready.",
    "no_support": "Speech recognition API is NOT supported in your browser!",
    "allow": "Please click the - Allow - button to enable microphone in your browser."
  },
  "start": function (e) {
    if (config.speech.synthesis.recognizing) {
      config.recognition.stop();
      config.show.info("copy");
      return;
    }
    /*  */
    config.speech.synthesis.start.timestamp = e.timeStamp;
    config.recognition.lang = config.button.dialect.value;
    config.speech.synthesis.final.transcript = '';
    config.speech.synthesis.ignore.onend = false;
    config.button.talk.src = "images/nomic.png";
    config.button.interim.textContent = '';
    config.button.final.textContent = '';
    /*  */
    config.recognition.start();
  },
  "resize": {
    "timeout": null,
    "method": function () {
      if (config.port.name === "win") {
        if (config.resize.timeout) window.clearTimeout(config.resize.timeout);
        config.resize.timeout = window.setTimeout(async function () {
          const current = await chrome.windows.getCurrent();
          /*  */
          config.storage.write("interface.size", {
            "top": current.top,
            "left": current.left,
            "width": current.width,
            "height": current.height
          });
        }, 1000);
      }
    }
  },
  "flash": {
    "timeout": '',
    "element": document.querySelector(".start"),
    "stop": function () {
      config.flash.element.removeAttribute("color");
      if (config.flash.timeout) window.clearTimeout(config.flash.timeout);
    },
    "start": function () {
      if (config.flash.timeout) window.clearTimeout(config.flash.timeout);
      config.flash.element.setAttribute("color", "red");
      const _blink = function () {
        config.flash.timeout = window.setTimeout(function () {
          const color = config.flash.element.getAttribute("color") === "red" ? "white" : "red";
          config.button.start.setAttribute("color", color);
          _blink();
        }, 500);
      };
      /*  */
      _blink();
    }
  },
  "store": {
    "size": function () {
      config.speech.synthesis.prefs.size = config.button.size.value;
      config.update.size();
    },
    "font": function () {
      config.speech.synthesis.prefs.font = config.button.font.selectedIndex;
      config.update.font();
    },
    "dialect": function () {
      config.speech.synthesis.prefs.dialect = config.button.dialect.selectedIndex;
      config.recognition.stop();
    },
    "language": function () {
      config.speech.synthesis.prefs.dialect = 0;
      config.speech.synthesis.prefs.language = config.button.language.selectedIndex;
      config.update.dialect(config.language[config.button.language.selectedIndex]);
      config.recognition.stop();
    }
  },
  "storage": {
    "local": {},
    "read": function (id) {
      return config.storage.local[id];
    },
    "load": function (callback) {
      chrome.storage.local.get(null, function (e) {
        config.storage.local = e;
        callback();
      });
    },
    "write": function (id, data) {
      if (id) {
        if (data !== '' && data !== null && data !== undefined) {
          let tmp = {};
          tmp[id] = data;
          config.storage.local[id] = data;
          chrome.storage.local.set(tmp);
        } else {
          delete config.storage.local[id];
          chrome.storage.local.remove(id);
        }
      }
    }
  },
  "port": {
    "name": '',
    "connect": function () {
      config.port.name = "webapp";
      const context = document.documentElement.getAttribute("context");
      /*  */
      if (chrome.runtime) {
        if (chrome.runtime.connect) {
          if (context !== config.port.name) {
            if (document.location.search === "?tab") config.port.name = "tab";
            if (document.location.search === "?win") config.port.name = "win";
            if (document.location.search === "?popup") config.port.name = "popup";
            /*  */
            if (config.port.name === "popup") {
              document.body.style.width = "650px";
              document.body.style.height = "550px";
            }
            /*  */
            background.connect(chrome.runtime.connect({"name": config.port.name}));
          }
        }
      }
      /*  */
      document.documentElement.setAttribute("context", config.port.name);
    }
  },
  "load": function () {
    const reload = document.getElementById("reload");
    const support = document.getElementById("support");
    const donation = document.getElementById("donation");
    /*  */
    config.button.font = document.getElementById("font");
    config.button.size = document.getElementById("size");
    config.button.talk = document.getElementById("talk");
    config.button.info = document.getElementById("info");
    config.button.start = document.getElementById("start");
    config.button.final = document.getElementById("final");
    config.button.interim = document.getElementById("interim");
    config.button.dialect = document.getElementById("dialect");
    config.button.language = document.getElementById("language");
    config.current.element.final = document.querySelector(".container .results .final");
    config.current.element.interim = document.querySelector(".container .results .interim");
    /*  */
    config.button.start.addEventListener("click", config.start, false);
    config.button.font.addEventListener("change", config.store.font, false);
    config.button.size.addEventListener("change", config.store.size, false);
    config.button.dialect.addEventListener("change", config.store.dialect, false);
    config.button.language.addEventListener("change", config.store.language, false);
    /*  */
    reload.addEventListener("click", function () {
      document.location.reload();
    });
    /*  */
    support.addEventListener("click", function () {
      const url = config.addon.homepage();
      chrome.tabs.create({"url": url, "active": true});
    }, false);
    /*  */
    donation.addEventListener("click", function () {
      const url = config.addon.homepage() + "?reason=support";
      chrome.tabs.create({"url": url, "active": true});
    }, false);
    /*  */
    config.storage.load(config.app.start);
    window.removeEventListener("load", config.load, false);
  },
  "update": {
    "font": function () {
      const font = config.button.font[config.speech.synthesis.prefs.font].textContent;
      /*  */
      config.current.element.final.style.fontFamily = font;
      config.current.element.interim.style.fontFamily = font;
    },
    "size": function () {
      const size = config.speech.synthesis.prefs.size;
      /*  */
      config.current.element.final.style.fontSize = size + "px";
      config.current.element.interim.style.fontSize = size + "px";
    },
    "dialect": function (target) {
      if (target) {
        config.button.dialect.textContent = '';
        config.button.dialect.style.visibility = "hidden";
        /*  */
        for (let i = 1; i < target.length; i++) {
          const value = target[i][0] !== undefined ? target[i][0] : '';
          const name = target[i][1] !== undefined ? target[i][1] : "System Default";
          const option = new Option(name, value);
          /*  */
          config.button.dialect.add(option);
          config.button.dialect.style.visibility = "visible";
        }
      }
    }
  },
  "speech": {
    "synthesis": {
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
        config.fill.select();
        config.show.info("start", "Please click on the microphone button to start speaking.");
        config.speech.synthesis.methods.oninit();
      },
      "prefs": {
        set font (val) {config.storage.write("font", val)},
        set size (val) {config.storage.write("size", val)},
        set dialect (val) {config.storage.write("dialect", val)},
        set language (val) {config.storage.write("language", val)},
        get font () {return config.storage.read("font") !== undefined ? config.storage.read("font") : 19},
        get size () {return config.storage.read("size") !== undefined ? config.storage.read("size") : 14},
        get dialect () {return config.storage.read("dialect") !== undefined ? config.storage.read("dialect") : 11},
        get language () {return config.storage.read("language") !== undefined ? config.storage.read("language") : 10},
      },
      "methods": {
        "onstart": function () {
          config.flash.start();
          config.speech.synthesis.recognizing = true;
          config.button.talk.src = "images/micactive.png";
          /*  */
          const dialect = config.button.dialect[config.button.dialect.selectedIndex].textContent;
          const language = config.button.language[config.button.language.selectedIndex].textContent;
          /*  */
          config.show.info("speak", "Input language: " + language + ' > ' + dialect);
        },
        "onend": function () {
          config.speech.synthesis.recognizing = false;
          if (config.speech.synthesis.ignore.onend) return;
          /*  */
          config.flash.stop();
          config.button.talk.src = "images/mic.png";
          if (!config.speech.synthesis.final.transcript) {
            config.show.info("end", "No results to show! please try again later.");
            return;
          }
          /*  */
          config.selection();
          config.show.info("copy");
        },
        "onresult": function (e) {
          const error = e.results === undefined || (typeof e.results) === "undefined";
          if (error) {
            config.recognition.onend = null;
            config.recognition.stop();
            config.nosupport();
            return;
          }
          /*  */
          let interim = '';
          for (let i = e.resultIndex; i < e.results.length; ++i) {
            if (e.results[i].isFinal) {
              config.speech.synthesis.final.transcript += e.results[i][0].transcript;
            } else {
              interim += e.results[i][0].transcript;
            }
          }
          /*  */
          config.speech.synthesis.final.transcript = config.capitalize(config.speech.synthesis.final.transcript);
          config.button.final.textContent = config.linebreak(config.speech.synthesis.final.transcript);
          config.button.interim.textContent = config.linebreak(interim);
        },
        "onerror": function (e) {
          if (e.error === "no-speech") {
            config.flash.stop();
            config.button.talk.src = "images/mic.png";
            config.speech.synthesis.ignore.onend = true;
            config.show.info("no_speech", "Please click on the microphone button again.");
          }
          /*  */
          if (e.error === "audio-capture") {
            config.flash.stop();
            config.show.info("no_microphone");
            config.button.talk.src = "images/mic.png";
            config.speech.synthesis.ignore.onend = true;
          }
          /*  */
          if (e.error === "not-allowed") {
            const diff = e.timeStamp - config.speech.synthesis.start.timestamp;
            config.show.info(diff < 100 ? "blocked" : "denied");
            config.speech.synthesis.ignore.onend = true;
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
                  config.recognition = new window.SpeechRecognition();
                  /*  */
                  config.recognition.continuous = true;
                  config.recognition.interimResults = true;
                  config.recognition.onend = config.speech.synthesis.methods.onend;
                  config.recognition.onstart = config.speech.synthesis.methods.onstart;
                  config.recognition.onerror = config.speech.synthesis.methods.onerror;
                  config.recognition.onresult = config.speech.synthesis.methods.onresult;
                  config.show.info("start", "Please click on the microphone button to start speaking.");
                } else {
                  config.show.info("blocked", "Please reload the app and try again.");
                  config.speech.synthesis.ignore.onend = true;
                }
              }, function (e) {
                config.show.info("blocked", "Please reload the app and try again.");
                config.speech.synthesis.ignore.onend = true;
              });
            } else {
              config.nosupport();
            }
          }
        }
      }
    }
  }
};

config.port.connect();

window.addEventListener("load", config.load, false);
window.addEventListener("resize", config.resize.method, false);
