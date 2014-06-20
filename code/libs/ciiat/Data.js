ciiatSettingsModel = Backbone.Model.extend({
    defaults: function () {
        return {
            //settings
            softversion: '1.0.0',
            softname: "enyojs-socketstream",
            softdescripiton: "fast enyojs dev framework",
            softdev: "rain.fu",
            softdevweibo: "http://weibo.com/rainfuling",
            softweb: "http://www.weifudao.com",
            //dev
            debug: true,
            isFirst:true,
            //settings
            messageSound: true,
            usePassword: false
        };
    }
});

ciiatSettingsCollection = Backbone.Collection.extend({
    model: ciiatSettingsModel,
    localStorage: new Backbone.LocalStorage("APP_Settings")
});

ciiatUserModel = Backbone.Model.extend({
    idAttribute: "uid",
    defaults: {
        //local
        uid:"default"
    }
});
ciiatUserCollection = Backbone.Collection.extend({
    model: ciiatUserModel,
    localStorage: new Backbone.LocalStorage("APP_Users"),
    loadDefault:function(){
       return this.create(new ciiatUserModel());
    }
});