var app = {};

app.error = function () {
  return chrome.runtime.lastError;
};

app.button = {
  "popup": function (popup, callback) {
    chrome.action.setPopup({"popup": popup}, function (e) {
      if (callback) callback(e);
    });
  },
  "on": {
    "clicked": function (callback) {
      chrome.action.onClicked.addListener(function (e) {
        app.storage.load(function () {
          callback(e);
        }); 
      });
    }
  }
};

app.contextmenu = {
  "create": function (options, callback) {
    if (chrome.contextMenus) {
      chrome.contextMenus.create(options, function (e) {
        if (callback) callback(e);
      });
    }
  },
  "on": {
    "clicked": function (callback) {
      if (chrome.contextMenus) {
        chrome.contextMenus.onClicked.addListener(function (info, tab) {
          app.storage.load(function () {
            callback(info, tab);
          });
        });
      }
    }
  }
};

app.storage = {
  "local": {},
  "read": function (id) {
    return app.storage.local[id];
  },
  "update": function (callback) {
    if (app.session) app.session.load();
    /*  */
    chrome.storage.local.get(null, function (e) {
      app.storage.local = e;
      if (callback) {
        callback("update");
      }
    });
  },
  "write": function (id, data, callback) {
    let tmp = {};
    tmp[id] = data;
    app.storage.local[id] = data;
    /*  */
    chrome.storage.local.set(tmp, function (e) {
      if (callback) {
        callback(e);
      }
    });
  },
  "load": function (callback) {
    const keys = Object.keys(app.storage.local);
    if (keys && keys.length) {
      if (callback) {
        callback("cache");
      }
    } else {
      app.storage.update(function () {
        if (callback) callback("disk");
      });
    }
  } 
};

app.window = {
  set id (e) {
    app.storage.write("window.id", e);
  },
  get id () {
    return app.storage.read("window.id") !== undefined ? app.storage.read("window.id") : '';
  },
  "create": function (options, callback) {
    chrome.windows.create(options, function (e) {
      if (callback) callback(e);
    });
  },
  "get": function (windowId, callback) {
    chrome.windows.get(windowId, function (e) {
      if (callback) callback(e);
    });
  },
  "update": function (windowId, options, callback) {
    chrome.windows.update(windowId, options, function (e) {
      if (callback) callback(e);
    });
  },
  "remove": function (windowId, callback) {
    chrome.windows.remove(windowId, function (e) {
      if (callback) callback(e);
    });
  },
  "query": {
    "current": function (callback) {
      chrome.windows.getCurrent(callback);
    }
  },
  "on": {
    "removed": function (callback) {
      chrome.windows.onRemoved.addListener(function (e) {
        app.storage.load(function () {
          callback(e);
        }); 
      });
    }
  }
};

app.on = {
  "management": function (callback) {
    chrome.management.getSelf(callback);
  },
  "uninstalled": function (url) {
    chrome.runtime.setUninstallURL(url, function () {});
  },
  "installed": function (callback) {
    chrome.runtime.onInstalled.addListener(function (e) {
      app.storage.load(function () {
        callback(e);
      });
    });
  },
  "startup": function (callback) {
    chrome.runtime.onStartup.addListener(function (e) {
      app.storage.load(function () {
        callback(e);
      });
    });
  },
  "connect": function (callback) {
    chrome.runtime.onConnect.addListener(function (e) {
      app.storage.load(function () {
        if (callback) callback(e);
      });
    });
  },
  "storage": function (callback) {
    chrome.storage.onChanged.addListener(function (changes, namespace) {
      app.storage.update(function () {
        if (callback) {
          callback(changes, namespace);
        }
      });
    });
  },
  "message": function (callback) {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      app.storage.load(function () {
        callback(request, sender, sendResponse);
      });
      /*  */
      return true;
    });
  }
};

app.tab = {
  "get": function (tabId, callback) {
    chrome.tabs.get(tabId, function (e) {
      if (callback) callback(e);
    });
  },
  "remove": function (tabId, callback) {
    chrome.tabs.remove(tabId, function (e) {
      if (callback) callback(e);
    });
  },
  "query": {
    "index": function (callback) {
      chrome.tabs.query({"active": true, "currentWindow": true}, function (tabs) {
        let tmp = chrome.runtime.lastError;
        if (tabs && tabs.length) {
          callback(tabs[0].index);
        } else callback(undefined);
      });
    }
  },
  "update": function (tabId, options, callback) {
    if (tabId) {
      chrome.tabs.update(tabId, options, function (e) {
        if (callback) callback(e);
      });
    } else {
      chrome.tabs.update(options, function (e) {
        if (callback) callback(e);
      });
    }
  },
  "open": function (url, index, active, callback) {
    const properties = {
      "url": url, 
      "active": active !== undefined ? active : true
    };
    /*  */
    if (index !== undefined) {
      if (typeof index === "number") {
        properties.index = index + 1;
      }
    }
    /*  */
    chrome.tabs.create(properties, function (tab) {
      if (callback) callback(tab);
    }); 
  }
};

app.interface = {
  "port": null,
  "message": {},
  "path": chrome.runtime.getURL("data/interface/index.html"),
  set id (e) {
    app.storage.write("interface.id", e);
  },
  get id () {
    return app.storage.read("interface.id") !== undefined ? app.storage.read("interface.id") : '';
  },
  "receive": function (id, callback) {
    app.interface.message[id] = callback;
  },
  "send": function (id, data) {
    if (id) {
      chrome.runtime.sendMessage({"data": data, "method": id, "path": "background-to-interface"}, app.error);
    }
  },
  "close": function (context) {
    if (app.interface.id) {
      try {
        if (context === "popup") {/*  */}
        if (context === "tab") app.tab.remove(app.interface.id);
        if (context === "win") app.window.remove(app.interface.id);
      } catch (e) {}
    }
  },
  "post": function (id, data) {
    if (id) {
      if (app.interface.port) {
        app.interface.port.postMessage({
          "data": data, 
          "method": id, 
          "path": "background-to-interface"
        });
      }
    }
  },
  "create": function (url, callback) {
    app.window.query.current(function (win) {
      app.window.id = win.id;
      url = url ? url : app.interface.path;
      /*  */
      const width = config.interface.size.width;
      const height = config.interface.size.height;
      const top = config.interface.size.top || (win.top + Math.round((win.height - height) / 2));
      const left = config.interface.size.left || (win.left + Math.round((win.width - width) / 2));
      /*  */
      app.window.create({
        "url": url,
        "top": top,
        "left": left,
        "width": width,
        "type": "popup",
        "height": height
      }, function (e) {
        if (callback) callback(e);
      });
    });
  }
};
