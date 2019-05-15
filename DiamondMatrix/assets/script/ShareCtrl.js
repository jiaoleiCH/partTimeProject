
cc.Class({
    extends: cc.Component,

    properties: {
        parentNode : cc.Node,
        shareContent : cc.Label,
        shareCountLab : cc.Label,
        gameNode : cc.Node,
        againBtn : cc.Node,
    },

    init () {
        this.node.on('click',this.shareEvent,this);
        this.initData();
        this.updateShareData();
        this.updateShareDes();
    },

    initData () {
        this._gameCtrl = this.gameNode.getComponent('GameCtrl');
        this._overGame = this.parentNode.getComponent('OverGame');
        this.shareContentLab = '';
    },

    updateShareData () {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            if (VDData.businessConfig.shareType == 1 || VDData.businessConfig.shareType == null) {
                this.shareContent.string = "双倍分数";
                this.shareContentLab = "翻倍";
            } else if (VDData.businessConfig.shareType == 2) {
                this.shareContent.string = "分享复活";
                this.shareContentLab = "复活";
            } else if (VDData.businessConfig.shareType == 3) {
                this.shareContent.string = "加兑换次数";
                this.shareContentLab = "兑换次数";
            }
            this.shareCountLab.string = "(今日还可分享" + this.shareContentLab + ((VDData.businessConfig.shareCount != null ? VDData.businessConfig.shareCount : 1) - VDData.shareCounts) +"次)";
            if (VDData.businessConfig.shareFlag == "2" || !VDData.clienConfig.share) {
                this.node.active = false;
                this.againBtn.x = 0;
            } else {
                this.node.active = true;
                this.againBtn.x = -127;
            }
        } else {
            this.shareContent.active = false;
        }
        
    },

    shareEvent () {
        // this.relife();
        let title = VDData.businessConfig.shareTitle ? VDData.businessConfig.shareTitle : "玩游戏做钻石王老五";
        let paramList = "";
        let imageUrl = VDData.businessConfig.shareImgUrl ? VDData.businessConfig.shareImgUrl : "share1.jpg";
        let success = () => {
            //Todo 按照分享类型响应事件
            VDIsShare = true;
            if(VDData.shareCounts < (VDData.businessConfig.shareCount == null ? 1 : VDData.businessConfig.shareCount)){
                this.shareSuccessEvent();
            }
            this.rSendShare(()=>{
                this.updateShareDes();
            });
        }
        
        if (VDIsShare && VDData.shareCounts < (VDData.businessConfig.shareCount == null ? 1 : VDData.businessConfig.shareCount)) {
            if (cc.sys.platform == cc.sys.WECHAT_GAME) {
                VDWeChat.showTips("每局只可分享一次!");
            }
            return;
        }
        VDWeChat.share(title, paramList, imageUrl, success);
    },

    shareSuccessEvent () {
        //1 : 双倍分数 2 : 分享复活 3 : 增加兑换次数
        VDData.businessConfig.shareType == null ? VDData.businessConfig.shareType = 1 : VDData.businessConfig.shareType;
        switch (parseInt(VDData.businessConfig.shareType)) {
            case 1 : 
                VDGameScore = VDGameScore * 2;
                //刷新分数
                this._gameCtrl.setScore();
                this._overGame.setFinishScore(VDGameScore);
                break;
            case 2 :
                this.relife();
                break; 
            case 3 :

                break; 
            default :

                break;
        }
        
    },

    relife () {
        this.parentNode.active = false;
        this.resetData();
        this._gameCtrl.setGameTime();
        // this._gameCtrl.setAchiveNum(0);
        this._gameCtrl.setBeganGame(true);
        // this._gameCtrl.init();
    },

    resetData () {
        GameTime = 120;
        GameOver = false;
    },

    
    rSendShare(callback) {
        if (VDData.shareCounts >= (VDData.businessConfig.shareCount == null ? 1 : VDData.businessConfig.shareCount)) return;
        let data = {
            sign : VDData.sign,
            shareType : VDData.businessConfig.shareType != null ? VDData.businessConfig.shareType : 1,
            addConversionNum : VDData.businessConfig.addExchangeCounts != null ? VDData.businessConfig.addExchangeCounts : 1,
            shareNum : VDData.shareCounts + 1,
            conversionNum : VDData.businessConfig.exchangeCounts == null ? 1 : VDData.businessConfig.exchangeCounts
        }
        VDMSG.sendMsg(VDMSG_MAP.shareScheme, data, () => {
            callback ? callback() : null;
        })
    },

    updateShareDes () {
        this.shareCountLab.string = "(今日还可分享" + this.shareContentLab +((VDData.businessConfig.shareCount != null ? VDData.businessConfig.shareCount : 1) - VDData.shareCounts) +"次)";
        this.parentNode.getComponent('OverGame').setConvertNum();
    },


});
