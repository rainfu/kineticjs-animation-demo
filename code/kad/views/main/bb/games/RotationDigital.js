var NumberModel = Backbone.Model.extend({
    defaults: function() {
      return {
        name: "0",
        posid:0
      };
   }
});
var NumberCollection = Backbone.Collection.extend({
    model: NumberModel
});

var NumberView = Backbone.View.extend({
    initialize: function () {
        _.bindAll(this, 'render');
        this.numberShape = new Kinetic.Group();
        this.numberPolygon = new Kinetic.RegularPolygon();
        this.numberText = new Kinetic.Text({
            text: '0',
            fontSize: 50,
            fontFamily: 'Calibri',
            fill: 'red'
        });
        this.numberShape.add(this.numberPolygon);
        this.numberShape.add(this.numberText);
        var self = this;
        this.listenTo(this.model, 'change', this.change);
    },
    render: function () {
        this.numberPolygon.setSides(this.model.get('sides'));
        this.numberPolygon.setRadius(this.model.get('radius'));
        this.numberPolygon.setFill(this.model.get('fill'));
        this.numberPolygon.setStroke(this.model.get('stroke'));
        this.numberPolygon.setStrokeWidth(this.model.get('strokeWidth'));

        this.numberText.setFill(this.model.get('stroke'));
        if (this.model.get('isAnswered')) {
            this.numberText.setText("");
        }
        else {
            this.numberText.setText(this.model.get('name'));
        }

        this.numberShape.setX(this.model.get('x'));
        this.numberShape.setY(this.model.get('y'));
        this.numberShape.setOffset({
            x: -this.model.get('offsetx'),
            y: -this.model.get('offsety')
        });
        this.numberPolygon.setOpacity(this.model.get('opacity'));
        this.numberShape.setRotation(this.model.get('arc') );
        this.numberPolygon.setRotation(-this.model.get('arc'));

        this.numberText.setOffset({
            x: this.numberText.getTextWidth() / 2,
            y: this.numberText.getTextHeight() / 2
        });
        this.numberText.setRotation(-this.model.get('arc'));
        
    },
    change: function () {
        this.render();
        this.numberShape.getLayer().draw();
    }
});
exports.RotationDigital = Backbone.View.extend({
    initialize: function () {
        _.bindAll(this, 'render', 'addOne', 'addAll',
             'init', 'animate', 'clear', "stopAnimate",
            'getTotalNum', 'caculateScore', 'checkGameOver', 'action'
         );
        this.numberCollection = new NumberCollection();
        this.listenTo(this.numberCollection, 'add', this.addOne);
        this.listenTo(this.numberCollection, 'reset', this.addAll);
        this.listenTo(this.numberCollection, 'all', this.render);

        //当前答案
        this.currentAnswer = 1;

        this.foreGroup = new Kinetic.Group();
        this.numberGroup = new Kinetic.Group();
        this.foreGroup.add(this.numberGroup);

        //控制相关
        this.maxRadius = 300;
    },
   
    init: function () {

        this.maxRadius = Math.min(this.foreGroup.getStage().getWidth(), this.foreGroup.getStage().getHeight()) / 2;
        this.totalNum = this.getTotalNum(this.model.get('level'));



        this.foreGroup.setX(this.foreGroup.getStage().getWidth() / 2);
        this.foreGroup.setY(this.foreGroup.getStage().getHeight() / 2);
        this.foreGroup.setOffset([this.maxRadius, this.maxRadius]);
        this.foreGroup.setRotation(0);
        this.numberGroup.setOffset([-this.maxRadius, -this.maxRadius]);


        // 获得样式
        this.colorTheme = app.$.gameView.getColorTheme(this.model.get('colorTheme'));

        //获得数组
        var numberArray = new Array();
        for (var i = 1; i <= this.totalNum; i++) {
            numberArray.push(i);
        }
        //打乱数字顺序
        var shuffleArray = _.shuffle(numberArray);

        //图形半径
        var radius = this.maxRadius * 2 / ((2 * this.model.get('level') + 1) * Math.sqrt(3));

        //添加其它图形
        var numbers = [];
        for (var i = 0; i < this.totalNum; i++) {
            var number = new NumberModel();
            var offsetx = 0;
            var offsety = 0;
            var arc = 0;
            if (i < 6) {
                arc = 60 * i;
                offsetx = -Math.sqrt(3) / 2 * radius;
                offsety = -1.5 * radius;
            }
            else if (i < 18) {
                arc = 30 * i;
                offsetx = -Math.sqrt(3) * radius;
                offsety = -3 * radius;

            }
            else if (i < 36) {
                arc = 20 * i;
                offsetx = -1.5 * Math.sqrt(3) * radius;
                offsety = -4.5 * radius;
            }
            else if (i < 60) {
                arc = 15 * i;
                offsetx = -2 * Math.sqrt(3) * radius;
                offsety = -6 * radius;
            }
            else if (i < 90) {
                arc = 12 * i;
                offsetx = -2.5 * Math.sqrt(3) * radius;
                offsety = -7.5 * radius;
            }
            number.set({
                //name: (1+i),
                name: shuffleArray[i],
                isAnswered: false,
                posid: i,
                sides: 6,
                radius: radius,
                offsetx: offsetx,
                offsety: offsety,
                fill: i % 2 == 0 ? this.colorTheme.get('color1') : this.colorTheme.get('color2'),
                stroke: this.colorTheme.get('borderColor'),
                strokeWidth: this.colorTheme.get('borderWidth'),
                fontSize: 30,
                arc: arc,
                opacity: 0.4 + Math.random() * 0.4
            });
            //console.log('number..' + JSON.stringify(number));
            numbers.push(number);

        };
        this.numberCollection.reset(numbers);
    },
    animate: function () {
        this.stopAnimate();
        if (this.model.get('speed') > 0) {
            var angularSpeed = 30;
            if (this.model.get('speed') == 1) {
                angularSpeed = 30;
            }
            else if (this.model.get('speed') == 2) {
                angularSpeed = 45;
            }
            else if (this.model.get('speed') == 3) {
                angularSpeed = 60;
            }
            else if (this.model.get('speed') == 4) {
                angularSpeed = 90;
            }
            else if (this.model.get('speed') == 5) {
                angularSpeed = 180;
            }
            var self = this;
            this.anim = new Kinetic.Animation(function (frame) {
                var angleDiff = frame.timeDiff * angularSpeed / 1000;
                self.foreGroup.rotate(angleDiff);
            }, self.foreGroup.getLayer());
            this.anim.start();
        }

    },
    render: function () {
        //console.log("FindNumberView render ");
    },
    addOne: function (number) {
        var view = new NumberView({ model: number });
        this.numberGroup.add(view.numberShape);
        view.render();
        var self = this;
        view.numberShape.on("click tap", function (evt) {
            self.action(evt, number);
        });
    },
    addAll: function () {
        this.numberGroup.destroyChildren();
        this.numberCollection.each(this.addOne);
        this.foreGroup.getLayer().draw();
        this.animate();
    },
    action: function (evt, model) {
        if (!model.get('isAnswered')) {
            if (model.get('name') == this.currentAnswer) {
                model.set({ isAnswered: true });
                this.currentAnswer++;
                app.playAudio('success');
                this.caculateScore(evt);
            }
            else {
                app.playAudio('wrong');
            }
        }
    },
    checkGameOver: function () {
        //是否已经完成
        var unfinisheds = this.numberCollection.where({ isAnswered: false });
        if (unfinisheds.length == 0) {
            this.currentAnswer = 1;
            return true
        }
        return false;
    },
    getTotalNum: function (level) {
        switch (level) {
            case 1:
                totalNum = 6;
                break;
            case 2:
                totalNum = 18;
                break;
            case 3:
                totalNum = 36;
                break;
            case 4:
                totalNum = 60;
                break;
            case 5:
                totalNum = 90;
                break;
            default:
                totalNum = 6;
                break;

        }
        return totalNum;
    },
    clear: function () {
        this.stopAnimate();
    },
    stopAnimate: function () {
        if (this.anim && this.anim.isRunning()) {
            this.anim.stop();
            this.anim = null;
        };
    },
    caculateScore: function (evt) {
        var winScore = 5 * this.model.get('level');
        var mousePos = this.foreGroup.getStage().getPointerPosition();
        this.model.set({
            mousex: mousePos.x,
            mousey: mousePos.y - 20,
            winScore: winScore,
            score: this.model.get('score') + winScore
        });
    }
});
