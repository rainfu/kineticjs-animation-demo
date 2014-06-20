enyo.kind({
    name: "ciiat.LoginPanel",
    kind: "FittableRows",
    classes: 'onyx  onyx-lightblue ciiat-login',
    components: [
        {
            kind: 'FittableRows',
            components: [
                {
                    fit: true, style: "margin:80px auto;max-width:300px;padding:25px;text-align:center;",
                    components: [
                        { name: "qqdenglu", classes: "onyx-affirmative btnLogin", kind: "onyx.Button", content: "QQ账号登录", ontap: "openLogin", allowHtml: true },
                         { name: "sinaweibo", classes: "onyx-blue btnLogin", kind: "onyx.Button", content: "微博账号登录", ontap: "openLogin", allowHtml: true },
				        { name: "offLine", classes: "onyx-light btnLogin", kind: "onyx.Button", content: "离线浏览", ontap: "offLine", allowHtml: true },
				    ]
                }
            ]
        }
    ],
    create: function () {
        this.inherited(arguments);
    },
    rendered: function () {
        this.inherited(arguments);
    },
    openLogin: function (inSender, inEvent) {
        var redirect_url = app.settings.get('baidRedirectUrl');
        var iframe = null;
        if (window.cordova || window.PhoneGap) {
            redirect_url = app.settings.get('baiduRedirectUrlCordova');
        }
        var options = {
            response_type: 'token',
            media_type: inSender.name,
            redirect_uri: redirect_url,
            client_type: 'web',
            iframe: iframe
        };
        if (inSender.name == 'baidu') {
            options.scope = 'netdisk';
        }
        baidu.frontia.social.login(options);
    },
    loginWithParams: function (params, sucess, err) {
        var self = this;
        baidu.frontia.social.setLoginCallback({
            params: params,
            success: function (user) {
                var baiduUser = baidu.frontia.getCurrentAccount();
                app.currentUser.save({
                    snsUser: baiduUser
                });
                self.getUserInfo(user.accessToken, sucess);
            },
            error: function (e) {
                console.log('login error ' + JSON.stringify(rtt));
                if (e)
                    err(e);
            }
        });
    },
    getUserInfo: function (accessToken, callback) {
        var url = "https://openapi.baidu.com/social/api/2.0/user/info";
        params = {
            access_token: accessToken
        }
        var jsonp = new enyo.JsonpRequest({
            url: url,
            callbackName: "callback"
        });
        jsonp.go(params);
        var self = this;
        jsonp.response(this, function (inSender, inResponse) {
            app.currentUser.save({
                snsUserInfo: inResponse
            });
            if (window.cordova || window.PhoneGap) {
                location.reload();
                return;
            }
            if (callback) {
                callback(inResponse);
            }
        });
    },
    offLine: function () {
        app.router.navigate('main', { trigger: true });
        app.offLine();
    },
    snsLogin: function (url, callback) {
        if (!url || _.isObject(url)) {
            callback();
            return;
        }
        var params = ciiat.Utils.getQueryParams(url);
        if (params) {
            this.loginWithParams(params, callback);
            return;
        }
        callback();
    }
});