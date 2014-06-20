enyo.kind({
    name: "ciiat.RoutePanels",
    kind: "enyo.Panels",
    classes: "onyx",
    create: enyo.inherit(function (sup) {
        return function () {
            sup.apply(this, arguments);
        };
    }),
    rendered: enyo.inherit(function (sup) {
        return function () {
            sup.apply(this, arguments);
            if (!window.app) return;
            var self = this;
            _.each(this.getPanels(), function (p) {
                if (p.route) {
                    window.app.router.route(p.route, p.rname ? p.rname : p.route, function (params) {
                        window.app.setCurrentPage(p.route);
                        var paths = ciiat.Utils.getQueryPaths('p#' + p.route);
                        self.initParams(self, paths);
                        var panel = self.selectPanelByRoute(p.route);
                        if (typeof panel.afterRoute === 'function') {
                            panel.afterRoute(params);
                        }
                    });
                }
            })
        };
    }),
    initParams: function (ctl, paths) {
        var parent = ctl.parent;
        if (parent) {
            if (parent.kind == 'ciiat.RoutePanels'||parent.name == 'rootView') {
                _.each(paths, function (p) {
                    var panel = parent.selectPanelByRoute(p);
                    if (panel) {
                       // console.log('find panel name..' + panel.name);
                       // console.log('find panel route..' + panel.route);
                    }
                })

            }
            this.initParams(parent, paths);
        }
    },
    selectPanelByRoute: function (route) {
        if (!route) {
            return;
        }
        var idx = 0;
        var panels = this.getPanels();
        var len = panels.length;
        for (; idx < len; ++idx) {
            if (route === panels[idx].route) {
                 if (this.getArrangerKind() == 'CollapsingArranger') {
                    if (!enyo.Panels.isScreenNarrow()) {

                    }
                    else {

                        this.setIndex(idx);
                    }
                }
                else {
                    this.setIndex(idx);
                }
                return panels[idx];
            }
        }
    },
    indexChanged: function (old) {
        this.inherited(arguments);
        /***
        if (!window.app) return;
        var idx = 0;
        var panel = this.getPanels()[this.index];
        var route = panel.route;
        if (panel.route) {
        if (window.app && window.app.router) {
        window.app.router.navigate(panel.route, { trigger: false });
        }
        }**/
    }
});
