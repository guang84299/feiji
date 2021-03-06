

cc.Class({
    extends: cc.Component,

    properties: {
        paimingItem: {
            default: null,
            type: cc.Prefab
        },
        chaoyueItem: {
            default: null,
            type: cc.Prefab
        }

    },


    onLoad: function()
    {
        this.dsize = cc.view.getDesignResolutionSize();
        this.initUI();
        this.adapt();

        this.kvdata = {
            wxgame:
            {
                score: 0,
                update_time: 0
            },
            card: 0
        };
        this.userInfo = null;
        this.friendRank = null;
        this.chaoyueData = [];
        var self = this;


        wx.onMessage(function(data){
            if(data.message == "closeOver")
            {
                self.node_over.active = false;
            }
            else if(data.message == "closeRank")
            {
                self.node_paiming.active = false;
            }
            else if(data.message == "friendRank"){ //好友排行榜
                self.showPaiming();
            }
            else if(data.message == "overRank"){ //3人排行榜
                self.uploadScore(data.score);
                self.showOverRank();
                self.chaoyueData = [];
            }
            else if(data.message == "loginSuccess")
            {
                self.userInfo = data.userInfo;
                self.getUserRank();
                self.getFriendRank();
            }
            else if(data.message == "updateScore")
            {
                self.updateScore(data.score);
            }
            cc.log(data.message);
        });
    },



    adapt: function()
    {

        var nodes = [this.node_over];
        for(var i=0;i<nodes.length;i++)
        {
            cc.log(nodes[i]);
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

    initUI: function()
    {
        var self = this;
        self.node_over = cc.find("Canvas/node_over");
        self.node_over_box1 = cc.find("paiming/box1",self.node_over);
        self.node_over_box2 = cc.find("paiming/box2",self.node_over);
        self.node_over_box3 = cc.find("paiming/box3",self.node_over);

        self.node_paiming = cc.find("Canvas/node_paiming");
        self.node_paiming_content = cc.find("scroll/view/content",self.node_paiming);
        self.node_paiming_num = cc.find("item/num",self.node_paiming);
        self.node_paiming_icon = cc.find("item/icon",self.node_paiming);
        self.node_paiming_nick = cc.find("item/nick",self.node_paiming);
        self.node_paiming_score = cc.find("item/score",self.node_paiming);

        self.node_chaoyue = cc.find("Canvas/node_chaoyue");
    },


    click: function(event,data)
    {
         if(data == "close")
        {
            this.node_paiming.active = false;
        }

        cc.log(data);
    },

    existChaoYue: function(data)
    {
        for(var i=0;i<this.chaoyueData.length;i++)
        {
            var data2 = this.chaoyueData[i];
            if(data.nickname == data2.nickname &&
                data.avatarUrl == data2.avatarUrl)
            {
                return true;
            }
        }
        return false;
    },

    updateScore: function(score)
    {
        if(this.friendRank && this.userInfo)
        {
            var chaoyue = null;
            for(var i=this.friendRank.length-1;i>=0;i--)
            {
                var data = this.friendRank[i];
                if(data.nickname != this.userInfo.nickName &&
                    data.avatarUrl != this.userInfo.avatarUrl && !this.existChaoYue(data))
                {
                    var feiji_rank = data.KVDataList[0].value;
                    var rank  = JSON.parse(feiji_rank);
                    if(score > rank.wxgame.score)
                    {
                        chaoyue = data;
                        break;
                    }
                }
            }
            if(chaoyue)
            {
                this.chaoyueData.push(chaoyue);

                var item = cc.instantiate(this.chaoyueItem);
                var icon = cc.find("icon",item);
                var nick = cc.find("nike",item);

                this.loadPic(icon,chaoyue.avatarUrl);
                nick.getComponent("cc.Label").string = "超越"+chaoyue.nickname;

                this.node_chaoyue.addChild(item);


                var seq = cc.sequence(
                    cc.fadeOut(0),
                    cc.moveTo(0,cc.v2(20,this.dsize.height*0.7)),
                    cc.spawn(
                        cc.fadeIn(0.5),
                        cc.moveTo(0.5,cc.v2(20,this.dsize.height*0.75)).easing(cc.easeSineIn())
                    ),
                    cc.delayTime(2),
                    cc.spawn(
                        cc.fadeOut(0.5),
                        cc.moveTo(0.5,cc.v2(20,this.dsize.height*0.8)).easing(cc.easeSineOut())
                    ),
                    cc.removeSelf()
                );

                item.runAction(seq);

                this.uploadScore(score);
            }
        }
    },

    showOverRank: function()
    {
        var self = this;
        this.getFriendRank(function(){
            self.showOverRank2();
        });
    },

    showOverRank2: function()
    {
        this.node_over.active = true;
        this.node_over_box1.active = false;
        this.node_over_box2.active = false;
        this.node_over_box3.active = false;

        if(this.friendRank && this.userInfo)
        {
            //找到最近3个
            var list = [];
            for(var i=0;i<this.friendRank.length;i++)
            {
                var data = this.friendRank[i];
                if(data.nickname == this.userInfo.nickName &&
                    data.avatarUrl == this.userInfo.avatarUrl)
                {
                    var sdata = data;
                    sdata.num = i+1;
                    sdata.isself = true;
                    list.push(sdata);
                    if(i != 0)
                    {
                        if(i == this.friendRank.length-1)
                        {
                            if(this.friendRank.length >= 3)
                            {
                                var data2 = this.friendRank[i-1];
                                var sdata2 = data2;
                                sdata2.num = i;
                                sdata2.isself = false;
                                list.unshift(sdata2);

                                var data3 = this.friendRank[i-2];
                                var sdata3 = data3;
                                sdata3.num = i-1;
                                sdata3.isself = false;
                                list.unshift(sdata3);
                            }
                            else
                            {
                                var data2 = this.friendRank[i-1];
                                var sdata2 = data2;
                                sdata2.num = i;
                                sdata2.isself = false;
                                list.unshift(sdata2);
                            }
                        }
                        else
                        {
                            var data2 = this.friendRank[i-1];
                            var sdata2 = data2;
                            sdata2.num = i;
                            sdata2.isself = false;
                            list.unshift(sdata2);

                            if(i != this.friendRank.length-1)
                            {
                                var data3 = this.friendRank[i+1];
                                var sdata3 = data3;
                                sdata3.num = i+2;
                                sdata3.isself = false;
                                list.push(sdata3);
                            }
                        }
                    }
                    else
                    {
                        if(this.friendRank.length>=3)
                        {
                            var data2 = this.friendRank[i+1];
                            var sdata2 = data2;
                            sdata2.num = i+2;
                            sdata2.isself = false;
                            list.push(sdata2);
                            var data3 = this.friendRank[i+2];
                            var sdata3 = data3;
                            sdata3.num = i+3;
                            sdata3.isself = false;
                            list.push(sdata3);
                        }
                        else if(this.friendRank.length>=2)
                        {
                            var data2 = this.friendRank[i+1];
                            var sdata2 = data2;
                            sdata2.num = i+2;
                            sdata2.isself = false;
                            list.push(sdata2);
                        }
                    }
                    break;
                }
            }
            if(list.length > 0)
            {
                this.node_over_box1.active = true;
                var num = cc.find("num",this.node_over_box1);
                var icon = cc.find("icon",this.node_over_box1);
                var nick = cc.find("nike",this.node_over_box1);
                var score = cc.find("score",this.node_over_box1);

                var data = list[0];
                var feiji_rank = data.KVDataList[0].value;
                var rank  = JSON.parse(feiji_rank);

                if(data.isself)
                {
                    num.color = cc.color(0,255,0,255);
                    nick.color = cc.color(0,255,0,255);
                    score.color = cc.color(0,255,0,255);
                }
                else
                {
                    num.color = cc.color(255,255,255,255);
                    nick.color = cc.color(255,255,255,255);
                    score.color = cc.color(255,255,255,255);
                }


                num.getComponent("cc.Label").string = data.num+"";
                this.loadPic(icon,data.avatarUrl);
                nick.getComponent("cc.Label").string = data.nickname;
                score.getComponent("cc.Label").string = rank.wxgame.score+"";
            }

            if(list.length > 1)
            {
                this.node_over_box2.active = true;
                var num = cc.find("num",this.node_over_box2);
                var icon = cc.find("icon",this.node_over_box2);
                var nick = cc.find("nike",this.node_over_box2);
                var score = cc.find("score",this.node_over_box2);

                var data = list[1];
                var feiji_rank = data.KVDataList[0].value;
                var rank  = JSON.parse(feiji_rank);

                if(data.isself)
                {
                    num.color = cc.color(0,255,0,255);
                    nick.color = cc.color(0,255,0,255);
                    score.color = cc.color(0,255,0,255);
                }
                else
                {
                    num.color = cc.color(255,255,255,255);
                    nick.color = cc.color(255,255,255,255);
                    score.color = cc.color(255,255,255,255);
                }


                num.getComponent("cc.Label").string = data.num+"";
                this.loadPic(icon,data.avatarUrl);
                nick.getComponent("cc.Label").string = data.nickname;
                score.getComponent("cc.Label").string = rank.wxgame.score+"";
            }

            if(list.length > 2)
            {
                this.node_over_box3.active = true;
                var num = cc.find("num",this.node_over_box3);
                var icon = cc.find("icon",this.node_over_box3);
                var nick = cc.find("nike",this.node_over_box3);
                var score = cc.find("score",this.node_over_box3);

                var data = list[2];
                var feiji_rank = data.KVDataList[0].value;
                var rank  = JSON.parse(feiji_rank);

                if(data.isself)
                {
                    num.color = cc.color(0,255,0,255);
                    nick.color = cc.color(0,255,0,255);
                    score.color = cc.color(0,255,0,255);
                }
                else
                {
                    num.color = cc.color(255,255,255,255);
                    nick.color = cc.color(255,255,255,255);
                    score.color = cc.color(255,255,255,255);
                }


                num.getComponent("cc.Label").string = data.num+"";
                this.loadPic(icon,data.avatarUrl);
                nick.getComponent("cc.Label").string = data.nickname;
                score.getComponent("cc.Label").string = rank.wxgame.score+"";
            }

        }
    },

    loadPic: function(sp,url)
    {
        cc.loader.load({url: url, type: 'png'}, function (err, tex) {
            if(err)
            {
                cc.log(err);
            }
            else
            {
                var spriteFrame = new cc.SpriteFrame(tex);
                sp.getComponent("cc.Sprite").spriteFrame = spriteFrame;
            }
        });
    },


    showPaiming: function()
    {
        var self = this;
        this.node_paiming.active = true;
        this.node_paiming_content.removeAllChildren();
        var selfrank = null;
        if(this.friendRank && this.userInfo)
        {
            for(var i=0;i<this.friendRank.length;i++)
            {
                var data = this.friendRank[i];
                var feiji_rank = data.KVDataList[0].value;
                var rank  = JSON.parse(feiji_rank);

                var item = cc.instantiate(this.paimingItem);
                var num = cc.find("num",item);
                var icon = cc.find("icon",item);
                var nick = cc.find("nick",item);
                var score = cc.find("score",item);

                num.getComponent("cc.Label").string = (i+1)+"";
                this.loadPic(icon,data.avatarUrl);
                nick.getComponent("cc.Label").string = data.nickname;
                score.getComponent("cc.Label").string = rank.wxgame.score+"";

                if(data.nickname == this.userInfo.nickName &&
                    data.avatarUrl == this.userInfo.avatarUrl)
                {
                    num.color = cc.color(0,255,0,255);
                    nick.color = cc.color(0,255,0,255);
                    score.color = cc.color(0,255,0,255);
                    selfrank = data;
                    selfrank.num = (i+1);
                }

                this.node_paiming_content.addChild(item);
            }
            if(selfrank)
            {
                var feiji_rank = selfrank.KVDataList[0].value;
                var rank  = JSON.parse(feiji_rank);

                this.node_paiming_num.getComponent("cc.Label").string = selfrank.num+"";
                this.loadPic(self.node_paiming_icon,selfrank.avatarUrl);
                this.node_paiming_nick.getComponent("cc.Label").string = selfrank.nickname;
                this.node_paiming_score.getComponent("cc.Label").string = rank.wxgame.score+"";
            }

        }

    },

    getUserRank: function()
    {
        var self = this;
        wx.getUserCloudStorage({
            keyList:["feiji_rank"],
            success: function(res)
            {
                cc.log(res);
                if(res.KVDataList.length == 0)
                {
                    self.setUserRank(0,new Date().getTime(),0);
                }
                else
                {
                    var feiji_rank = res.KVDataList[0].value;
                    self.kvdata = JSON.parse(feiji_rank);
                    cc.log(self.kvdata);
                }
            }
        });
    },

    uploadScore: function(score)
    {
        if(this.kvdata)
        {
            if(score > this.kvdata.wxgame.score)
            {
                this.kvdata.wxgame.score = score;
                this.setUserRank(score,new Date().getTime(),this.kvdata.card);
            }
        }
        else
        {
            this.getUserRank();
        }
    },

    setUserRank: function(score,update_time,card)
    {
        var self = this;
        var data = {
            key: "feiji_rank",
            value: "{\"wxgame\":{\"score\":"+score+",\"update_time\": "+update_time+"},\"card\":"+card+"}"
        };

        var kvDataList = [data];
        wx.setUserCloudStorage({
            KVDataList: kvDataList,
            success: function(res)
            {
                self.kvdata.wxgame.score = score;
                self.getFriendRank();
                cc.log(res);
            },
            fail: function(res)
            {
                cc.log(res);
            }
        });
    },

    getFriendRank: function(callback)
    {
        var self = this;
        wx.getFriendCloudStorage({
            keyList:["feiji_rank"],
            success: function(res)
            {
                self.friendRank = res.data;
                self.sortFriendRank();
                cc.log(res);
                if(callback)
                    callback();
            }
        });
    },

    sortFriendRank: function()
    {
        if(this.friendRank)
        {
            this.friendRank.sort(function(a,b){
                var a_rank =JSON.parse(a.KVDataList[0].value);
                var AMaxScore=a_rank.wxgame.score;

                var b_rank =JSON.parse(b.KVDataList[0].value);
                var BMaxScore = b_rank.wxgame.score;

                return parseInt(BMaxScore) - parseInt(AMaxScore);
            });
        }
    }


});
