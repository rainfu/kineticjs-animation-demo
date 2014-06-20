exports.GratingBg = Backbone.View.extend({
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

        var totalNum = this.getTotalNum(this.model.get('level'));
        var rectWidth = this.bgGroup.getStage().width() / totalNum;
        var rectHeight = this.bgGroup.getStage().height() * 3;
        // 获得样式
        this.bgSubType = this.getBgSubType();
        this.colorTheme = app.$.gameView.getColorTheme(this.model.get('colorTheme'));
        var rotationDeg = 45 * Math.random();
        //添加
        this.bgGroup.destroyChildren();
        this.nodes = [];
        for (var i = 0; i < 3 * totalNum; i++) {
            var node = new Kinetic.Rect({
                x: i * rectWidth,
                y: -this.bgGroup.getStage().height(),
                width: rectWidth,
                height: rectHeight,
                fill: i % 2 == 0 ? this.colorTheme.get('color1') : this.colorTheme.get('color2'),
                stroke: this.colorTheme.get('borderColor'),
                strokeWidth: this.colorTheme.get('borderWidth'),
                rotationDeg: rotationDeg,
                offsetX: 0,
                offsetY: 0,
                scaleX: 1,
                scaleY: 1,
                opacity: 1
            });
            this.nodes.push(node);
            this.bgGroup.add(node);
        };
        this.bgGroup.setX(-this.longWidth);
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
            if (self.bgSubType == 'move') {
                var move = self.bgGroup.getStage().getWidth() * self.usedTime / self.period;
                //var move = self.bgGroup.getStage().getWidth()*Math.sin(frame.time * 2 * Math.PI / period);
                self.bgGroup.setX(-self.longWidth + move);
                _.each(self.nodes, function (node) {
                    node.setAttrs({
                        opacity: Math.random()
                    });
                });
            }
            else if (self.bgSubType == 'rotate') {
                var rotationDeg = 360 * self.usedTime / self.period;
                _.each(self.nodes, function (node) {
                    node.setAttrs({
                        offsetX: node.width() / 2,
                        offsetY: node.height() / 2,
                        rotationDeg: rotationDeg,
                        opacity: Math.random()
                    });
                });
            }
            else if (self.bgSubType == 'scale') {
                var scale = Math.sin(self.usedTime * 2 * Math.PI / self.period) + 0.001;
                _.each(self.nodes, function (node) {
                    node.setAttrs({
                        scaleX: scale,
                        scaleY: 1,
                        opacity: Math.random()
                    });
                });
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
            var types = ['move', 'scale'];
            bgSubType = (_.shuffle(types))[0];
        }

        return bgSubType;
    }
});
