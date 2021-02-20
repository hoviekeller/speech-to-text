app.version = function () {return chrome.runtime.getManifest().version};
app.homepage = function () {return chrome.runtime.getManifest().homepage_url};

if (!navigator.webdriver) {
  app.on.uninstalled(app.homepage() + "?v=" + app.version() + "&type=uninstall");
  app.on.installed(function (e) {
    app.on.management(function (result) {
      if (result.installType === "normal") {
        window.setTimeout(function () {
          app.tab.query.index(function (index) {
            var previous = e.previousVersion !== undefined && e.previousVersion !== app.version();
            var doupdate = previous && parseInt((Date.now() - config.welcome.lastupdate) / (24 * 3600 * 1000)) > 45;
            if (e.reason === "install" || (e.reason === "update" && doupdate)) {
              var parameter = (e.previousVersion ? "&p=" + e.previousVersion : '') + "&type=" + e.reason;
              var url = app.homepage() + "?v=" + app.version() + parameter;
              app.tab.open(url, index, e.reason === "install");
              config.welcome.lastupdate = Date.now();
            }
          });
        }, 3000);
      }
    });
  });
}

app.on.message(function (request, sender) {
  if (request) {
    if (request.path === "interface-to-background") {
      for (var id in app.interface.message) {
        if (app.interface.message[id]) {
          if ((typeof app.interface.message[id]) === "function") {
            if (id === request.method) {
              app.interface.message[id](request.data);
            }
          }
        }
      }
    }
  }
});