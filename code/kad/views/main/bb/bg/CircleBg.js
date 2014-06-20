exports.CircleBg = Backbone.View.extend({
    initialize: function () {
        _.bindAll(this, 'render', 'startAnimate', 'stopAnimate', 'animateLoop', 'clear', 'changeSpeed', 'init', 'getTotalNum', 'getBgSubType'
         );
        this.bgGroup = new Kinetic.Group();
        //控制相关
        this.longWidth = 300;
        this.period = 10000;
        this.usedTime = 0;
        this.timeDiff = 80;
    },
    changeSpeed: function () {
        this.period = Math.max(1000 * (10 - 2 * this.model.get('speed')), 2000);
        if (this.bgGroup.getStage())
            this.init();
    },
    init: function () {
        this.longWidth = Math.max(this.bgGroup.getStage().width(), this.bgGroup.getStage().height());
        this.listenTo(this.model, 'change:speed', this.changeSpeed);
        this.bgSubType = this.getBgSubType();
        //console.log('init bg..' + this.bgSubType);
        this.bgGroup.setX(this.bgGroup.getStage().width() / 2);
        this.bgGroup.setY(this.bgGroup.getStage().height() / 2);
        var totalNum = this.getTotalNum(this.model.get('level'));
        if (this.bgSubType == 'onewedge') {
            totalNum = 1;
        }
        var radius = maxRadius = this.bgGroup.getStage().width() * 0.6;
        this.maxRadius = radius;
        this.totalNum = totalNum;
        // 获得样式
        this.colorTheme = app.$.gameView.getColorTheme(this.model.get('colorTheme'));
        var angleDeg = 60;
        //添加
        this.bgGroup.destroyChildren();
        this.nodes = [];
        for (var i = 0; i < totalNum; i++) {
            switch (this.bgSubType) {
                case "circle":
                    var node = new Kinetic.Circle({
                        x: 0,
                        y: 0,
                        radius: this.maxRadius * (totalNum - i) / (totalNum),
                        fill: i % 2 == 0 ? this.colorTheme.get('color1') : this.colorTheme.get('color2'),
                        stroke: i % 2 == 0 ? this.colorTheme.get('color1') : this.colorTheme.get('color2'),
                        strokeWidth: this.colorTheme.get('borderWidth'),
                        offsetX: 0,
                        offsetY: 0,
                        scaleX: 1,
                        scaleY: 1,
                        opacity: 1
                    });
                    break;
                case "wedge":
                    angleDeg = 360 / totalNum;
                    var node = new Kinetic.Wedge({
                        x: 0,
                        y: 0,
                        radius: radius,
                        fill: i % 2 == 0 ? this.colorTheme.get('color1') : this.colorTheme.get('color2'),
                        stroke: i % 2 == 0 ? this.colorTheme.get('color1') : this.colorTheme.get('color2'),
                        strokeWidth: this.colorTheme.get('borderWidth'),
                        offsetX: 0,
                        offsetY: 0,
                        angleDeg: angleDeg,
                        rotationDeg: angleDeg * i,
                        scaleX: 1,
                        scaleY: 1,
                        opacity: 1
                    });
                    break;
                case "onewedge":
                    var node = new Kinetic.Wedge({
                        x: 0,
                        y: 0,
                        radius: radius,
                        fill: i % 2 == 0 ? this.colorTheme.get('color1') : this.colorTheme.get('color2'),
                        stroke: i % 2 == 0 ? this.colorTheme.get('color1') : this.colorTheme.get('color2'),
                        strokeWidth: this.colorTheme.get('borderWidth'),
                        offsetX: 0,
                        offsetY: 0,
                        angleDeg: angleDeg,
                        rotationDeg: angleDeg * i,
                        scaleX: 1,
                        scaleY: 1,
                        opacity: 1
                    });
                    break;
                case "color":
                    var node = new Kinetic.Wedge({
                        x: 0,
                        y: 0,
                        radius: radius,
                        fill: i % 2 == 0 ? this.colorTheme.get('color1') : this.colorTheme.get('color2'),
                        stroke: i % 2 == 0 ? this.colorTheme.get('color1') : this.colorTheme.get('color2'),
                        strokeWidth: this.colorTheme.get('borderWidth'),
                        offsetX: 0,
                        offsetY: 0,
                        angleDeg: angleDeg,
                        rotationDeg: angleDeg * i,
                        scaleX: 1,
                        scaleY: 1,
                        opacity: 1
                    });
                    break;
            }
            this.nodes.push(node);
            this.bgGroup.add(node);
        };
        this.bgGroup.getLayer().draw();
        this.startAnimate();
    },
    startAnimate: function () {
        var self = this;
        self.stopAnimate();
        self.usedTime = 0;
        try{
            if (app.settings.get('anim') == 'animation') {
                this.anim = new Kinetic.Animation(function (frame) {
                    self.usedTime += self.timeDiff;
                    if (self.usedTime > self.period) {
                        self.usedTime = 0;
                    }
                    self.animateLoop();
                }, self.bgGroup.getLayer());
                this.anim.start();
            }
            else {
                if (!self.isMainLoopRunning) {
                    self.isMainLoopRunning = true;
                    self.animInterval = setInterval(function () {
                        self.usedTime += self.timeDiff;
                        if (self.usedTime > self.period) {
                            self.usedTime = 0;
                        }
                        self.animateLoop();
                         if (self.bgGroup&&self.bgGroup.getLayer())
                            self.bgGroup.getLayer().batchDraw();
                    }, self.timeDiff);
                }
            }
        }catch(e){
            console.log('animat wrong');
            self.stopAnimate();
        }
    },
    animateLoop: function () {
        var self = this;
        if (self.bgGroup.getStage()) {
            if (self.bgSubType == 'wedge') {
                var rotationDeg = 360 * self.usedTime / self.period;
                _.each(self.nodes, function (node) {
                    node.setAttrs({
                        rotationDeg: node.getRotationDeg() + rotationDeg
                    });
                });

            }
            else if (self.bgSubType == 'circle') {
                var scale = 1 + self.usedTime / self.period;
                _.each(self.nodes, function (node) {
                    node.setAttrs({
                        scaleX: scale,
                        scaleY: scale
                    });
                });
            }
            else if (self.bgSubType == 'onewedge') {
                var rotationDeg = 360 * self.usedTime / self.period;
                _.each(self.nodes, function (node) {
                    node.setAttrs({
                        rotationDeg: rotationDeg,
                        opacity: 0.4 + 0.6 * Math.random()
                    });
                });
            }
            else if (self.bgSubType == 'color') {
                if (self.usedTime / self.period > 0.05) {
                    self.usedTime = 0;
                    _.each(self.nodes, function (node) {
                        var color = self.colorTheme.get('color2');
                        if (node.getFill() == self.colorTheme.get('color2')) {
                            color = self.colorTheme.get('color1');
                        }
                        node.setAttrs({
                            fill: color
                        });
                    });

                }
            }
        }
    },
    stopAnimate: function () {
        if (app.settings.get('anim') == 'animation') {
            if (this.anim && this.anim.isRunning()) {
                this.anim.stop();
                this.anim = null;
            };
        }
        else {
            clearInterval(this.animInterval);
            this.isMainLoopRunning = false;
        }
        this.off(this.model, 'change:speed', this.changeSpeed);
    },
    clear: function () {
        this.stopAnimate();

    },
    render: function () {
        //console.log("FindNumberView render ");
    },
    getTotalNum: function (level) {
        return 5+level * 2;
    },
    getBgSubType: function () {
        var bgSubType = this.model.get('bgSubType');
        // console.log('bgSubType..' + bgSubType);
        if (bgSubType == 'random') {
            var types = ['circle', 'wedge', 'onewedge', 'color'];
            bgSubType = (_.shuffle(types))[0];
        }
        return bgSubType;
    }
});
