var config = {};

config.welcome = {
  set lastupdate (val) {app.storage.write("lastupdate", val)},
  get lastupdate () {return app.storage.read("lastupdate") !== undefined ? app.storage.read("lastupdate") : 0}
};

config.interface = {
  set size (val) {app.storage.write("interface.size", val)},
  set context (val) {app.storage.write("interface.context", val)},
  get size () {return app.storage.read("interface.size") !== undefined ? app.storage.read("interface.size") : config.interface.default.size},
  get context () {return app.storage.read("interface.context") !== undefined ? app.storage.read("interface.context") : config.interface.default.context},
  "default": {
    "context": "win",
    "size": {
      "width": 900, 
      "height": 650
    }
  }
};