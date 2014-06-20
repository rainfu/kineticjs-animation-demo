enyo.kind({
    name: "ciiat.RootPanel",
    kind: "ciiat.RoutePanels",
    classes: "onyx ciiat-root",
    published: {
        pushState: true,
        usePushState: true,
        hashChange: true,
        hasGuide: true,
        root: "",
        snsLogin: true,
        currentUser: null,
        currentPage: null,
        settings: null
    },
    create: enyo.inherit(function (sup) {
        return function () {
            sup.apply(this, arguments);
            this.initSettings();
            this.initCurrentUser();
            this.initData();
            this.settings.get('debug') ? enyo.logging.level = 30 : enyo.logging.level = 10;
            if (document.URL.indexOf("access_token") > 0) {
                this.accessUrl = document.URL;
            }
            else if (document.URL.indexOf("reguid") > 0) {
                var params = ciiat.Utils.getQueryParams(document.URL);
                if (params['reguid']) {
                    this.settings.save('reguid', params['reguid']);
                }
            }
            else {
                var paths = ciiat.Utils.getQueryPaths(document.URL);
                if (paths) {
                    this.sourcePaths = paths;
                }
            }
            if (window.cordova || window.PhoneGap) {
                this.setRoot('');
                this.setPushState(false);
            }
            else if (document.URL.indexOf('file') >= 0) {
                this.setRoot('');
                this.setPushState(false);
            }
            else {
                if (this.usePushState) {
                    this.setRoot('/');
                    this.setPushState(true);
                }
                else {
                    this.setRoot('');
                    this.setPushState(false);
                }
            }
            Backbone.history.start({ pushState: this.pushState, hashChange: this.hashChange, root: this.root });
        };
    }),
    rendered: enyo.inherit(function (sup) {
        return function () {
            sup.apply(this, arguments);
            this.applyData();
            var self = this;
            if (self.settings.get('isFirst')) {
                self.settings.save({ isFirst: false });
                if (self.hasGuide) {
                    app.router.navigate('guide', { trigger: true });
                    return;
                }
            };
            if (this.snsLogin) {
                app.router.navigate('login', { trigger: true });
            }
            else {
                app.router.navigate('main', { trigger: true });
            }
            this.start();
        };
    }),
    initCurrentUser: function () {
        var userCollection = new ciiatUserCollection();
        userCollection.fetch();
        if (userCollection.length) {
            this.setCurrentUser(userCollection.at(0));
        }
        else {
            this.setCurrentUser(userCollection.loadDefault());
        }
        this.applyUser();
    },
    initSettings: function () {
        var settingsCollection = new ciiatSettingsCollection();
        settingsCollection.fetch();
        if (!settingsCollection.length) {
            var settings = new ciiatSettingsModel();
            settingsCollection.create(settings);
        }
        this.setSettings(settingsCollection.at(0));
        this.applySettings();
    },
    applySettings: function () {
    },
    applyUser: function () {
    },
    initData: function () {
    },
    applyData: function () {
    },
    start: function () {
    }
});
