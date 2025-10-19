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
  "button": {},
  "element": {},
  "isgecko": navigator.userAgent.toLowerCase().includes("firefox"),
  "linebreak": function (e) {
    return e.replace(/\n\n/g, "<p></p>").replace(/\n/g, "<br>");
  },
  "addon": {
    "homepage": function () {
      return chrome.runtime.getManifest().homepage_url;
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
      config.element.info.textContent = ">> " + (i ? (config.message[i] ? config.message[i] : i) + comment : comment);
    }
  },
  "nosupport": function (e) {
    config.button.size.disabled = true;
    config.button.font.disabled = true;
    config.button.chunk.disabled = true;
    config.button.start.disabled = true;
    config.button.engine.disabled = true;
    config.button.backend.disabled = true;
    config.button.dialect.disabled = true;
    config.button.language.disabled = true;
    config.button.talk.src = "images/nomic.png";
    config.show.info("no_support", e ? e : "Please either update your browser or try the app in a different browser.");
  },
  "selection": {
    "remove": function () {
      if (window.getSelection) {
        window.getSelection().removeAllRanges();
      }
    },
    "add": function () {
      if (window.getSelection) {
        window.getSelection().removeAllRanges();
        /*  */
        const range = document.createRange();
        range.selectNode(config.element.final);
        window.getSelection().addRange(range);
      }
    }
  },
  "message": {
    "end": "Speech recognition is ended.",
    "no_speech": "No speech was detected!",
    "error": "An unexpected error happened!",
    "no_permission": "Host permission denied!",
    "no_microphone": "No microphone was found!",
    "speak": "Please speak into your microphone...",
    "denied": "Permission to use the microphone was denied!",
    "no_gpu": "WebGPU API is not supported in your browser!",
    "blocked": "Permission to use the microphone is blocked!",
    "start": "Speech to Text (Voice Recognition) app is ready.",
    "copy": "Press (Ctrl + C) to copy text (Command + C on Mac)",
    "no_support": "Speech recognition API is NOT supported in your browser!",
    "loading": "Speech to Text (Voice Recognition) is loading, please wait...",
    "allow": "Please click the - Allow - button to enable microphone in your browser.",
    "audio": "Whisper AI engine is recognizing text from the input audio file. Please wait..."
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
  "storage": {
    "local": {},
    "read": function (id) {
      return config.storage.local[id];
    },
    "reset": function (callback) {
      chrome.storage.local.clear(callback);
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
  "update": {
    "chunk": function () {
      config.button.chunk.value = config.app.prefs.whisper.chunk;
    },
    "font": function () {
      const font = config.button.font[config.app.prefs.font].textContent;
      /*  */
      config.element.final.style.fontFamily = font;
      config.element.interim.style.fontFamily = font;
    },
    "size": function () {
      const size = config.app.prefs.size;
      /*  */
      config.element.final.style.fontSize = size + "px";
      config.element.interim.style.fontSize = size + "px";
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
  "store": {
    "size": function () {
      config.app.prefs.size = config.button.size.value;
      config.update.size();
    },
    "font": function () {
      config.app.prefs.font = config.button.font.selectedIndex;
      config.update.font();
    },
    "chunk": function () {
      config.app.prefs.whisper.chunk = config.button.chunk.value;
      /*  */
      window.setTimeout(function () {
        document.location.reload();
      }, 300);
    },
    "dialect": function () {
      config.app.prefs.webapi.dialect = config.button.dialect.selectedIndex;
      /*  */
      window.setTimeout(function () {
        document.location.reload();
      }, 300);
    },
    "engine": function () {
      config.app.prefs.engine = config.button.engine.value;
      /*  */
      window.setTimeout(function () {
        document.location.reload();
      }, 300);
    },
    "backend": function () {
      config.app.prefs.backend = config.button.backend.value;
      /*  */
      window.setTimeout(function () {
        document.location.reload();
      }, 300);
    },
    "language": function () {
      const engine = config.app.prefs.engine;
      /*  */
      config.app.prefs[engine].language = config.button.language.selectedIndex;
      if (engine === "webapi") {
        config.app.prefs[engine].dialect = 0;
        config.update.dialect(config.language[engine][config.button.language.selectedIndex]);
      }
      /*  */
      window.setTimeout(function () {
        document.location.reload();
      }, 300);
    }
  },
  "app": {
    "start": function () {
      const theme = config.app.prefs.theme;
      const engine = config.app.prefs.engine;
      /*  */
      document.documentElement.setAttribute("theme", theme);
      /*  */
      config.update.size();
      config.update.font();
      config.update.chunk();
      config.speech[engine].init();
    },
    "initialize": async function (e) {
      const engine = config.app.prefs.engine;
      /*  */
      if (config.speech[engine].recognizing) {
        config.speech[engine].instance.stop();
        config.show.info("copy");
        return;
      }
      /*  */
      config.speech[engine].start.timestamp = e.timeStamp;
      config.speech[engine].final.transcript = '';
      config.speech[engine].ignore.onend = false;
      config.button.talk.src = "images/nomic.png";
      config.element.interim.textContent = '';
      config.element.final.textContent = '';
      /*  */
      config.speech[engine].instance.start();
    },
    "prefs": {
      set font (val) {config.storage.write("font", val)},
      set size (val) {config.storage.write("size", val)},
      set theme (val) {config.storage.write("theme", val)},
      set engine (val) {config.storage.write("engine", val)},
      set backend (val) {config.storage.write("backend", val)},
      //
      get font () {return config.storage.read("font") !== undefined ? config.storage.read("font") : 19},
      get size () {return config.storage.read("size") !== undefined ? config.storage.read("size") : 14},
      get theme () {return config.storage.read("theme") !== undefined ? config.storage.read("theme") : "light"},
      get engine () {return config.storage.read("engine") !== undefined ? config.storage.read("engine") : "webapi"},
      get backend () {return config.storage.read("backend") !== undefined ? config.storage.read("backend") : config.isgecko ? "wasm" : "webgpu"},
      //
      "webapi": {
        set dialect (val) {config.storage.write("dialect", val)},
        set language (val) {config.storage.write("language", val)},
        get dialect () {return config.storage.read("dialect") !== undefined ? config.storage.read("dialect") : 11},
        get language () {return config.storage.read("language") !== undefined ? config.storage.read("language") : 10}
      },
      "whisper": {
        set chunk (val) {config.storage.write("chunk", val)},
        set permission (val) {config.storage.write("permission", val)},
        set language (val) {config.storage.write("language-whisper", val)},
        get chunk () {return config.storage.read("chunk") !== undefined ? config.storage.read("chunk") : 1},
        get permission () {return config.storage.read("permission") !== undefined ? config.storage.read("permission") : false},
        get language () {return config.storage.read("language-whisper") !== undefined ? config.storage.read("language-whisper") : 20}
      }
    }
  },
  "load": function () {
    const theme = document.getElementById("theme");
    const reset = document.getElementById("reset");
    const reload = document.getElementById("reload");
    const support = document.getElementById("support");
    const donation = document.getElementById("donation");
    const actions = ["drop", "dragenter", "dragover", "dragleave"];
    /*  */
    config.button.font = document.getElementById("font");
    config.button.size = document.getElementById("size");
    config.button.talk = document.getElementById("talk");
    config.button.chunk = document.getElementById("chunk");
    config.button.start = document.getElementById("start");
    config.button.engine = document.getElementById("engine");
    config.button.backend = document.getElementById("backend");
    config.button.dialect = document.getElementById("dialect");
    config.button.language = document.getElementById("language");
    /*  */
    config.element.info = document.getElementById("info");
    config.element.final = document.getElementById("final");
    config.element.interim = document.getElementById("interim");
    config.element.buttons = document.querySelector(".buttons");
    config.element.fileinfo = document.querySelector(".fileinfo");
    config.element.placeholder = document.getElementById("placeholder");
    config.element.results = document.querySelector(".container .results");
    /*  */
    config.button.font.addEventListener("change", config.store.font, false);
    config.button.size.addEventListener("change", config.store.size, false);
    config.button.chunk.addEventListener("change", config.store.chunk, false);
    config.button.engine.addEventListener("change", config.store.engine, false);
    config.button.start.addEventListener("click", config.app.initialize, false);
    config.button.dialect.addEventListener("change", config.store.dialect, false);
    config.button.backend.addEventListener("change", config.store.backend, false);
    config.button.language.addEventListener("change", config.store.language, false);
    config.element.results.addEventListener("drop", config.speech.whisper.methods.drop, false);
    /*  */
    actions.forEach(function (action) {
      config.element.results.addEventListener(action, e => e.preventDefault(), false);
      config.element.results.addEventListener(action, e => e.stopPropagation(), false);
    });
    /*  */
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
    reset.addEventListener("click", function () {
      const reset = window.confirm("Are you sure you want to reset the app to factory settings?");
      if (reset) {
        config.storage.reset(function () {
          document.location.reload();
        });
      }
    });
    /*  */
    theme.addEventListener("click", function () {
      let attribute = document.documentElement.getAttribute("theme");
      attribute = attribute === "dark" ? "light" : "dark";
      /*  */
      document.documentElement.setAttribute("theme", attribute);
      config.storage.write("theme", attribute);
    }, false);
    /*  */
    config.storage.load(config.app.start);
    window.removeEventListener("load", config.load, false);
  }
};

config.port.connect();

window.addEventListener("load", config.load, false);
window.addEventListener("resize", config.resize.method, false);
