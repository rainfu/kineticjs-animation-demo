//RootView
require('/views/Data');
require('/views/main/MenuView');
require('/views/main/GameView');
require('/views/settings/SettingsPopupView');
enyo.kind({
    name: "App.RootView",
    classes: "onyx enyo-fit enyo-unselectable appView",
    kind: "ciiat.RootPanel",
    draggable: false,
    hasGuide: false,
    pushState: false,
    usePushState: false,
    snsLogin: false,
    router: new Backbone.Router(),
    arrangerKind: "CardSlideInArranger",
    create: function () {
        this.inherited(arguments);
        this.setPushState(false);
    },
    rendered: function () {
        this.inherited(arguments);
    },
    published:{
        bgMedia:null
    },
    components: [
        {
            name: "mainView",
            route: "main",
            kind: "FittableRows",
            components: [
                    {
                        fit: true,
                        kind: "ciiat.RoutePanels",
                        draggable: false,
                        arrangerKind: "CardSlideInArranger",
                        components: [
                     { name: "menuView", route: "main/menu", kind: "MainView.MenuView" },
                       { name: "gameView", route: "main/game/:name", kind: "MainView.GameView" },
                       {
                           name: "others", components: [
                            { name: "spinnerPopup", classes: "onyx-dark", kind: "onyx.Popup", centered: true, floating: true, scrim: true, autoDismiss: true, components: [
				                            { kind: "onyx.Spinner" }
			                            ]
                            },
                            { kind: "Audio", name: "clickSound" },
                            { kind: "Audio", name: "bgSound", loop: true },
                            { kind: "Audio", name: "successSound" },
                            { kind: "Audio", name: "wrongSound" },
                            { kind: "Audio", name: "victorySound" },
                            { kind: "Audio", name: "sclickSound" }
                            ]
                       }
                      ]
                    }
                   ]
        }
    ],
    initSettings: function () {
        var settingsCollection = new SettingsCollection();
        settingsCollection.fetch();
        if (!settingsCollection.length) {
            var settings = new SettingsModel();
            settingsCollection.create(settings);
        }
        this.settings = settingsCollection.at(0);
        this.applySettings();
    },
    initData: function () {
        this.colorThemeCollection = new ColorThemeCollection();
        this.gameCollection = new GameCollection();
        this.imageCollection = new ImageCollection();
        this.initImages();
    },
    applySettings: function () {
        var oldVer = this.settings.get('softversion');
        this.settings.save({
            softversion: '1.4.1',
            debug: false
        });
        this.settings.set({
            todayScore: 0,
            todayTime: 0
        });
    },
    applyUser: function () {
    },
    applyData: function () {
        app.gameCollection.load();
        app.colorThemeCollection.load();
        app.loadImages();
    },
    loadImages: function (callback) {
        var loadedImages = 0;
        app.imageCollection.each(function (image) {
            var tempImage = new Image();
            tempImage.onload = function () {
                image.image = tempImage;
                if (++loadedImages >= app.imageCollection.length) {
                    console.log('load image ok');
                }
            };
            tempImage.src = app.getRoot() + "kad/" + image.get('tag') + "/" + image.get('name') + ".png";
        });
    },
    initImages: function () {
    },
    start: function () {
        var self = this;
        app.router.navigate('main/menu', { trigger: true });

    },
    showSpinner: function () {
        this.$.spinnerPopup.show();
    },
    hideSpinner: function () {
        this.$.spinnerPopup.hide();
    },
    playAudio: function (type) {
        if (type == 'bg') {
            if (app.settings.get('isBgSound')) {
                var bgMedia = ciiat.Utils.playAudio(this.$.bgSound, app.getRoot() + 'amblyopia/audios/gamebg.mp3', "/android_asset/www/amblyopia/audios/gamebg.mp3");
                app.setBgMedia(bgMedia);
            }
        }
        else {
            if (app.settings.get('isSoundEffect')) {
                if (type == 'click') {
                    ciiat.Utils.playAudio(this.$.clickSound, app.getRoot() + 'amblyopia/audios/click.mp3', "/android_asset/www/amblyopia/audios/click.mp3");
                }
                else if (type == 'success') {
                    ciiat.Utils.playAudio(this.$.successSound, app.getRoot() + 'amblyopia/audios/success.mp3', "/android_asset/www/amblyopia/audios/success.mp3");
                }
                else if (type == 'wrong') {
                    ciiat.Utils.playAudio(this.$.wrongSound, app.getRoot() + 'amblyopia/audios/wrong.mp3', "/android_asset/www/amblyopia/audios/wrong.mp3");
                }
               
                else if (type == 'victory') {
                    ciiat.Utils.playAudio(this.$.victorySound, app.getRoot() + 'amblyopia/audios/victory.mp3', "/android_asset/www/amblyopia/audios/victory.mp3");
                }
                else if (type == 'sclick') {
                    ciiat.Utils.playAudio(this.$.sclickSound, app.getRoot() + 'amblyopia/audios/sclick.mp3', "/android_asset/www/amblyopia/audios/sclick.mp3");
                }
              
            }
        }
    },
    stopAudio: function (type) {
        if (type == 'bg') {
            ciiat.Utils.stopAudio(this.$.bgSound, app.getRoot() + 'amblyopia/audios/gamebg.mp3', "/android_asset/www/amblyopia/audios/gamebg.mp3");
        }
    }
});
