
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

    shareEvent () {
        let title = "玩游戏做钻石王老五";
        let paramList = "";
        let imageUrl =  "share.png";
        let success = () => {
            //Todo 按照分享类型响应事件
            VDIsShare = true;
            if(!VDIsShare){
                VDGameScore = VDGameScore * 2;
                //刷新分数
                this._gameCtrl.setScore();
                this._overGame.setFinishScore(VDGameScore);        
            }
            
        }
        
        
        VDWeChat.share(title, paramList, imageUrl, success);
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
        GameTime = 20;
        GameOver = false;
    },


});
