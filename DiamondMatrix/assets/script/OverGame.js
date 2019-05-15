

cc.Class({
    extends: cc.Component,

    properties: {
        scoreLab : cc.Label,
        againBtn : cc.Node,
        startGame : cc.Node,
        exChangeScoreBtn : cc.Node,
        moreGiftBtn : cc.Node,
        btnNode : cc.Node,
        shareBtn : cc.Node,
        ruleBtn : cc.Node,
        ruleNode : cc.Node,
        convertLabel : cc.Label,
        rankBtn : cc.Node,
        rankNode : cc.Node,
    },

    init (gameCtrl) {
        this.initData(gameCtrl);
        this._controlVersion();
        this.initClickEvent();
        return this;
    },

    initData (gameCtrl) {
        this._gameCtrl = gameCtrl;
        this.updateOverNodeStatus();
        this.shareBtn.getComponent('ShareCtrl').init();
        this._rankCtrl = this.rankNode.getComponent('RankCtrl').init(gameCtrl);
        this.integralList = [200,500,800,1000,999999];
        this.rewardList = [1,3,5,8,0];
        this._maxConvertCounnts = 1;
        VDData.converting = false;
        VDData.navigate = false;
        VDData.clicked = false;
    },

    _controlVersion() {
        if(cc.sys.platform == cc.sys.WECHAT_GAME) {
            if(VDData.clienConfig.moreGame){
                this.btnNode.active = true;
            }else {
                this.btnNode.active = false;
            }
        } 
    },

    initClickEvent () {
        this.againBtn.on('click',this.againGameEvent,this);
        this.exChangeScoreBtn.on('click',this.convertScore,this);
        this.moreGiftBtn.on('click',this.moreGiftEvent,this);
        this.ruleBtn.on("click",this.ruleEvent,this);
        this.rankBtn.on("click",this.rankEvent,this);
    },

    setOverVisible (f) {
        this.node.active = f;
        this.updateOverNodeStatus();
    },

    setFinishScore (s) {
        this.scoreLab.string = s;
        this._rankCtrl.submitScore(s);
        // this._rankCtrl.sendFriendMsg(s);
        // this._rankCtrl.sendWorldMsg(s);
    },

    setConvertNum () {
        this.convertLabel.node.active = true;
        this.convertLabel.string = "(今日还可兑换"+ (VDData.maxConvertCounnts - VDData.convertCounts) + "次)";
    },

    againGameEvent () {
        if(VDData.converting || VDData.navigate || VDData.clicked) return;
        // VDGameScore = 0;
        VDIsShare = false;
        AgainGame = true;
        VDWeChat.sendMessage({
            messageType: 4,
        });
        cc.director.loadScene('game');
    },

    // data : {time : "2018/12/27", counts : 0}
    updateOverNodeStatus() {
        let data = VDUtils2.getLocalData("diamond");
        let now = new Date().toLocaleDateString();
        if (!data || data.time != now) {
            // 今日第一次
            VDData.convertCounts = 0;
        } else {
            VDData.convertCounts = data.counts;
            if (VDData.convertCounts >= VDData.maxConvertCounnts) {
                // 
            }
        }
    },

    // 兑换积分按钮回调
    convertScore(event, p) {
        console.log('兑换积分按钮回调' , VDData.converting , VDData.navigate);
        if (VDData.converting || cc.sys.platform != cc.sys.WECHAT_GAME || VDData.navigate) return;
        VDData.converting = true;
        console.log('convertScore  ' , VDData.convertCounts , VDData.maxConvertCounnts);
        if (VDData.convertCounts >= VDData.maxConvertCounnts) {
            if (cc.sys.platform == cc.sys.WECHAT_GAME) {
                VDWeChat.tipsFunc = () => {
                    this.moreGameEvent();
                }
                VDWeChat.showTips("剩余兑换次数不足!!!"); 
            }
            VDData.converting = false;
        } else {
            this.rSendConvert(VDGameScore, (res) => {
                console.log('兑换完成====>  ' , VDData.convertCounts , VDData.maxConvertCounnts);
                VDUtils.setLocalData("diamond", {time : new Date().toLocaleDateString(), counts : ++VDData.convertCounts});
                this.setConvertNum();
                if (VDData.convertCounts >= VDData.maxConvertCounnts) {
                    //
                }
                this.moreGameEvent(res.data.infoMD5);
            });
        }
    },

    rSendConvert(score, callback) {
        var data = {
            sign : VDData.sign,
            score : score,
            templateId : TEMPLATE_ID,
            conversionNum : VDData.businessConfig.exchangeCounts == null ? 1 : VDData.businessConfig.exchangeCounts
        }
        VDMSG.sendMsg(VDMSG_MAP.uploadIntegral1, data, (res) => {
            callback ? callback(res) : null;
        })
    },

    /**
     * 跳转魔力橙
     */
    moreGameEvent (infoMD5) {
        VDData.navigate = true;
        VDWeChat.moreGameData.appid = MlyAppid;
        VDWeChat.moreGameData.envVersion = "release";  //trial //release
        VDWeChat.moreGameData.extraData = {"key" : infoMD5 ? infoMD5 : null}
        VDWeChat.moreGameData.success = () => {
            VDData.navigate = false;
            VDData.clicked = false;
        }
        VDWeChat.moreGameData.fail = () => {
            VDData.navigate = false;
            VDData.clicked = false;
        }
        VDWeChat.moreGame();
    },

    /**
     * 跳转拆红包
     */
    redPacketEvent (event, p) {
        if (cc.sys.platform != cc.sys.WECHAT_GAME) return;
        VDWeChat.moreGameData.appid = 'wxd3bbabae90e60577';
        VDWeChat.moreGameData.envVersion = "release";
        VDWeChat.moreGameData.success = () => {
            VDData.navigate = false;
            VDData.clicked = false;
        }
        VDWeChat.moreGameData.fail = () => {
            VDData.navigate = false;
            VDData.clicked = false;
        }
        VDWeChat.moreGame();
    },

    /**
     * 更多好礼
     */
    moreGiftEvent(event, p) {
        if (cc.sys.platform != cc.sys.WECHAT_GAME) return;
        VDWeChat.moreGameData.appid = 'wx1910479a211ce14f';
        VDWeChat.moreGameData.envVersion = "release";
        VDWeChat.moreGameData.success = () => {
            VDData.navigate = false;
            VDData.clicked = false;
        }
        VDWeChat.moreGameData.fail = () => {
            VDData.navigate = false;
            VDData.clicked = false;
        }
        VDWeChat.moreGame();
    },

    //积分兑换算法
    convert(integralList, rewardList, val){
        //如果值小于最小的值时，则奖励0
        if(val < integralList[0]){
            return 0;
        };
        //如果值大于最大的值时，则奖励最高一档
        if(val > integralList[integralList.length-1]){
            return rewardList[integralList.length-1];
        };
        var index = 0;
        for(var i=1; i<integralList.length;i++){
            if(integralList[i] > val){
                index = i-1;
                break;
            };
        };
        return rewardList[index];
    },

    ruleEvent () {
        this._gameCtrl.initRuleConfig();
        this.ruleNode.active = true;
        this.ruleNode.getChildByName('layout').on('click',()=>{
            this.ruleNode.active = false;
        },this);
    },

    rankEvent () {
        this.rankNode.active = true;
        this._rankCtrl.friendRankEvent();
    }
    

});
