

cc.Class({
    extends: cc.Component,

    properties: {
        BaoHuIcon: {
            default: null,
            type: cc.Prefab
        },
        BaoHu: {
            default: null,
            type: cc.Prefab
        },
        icon: {
            default: null,
            type: cc.Prefab
        },
        daodan1: {
            default: null,
            type: cc.Prefab
        },
        daodan2: {
            default: null,
            type: cc.Prefab
        },
        daodan3: {
            default: null,
            type: cc.Prefab
        },
        tishi1: {
            default: null,
            type: cc.Prefab
        },
        tishi2: {
            default: null,
            type: cc.Prefab
        },
        tishi3: {
            default: null,
            type: cc.Prefab
        },
        yan: {
            default: null,
            type: cc.Prefab
        },
        yun1: {
            default: null,
            type: cc.Prefab
        },
        yun2: {
            default: null,
            type: cc.Prefab
        },
        yun3: {
            default: null,
            type: cc.Prefab
        },
        yun4: {
            default: null,
            type: cc.Prefab
        },
        baoza: {
            default: null,
            type: cc.Prefab
        },
        audio_explosion: {
            url: cc.AudioClip,
            default: null
        },
        audio_getstar: {
            url: cc.AudioClip,
            default: null
        },
        audio_music2: {
            url: cc.AudioClip,
            default: null
        },
        display: cc.Sprite,
        display_gray: cc.Node,
        display_gray_rank: cc.Node,
        display_bg: cc.Node
    },


    onLoad: function()
    {
        this.dsize = cc.view.getDesignResolutionSize();
        this.tex = new cc.Texture2D();
        this.subdt = 0;
        this.userInfo = {};
        this.uploadScoreDt = 0;
        this.openover = false;

        this.initData();
        this.initUI();
        this.addListener();
        this.adapt();


        this.wxGetUserInfo();
        this.wxOpenQuan();
        cc.audioEngine.play(this.audio_music2, true, 1);
    },

    wxGetUserInfo: function()
    {
        var self = this;
        wx.login({
            success: function () {
                wx.getUserInfo({
                    openIdList:['selfOpenId'],
                    lang: 'zh_CN',
                    fail: function (res) {
                        // iOS 和 Android 对于拒绝授权的回调 errMsg 没有统一，需要做一下兼容处理
                        if (res.errMsg.indexOf('auth deny') > -1 ||     res.errMsg.indexOf('auth denied') > -1 ) {
                            // 处理用户拒绝授权的情况
                            cc.log(res.errMsg);
                            self.wxOpenSetting();
                        }
                    },
                    success: function(res)
                    {
                        cc.log(res.userInfo);
                        self.userInfo = res.userInfo;

                        wx.postMessage({ message: "loginSuccess",userInfo:res.userInfo });
                    }
                });
            }
        });

        wx.showShareMenu({
            withShareTicket: true,
            success: function (res) {
                // 分享成功
                cc.log(res);
            },
            fail: function (res) {
                // 分享失败
            }
        });

        wx.onShareAppMessage(function (ops){
            return {
                title: "小哥哥，打灰机吗",
                imageUrl: cc.url.raw("resources/zhuanfa.jpg")
            }
        });


    },

    wxOpenSetting: function()
    {
        var self = this;
        self.node_quanxian.active = true;
        var openDataContext = wx.getOpenDataContext();
        var sharedCanvas = openDataContext.canvas;
        var button = wx.createOpenSettingButton({
            type: 'text',
            text: '打开设置页面',
            style: {
                left: sharedCanvas.width/4-50,
                top: sharedCanvas.height/4+30,
                width: 100,
                height: 30,
                lineHeight: 30,
                backgroundColor: '#1779a6',
                color: '#ffffff',
                textAlign: 'center',
                fontSize: 12,
                borderRadius: 4
            }
        });
        button.onTap(function(){
            wx.getSetting({
                success: function (res) {
                    var authSetting = res.authSetting;
                    button.destroy();
                    self.node_quanxian.active = false;
                    if (authSetting['scope.userInfo'] === true) {
                        wx.getUserInfo({
                            openIdList:['selfOpenId'],
                            lang: 'zh_CN',
                            fail: function (res) {
                                // iOS 和 Android 对于拒绝授权的回调 errMsg 没有统一，需要做一下兼容处理
                                if (res.errMsg.indexOf('auth deny') > -1 ||     res.errMsg.indexOf('auth denied') > -1 ) {
                                    // 处理用户拒绝授权的情况
                                    cc.log(res.errMsg);
                                    self.wxOpenSetting();
                                }

                            },
                            success: function(res)
                            {
                                cc.log(res.userInfo);
                                self.userInfo = res.userInfo;
                                wx.postMessage({ message: "loginSuccess",userInfo:res.userInfo });
                            }
                        });
                    } else if (authSetting['scope.userInfo'] === false){
                        // 用户已拒绝授权，再调用相关 API 或者 wx.authorize 会失败，需要引导用户到设置页面打开授权开关
                        self.wxOpenSetting();
                    } else {
                        // 未询问过用户授权，调用相关 API 或者 wx.authorize 会弹窗询问用户
                    }
                }
            });
        });

    },

    _updaetSubDomainCanvas: function() {
        if (!this.tex) {
            return;
        }
        var openDataContext = wx.getOpenDataContext();
        var sharedCanvas = openDataContext.canvas;
        this.tex.initWithElement(sharedCanvas);
        this.tex.handleLoadedTexture();
        this.display.spriteFrame = new cc.SpriteFrame(this.tex);
        if(this.display.node.scale == 1)
            this.display.node.scale = (this.dsize.width / this.display.node.width);
    },


    wxOpenQuan: function()
    {
        var openDataContext = wx.getOpenDataContext();
        var sharedCanvas = openDataContext.canvas;
        var quan = cc.find("bootembg/quan",this.node_main);
        var sc = sharedCanvas.width/this.dsize.width;
        var dpi = cc.view._devicePixelRatio;
        var pos = cc.v2(quan.x*sc/dpi,sharedCanvas.height/dpi-quan.y*sc/dpi);
        this.quan_button = wx.createGameClubButton({
            icon: 'white',
            style: {
                left: pos.x - 15,
                top: pos.y - 15,
                width: 30,
                height: 30
            }
        })
    },

    adapt: function()
    {
        var nodes = [this.node_main,this.node_game_ui,this.node_pause,this.node_over,this.node_fuhuo];
        for(var i=0;i<nodes.length;i++)
        {
            var items = nodes[i].children;
            for(var j=0;j<items.length;j++)
            {
                var item = items[j];
                this.adaptItem(item);
            }
        }
    },

    adaptItem: function(node)
    {
        var s = cc.winSize;
        var h = (this.dsize.height - s.height)/2;
        var sc = node.y/this.dsize.height;
        node.y = s.height*sc + h;
    },

    initData: function()
    {
        this.GAME = {};
        this.openRotation = false;
        this.GAME.Config = {
            "PlayerHp":3,
            "DaoDanLiveTime":20,
            "BaoHuDaoJvShowTime":1,
            "DaoDanShowTime":[30,60,90,120,150,180,210,240,270,300],
            "DaoDanShowNum":[
                {
                    "minnum":1,
                    "maxnum":3
                },
                {
                    "minnum":1,
                    "maxnum":3
                },
                {
                    "minnum":2,
                    "maxnum":4
                },
                {
                    "minnum":2,
                    "maxnum":4
                },
                {
                    "minnum":2,
                    "maxnum":4
                },
                {
                    "minnum":3,
                    "maxnum":5
                },
                {
                    "minnum":3,
                    "maxnum":5
                },
                {
                    "minnum":3,
                    "maxnum":5
                },
                {
                    "minnum":3,
                    "maxnum":5
                },
                {
                    "minnum":4,
                    "maxnum":6

                }],
            "ZhiXianDaoDan":[
                {
                    "x1":-500,
                    "y1":-500,
                    "x2":500,
                    "y2":500
                },
                {
                    "x1":-500,
                    "y1":500,
                    "x2":500,
                    "y2":-500
                },
                {
                    "x1":500,
                    "y1":-500,
                    "x2":-500,
                    "y2":500
                },
                {
                    "x1":500,
                    "y1":500,
                    "x2":-500,
                    "y2":-500
                },
                {
                    "x1":-500,
                    "y1":-200,
                    "x2":500,
                    "y2":200
                },
                {
                    "x1":-200,
                    "y1":-500,
                    "x2":200,
                    "y2":500
                }
            ],

            "LevelInfo":[
                {
                    "Time":30,
                    "PlaneSpeed":200,
                    "PlaneRotation":5,
                    "DaoDanShowTime":5,
                    "DaoDanTotalNum":4,
                    "CoinCfg":[
                        {
                            "DaoDanType":1,
                            "DaoDanSpeed":230,
                            "DaoDanRotation":1,
                            "ShowJiLv":60

                        },
                        {
                            "DaoDanType":2,
                            "DaoDanSpeed":260,
                            "DaoDanRotation":1,
                            "ShowJiLv":20

                        },
                        {
                            "DaoDanType":3,
                            "DaoDanSpeed":290,
                            "DaoDanRotation":1,
                            "ShowJiLv":20
                        }
                    ]
                },
                {
                    "Time":30,
                    "PlaneSpeed":230,
                    "PlaneRotation":5,
                    "DaoDanShowTime":5,
                    "DaoDanTotalNum":4,

                    "CoinCfg":[
                        {
                            "DaoDanType":1,
                            "DaoDanSpeed":260,
                            "DaoDanRotation":1,
                            "ShowJiLv":60

                        },
                        {
                            "DaoDanType":2,
                            "DaoDanSpeed":290,
                            "DaoDanRotation":1,
                            "ShowJiLv":20

                        },
                        {
                            "DaoDanType":3,
                            "DaoDanSpeed":320,
                            "DaoDanRotation":1,
                            "ShowJiLv":20
                        }
                    ]
                },
                {
                    "Time":10,
                    "PlaneSpeed":200,
                    "PlaneRotation":5,
                    "DaoDanShowTime":5,
                    "DaoDanTotalNum":4,

                    "CoinCfg":[
                        {
                            "DaoDanType":1,
                            "DaoDanSpeed":200,
                            "DaoDanRotation":2,
                            "ShowJiLv":60

                        },
                        {
                            "DaoDanType":2,
                            "DaoDanSpeed":220,
                            "DaoDanRotation":2,
                            "ShowJiLv":20

                        },
                        {
                            "DaoDanType":3,
                            "DaoDanSpeed":250,
                            "DaoDanRotation":2,
                            "ShowJiLv":20
                        }
                    ]
                },
                {
                    "Time":30,
                    "PlaneSpeed":260,
                    "PlaneRotation":5,
                    "DaoDanShowTime":5,
                    "DaoDanTotalNum":4,

                    "CoinCfg":[
                        {
                            "DaoDanType":1,
                            "DaoDanSpeed":290,
                            "DaoDanRotation":1,
                            "ShowJiLv":60

                        },
                        {
                            "DaoDanType":2,
                            "DaoDanSpeed":320,
                            "DaoDanRotation":2,
                            "ShowJiLv":20

                        },
                        {
                            "DaoDanType":3,
                            "DaoDanSpeed":350,
                            "DaoDanRotation":2,
                            "ShowJiLv":20
                        }
                    ]
                },
                {
                    "Time":30,
                    "PlaneSpeed":290,
                    "PlaneRotation":5,
                    "DaoDanShowTime":5,
                    "DaoDanTotalNum":4,

                    "CoinCfg":[
                        {
                            "DaoDanType":1,
                            "DaoDanSpeed":320,
                            "DaoDanRotation":2,
                            "ShowJiLv":60

                        },
                        {
                            "DaoDanType":2,
                            "DaoDanSpeed":350,
                            "DaoDanRotation":2,
                            "ShowJiLv":20

                        },
                        {
                            "DaoDanType":3,
                            "DaoDanSpeed":380,
                            "DaoDanRotation":2,
                            "ShowJiLv":20
                        }
                    ]
                },
                {
                    "Time":10,
                    "PlaneSpeed":230,
                    "PlaneRotation":5,
                    "DaoDanShowTime":5,
                    "DaoDanTotalNum":4,

                    "CoinCfg":[
                        {
                            "DaoDanType":1,
                            "DaoDanSpeed":240,
                            "DaoDanRotation":2,
                            "ShowJiLv":60

                        },
                        {
                            "DaoDanType":2,
                            "DaoDanSpeed":260,
                            "DaoDanRotation":2,
                            "ShowJiLv":20

                        },
                        {
                            "DaoDanType":3,
                            "DaoDanSpeed":280,
                            "DaoDanRotation":2,
                            "ShowJiLv":20
                        }
                    ]
                },
                {
                    "Time":30,
                    "PlaneSpeed":320,
                    "PlaneRotation":5,
                    "DaoDanShowTime":5,
                    "DaoDanTotalNum":4,

                    "CoinCfg":[
                        {
                            "DaoDanType":1,
                            "DaoDanSpeed":350,
                            "DaoDanRotation":2,
                            "ShowJiLv":60

                        },
                        {
                            "DaoDanType":2,
                            "DaoDanSpeed":380,
                            "DaoDanRotation":2,
                            "ShowJiLv":20

                        },
                        {
                            "DaoDanType":3,
                            "DaoDanSpeed":410,
                            "DaoDanRotation":2,
                            "ShowJiLv":20
                        }
                    ]

                },
                {
                    "Time":30,
                    "PlaneSpeed":350,
                    "PlaneRotation":5,
                    "DaoDanShowTime":5,
                    "DaoDanTotalNum":4,

                    "CoinCfg":[
                        {
                            "DaoDanType":1,
                            "DaoDanSpeed":380,
                            "DaoDanRotation":2,
                            "ShowJiLv":60

                        },
                        {
                            "DaoDanType":2,
                            "DaoDanSpeed":410,
                            "DaoDanRotation":2,
                            "ShowJiLv":20

                        },
                        {
                            "DaoDanType":3,
                            "DaoDanSpeed":440,
                            "DaoDanRotation":2,
                            "ShowJiLv":20
                        },
                        {

                            "Time":30,
                            "PlaneSpeed":380,
                            "PlaneRotation":5,
                            "DaoDanShowTime":5,
                            "DaoDanTotalNum":4,

                            "CoinCfg":[
                                {
                                    "DaoDanType":1,
                                    "DaoDanSpeed":410,
                                    "DaoDanRotation":2,
                                    "ShowJiLv":60

                                },
                                {
                                    "DaoDanType":2,
                                    "DaoDanSpeed":440,
                                    "DaoDanRotation":2,
                                    "ShowJiLv":20

                                },
                                {
                                    "DaoDanType":3,
                                    "DaoDanSpeed":470,
                                    "DaoDanRotation":2,
                                    "ShowJiLv":20
                                }
                            ]
                        },
                        {

                            "Time":30,
                            "PlaneSpeed":40,
                            "PlaneRotation":5,
                            "DaoDanShowTime":5,
                            "DaoDanTotalNum":4,

                            "CoinCfg":[
                                {
                                    "DaoDanType":1,
                                    "DaoDanSpeed":450,
                                    "DaoDanRotation":2,
                                    "ShowJiLv":60

                                },
                                {
                                    "DaoDanType":2,
                                    "DaoDanSpeed":480,
                                    "DaoDanRotation":3,
                                    "ShowJiLv":20

                                },
                                {
                                    "DaoDanType":3,
                                    "DaoDanSpeed":520,
                                    "DaoDanRotation":2,
                                    "ShowJiLv":20
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        var self = this;

        self.curLevelIndex = 0;
        self.curDaoDanIndex = 1; //直线导弹配置索引
        self.curInfo = self.GAME.Config.LevelInfo[self.curLevelIndex];
        self.DaoDanShowTime = 0;  //导弹显示计时
        self.curGameRunTime = 0;  //用于读取时间配置数据
        self.curShowBaoHuTime = 0; //保护道具显示倒计时 ，吃掉后死亡才会再次显示
        self.GameTime = 0; //用于生成直线导弹
        self.GamePlayTime = 0; // 用于游戏中计时
        self.IconCount = 0; //金币当前个数
        self.planeIsMove = true; //飞机死亡时定为false
        self.rPlayGameTime = 100000; // 从新开始打游戏的时间
        self.suijiyun = 1; // 1表示随机x周，2随机y轴
        self.jinbiinfo = [
            [
                {x1 : 63,y1 : 44},
                {x1 : 126,y1 : 88}
            ],
            [
                {x1 : 63,y1 : 44},
                {x1 : 0,y1 : 88},
                {x1 : -63,y1 : 44}
            ],
            [
                {x1 : 67,y1 : 0},
                {x1 : 134,y1 : 0},
                {x1 : 201,y1 : 0},
                {x1 : 268,y1 : 0}
            ],
            [
                {x1 : 84,y1 : 0},
                {x1 : 117,y1 : 81},
                {x1 : 42,y1 : 162},
                {x1 : -33,y1 : 81}
            ]
        ];
        self.GAME.sBase = 1;
        self.GAME.state = "MAIN";
        self.GAME.Config.PlayerHp = 1;
        self.GAME.playerHp = 1;

        self.GAME.midScore = 0;

        self.GAME.score = 0;
        self.GAME.starLevel = 0;
        self.GAME.starScore = [500,2000,4500,8000,16000];
        self.GAME.FIRST_JOIN = true;
        self.GAME.maindt = 0;
    },

    initUI: function()
    {
        var self = this;
        self.node_game = cc.find("Canvas/node_game");
        self.node_game_ui = cc.find("gameui",self.node_game);
        self.joystickbg = cc.find("gameui/joystickbg",self.node_game);
        self.joystick = cc.find("joystick",self.joystickbg);
        self.plane = cc.find("plane",self.node_game);
        self.yunNode = cc.find("yunNode",self.node_game);
        self.yunNode2 = cc.find("yunNode2",self.yunNode);
        self.ZiDanNode = cc.find("ZiDanNode",self.node_game);
        self.ZhiXianZiDanNode = cc.find("ZhiXianZiDanNode",self.yunNode);
        self.JinBiNode = cc.find("JinBiNode",self.yunNode);
        self.BaoHuIconNode = cc.find("BaoHuIconNode",self.yunNode);
        self.other = cc.find("other",self.node_game);
        self.node_game_score = cc.find("gameui/score",self.node_game);
        self.node_main = cc.find("Canvas/node_main");
        self.node_main_score = cc.find("score",self.node_main);
        self.node_pause = cc.find("Canvas/node_pause");
        self.node_pause_tishi = cc.find("tishi",self.node_pause);
        self.node_pause_hand = cc.find("hand",self.node_pause);
        self.node_over = cc.find("Canvas/node_over");
        self.node_over_score = cc.find("score",self.node_over);
        self.node_over_chaoguo = cc.find("chaoguo",self.node_over);

        self.node_fuhuo = cc.find("Canvas/node_fuhuo");
        self.node_fuhuo_score = cc.find("score",self.node_fuhuo);
        self.node_fuhuo_circle = cc.find("time/fuhuo_circle",self.node_fuhuo);
        self.node_fuhuo_num = cc.find("time/havecard/fuhuonum",self.node_fuhuo);
        self.node_fuhuo_havecard = cc.find("time/havecard",self.node_fuhuo);
        self.node_fuhuo_nocard = cc.find("time/nocard",self.node_fuhuo);
        self.node_fuhuo_skip = cc.find("skip",self.node_fuhuo);

        self.node_paiming = cc.find("Canvas/node_paiming");

        self.node_card = cc.find("Canvas/node_card");
        self.node_card_num = cc.find("bg/cardnum",self.node_card);

        self.node_quanxian = cc.find("Canvas/node_quanxian");

        self.node_pause_tishi.active = false;
        self.node_pause_hand.active = false;

        var node_main_fuhuo = cc.find("fuhuo",self.node_main);
        var stringTime = "2018-06-21 22:01:00";
        var timestamp2 = (new Date(Date.parse(stringTime.replace(/-/g,"/")))).getTime();
        if(new Date().getTime() < timestamp2)
        {
            node_main_fuhuo.active = false;
        }

        self.node_game_ui.active = false;
        self.node_quanxian.active = false;

        var currscore = cc.sys.localStorage.getItem("highscore");
        currscore = currscore ? currscore : 0;
        self.node_main_score.getComponent("cc.Label").string = currscore+"";

        self.joyRect = cc.rect(0,0,self.joystickbg.width,self.joystickbg.height);
        self.joyOringinPos = cc.p(self.joystickbg.width * 0.5,self.joystickbg.height * 0.5);
        self.joyNewPos = self.joyOringinPos;

        self.planeChaoXiang = cc.p(0,-1); //--向下
        self.plane.wuditime = 0;
        self.plane.isbaohu = false;
        self.planeChaoXiang.y = - self.curInfo.PlaneSpeed / 60;


        self.xiarect = cc.rect(0,-cc.winSize.height/2,cc.winSize.width,cc.winSize.height/2);
        self.zuorect = cc.rect(-cc.winSize.width/2,0,cc.winSize.width/2,cc.winSize.height);
        self.yourect = cc.rect(cc.winSize.width,0,cc.winSize.width/2,cc.winSize.height);
        self.shangrect = cc.rect(0,cc.winSize.height,cc.winSize.width,cc.winSize.height/2);

        self.yunNode2.begainTime = 2;

        var s = cc.winSize;

        var yun = self.CreateYun();
        yun.position = cc.v2(Math.floor(Math.random()*200-100),Math.floor(Math.random()*200-100));
        self.yunNode2.addChild(yun);

        yun = self.CreateYun();
        yun.position = cc.v2(s.width*0.5 + Math.floor(Math.random()*200-100), s.height*0.4 + Math.floor(Math.random()*200-100));
        self.yunNode2.addChild(yun);

        yun = self.CreateYun();
        yun.position = cc.v2(s.width*0.3 + Math.floor(Math.random()*200-100), s.height*0.4 + Math.floor(Math.random()*200-100));
        self.yunNode2.addChild(yun);

        self.joyChaoXiang = self.planeChaoXiang;
    },

    startGmae: function()
    {
        var self = this;
        self.GAME.state = "START";

        self.curLevelIndex = 0;
        self.curDaoDanIndex = 1; //直线导弹配置索引
        self.curInfo = self.GAME.Config.LevelInfo[self.curLevelIndex];
        self.DaoDanShowTime = 0;  //导弹显示计时
        self.curGameRunTime = 0;  //用于读取时间配置数据
        self.curShowBaoHuTime = 0; //保护道具显示倒计时 ，吃掉后死亡才会再次显示
        self.GameTime = 0; //用于生成直线导弹
        self.GamePlayTime = 0; // 用于游戏中计时
        self.IconCount = 0; //金币当前个数
        self.planeIsMove = true; //飞机死亡时定为false
        self.rPlayGameTime = 100000; // 从新开始打游戏的时间
        self.suijiyun = 1; // 1表示随机x周，2随机y轴
        self.jinbiinfo = [
            [
                {x1 : 63,y1 : 44},
                {x1 : 126,y1 : 88}
            ],
            [
                {x1 : 63,y1 : 44},
                {x1 : 0,y1 : 88},
                {x1 : -63,y1 : 44}
            ],
            [
                {x1 : 67,y1 : 0},
                {x1 : 134,y1 : 0},
                {x1 : 201,y1 : 0},
                {x1 : 268,y1 : 0}
            ],
            [
                {x1 : 84,y1 : 0},
                {x1 : 117,y1 : 81},
                {x1 : 42,y1 : 162},
                {x1 : -33,y1 : 81}
            ]
        ];
        self.GAME.sBase = 1;
        self.GAME.Config.PlayerHp = 1;
        self.GAME.playerHp = 1;
        self.GAME.playerfuhuo = true;

        self.GAME.midScore = 0;

        self.GAME.score = 0;
        self.GAME.starLevel = 0;
        self.GAME.starScore = [500,2000,4500,8000,16000];

        self.time_score = 0;
        self.node_game_ui.active = true;
        self.node_game_score.getComponent("cc.Label").string = "0";

        self.ZiDanNode.removeAllChildren();
        self.ZhiXianZiDanNode.removeAllChildren();
        self.JinBiNode.removeAllChildren();
        self.BaoHuIconNode.removeAllChildren();
        self.other.removeAllChildren();

        self.plane.isbaohu = false;
        self.plane.active = true;
        self.planeIsMove = true;
        self.joyChaoXiang = cc.v2(0,1);
        self.joyNewPos = cc.v2(0,0);
        self.planeChaoXiang = cc.p(0,1);
        self.joystick.setPosition(cc.p(0,0));

        self.CreateIcon();
        self.CreateBaoHuIcon();

        this.wxCloseOver();
        this.wxCloseRank();


        if(cc.sys.os == cc.sys.OS_ANDROID)
        {
            var playnum = cc.sys.localStorage.getItem("playnum");
            playnum = playnum ? playnum : 0;
            if(playnum == 1)
            {
                self.node_pause_tishi.active = true;
                self.node_pause_hand.active = true;
                self.node_pause.active = true;
                self.node_pause_hand.runAction(cc.repeatForever(cc.sequence(
                    cc.moveBy(0.3,10,0).easing(cc.easeSineIn()),
                    cc.moveBy(0.3,-10,0).easing(cc.easeSineIn())
                )));
                self.GAME.state = "STOP";
            }
            playnum ++;
            cc.sys.localStorage.setItem("playnum",playnum);
        }

    },

    wxCloseOver: function()
    {
        this.node_over.active = false;
        this.display_gray.active = false;
        wx.postMessage({ message: "closeOver" });
    },

    wxCloseRank: function()
    {
        this.node_paiming.active = false;
        this.display_gray_rank.active = false;
        wx.postMessage({ message: "closeRank" });
    },

    wxRank: function()
    {
        this.node_paiming.active = true;
        this.display_gray_rank.active = true;
        wx.postMessage({ message: "friendRank" });
    },

    wxOverRank: function(score)
    {
        this.node_over.active = true;
        this.display_gray.active = true;
        wx.postMessage({ message: "overRank",score:score });
    },

    wxUploadScore: function(score)
    {
        wx.postMessage({ message: "updateScore",score:score });
    },

    wxGropShare: function()
    {
        wx.shareAppMessage({
            title: "小哥哥，打灰机吗",
            imageUrl: cc.url.raw("resources/zhuanfa.jpg"),
            success: function(res)
            {
                cc.log(res);
            }
        });
    },
    wxGropShareChange: function()
    {
        var s = "打灰机我拿了"+ this.GAME.score + "分，超过了" + this.getChaoyue()+"的用户，不服来战。";
        wx.shareAppMessage({
            title: s,
            imageUrl: cc.url.raw("resources/zhuanfa.jpg"),
            success: function(res)
            {
                cc.log(res);
            }
        });
    },
    wxGropShareCard: function()
    {
        var sharetime = cc.sys.localStorage.getItem("sharetime");
        sharetime = sharetime ? sharetime : 0;
        var now = new Date().getTime();
        if(now - sharetime > 24*60*60*1000)
        {
            cc.sys.localStorage.setItem("sharetime",now);
            cc.sys.localStorage.setItem("sharenum",0);
        }

        var sharenum = cc.sys.localStorage.getItem("sharenum");
        sharenum = sharenum ? sharenum : 0;
        if(sharenum>=5)
        {
            wx.showToast({
                title: "每天最多领取5次"
            });
            return;
        }

        var self = this;
        wx.shareAppMessage({
            title: "小哥哥，打灰机吗",
            imageUrl: cc.url.raw("resources/zhuanfa.jpg"),
            success: function(res)
            {
                wx.showToast({
                    title: "获取到一个复活卡"
                });
                cc.sys.localStorage.setItem("sharenum",(sharenum+1));

                var cardnum = cc.sys.localStorage.getItem("cardnum");
                cardnum = cardnum ? cardnum : 0;
                cardnum += 1;
                cc.sys.localStorage.setItem("cardnum",cardnum);
                self.node_card_num.getComponent("cc.Label").string = cardnum+"";

                cc.log(res);
            }
        });
    },

    wxGropShareFuhuo: function()
    {
        var self = this;
        wx.shareAppMessage({
            title: "小哥哥，打灰机吗",
            imageUrl: cc.url.raw("resources/zhuanfa.jpg"),
            success: function(res)
            {
                wx.showToast({
                    title: "复活成功"
                });
                self.fuhuo2();
            }
        });
    },

    click: function(event,data)
    {
        if(data == "start")
        {
            this.node_main.active = false;
            this.quan_button.hide();
            this.startGmae();
        }
        else if(data == "pause")
        {
            this.node_pause.active = true;
            cc.director.pause();
        }
        else if(data == "resume")
        {
            if(this.node_pause_tishi.active)
            {
                this.GAME.state = "START";
                this.node_pause_tishi.active = false;
                this.node_pause_hand.active = false;
                this.node_pause.active = false;
            }
            else
            {
                cc.director.resume();
                this.node_pause.active = false;
            }
        }
        else if(data == "main")
        {
            cc.director.resume();
            this.goMain();
        }
        else if(data == "again")
        {
            this.node_over.active = false;
            this.startGmae();
        }
        else if(data == "change")
        {
            this.wxGropShareChange();
        }
        else if(data == "fuhuo")
        {
            if(this.node_fuhuo_havecard.active)
                this.fuhuo();
            else
                this.wxGropShareFuhuo();
        }
        else if(data == "skip")
        {
            this.skip();
        }
        else if(data == "paiming")
        {
            this.quan_button.hide();
            this.showPaiming();
        }
        else if(data == "paimingover")
        {
            this.showPaiming();
            this.wxCloseOver();
            this.node_over.active = false;
            this.openover = true;
        }
        else if(data == "close")
        {
            this.wxCloseRank();
            if(this.openover)
            {
                this.openover = false;
                this.node_over.active = true;
                this.wxOverRank();
            }
            else
            {
                this.quan_button.show();
            }
        }
        else if(data == "getcard")
        {
            this.node_card.active = true;
            var cardnum = cc.sys.localStorage.getItem("cardnum");
            cardnum = cardnum ? cardnum : 0;
            this.node_card_num.getComponent("cc.Label").string = cardnum+"";

        }
        else if(data == "closecard")
        {
            this.node_card.active = false;
        }
        else if(data == "share")
        {
            this.wxGropShare();
        }
        else if(data == "sharecard")
        {
            this.wxGropShareCard();
        }

        cc.log(data);
    },


    goMain: function()
    {
        var self = this;

        self.GAME.state = "MAIN";
        this.node_pause.active = false;
        this.node_main.active = true;
        self.node_game_ui.active = false;
        this.node_over.active = false;
        this.quan_button.show();
        this.wxCloseOver();
        this.wxCloseRank();

        var currscore = cc.sys.localStorage.getItem("highscore");
        currscore = currscore ? currscore : 0;
        self.node_main_score.getComponent("cc.Label").string = currscore+"";

        self.planeChaoXiang = cc.v2(0,1);

        self.ZiDanNode.removeAllChildren();
        self.ZhiXianZiDanNode.removeAllChildren();
        self.JinBiNode.removeAllChildren();
        self.BaoHuIconNode.removeAllChildren();
        self.other.removeAllChildren();

        self.plane.isbaohu = false;
        self.planeIsMove = true;
        self.plane.active = true;
    },

    showPaiming: function()
    {
        this.wxRank();
    },

    CreateBaoHuIcon: function()
    {
        var self = this;
        var s = cc.winSize;
        var pos = cc.v2(Math.floor(Math.random()*s.width*2-s.width/2),Math.floor(Math.random()*s.height*2-s.height/2));

        var icon = cc.instantiate(self.BaoHuIcon);
        self.BaoHuIconNode.addChild(icon);

        var posyun = self.BaoHuIconNode.convertToNodeSpace(pos);
        icon.position = posyun;
    },

    CreateIcon: function()
    {
        var self = this;
        var s = cc.winSize;
        self.IconCount = self.IconCount + 1;
        var jinbitype = 2;
        var pos = cc.v2(Math.floor(Math.random()*s.width*2-s.width/2),Math.floor(Math.random()*s.height*2-s.height/2));

        if(jinbitype == 1)
        {
            var icon = cc.instantiate(self.icon);
            self.JinBiNode.addChild(icon);

            var posyun = self.JinBiNode.convertToNodeSpace(pos);
            icon.position = posyun;
            self.IconCount = self.IconCount + 1;
        }
        else if(jinbitype == 2)
        {
            var jinbitable = self.jinbiinfo;
            var index = Math.floor(Math.random()*jinbitable.length);
            var postable = jinbitable[index];
            for(var i=0;i<postable.length;i++)
            {
                var v = postable[i];
                var icon = cc.instantiate(self.icon);
                self.JinBiNode.addChild(icon);
                var pos3 = cc.pAdd(pos,cc.v2(v.x1,v.y1));
                var posyun = self.JinBiNode.convertToNodeSpace(pos3);
                icon.position = posyun;
            }
            self.IconCount = self.IconCount + postable.length;
        }
        self.IconCount = self.IconCount - 1;
    },

    CreateYun: function()
    {
        var index = Math.floor(Math.random()*4+1);
        var imgyun = null;
        if(index == 1)
            imgyun = cc.instantiate(this.yun1);
        else if(index == 2)
            imgyun = cc.instantiate(this.yun2);
        else if(index == 3)
            imgyun = cc.instantiate(this.yun3);
        else if(index == 4)
            imgyun = cc.instantiate(this.yun4);
        return imgyun
    },

    updatePlaneRotation: function()
    {
        var self = this;
        var hudu = self.pGetAngle(self.planeChaoXiang,cc.v2(0,-1));
        var jiaodu = 180/Math.PI*hudu;

        this.plane.rotation = jiaodu;
    },

    addListener: function()
    {
        var self = this;
        // touch input
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function(touch, event) {
                var touch = touch.getLocation();
                var touch3 = self.joystickbg.convertToNodeSpace(touch);
                if(!self.planeIsMove)
                    return false;
                if(cc.rectContainsPoint(self.joyRect,touch3))
                {
                    self.openRotation = true;
                    var x = touch3.x - self.joyOringinPos.x;
                    var y = touch3.y - self.joyOringinPos.y;
                    self.joyChaoXiang = cc.v2(x,y);
                    self.joyNewPos = cc.v2(x,y);
                    return true;
                }
                return false;
            },
            onTouchMoved:function(touch, event) {
                var touch = touch.getLocation();
                var touch3 = self.joystickbg.convertToNodeSpace(touch);
                //-- 得到两点x的距离
                var x = touch3.x - self.joyOringinPos.x;

                //-- 得到两点y的距离
                var y = touch3.y - self.joyOringinPos.y;
                self.joyChaoXiang = cc.v2(x,y);
                touch3 = cc.v2(x,y);
                var xie = cc.pDistance(cc.v2(0,0),touch3);
                var xie2 = xie;
                if(xie2 > self.joyRect.width/2)
                {
                    xie2 = self.joyRect.width/2;
                }
                x = touch3.x * xie2 / xie;
                y = touch3.y * xie2 / xie;
                self.joyNewPos = cc.v2(x, y);
            },
            onTouchEnded: function(touch, event) {
                self.openRotation = false;
                self.joyNewPos = cc.v2(0,0);
                self.joyChaoXiang = self.planeChaoXiang;
                self.joystick.position = self.joyNewPos;

            }
        }, self.node);
    },

    rePlayGame: function()
    {
        var self = this;
        var s = cc.winSize;
        //--创建飞机
        self.plane.active = true;
        //self.plane.position = cc.v2(s.width/2,s.height/2);
        self.planeChaoXiang = cc.p(0,-1) //--向下
        self.planeChaoXiang.y = - self.curInfo.PlaneSpeed / 60;
        self.plane.wuditime = 4;
        self.planeIsMove = true;
        self.plane.runAction(cc.sequence(
            cc.fadeOut(0.4),
            cc.fadeIn(0.4),
            cc.fadeOut(0.4),
            cc.fadeIn(0.4),
            cc.fadeOut(0.4),
            cc.fadeIn(0.4),
            cc.fadeOut(0.4),
            cc.fadeIn(0.4),
            cc.fadeOut(0.4),
            cc.fadeIn(0.4),
            cc.callFunc(function()
                {
                    self.plane.wuditime = 0;
                }
        )));

        self.CreateBaoHuIcon();
        self.joyChaoXiang = self.planeChaoXiang;
    },

    CreateSuiJiYun: function()
    {
        var self = this;
        var s = cc.winSize;
        var childTbale = self.yunNode2.children;
        var shownum = 0;

        for(var i=0;i<childTbale.length;i++)
        {
            var yunnode = childTbale[i];
            var yunposx = yunnode.getPosition().x;
            var yunposy = yunnode.getPosition().y;
            var yunpos = cc.p(yunposx,yunposy);
            var coverpos = self.yunNode2.convertToWorldSpace(yunpos);

            var posrectx;
            var posrecty;
            var posrect;

            if(self.planeChaoXiang.x > 0)
            {
                posrectx = s.width - s.width/3;

                posrecty = 0;
                posrect = cc.rect(posrectx,posrecty,s.width*0.5 +s.width/3,s.height);
            }
            else if(self.planeChaoXiang.x == 0)
            {
                posrectx = 0;
                if(self.planeChaoXiang.y > 0)
                {
                    posrecty = s.height - s.height/ 3;
                }
                else
                {
                    posrecty = -s.height* 0.5;
                }
                posrect = cc.rect(posrectx,posrecty,s.width*0.5, s.height * 0.5 + s.height / 3);
            }
            else
            {
                posrectx = -s.width*0.5;
                posrecty = 0;

                posrect = cc.rect(posrectx,posrecty,s.width*0.5 +s.width/3,s.height);
            }

            if(cc.rectContainsPoint(posrect,coverpos))
            {
                shownum = shownum + 1;
            }
            if(shownum > 1)
            {
                break;
            }
        }

        if(shownum < 2)
        {
            //--添加云   根据飞机飞行方向添加
            var xiangliang = cc.pNormalize(self.planeChaoXiang);
            var yun = self.CreateYun();
            self.yunNode2.addChild(yun);
            xiangliang.x = xiangliang.x * (s.width * 0.5 + yun.width + 70);
            xiangliang.y = xiangliang.y * (s.height * 0.5 + yun.height + 100);
            if(self.suijiyun == 0)
            {
                xiangliang.x = xiangliang.x + Math.floor(Math.random()*300-150);
                xiangliang.y = xiangliang.y + Math.floor(Math.random()*200-100);
            }
            else
            {
                xiangliang.x = xiangliang.x + Math.floor(Math.random()*200-100);
                xiangliang.y = xiangliang.y + Math.floor(Math.random()*400-200);
            }
            self.suijiyun = self.suijiyun + 1;
            self.suijiyun = self.suijiyun % 2;
            xiangliang = cc.pAdd(cc.p(s.width * 0.5,s.height *0.5),xiangliang);

            var coverpos = self.yunNode2.convertToNodeSpace(xiangliang);
            yun.setPosition(coverpos);
        }
    },

    ShowBaoHuTiShi: function()
    {
        var self = this;
        var s = this.dsize;
        var childTbale = self.BaoHuIconNode.children;
        var isshow = true;
        var postest;
        for(var i=0;i<childTbale.length;i++)
        {
            var jinbi = childTbale[i];
            var posx = jinbi.getPosition().x;
            var posy = jinbi.getPosition().y;
            var pos = self.BaoHuIconNode.convertToWorldSpace(cc.p(posx,posy));
            postest = pos;
            if((pos.x > 0 && pos.x < s.width) && (pos.y > 0 && pos.y < s.height))
            {
                isshow = false;
                break;
            }
        }
        if(isshow && childTbale.length > 0)
        {
            var hudun = self.other.getChildByTag(6);
            if(!hudun)
            {
                hudun = cc.instantiate(this.tishi2);
                self.other.addChild(hudun,5,6);
            }
            var chaoxiang = cc.pSub(postest,cc.p(s.width * 0.5,s.height * 0.5));

            chaoxiang = cc.pNormalize(chaoxiang);
            chaoxiang.x = chaoxiang.x * (s.width * 0.3);
            chaoxiang.y = chaoxiang.y * (s.width * 0.3);
            var daodanpos = cc.pAdd(chaoxiang,cc.p(s.width/2,s.height/2));
            hudun.setPosition(daodanpos);

            //--算出金币跟飞机的夹角
            var hudu = self.pGetAngle(chaoxiang,cc.p(0,-1));
            var jiaodu = 180/Math.PI*hudu;
            hudun.rotation = jiaodu;
        }
        else
        {
            var hudun = self.other.getChildByTag(6);
            if(hudun)
                hudun.destroy();
        }
    },

    ShowJinBiTiShi: function()
    {
        var self = this;
        var s = this.dsize;

        var childTbale = self.JinBiNode.children;
        var isshow = true;
        var postest;
        for(var i=0;i<childTbale.length;i++)
        {
            var jinbi = childTbale[i];
            var posx = jinbi.getPosition().x;
            var posy = jinbi.getPosition().y;
            var pos = self.JinBiNode.convertToWorldSpace(cc.p(posx,posy));
            postest = pos;

            if((pos.x > 0 && pos.x < s.width) && (pos.y > 0 && pos.y < s.height))
            {
                isshow = false;
                break;
            }
        }

        if(isshow)
        {
            var hudun = self.other.getChildByTag(5);
            if(!hudun)
            {
                hudun = cc.instantiate(this.tishi1);
                self.other.addChild(hudun,5,5);
            }
            var chaoxiang = cc.pSub(postest,cc.p(s.width * 0.5,s.height * 0.5));

            chaoxiang = cc.pNormalize(chaoxiang);
            chaoxiang.x = chaoxiang.x * (s.width * 0.3);
            chaoxiang.y = chaoxiang.y * (s.width * 0.3);
            var daodanpos = cc.pAdd(chaoxiang,cc.p(s.width/2,s.height/2));
            hudun.setPosition(daodanpos);

            //--算出金币跟飞机的夹角
            var hudu = self.pGetAngle(chaoxiang,cc.p(0,-1));
            var jiaodu = 180/Math.PI*hudu;
            hudun.rotation = jiaodu;
        }
        else
        {
            var hudun = self.other.getChildByTag(5);
            if(hudun)
                hudun.destroy();
        }
    },

    CreateZiDan: function()
    {
        var self = this;
        var s = cc.winSize;

        var childTbale = self.ZiDanNode.children;
        if(childTbale.length >= self.curInfo.DaoDanTotalNum)
            return;

        var index = Math.floor(Math.random()*100+1);
        var gailv = 0;

        for(var i=0;i<self.curInfo.CoinCfg.length;i++)
        {
            var v = self.curInfo.CoinCfg[i];
            if(index > gailv && index <= gailv + v.ShowJiLv)
            {
                var posindex = Math.floor(Math.random()*3);//--上边一个坐标，之随机x值，左右分别两个，只随机y值
                var pos2;
                if(posindex == 0)
                    pos2 = cc.pAdd(cc.p(1,s.height + 50),cc.p(Math.floor(Math.random()*s.width+1),0));
                else if(posindex == 1)
                    pos2 = cc.pAdd(cc.p(-50,s.height /3),cc.p(0,Math.floor(Math.random()*(s.height-s.height/3)+1)));
                else
                    pos2 = cc.pAdd(cc.p(s.width + 50,s.height /3),cc.p(0,Math.floor(Math.random()*(s.height-s.height/3)+1)));

                var imgyun = null;
                if(v.DaoDanType == 1)
                    imgyun = cc.instantiate(this.daodan1);
                else if(v.DaoDanType == 2)
                    imgyun = cc.instantiate(this.daodan2);
                else if(v.DaoDanType == 3)
                    imgyun = cc.instantiate(this.daodan3);

                self.ZiDanNode.addChild(imgyun);
                var posx = self.ZiDanNode.getPosition().x;
                var posy = self.ZiDanNode.getPosition().y;
                var posword = cc.p(posx,posy);//self.ZiDanNode.convertToWorldSpace(cc.p(posx,posy));
                posword = cc.pSub(posword,cc.p(s.width/2,s.height/2));

                var pos1 = cc.pAdd(pos2,posword);
                //pos1 = self.ZiDanNode.convertToNodeSpace(pos1);
                imgyun.setPosition(pos1);
                imgyun.info = v;
                imgyun.ZiDanChaoXiang = cc.p(-1,0);
                imgyun.liveTime = self.GAME.Config.DaoDanLiveTime;
                imgyun.showYunLength = 30;  //--生成尾气需要的距离

                if(v.DaoDanType == 3 && self.GAME.state == "START")
                {
                    //--导弹提示
                    var daodanchaoxiang = cc.pSub(pos2,cc.p(s.width * 0.5,s.height * 0.5));

                    daodanchaoxiang = cc.pNormalize(daodanchaoxiang);
                    daodanchaoxiang.x = daodanchaoxiang.x * (s.width * 0.5);
                    daodanchaoxiang.y = daodanchaoxiang.y * (s.width * 0.5);
                    var daodanpos = cc.pAdd(daodanchaoxiang,cc.p(s.width/2,s.height/2));
                    var tishi = cc.instantiate(this.tishi3);
                    tishi.position = daodanpos;
                    self.other.addChild(tishi,6);
                    tishi.runAction(cc.sequence(
                        cc.fadeOut(0.2),
                        cc.fadeIn(0.2),
                        cc.fadeOut(0.2),
                        cc.fadeIn(0.2),
                        cc.callFunc(function()
                        {
                            tishi.destroy();
                        }
                    )));
                }
                break;
            }
            gailv = gailv + v.ShowJiLv;
        }
    },

    CreateZhiXianDaoDan: function()
    {
        var self = this;
        var s = cc.winSize;

        var numtable = self.GAME.Config.DaoDanShowNum[self.curDaoDanIndex];

        var zidannum = Math.floor(Math.random()*numtable.maxnum+numtable.minnum);
        var lujingtable = [];
        for(var i=0;i<zidannum;i++)
        {
            var index = Math.floor(Math.random()*2+1);
            var info;
            for(var j=0;j<self.curInfo.CoinCfg.length;j++)
            {
                info = self.curInfo.CoinCfg[j];
                if(info.DaoDanType == index)
                {
                    break;
                }
            }

            //local string = string.format("#DMP_DaoDan%d.png", info.DaoDanType)
            var posindex;
            var istrue = true;
            while(istrue)
            {
                posindex = Math.floor(Math.random()*self.GAME.Config.ZhiXianDaoDan.length);
                istrue = false;
                for(var q=0;q<lujingtable.length;q++)
                {
                    var v = lujingtable[q];
                    if(v == posindex)
                    {
                        istrue = true;
                        break;
                    }
                }
            }
            lujingtable[i] = posindex;
            var zidanpoxtable = self.GAME.Config.ZhiXianDaoDan[posindex];

            var zidan = null;
            if(info.DaoDanType == 1)
                zidan = cc.instantiate(this.daodan1);
            else if(info.DaoDanType == 2)
                zidan = cc.instantiate(this.daodan2);
            else if(info.DaoDanType == 3)
                zidan = cc.instantiate(this.daodan3);
            self.ZhiXianZiDanNode.addChild(zidan);

            var pos = self.ZhiXianZiDanNode.getPosition();
            var posword = self.ZhiXianZiDanNode.convertToWorldSpace(pos);
            posword = cc.pSub(posword,cc.p(s.width/2,s.height/2));

            var pos1 = cc.pSub(cc.p(zidanpoxtable.x1,zidanpoxtable.y1),posword);
            var pos2 = cc.pSub(cc.p(zidanpoxtable.x2,zidanpoxtable.y2),posword);
            zidan.setPosition(pos1);
            var postest1 = zidan.convertToWorldSpace(pos1);
            var postest2 = zidan.convertToWorldSpace(pos2);

            zidan.ZiDanChaoXiang = cc.pSub(cc.p(zidanpoxtable.x2,zidanpoxtable.y2),cc.p(zidanpoxtable.x1,zidanpoxtable.y1));
            zidan.showYunLength = 30;
            zidan.info = info;

            var hudu2 = self.pGetAngle(zidan.ZiDanChaoXiang,cc.p(-1,0));
            var jiaodu2 = 180/Math.PI*hudu2;
            zidan.rotation = jiaodu2;

        }
    },

    CheckPlaneAndZiDanPengZhuang: function()
    {
        var self = this;
        var s = cc.winSize;

        var childTbale = self.ZiDanNode.children;
        var istuichu = false;
        for(var i=0;i<childTbale.length;i++)
        {
            var zidan = childTbale[i];
            //--判断导弹和飞机碰撞
            var posx = zidan.getPosition().x;
            var posy = zidan.getPosition().y;
            var pos = cc.p(posx,posy);
            var pos2 = self.ZiDanNode.convertToWorldSpace(pos);
            pos2 = cc.pSub(pos2,cc.p(s.width/2,s.height/2));
            var length = Math.sqrt(Math.pow(pos2.x, 2) + Math.pow(pos2.y, 2));
            if(length <= 40 && self.plane.wuditime == 0)
            {
                //--爆炸，结束
                zidan.destroy();
                istuichu = true;
                break;
            }
        }
        if(istuichu)
        {
            self.PlaneBaoZha();
            return;
        }
    },

    PlaneBaoZha: function()
    {
        var self = this;
        var s = cc.winSize;

        if(self.plane.isbaohu)
        {
            var baohu = self.other.getChildByTag(11);
            if(baohu)
            {
                baohu.destroy();
                var pos = self.plane.getPosition();
                var baozha = self.CreateBaoZha();
                baozha.setPosition(pos);
            }
            self.plane.isbaohu = false;
            return;
        }

        self.planeIsMove = false;
        var pos = self.plane.getPosition();
        self.plane.active = false;

        var baozha = self.CreateBaoZha();
        baozha.setPosition(pos);
        self.planeChaoXiang = cc.p(0,0);
        self.joyNewPos = self.joyOringinPos;
        self.joyChaoXiang = self.planeChaoXiang;
        self.joystick.setPosition(cc.p(0,0));

        var childTbaleicon = self.BaoHuIconNode.children;
        for(var i=0;i<childTbaleicon.length;i++)
        {
            var jinbi = childTbaleicon[i];
            jinbi.destroy();
        }

        var childTbale = self.ZiDanNode.children;
        for(var i=0;i<childTbale.length;i++)
        {
            var zidan = childTbale[i];
            zidan.liveTime = 1;
        }
        self.playerHurt(1);

        if(self.GAME.playerfuhuo)
        {
            //self.rPlayGameTime = 5; self.GAME.playerHp > 0
            self.judgefuhuo();
        }
        else
        {

        }
    },

    judgefuhuo: function()
    {
        var self = this;
        var stringTime = "2018-06-21 22:01:00";
        var timestamp2 = (new Date(Date.parse(stringTime.replace(/-/g,"/")))).getTime();
        if(new Date().getTime() < timestamp2)
        {
            self.gameOver();
            return;
        }

        this.GAME.state = "FUHUO";

        var cardnum = cc.sys.localStorage.getItem("cardnum");
        cardnum = cardnum ? cardnum : 0;
        if(cardnum > 0)
        {
            self.node_fuhuo_havecard.active = true;
            self.node_fuhuo_nocard.active = false;
        }
        else
        {
            self.node_fuhuo_havecard.active = false;
            self.node_fuhuo_nocard.active = true;
        }
        self.node_fuhuo_skip.active = false;

        self.node_game_ui.active = false;
        self.node_fuhuo.active = true;
        self.node_fuhuo_score.getComponent("cc.Label").string = Math.floor(this.GAME.score)+"";
        self.node_fuhuo_num.getComponent("cc.Label").string = cardnum + "";

        self.node_fuhuo_circle.getComponent("cc.ProgressBar").progress = 1;

        //self.rPlayGameTime = 5;
        self.node_fuhuo_circle.runtime = 8;
        var seq = cc.sequence(
            cc.delayTime(0.1),
            cc.callFunc(function(){
                self.node_fuhuo_circle.runtime -= 0.1;
                var p = self.node_fuhuo_circle.runtime/8;
                self.node_fuhuo_circle.getComponent("cc.ProgressBar").progress = p;
            })
        );
        var seq2 = cc.sequence(
            cc.delayTime(8),
            cc.callFunc(function(){
                self.gameOver();
                self.node_fuhuo.active = false;
            })
        );
        var seq3 = cc.sequence(
            cc.delayTime(2),
            cc.callFunc(function(){
                self.node_fuhuo_skip.active = true;
            })
        );
        self.node_fuhuo_circle.runAction(cc.repeat(seq,80));
        self.node_fuhuo_circle.runAction(seq2);
        self.node_fuhuo_circle.runAction(seq3);
    },

    fuhuo: function()
    {
        var self = this;

        self.node_fuhuo_circle.stopAllActions();
        this.GAME.state = "START";

        self.node_game_ui.active = true;
        self.node_fuhuo.active = false;
        self.GAME.playerHp = 1;
        self.rPlayGameTime = 1;
        self.GAME.playerfuhuo = false;

        var cardnum = cc.sys.localStorage.getItem("cardnum");
        cc.sys.localStorage.setItem("cardnum",(cardnum-1));
    },

    fuhuo2: function()
    {
        var self = this;

        self.node_fuhuo_circle.stopAllActions();
        this.GAME.state = "START";

        self.node_game_ui.active = true;
        self.node_fuhuo.active = false;
        self.GAME.playerHp = 1;
        self.rPlayGameTime = 1;
        self.GAME.playerfuhuo = false;
    },

    skip: function()
    {
        var self = this;

        self.node_fuhuo_circle.stopAllActions();
        self.node_fuhuo.active = false;
        self.gameOver();
    },

    playerHurt: function(hp)
    {
        if(this.GAME.state != "OVER")
        {
            this.GAME.playerHp = this.GAME.playerHp - hp;
        }
    },

    CreateBaoZha: function()
    {
        var self = this;

        var baozha = self.other.getChildByTag(10);
        if(baozha)
            baozha.destroy();

        var texiao = cc.instantiate(this.baoza);
        self.other.addChild(texiao,10,10);
        cc.audioEngine.play(this.audio_explosion, false, 1);
        return texiao
    },

    CheckPlaneAndZXZiDanPengZhuang: function()
    {
        var self = this;
        var s = cc.winSize;

        var childTbale = self.ZhiXianZiDanNode.children;
        var istuichu = false;
        for(var i=0;i<childTbale.length;i++)
        {
            var zidan = childTbale[i];
            //--判断导弹和飞机碰撞
            var pos = zidan.getPosition();
            var pos2 = self.ZhiXianZiDanNode.convertToWorldSpace(pos);
            pos2 = cc.pSub(pos2,cc.p(s.width/2,s.height/2));
            var length = Math.sqrt(Math.pow(pos2.x, 2) + Math.pow(pos2.y, 2));
            if(length <= 40 && self.plane.wuditime == 0)
            {
                zidan.destroy();
                istuichu = true;
                break;
            }
        }
        if(istuichu)
        {
            self.PlaneBaoZha();
            return;
        }
    },

    checkPlanePengZhuang: function()
    {
        var self = this;
        var s = cc.winSize;

        var childTbale = self.JinBiNode.children;
        for(var i=0;i<childTbale.length;i++)
        {
            var zidan = childTbale[i];
            //--判断导弹和飞机碰撞
            var pos = zidan.getPosition();
            var pos2 = self.JinBiNode.convertToWorldSpace(pos);
            pos2 = cc.pSub(pos2,cc.p(s.width/2,s.height/2));
            var length = Math.sqrt(Math.pow(pos2.x, 2) + Math.pow(pos2.y, 2));
            if(length <= 45)
            {
                //--吃掉金币
                zidan.destroy();
                self.IconCount = self.IconCount - 1;
                self.playerBingGo(10);
                break;
            }
        }

        var childTbale2 = self.BaoHuIconNode.children;
        for(var i=0;i<childTbale2.length;i++)
        {
            var zidan = childTbale2[i];
            //--判断导弹和飞机碰撞
            var pos = zidan.getPosition();
            var pos2 = self.BaoHuIconNode.convertToWorldSpace(pos);
            pos2 = cc.pSub(pos2,cc.p(s.width/2,s.height/2));
            var length = Math.sqrt(Math.pow(pos2.x, 2) + Math.pow(pos2.y, 2));
            if(length <= 45)
            {
                //--吃掉保护罩
                zidan.destroy();
                //--给飞机添加保护图片
                self.plane.isbaohu = true;
                var baohu = cc.instantiate(this.BaoHu);
                baohu.position = cc.v2(self.dsize.width/2,self.dsize.height/2);
                self.other.addChild(baohu,11,11);
                break;
            }
        }

    },

    checkZiDanPengZhuang: function()
    {
        var self = this;
        var s = cc.winSize;

        var childTbale = self.ZiDanNode.children;
        var zidanpengzhuang = false;
        //--判断导弹与导弹的碰撞
        for(var i=0;i<childTbale.length;i++)
        {
            var zidan = childTbale[i];
            var pos = zidan.position;
            for(var j=0;j<childTbale.length;j++)
            {
                var zidan2 = childTbale[j];
                if(zidan != zidan2)
                {
                    var pos2 = cc.pSub(zidan2.position,pos);
                    var length = Math.sqrt(Math.pow(pos2.x, 2) + Math.pow(pos2.y, 2));
                    if(length <= 27)
                    {
                        zidanpengzhuang = true;
                        zidan2.destroy();
                        break;
                    }
                }
            }
            if(zidanpengzhuang)
            {
                var baozha = self.CreateBaoZha();
                var pos = zidan.getPosition();
                pos = self.ZiDanNode.convertToWorldSpace(pos);
                var h = (self.dsize.height - s.height)/2;
                pos.y += h;
                baozha.setPosition(pos);
                zidan.destroy();
                break;
            }
        }

        zidanpengzhuang = false;
        //--判断导弹与导弹的碰撞
        var childTbale1 = self.ZiDanNode.children;
        var childTbale2 = self.ZhiXianZiDanNode.children;
        for(var i=0;i<childTbale1.length;i++)
        {
            var zidan = childTbale1[i];
            var pos = zidan.position;
            for(var j=0;j<childTbale2.length;j++)
            {
                var zidan2 = childTbale2[j];
                var pos2 = cc.pSub(zidan2.position,pos);
                var length = Math.sqrt(Math.pow(pos2.x, 2) + Math.pow(pos2.y, 2));
                if(length <= 27)
                {
                    zidanpengzhuang = true;
                    zidan2.destroy();
                    break;
                }
            }
            if(zidanpengzhuang)
            {
                var baozha = self.CreateBaoZha();
                var pos = zidan.getPosition();
                pos = self.ZhiXianZiDanNode.convertToWorldSpace(pos);
                var h = (self.dsize.height - s.height)/2;
                pos.y += h;
                baozha.setPosition(pos);
                zidan.destroy();
                break;
            }
        }
    },

    checkZhiXianZiDanPengZhuang: function()
    {
        var self = this;
        var s = cc.winSize;

        var childTbale = self.ZhiXianZiDanNode.children;
        var zidanpengzhuang = false;
        //--判断导弹与导弹的碰撞
        for(var i=0;i<childTbale.length;i++)
        {
            var zidan = childTbale[i];
            var pos = zidan.position;
            for(var j=0;j<childTbale.length;j++)
            {
                var zidan2 = childTbale[j];
                if(zidan != zidan2)
                {
                    var pos2 = cc.pSub(zidan2.position,pos);
                    var length = Math.sqrt(Math.pow(pos2.x, 2) + Math.pow(pos2.y, 2));
                    if(length <= 27)
                    {
                        zidanpengzhuang = true;
                        zidan2.destroy();
                        break;
                    }
                }
            }
            if(zidanpengzhuang)
            {
                var baozha = self.CreateBaoZha();
                var pos = self.ZhiXianZiDanNode.convertToWorldSpace(zidan.position);
                var h = (self.dsize.height - s.height)/2;
                pos.y += h;
                baozha.setPosition(pos);
                zidan.destroy();
                break;
            }
        }
    },

    CreateYan: function()
    {
        var yan = cc.instantiate(this.yan);
        yan.scale = 0.4;
        var rotate = Math.floor(Math.random()*360+1);
        yan.rotation = rotate;
        return yan;
    },

    playerBingGo: function(score)
    {
        this.GAME.score = this.GAME.score + score*this.GAME.sBase;
        this.node_game_score.getComponent("cc.Label").string =  this.GAME.score+"";
        if(score == 10)
        cc.audioEngine.play(this.audio_getstar, false, 1);
    },

    gameOver: function()
    {
        this.GAME.state = "OVER";
        this.node_over.active = true;
        this.node_game_ui.active = false;

        this.node_over_score.getComponent("cc.Label").string = Math.floor(this.GAME.score)+"";
        this.node_over_chaoguo.getComponent("cc.Label").string = "超过全国"+this.getChaoyue()+"的用户";

        var currscore = cc.sys.localStorage.getItem("highscore");
        if(Math.floor(this.GAME.score) > currscore)
            cc.sys.localStorage.setItem("highscore",Math.floor(this.GAME.score));

        this.wxOverRank(Math.floor(this.GAME.score));
    },

    getChaoyue: function()
    {
        if(this.GAME.score < 99)
        {
            return "9%";
        }
        else if(this.GAME.score < 200 && this.GAME.score >= 100)
        {
            return "12%";
        }
        else if(this.GAME.score < 300 && this.GAME.score >= 200)
        {
            return "18%";
        }
        else if(this.GAME.score < 400 && this.GAME.score >= 300)
        {
            return "32%";
        }
        else if(this.GAME.score < 500 && this.GAME.score >= 400)
        {
            return "45%";
        }
        else if(this.GAME.score < 600 && this.GAME.score >= 500)
        {
            return "66%";
        }
        else if(this.GAME.score < 700 && this.GAME.score >= 600)
        {
            return "72%";
        }
        else if(this.GAME.score < 800 && this.GAME.score >= 700)
        {
            return "81%";
        }
        else if(this.GAME.score < 1000 && this.GAME.score >= 800)
        {
            return "86%";
        }
        else if(this.GAME.score < 1500 && this.GAME.score >= 1000)
        {
            return "90%";
        }
        else if(this.GAME.score < 2000 && this.GAME.score >= 1500)
        {
            return "95%";
        }
        else if(this.GAME.score >= 2000)
        {
            return "99%";
        }
    },

    pGetAngle: function(self,other)
    {
        var a2 = cc.pNormalize(self);
        var b2 = cc.pNormalize(other);
        var angle = Math.atan2(cc.pCross(a2, b2), cc.pDot(a2, b2) );
        //if(Math.abs(angle) < 0.0000001192092896);
        //    return 0.0;
        return angle;
    },

    update: function(dt)
    {
        var self = this;
        if((self.GAME.state == "START" || self.GAME.state == "MAIN") && dt > 0)
        {
            self.GamePlayTime = self.GamePlayTime + dt;
            self.rPlayGameTime = self.rPlayGameTime - dt;
            if(self.rPlayGameTime <= 0)
            {
                self.rPlayGameTime = 100000;
                self.rePlayGame();
            }

            if(self.GAME.state == "START")
            {
                self.time_score += dt;
                if(self.time_score>1)
                {
                    self.time_score = self.time_score-1;
                    self.playerBingGo(1);
                }
            }

            if(self.planeIsMove)
            {
                self.yunNode2.begainTime = self.yunNode2.begainTime - dt;
                if(self.yunNode2.begainTime <= 0)
                {
                    self.CreateSuiJiYun();
                    self.yunNode2.begainTime = 2;
                }
                if(self.IconCount == 0 && self.GAME.state == "START")
                {
                    self.CreateIcon();
                }
                if(self.GAME.state == "START")
                {
                    self.ShowBaoHuTiShi();
                    self.ShowJinBiTiShi();
                }

                self.GameTime = self.GameTime + dt;
                self.DaoDanShowTime = self.DaoDanShowTime + dt;
                self.curGameRunTime = self.curGameRunTime + dt;
                if(self.curGameRunTime >= self.curInfo.Time)
                {
                    self.curGameRunTime = 0;
                    self.curLevelIndex = self.curLevelIndex + 1;
                    if(self.curLevelIndex >= self.GAME.Config.LevelInfo.length)
                    {
                        self.curLevelIndex = self.curLevelIndex - 1;
                    }
                    self.curInfo = self.GAME.Config.LevelInfo[self.curLevelIndex];
                }

                if(self.DaoDanShowTime >= self.curInfo.DaoDanShowTime)
                {
                    self.DaoDanShowTime = 0;
                    self.CreateZiDan();
                }

                if(self.curDaoDanIndex < self.GAME.Config.DaoDanShowTime && self.GAME.state == "START")
                {
                    var showtime = self.GAME.Config.DaoDanShowTime[self.curDaoDanIndex];
                    if(self.GameTime >= showtime)
                    {
                        self.GameTime = 0;
                        self.CreateZhiXianDaoDan();
                        self.curDaoDanIndex = self.curDaoDanIndex + 1;
                    }
                }

                if(self.openRotation)
                {
                    if(self.GAME.state != "MAIN")
                        self.joystick.position = self.joyNewPos;

                    var hudu = self.pGetAngle(self.planeChaoXiang,self.joyChaoXiang);
                    var jiaodu = 180/Math.PI*hudu;
                    if(jiaodu < -0.5 || jiaodu > 0.5)
                    {
                        if(Math.abs(jiaodu) > self.curInfo.PlaneRotation * dt)
                        {
                            if(jiaodu < 0)
                            {
                                jiaodu = - self.curInfo.PlaneRotation * dt;
                            }
                            else
                            {
                                jiaodu = self.curInfo.PlaneRotation * dt;
                            }
                        }
                        self.planeChaoXiang = cc.pRotateByAngle(self.planeChaoXiang,cc.v2(0,0),jiaodu);
                        var hudu2 = self.pGetAngle(self.planeChaoXiang,self.joyChaoXiang);
                        var jiaodu2 = 180/Math.PI*hudu2;
                        if((jiaodu < 0 && jiaodu2 > 0) || (jiaodu > 0 && jiaodu2 < 0))
                        {
                            self.planeChaoXiang = self.joyChaoXiang;
                        }
                    }
                    else
                    {
                        self.planeChaoXiang = self.joyChaoXiang;
                    }

                }

                self.planeChaoXiang = cc.pNormalize(self.planeChaoXiang);
                self.planeChaoXiang.x = self.planeChaoXiang.x * (self.curInfo.PlaneSpeed *dt);
                self.planeChaoXiang.y = self.planeChaoXiang.y * (self.curInfo.PlaneSpeed *dt);
                self.updatePlaneRotation();
                var posx = self.yunNode.position.x;
                var posy = self.yunNode.position.y;
                var pos1 = cc.p(posx,posy);
                self.yunNode.position = cc.pSub(pos1,self.planeChaoXiang);

            }

            //if(self.GAME.state == "MAIN")
            //{
            //    self.GAME.maindt = self.GAME.maindt+dt;
            //    if(self.GAME.maindt>3)
            //    {
            //        self.GAME.maindt = 0;
            //        self.joyChaoXiang.x = Math.random()*2-1;
            //        self.joyChaoXiang.y = Math.random()*2-1;
            //        self.openRotation = true;
            //    }
            //}

            var planeChaoXiang2 = cc.pNormalize(self.planeChaoXiang);
            if(self.planeIsMove)
            {
                planeChaoXiang2.x = -planeChaoXiang2.x * (self.plane.height/2);
                planeChaoXiang2.y = -planeChaoXiang2.y * (self.plane.height/2);
            }

            var childTbale = self.ZiDanNode.children;
            for(var i=0;i<childTbale.length;i++)
            {
                var zidan = childTbale[i];
                var info = zidan.info;
                var zidanposx = zidan.position.x;
                var zidanposy = zidan.position.y;
                zidan.liveTime = zidan.liveTime - dt;
                var zidanpos = cc.p(planeChaoXiang2.x-zidanposx,planeChaoXiang2.y-zidanposy);
                if(!self.planeIsMove)
                {
                    zidanpos = zidan.ZiDanChaoXiang;
                }
                var zidanhudu = self.pGetAngle(zidan.ZiDanChaoXiang,zidanpos);
                var zidanjiaodu = 180/Math.PI*zidanhudu;
                if(zidanjiaodu < -0.5 || zidanjiaodu > 0.5)
                {
                    if(Math.abs(zidanjiaodu) > info.DaoDanRotation * dt)
                    {
                        if(zidanjiaodu < 0)
                        {
                            zidanjiaodu = - info.DaoDanRotation * dt;
                        }
                        else
                        {
                            zidanjiaodu = info.DaoDanRotation * dt;
                        }
                    }
                    zidan.ZiDanChaoXiang = cc.pRotateByAngle(zidan.ZiDanChaoXiang,cc.p(0,0),zidanjiaodu);
                    var zidanhudu2 = self.pGetAngle(zidan.ZiDanChaoXiang,zidanpos);
                    var zidanjiaodu2 = 180/Math.PI*zidanhudu2;
                    if((zidanjiaodu < 0 && zidanjiaodu2 > 0) || (zidanjiaodu > 0 && zidanjiaodu2 < 0))
                    {
                        zidan.ZiDanChaoXiang = zidanpos;
                    }
                }
                else
                {
                    zidan.ZiDanChaoXiang = zidanpos;
                }
                zidan.ZiDanChaoXiang = cc.pNormalize(zidan.ZiDanChaoXiang);

                zidan.ZiDanChaoXiang.x = zidan.ZiDanChaoXiang.x * (info.DaoDanSpeed *dt);
                zidan.ZiDanChaoXiang.y = zidan.ZiDanChaoXiang.y * (info.DaoDanSpeed *dt);

                var hudu2 = self.pGetAngle(zidan.ZiDanChaoXiang,cc.p(-1,0));
                var jiaodu2 = 180/Math.PI*hudu2;
                zidan.rotation = jiaodu2;
                var plane = cc.p(-self.planeChaoXiang.x,-self.planeChaoXiang.y);
                plane = cc.pNormalize(plane);
                plane.x = plane.x * (self.curInfo.PlaneSpeed *dt);
                plane.y = plane.y * (self.curInfo.PlaneSpeed *dt);

                if(self.planeIsMove)
                {
                    plane = cc.pAdd(zidan.ZiDanChaoXiang,plane);
                }
                else
                {
                    plane = zidan.ZiDanChaoXiang;
                }

                var zidanpos2 = cc.p(-zidanposx,-zidanposy);
                var pos3 = cc.pSub(plane,zidanpos2);
                zidan.showYunLength = zidan.showYunLength - cc.pLength(plane);
                zidan.position = pos3;

                if(zidan.liveTime <= 0 && !zidan.willremove)
                {
                    zidan.willremove = true;
                    zidan.runAction(cc.sequence(
                        cc.fadeOut(0.5),
                        cc.removeSelf()
                    ));
                }
                if(zidan.showYunLength <= 0)
                {
                    zidan.showYunLength = 30;
                    var yun = self.CreateYan();
                    self.yunNode.addChild(yun,2);
                    var posword = self.ZiDanNode.convertToWorldSpace(pos3);
                    var yunnode = self.yunNode.convertToNodeSpace(posword);
                    yun.setPosition(yunnode);
                    yun.runAction(cc.sequence(
                        cc.delayTime(3.0),
                        cc.fadeOut(0.5),
                        cc.removeSelf()
                    ));
                }
            }

            //--直线子弹飞
            var childTbale2 = self.ZhiXianZiDanNode.children;
            for(var i=0;i<childTbale2.length;i++)
            {
                var zidan = childTbale2[i];
                var info = zidan.info;

                zidan.ZiDanChaoXiang = cc.pNormalize(zidan.ZiDanChaoXiang);

                zidan.ZiDanChaoXiang.x = zidan.ZiDanChaoXiang.x * (info.DaoDanSpeed *dt);
                zidan.ZiDanChaoXiang.y = zidan.ZiDanChaoXiang.y * (info.DaoDanSpeed *dt);
                //--设置位置
                var posx = zidan.getPosition().x;
                var posy = zidan.getPosition().y;
                var pos1 = cc.p(posx,posy);
                var pos3 = cc.pAdd(pos1,zidan.ZiDanChaoXiang);
                zidan.setPosition(pos3);
                //--计算飞行距离
                var length = info.DaoDanSpeed *dt;

                zidan.showYunLength = zidan.showYunLength - length
                if(zidan.showYunLength <= 0)
                {
                    zidan.showYunLength = 30;
                    var yun = self.CreateYan();
                    self.yunNode.addChild(yun,2);
                    var posword = self.ZhiXianZiDanNode.convertToWorldSpace(pos3);
                    var yunnode = self.yunNode.convertToNodeSpace(posword);
                    yun.setPosition(yunnode);
                    yun.runAction(cc.sequence(
                        cc.delayTime(3.0),
                        cc.fadeOut(0.5),
                        cc.callFunc(function()
                            {
                                yun.destroy();
                            }
                        )));
                }
            }
            if(self.GAME.state == "START")
            {
                if(self.planeIsMove)
                {
                    //--碰撞检测
                    self.CheckPlaneAndZiDanPengZhuang();
                    self.CheckPlaneAndZXZiDanPengZhuang();

                    self.checkPlanePengZhuang();
                }
                self.checkZiDanPengZhuang();
                self.checkZhiXianZiDanPengZhuang();

                this.uploadScoreDt += dt;
                if(this.uploadScoreDt > 5)
                {
                    this.uploadScoreDt = 0;
                    this.wxUploadScore(Math.floor(this.GAME.score));
                }
            }

        }
        this.subdt += dt;
        var timeinv = 0.2;
        if(self.GAME.state != "START")
            timeinv = 0.06;
        if(this.subdt > timeinv)
        {
            this.subdt = 0;
            this._updaetSubDomainCanvas();
        }
    }
});
