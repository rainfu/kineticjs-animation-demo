exports.Treatment = Backbone.View.extend({
    initialize: function () {
        _.bindAll(this, 'render', 'initBgLayer', 'initForeLayer',
        'updateSpeed', 'updateScore', 'clear', 'changeGame', 'gameOver', 'updateScoreGroup');
        this.padding = 10;
        this.imgWidth = 64;
        this.paused = false;
    },
    initCanvas: function (width, height) {
        this.stage = new Kinetic.Stage({
            container: 'gameMain',
            width: width,
            height: height,
            draggable: false
        });
        this.bgLayer = new Kinetic.Layer();
        this.foreLayer = new Kinetic.Layer();
        this.stage.add(this.bgLayer);
        this.stage.add(this.foreLayer);
        this.initControlLayer();
        this.initScoreLayer();

    },
    setGame: function (game) {
        this.model = game;
        this.listenTo(this.model, 'change:speed', this.updateSpeed);
        this.listenTo(this.model, 'change:score', this.updateScore);
        this.listenTo(this.model, 'change:isFinished', this.changeGame);
        this.render();
        var self = this;
        this.remainTime = self.model.get('time');
        this.timeInterval = setInterval(function () {
            self.timeText.setText(self.remainTime);
            self.timeText.getLayer().draw();
            self.remainTime--;
            if (self.remainTime < 0) {
                self.gameOver();
            };
        }, 1000);
        this.scoreText.setText($L('Score') + ": " + this.model.get('score'));
        this.minTotalScoreText.setText($L('Total') + ': ' + (this.model.get('score') + app.settings.get('todayScore')));
        this.minTotalScoreText.getLayer().draw();
        this.applyImages();
    },
    applyImages: function () {
    },
    changeGame: function () {

    },
    updateScore: function () {
        var self = this;
        this.scoreText.setText($L('Score') + ': ' + this.model.get('score'));
        this.minTotalScoreText.setText($L('Total') + ': ' + (this.model.get('score') + app.settings.get('todayScore')));
        this.scoreLabel.setAttrs({
            x: this.model.get('mousex'),
            y: this.model.get('mousey'),
            fontSize: 30,
            text: "+" + this.model.get('winScore'),
            visible: true,
            opacity: 1
        });
        var tween = new Kinetic.Tween({
            node: this.scoreLabel,
            duration: 1,
            opacity: 0,
            easing: Kinetic.Easings.EaseOut,
            onFinish: function () {
                self.scoreLabel.setAttrs({
                    visible: false
                });
                if (self.foreView.checkGameOver()) {
                    if (self.model.get('speed') >= self.model.get('maxSpeed')) {
                        if (self.model.get('level') >= self.model.get('maxLevel')) {
                            self.model.set({
                                level: self.model.get('maxLevel'),
                                speed: 0
                            });
                        }
                        else {
                            self.model.set({
                                level: self.model.get('level') + 1,
                                speed: 0
                            });
                        }
                    }
                    else {
                        self.model.set({
                            speed: self.model.get('speed') + 1
                        });
                    }
                }
            }
        });
        tween.play();
    },
    updateSpeed: function () {
        //console.log('updateSpeed：' + this.model.get('speed'));
        if (this.foreView) {
            this.foreView.init();
        }
    },
    updateLevel: function () {
        //console.log('updateLevel：' + this.model.get('level'));
        if (this.bgView) {
            this.bgView.init();
        }
        if (this.foreView) {
            this.foreView.init();
        }
    },
    gameOver: function () {
        clearInterval(this.timeInterval);
        app.playAudio('victory');
        if (this.bgView) {
            this.bgView.stopAnimate();
            this.bgView.bgGroup.setOpacity(.1);
            this.bgView.bgGroup.getLayer().draw();
        }
        if (this.foreView) {
            this.foreView.stopAnimate();
            this.foreView.foreGroup.setOpacity(.3);
            this.foreView.foreGroup.setListening(false);
            this.foreView.foreGroup.getLayer().draw();
        }
        var self = this;
        self.controlLayer.setVisible(false);
        self.scoreGroup.setVisible(true);
        var tween = new Kinetic.Tween({
            node: self.scoreGroup,
            duration: 1,
            opacity: 1,
            easing: Kinetic.Easings.EaseIn,
            onFinish: function () {
                self.updateScoreGroup();
            }
        });
        tween.play();
    },
    updateScoreGroup: function () {
        //console.log('..updateScoreGroup ');
        this.baseScoreText.setText($L('Win score: ') + this.model.get('score'));
        this.awardScoreText.setText($L('Award score: ') + 0);
        this.totalScoreText.setText($L('Total score: ') + (this.model.get('score') + app.settings.get('todayScore')));
        this.scoreLayer.draw();
        var self = this;
        var awardScore = 50 + Math.floor(this.model.get('score') / 4);
        var tempTotalScore = 0;
        this.anim = new Kinetic.Animation(function (frame) {
            var tempScore = Math.floor(Math.random() * 5);
            tempTotalScore += tempScore;
            self.awardScoreText.setText($L('Award score: ') + tempTotalScore);
            self.totalScoreText.setText($L('Total score: ') + (tempTotalScore + (self.model.get('score') + app.settings.get('todayScore'))));
            if (tempTotalScore > awardScore) {
                self.anim.stop();
                self.backButton.setOpacity(1);
                app.settings.set({
                    todayScore: (app.settings.get('todayScore') + tempTotalScore + self.model.get('score'))
                });
                app.settings.set({
                    todayTime: (app.settings.get('todayTime') + self.model.get('time'))
                });
            }
        }, self.scoreLayer);
        this.anim.start();
    },
    initScoreLayer: function () {
        this.scoreLabel = new Kinetic.Text({
            text: "+100",
            width: 200,
            fill: "orange",
            x: 190,
            y: 15,
            opacity: 0
        });
        //scoregroup

        this.scoreRect = new Kinetic.Rect({
            fill: "#555",
            width: 400,
            height: 350,
            stroke: '#666',
            strokeWidth: 2,
            opacity: .8
        });

        this.scoreGroup = new Kinetic.Group({
            x: (this.stage.getWidth() - this.scoreRect.getWidth()) / 2,
            y: (this.stage.getHeight() - this.scoreRect.getHeight()) / 2,
            opacity: 0.01,
            visible: false
        });

        this.titleText = new Kinetic.Text({
            text: $L("Your Score"),
            width: this.scoreRect.getWidth(),
            x: 0,
            y: 30,
            fontSize: 28,
            align: 'center',
            fill: "white"
        });
        this.baseScoreText = this.titleText.clone({
            text: $L('Win score: '),
            x: 0,
            y: this.titleText.getY() + this.titleText.getTextHeight() + 50,
            fontSize: 20
        });
        this.awardScoreText = this.titleText.clone({
            text: $L('Award score: '),
            x: 0,
            y: this.baseScoreText.getY() + this.baseScoreText.getTextHeight() + 20,
            fontSize: 20
        });
        this.totalScoreText = this.titleText.clone({
            text: $L('Total score: '),
            x: 0,
            y: this.awardScoreText.getY() + this.awardScoreText.getTextHeight() + 20,
            fontSize: 20
        });
        var self = this;

        this.backButton = new Kinetic.Label({
            opacity: 0,
            x: this.scoreRect.getWidth() * 2 / 4,
            y: this.totalScoreText.getY() + this.totalScoreText.getTextHeight() + 50
        });

        // add a tag to the label
        this.backButton.add(new Kinetic.Tag({
            fill: "#eee",
            lineJoin: 'round',
            cornerRadius: 5
        }));

        // add text to the label
        this.backButton.add(new Kinetic.Text({
            text: $L("Back"),
            fontSize: 20,
            align: 'center',
            fill: "#666",
            padding: 15
        }));
        this.backButton.setX(this.scoreRect.getWidth() / 2 - 70);
        var self = this;
        this.backButton.on('click tap', function () {
            app.playAudio('sclick');
            var tween = new Kinetic.Tween({
                node: self.scoreGroup,
                duration: 1,
                opacity: 0,
                easing: Kinetic.Easings.EaseOut,
                onFinish: function () {
                    self.backButton.setOpacity(0);
                    self.controlLayer.setVisible(true);
                    self.scoreGroup.setVisible(false);
                    app.router.navigate('main/menu', { trigger: true });
                }
            });
            tween.play();

        });

        this.scoreGroup.add(this.scoreRect);
        this.scoreGroup.add(this.titleText);
        this.scoreGroup.add(this.baseScoreText);
        this.scoreGroup.add(this.awardScoreText);
        this.scoreGroup.add(this.totalScoreText);
        this.scoreGroup.add(this.backButton);
        this.scoreLayer = new Kinetic.Layer();
        this.scoreLayer.add(this.scoreLabel);
        this.scoreLayer.add(this.scoreGroup);
        this.stage.add(this.scoreLayer);
        this.scoreLayer.draw();
    },
    initControlLayer: function () {
        this.controlGroup = new Kinetic.Group();
        this.controlPanelGroup = new Kinetic.Group(
        {
            x: this.stage.getWidth() - 175,
            y: 30,
            opacity: .5
        });
        var self = this;
        this.controlPanelGrab = new Kinetic.Wedge({
            x: 25,
            y: 45,
            angleDeg: 180,
            rotationDeg: 90,
            radius: 25,
            stroke: 'white',
            strokeWidth: 1,
            fill: 'lightgreen'
        });
        this.controlPanelGrab.on('click tap', function () {
            app.playAudio('click');
            if (self.controlPanelGroup.getX() == self.stage.getWidth() - 25) {
                var tween = new Kinetic.Tween({
                    node: self.controlPanelGroup,
                    x: self.stage.getWidth() - 175,
                    duration: 1,
                    easing: Kinetic.Easings.EaseOut
                });
                tween.play();
            }
            else {
                var tween = new Kinetic.Tween({
                    node: self.controlPanelGroup,
                    x: self.stage.getWidth() - 25,
                    duration: 1,
                    easing: Kinetic.Easings.EaseIn
                });
                tween.play();
            }
        });

        this.controlPanel = new Kinetic.Rect({
            x: 25,
            y: 0,
            height: 260,
            width: 150,
            fill: 'lightgreen',
            stroke: 'white',
            strokeWidth: 1,
            cornerRadius: 3
        });
        this.timeText = new Kinetic.Text({
            x: 50,
            y: 30,
            fontSize: 40,
            align: 'center',
            fill: 'white',
            text: "0"
        });
        this.minTotalScoreText = this.timeText.clone({
            x: 50,
            fontSize: 20,
            y: this.timeText.getY() + this.timeText.getHeight() + 20,
            text: $L('Total')
        });
        this.scoreText = this.timeText.clone({
            x: 50,
            fontSize: 20,
            y: this.minTotalScoreText.getY() + this.minTotalScoreText.getHeight() + 20,
            text: $L('Score')
        });

        this.desText = this.timeText.clone({
            x: 50,
            fontSize: 14,
            y: this.scoreText.getY() + 50,
            text: $L('Click the smallest')
        });

        this.des2Text = this.timeText.clone({
            x: 50,
            fontSize: 14,
            y: this.desText.getY() + 20,
            text: $L('digital to start!')
        });

        this.controlPanelGroup.add(this.controlPanel);
        this.controlPanelGroup.add(this.controlPanelGrab);
        this.controlPanelGroup.add(this.scoreText);
        this.controlPanelGroup.add(this.minTotalScoreText);
        this.controlPanelGroup.add(this.timeText);
         this.controlPanelGroup.add(this.desText);
          this.controlPanelGroup.add(this.des2Text);
        this.controlGroup.add(this.controlPanelGroup);

        this.controlLayer = new Kinetic.Layer();
        this.controlLayer.add(this.controlGroup);
        this.stage.add(this.controlLayer);
        this.controlLayer.draw();
    },
    initBgLayer: function () {
        // console.log('Mainview..initBgLayer');
        if (this.bgView) {
            this.bgView.bgGroup.destroy();
            this.bgView = null;
        }
        var bgType = "none";
        if (this.model.get('bgType') == 'none') {
            bgType == "none";
        }
        else if (this.model.get('bgType') == 'random') {
            var bgTypes = ['circle', 'grid', 'grating'];
            bgType = (_.shuffle(bgTypes))[0];
        }
        else {
            bgType = this.model.get('bgType');
        };
        if (app.settings.get('debug')) {
            bgType = 'circle';
        }
        switch (bgType) {
            case "circle":
                var m_View = require('/views/main/bb/bg/CircleBg');
                this.bgView = new m_View.CircleBg({ model: this.model });
                break;
            case "grid":
                var m_View = require('/views/main/bb/bg/GridBg');
                this.bgView = new m_View.GridBg({ model: this.model });
                break;
            case "grating":
                var m_View = require('/views/main/bb/bg/GratingBg');
                this.bgView = new m_View.GratingBg({ model: this.model });
                break;
            case "image":
                var m_View = require('/views/main/bb/bg/ImageBg');
                this.bgView = new m_View.ImageBg({ model: this.model });
                break;
            default:
                this.bgView = null;
                break;
        }
        if (this.bgView) {
            this.bgLayer.add(this.bgView.bgGroup);
            this.bgView.init();
        }
    },
    initForeLayer: function () {
        // console.log('Mainview..initForeLayer');
        if (this.foreView) {
            this.foreView.foreGroup.destroy();
            this.foreView = null;
        }
        switch (this.model.get('id')) {
            case "findLetter":
                var m_View = require('/views/main/bb/games/FindLetter');
                this.foreView = new m_View.FindLetter({ model: this.model });
                break;
            case "drawWord":
                var m_View = require('/views/main/bb/games/DrawWord');
                this.foreView = new m_View.DrawWord({ model: this.model });
                break;
            case "drawLine":
                var m_View = require('/views/main/bb/games/DrawLine');
                this.foreView = new m_View.DrawLine({ model: this.model });
                break;
            case "drawGraph":
                var m_View = require('/views/main/bb/games/DrawGraph');
                this.foreView = new m_View.DrawGraph({ model: this.model });
                break;
            case "hitMonster":
                var m_View = require('/views/main/bb/games/HitMonster');
                this.foreView = new m_View.HitMonster({ model: this.model });
                break;
            case "rotationDigital":
                var m_View = require('/views/main/bb/games/RotationDigital');
                this.foreView = new m_View.RotationDigital({ model: this.model });
                break;
            case "findFruit":
                var m_View = require('/views/main/bb/games/FindFruit');
                this.foreView = new m_View.FindFruit({ model: this.model });
                break;
            case "animalStickers":
                var m_View = require('/views/main/bb/games/AnimalStickers');
                this.foreView = new m_View.AnimalStickers({ model: this.model });
                break;
            case "hitMonster":
                var m_View = require('/views/main/bb/games/HitMonster');
                this.foreView = new m_View.HitMonster({ model: this.model });
                break;
            case "fillDigital":
                var m_View = require('/views/main/bb/games/FillDigital');
                this.foreView = new m_View.FillDigital({ model: this.model });
                break;
            case "crazyBallon":
                var m_View = require('/views/main/bb/games/CrazyBallon');
                this.foreView = new m_View.CrazyBallon({ model: this.model });
                break;
            case "catMouse":
                var m_View = require('/views/main/bb/games/CatMouse');
                this.foreView = new m_View.CatMouse({ model: this.model });
                break;
            default:
                break;
        };
        if (this.foreView) {
            this.foreLayer.add(this.foreView.foreGroup);
            this.foreView.init();
        }
    },
    clear: function () {
        if (this.bgView) {
            this.bgView.clear();
        };
        if (this.foreView) {
            this.foreView.clear();
        };
    },
    render: function () {
        // console.log(this.model.get('id') + ' render');
        this.initBgLayer();
        this.initForeLayer();
    },
    pauseGame: function () {
        this.paused = !this.paused;
        if (this.paused) {
            this.bgView.stopAnimate();
            this.bgView.bgGroup.setOpacity(.1);
            this.bgView.bgGroup.getLayer().draw();
        }
        else {
            this.bgView.bgGroup.setOpacity(1);
            this.bgView.bgGroup.getLayer().draw();
            this.bgView.startAnimate();
        }
        if (this.paused) {
            clearInterval(this.timeInterval);
            if (this.foreView) {
                this.foreView.stopAnimate();
                this.foreView.bgGroup.setOpacity(.3);
                this.foreView.bgGroup.setListening(false);
                this.foreView.bgGroup.getLayer().draw();
            }
        }
        else {
            if (this.foreView) {
                this.foreView.bgGroup.setOpacity(1);
                this.foreView.bgGroup.setListening(true);
                this.foreView.bgGroup.getLayer().draw();
                this.foreView.animate();
            }
            var self = this;
            this.timeInterval = setInterval(function () {
                self.timeText.setText($('Time') + ": " + self.remainTime);
                self.timeText.getLayer().draw();
                self.remainTime--;
                if (self.remainTime < 0) {
                    self.gameOver();
                };
            }, 1000);
        }
    }
});
