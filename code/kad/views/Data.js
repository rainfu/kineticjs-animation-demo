SettingsModel = Backbone.Model.extend({
    defaults: {
        //soft
        softversion: '1.3.0',
        softname: "Kineticjs animation demo",
        softdescripiton: "",
        softdev: "Rain Fu",
        softweb: "http://www.cejia.com",
        softdevweibo: "http://weibo.com/rainfuling",
        debug: false,
        //runing
        isFirst: true,
        isBgSound:false,
        isSoundEffect:true,
        //social
        messageSound:true,
        animate:"animation",
        timeDiff:20
    }
});

SettingsCollection = Backbone.Collection.extend({
    model: SettingsModel,
    localStorage: new Backbone.LocalStorage("KAD_Settings")
});

UserModel = Backbone.Model.extend({
    idAttribute: "uid",
    defaults: {
        //local
        online: false,
        uid: "current"
    }
});

UserCollection = Backbone.Collection.extend({
    model: UserModel,
    localStorage: new Backbone.LocalStorage("KAD_Users"),
    loadDefault:function(){
       return this.create(new UserModel());
    }
});

BackgroundModel = Backbone.Model.extend({
});

ColorThemeModel = Backbone.Model.extend({
});

BackgroundCollection = Backbone.Collection.extend({
    model: BackgroundModel
});

ColorThemeCollection = Backbone.Collection.extend({
    model: ColorThemeModel,
    localStorage: new Store("ATA_ColorThemes"),
    load: function () {
        this.fetch({ reset: true });
        if (!this.length) {
            this.reset(this.loadDefault().models);
        }
    },
    loadDefault: function () {
        var items = new ColorThemeCollection();
         //god
        items.create({
            color1: 'black',
            color2: 'red',
            color3: 'blue',
            borderColor: 'white',
            borderWidth: "2"

        });
        items.create({
            color1: 'blue',
            color2: 'yellow',
            color3: 'black',
            borderColor: 'white',
            borderWidth: "2"

        });
        items.create({
            color1: 'green',
            color2: 'orange',
            color3: 'black',
            borderColor: 'white',
            borderWidth: "2"
        });

        items.create({
            color1: 'pink',
            color2: 'gray',
            color3: 'black',
            borderColor: 'yellow',
            borderWidth: "1"
        });

        items.create({
            color1: 'darkred',
            color2: 'darkblue',
            color3: 'black',
            borderColor: 'pink',
            borderWidth: "1"
        });
        return items;
    }
});



GameModel = Backbone.Model.extend({
    defaults: {
        score: 0,
        level:1,
        speed:0,
        maxSpeed:3,
        maxLevel:5,
        isFinished:false,
        bgType:'random',
        bgSubType:"random",
        colorTheme:"random"
    }
});

GameCollection = Backbone.Collection.extend({
    model: GameModel,
    localStorage: new Store("KAD_Games"),
    load: function () {
        this.fetch({ reset: true });
        this.reset(this.loadDefault().models);
    },
    loadDefault: function () {
        var items = new GameCollection();
        items.create({
            id: "rotationDigital",
            name: "Rotation digital",
            description: "Clicking the rotation numbers order by small to large",
            tag: "Visual discrimination",
            start: 0,
            end: 4,
            isOpen: 1,
            time: 30
        });
        return items;
    }
});

ImageModel= Backbone.Model.extend({
});

ImageCollection = Backbone.Collection.extend({
    model: ImageModel
});

BgModel = Backbone.Model.extend({
});
BgCollection = Backbone.Collection.extend({
    model: BgModel
});

