enyo.kind({
    name: "ciiat.Utils",
    statics: {
        subString: function (str, len, hasDot) {
            var newLength = 0;
            var newStr = "";
            var chineseRegex = /[^\x00-\xff]/g;
            var singleChar = "";
            var strLength = str.replace(chineseRegex, "**").length;
            for (var i = 0; i < strLength; i++) {
                singleChar = str.charAt(i).toString();
                if (singleChar.match(chineseRegex) != null) {
                    newLength += 2;
                }
                else {
                    newLength++;
                }
                if (newLength > len) {
                    break;
                }
                newStr += singleChar;
            }

            if (hasDot && strLength > len) {
                newStr += "...";
            }
            return newStr;
        },
        formatTime: function (time) {

            // Get now
            var now = Date.parse(new Date());
            // Time measurement: seconds
            var secondsDifferent = Math.floor((now - time) / 1000);
            if (secondsDifferent < 60) {
                if (secondsDifferent < 0)
                    secondsDifferent = 1;
                return secondsDifferent + " 秒前";
            }

            // Time measurement: Minutes
            var minutesDifferent = Math.floor(secondsDifferent / 60);
            if (minutesDifferent < 60) {
                return minutesDifferent + " 分钟前";
            }

            // Time measurement: Hours
            var hoursDifferent = Math.floor(minutesDifferent / 60);
            if (hoursDifferent < 24) {
                return hoursDifferent + " 小时前";
            }

            // Time measurement: Days
            var daysDifferent = Math.floor(hoursDifferent / 24);
            return daysDifferent + " 天前";
        },

        formatDate: function (time) {
            var timestamp = time * 1000;
            date = new Date(timestamp * 1000);
            datevalues = [
         date.getFullYear()
        , date.getMonth() + 1
        , date.getDate()
        , date.getHours()
        , date.getMinutes()
        , date.getSeconds()
   ];
            return (datevalues[0] + "-" + datevalues[1] + "-" + datevalues[2]);
        },
        formatDay: function (time) {
            var time2 = new Date().getTime();
            var d = new Date(time);
            var curr_date = d.getDate();
            var curr_month = d.getMonth() + 1; //Months are zero based
            var curr_year = d.getFullYear();
            return (curr_year + "-" + curr_month + "-" + curr_date)
        },
        formatSmallDate: function (time) {
            var d = new Date(time);
            var curr_date = d.getDate();
            var curr_month = d.getMonth() + 1; //Months are zero based
            return (curr_month + "-" + curr_date)
        },
        getQueryParams: function (url) {
            if (!url) return;
            var params = {};
            if (url.indexOf('#') >= 0) {
                paramsStr = url.split('#')[1];
                var parts = paramsStr.split('&');
                for (var i = 0; i < parts.length; i++) {
                    var nv = parts[i].split('=');
                    if (!nv[0]) continue;
                    params[nv[0]] = nv[1] || true;
                }
            }
            return params;

        },
        getQueryPaths: function (url) {
            if (!url) return;
            var paths = [];
            if (url.indexOf('#') >= 0) {
                paramsStr = url.split('#')[1];
                var parts = paramsStr.split('/');
                var sub = "";
                for (var i = 0; i < parts.length; i++) {
                    if (parts[i]) {
                        paths[i] = sub + parts[i];
                        sub = paths[i] + "/";
                    }
                }
            }
            else {
                var path = window.location.pathname.substring(1);
                if (path) {
                    paths[0] = path;
                }
            }
            return paths;
        },
        toQueryString: function (obj) {
            var k = Object.keys(obj);
            var s = "";
            for (var i = 0; i < k.length; i++) {
                s += k[i] + "=" + encodeURIComponent(obj[k[i]]);
                if (i != k.length - 1) s += "&";
            }
            return s;
        },
        toHtml: function (str) {
            if (!str) return "";
            return str.replace(/\r?\n/g, '<br/>');

        },
        centerScreen: function (element) {
            var top = ($(window).height() - element.outerHeight()) / 2;
            var left = ($(window).width() - element.outerWidth()) / 2;
            $('#load-screen').css({ top: top, left: left });
        },
        loadImage: function (url, callback) {
            if (!url) {
                if (callback)
                    callback(false, '');
                return;
            }
            var ajax = new enyo.Ajax({
                cacheBust: false,
                url: url,
                handleAs: "text",
                contentType: "text/plain",
                method: "GET"
            });
            ajax.go();
            var self = this;
            ajax.response(this, function (inSender, inResponse) {
                if (callback)
                    callback(true, inResponse);
            });
            ajax.error(this, function (inSender, inResponse) {
                enyo.log('loadImage error.' + inResponse);
                if (callback)
                    callback(false, inResponse);
            });
        },
        openUrl: function (url, target, location) {
            if (!target) target = "_blank";
            if (!location) location = "yes";
            if (window.cordova || window.PhoneGap) {
                if (device.platform == 'windows8') {
                    var ref = window.open(url, '_system', 'location=' + location);
                }
                else {
                    var ref = window.open(url, '_blank', 'location=' + location);
                }
            }
            else if (window.client && window.client == 'clientapp') {
                winObj.callNavigate(url);
            }
            else {
                window.open(url, target);
            }
        },
        playAudio: function (dom, webSrc, mobSrc) {
            if (app.settings.get('messageSound')) {
                if (window.cordova || window.PhoneGap) {
                    if (enyo.platform.android) {
                        src = mobSrc;
                    }
                    else {
                        src = webSrc;
                    }
                    var my_media = new Media(src, function () {
                    }, function (error) {
                    });
                    my_media.play();
                    return my_media;
                }
                else {
                    if (window.client && window.client == 'clientapp') {
                        webSrc=webSrc.replace('.mp3', '.wav');
                    }
                    if (!dom.getSrc()) {
                        dom.setSrc(webSrc);
                    }
                    dom.play();
                }
            }
        },
        stopAudio: function (dom, webSrc, mobSrc) {
            if (app.settings.get('messageSound')) {
                if (window.cordova || window.PhoneGap) {
                    if (app.bgMedia)
                        app.bgMedia.stop();
                }
                else {
                    if (window.client && window.client == 'clientapp') {
                        webSrc=webSrc.replace('.mp3', '.wav');
                    }
                    if (!dom.getSrc()) {
                        dom.setSrc(webSrc);
                    }
                    dom.pause();
                }
            }
        },
        isEmail: function (strEmail) {
            if (strEmail.search(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/) != -1)
                return true;
            else
                return false;
        }
    }
});


