
cc.Class({
    extends: cc.Component,

    properties: {
        topNode : cc.Node,
        gameBg : cc.Node,
        timeLab : cc.Label,
        scoreLab : cc.Label,
        diamondLayout : cc.Node,
        overGame : cc.Node,
        targetDiamond : cc.Sprite,
        ruleNode : cc.Node,
        ruleScroll : cc.ScrollView,
        ruleItemPre : cc.Prefab,
        perfectNode : cc.Node,
        newPlayerNode : cc.Node,
        diamondFrame : {
            default : [],
            type : cc.SpriteFrame
        }
    },

    init () {
        if(cc.sys.platform === cc.sys.WECHAT_GAME){
            wx.onHide(()=>{
                console.log('*********onHide**********');
                cc.director.pause();
            })
            wx.onShow(()=>{
                console.log('*********onShow**********');
                if(this.node){
                    // this.node.parent.getComponent(cc.AudioSource).play();
                }
                
                cc.director.resume();
                
            })
        }
        this.fixResolution();
        this.initData();
        // this.initGameRule();
        this.initGuide();
        this.initUi();
        this.initDiamond();
        this.schedule(this.timeSchedule ,1);
    },

    fixResolution () {
        let size = cc.view.getVisibleSize();
        this.gameBg.width = size.width;
        this.gameBg.height = size.height;
        if(VDAdaptionMode == 1){    //高度适配
            this.topNode.y = size.height * 0.5 - 640;
        }else{
            
        }
    },

    initData () {
        this._guideCtrl = this.newPlayerNode.getComponent('NewPlayerCtrl').init(this);
        this._guideCtrl.fixResolution();
        this._diamondNum = {raw : 4 , col : 4};
        this._gameLev = 1;
        this._isBegan = null;
        this._isShare = false;
        this._achiveNum = 0;
        this._diamondArr = ['red','red','red','red','green','green','green','green','blue','blue','blue','blue','gray','gray','gray'];
        this._arrangement = [[0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15],[0,4,8,12],[1,5,9,13],[2,6,10,14],[3,7,11,15],[0,1,4,5],[2,3,6,7],[8,9,12,13],[10,11,14,15],[5,6,9,10]];
    },

    initGuide () {
        let initGuide = VDUtils2.getLocalData('initGuide');
        // console.log('initGuide' ,initGuide);
        if(!initGuide || initGuide != 'yes'){
            VDUtils2.setLocalData('initGuide', "yes");
            this.newPlayerNode.active = true;
        }else{
            this.newPlayerNode.active = false;
            // this.initGameRule();
        }
    },

    initGameRule () {
        let isNewPlayer = VDUtils2.getLocalData('isNewPlayer');
        if(!isNewPlayer || isNewPlayer == 'yes'){
            VDUtils2.setLocalData('isNewPlayer', "yes");
            this._isBegan = false;
            this.ruleNode.getChildByName('layout').on('click',this.newPlayerEvent,this);
        }else{
            this._isBegan = true;
        }
        this.initRuleConfig();
        this.ruleNode.active = !this._isBegan;
        // if(this._isBegan && (!VdIsRelife || AgainGame)) this.initGameLevel();
    },

    initRuleConfig () {
        let config = [];
        config = VDData.businessConfig.activityRule ? JSON.parse(VDData.businessConfig.activityRule) : ruleConfig;
        this.ruleScroll.content.destroyAllChildren();
        for(let i = 0 ; i < config.length; i++) {
            let itemNode = cc.instantiate(this.ruleItemPre);
            itemNode.getChildByName('content').getComponent(cc.Label).string = config[i];
            this.ruleScroll.content.addChild(itemNode);
            this.scheduleOnce(() => {
                let H = itemNode.getChildByName('content').height;
                itemNode.height = H;
            }, 1 / 60.0);
        }
        let state = VDData.businessConfig.activityState ? VDData.businessConfig.activityState : '1';
        this.ruleNode.active = state == "1" ? true : false;
        
    },

    newPlayerEvent () {
        VDUtils2.setLocalData('isNewPlayer', "no");
        this._isBegan = true;
        this.ruleNode.active = false;
        // this.initGameLevel(GameLevel);
        this.ruleNode.getChildByName('layout').off('click',this.newPlayerEvent,this);
    },

    initUi () {
        this.setGameTime();
        this.scoreLab.string = VDGameScore;
        this.overGame.getComponent('OverGame').init(this);
    },

    initDiamond () {
        let rand = VDUtils.randint(0,12);
        let arrangeObj = {};
        arrangeObj.arrange = this._arrangement[rand];
        arrangeObj.index = rand;
        this.createDiamondFeild(arrangeObj, (diamondFeildArr) => {
            this.createDrawDireLine(diamondFeildArr,arrangeObj);
        });
        
    },

    createDiamondFeild (arrangeObj,callback) {
        this.clearDiamond();
        TargetIndex = VDUtils.randint(0,2);
        this.targetDiamond.spriteFrame = this.diamondFrame[TargetIndex];
        let diamondArrange = VDUtils.shuffle(this._diamondArr);
        let diamondFeildArr = [];
        let index = 0;
        for (var i = 0; i < this._diamondNum.raw; i++) {
            for (var j = 0; j < this._diamondNum.col; j++) {
                let diamondFeild = VDNodeCache.GetNodeByType(VDNodeCache.Config.diamondFeild);
                diamondFeild.getComponent('DiamondFeildCtrl').init(this,index,arrangeObj.arrange);
                diamondFeild.position = cc.v2(-this.diamondLayout.width * 0.5 + diamondFeild.width * 0.5 + 10 + (10 + diamondFeild.width) * j , 
                                        this.diamondLayout.height * 0.5 - 15 - diamondFeild.height* 0.5 - (10 + diamondFeild.height) * i);
                this.diamondLayout.addChild(diamondFeild);
                diamondFeildArr.push(diamondFeild);
                
                if(index != 0){
                    this.createDiamond(diamondFeild,diamondArrange[index-1],index);
                }
                index++;

                if(index == this._diamondNum.raw * this._diamondNum.col){
                    callback ? callback(diamondFeildArr) : null;
                }
            }
        }
    },

    clearDiamond () {
        let feildNodeArr = this.diamondLayout.getChildren();
        for (let i = 0; i < feildNodeArr.length; i++) {
            // VDNodeCache.PutNode(feildNodeArr[i]);
            feildNodeArr[i].destroy();
        }
        this.diamondLayout.removeAllChildren();
    },

    createDiamond (feildNode, frame, index) {
        let diamond = VDNodeCache.GetNodeByType(VDNodeCache.Config.diamond);
        feildNode.addChild(diamond);
        diamond.getComponent('DiamondCtrl').init(this,frame,index);
        diamond.position = cc.v2(0,0);
    },

    createDrawDireLine (diamondFeildArr,arrangeObj) {
        // console.log('======创建目标区域线======',diamondFeildArr,arrangeObj,diamondFeildArr[arrangeObj.arrange[3]]);
        var feild;
        let originPos = cc.v2(0,0), rectW = 0,rectH = 0;
        if(arrangeObj.index >= 8){
            feild = diamondFeildArr[arrangeObj.arrange[0]];
            originPos.x = feild.x + feild.width * .5 + 5;
            originPos.y = feild.y - feild.height * .5 - 5;
            rectW = feild.width * 2 + 2 * 10;
            rectH = feild.height * 2 + 2 * 10;
        } else if(arrangeObj.index >= 0 && arrangeObj.index < 4){
            feild = diamondFeildArr[arrangeObj.arrange[1]];
            originPos.x = feild.x + feild.width * .5 + 5;
            originPos.y = feild.y;
            rectW = feild.width * 4 + 3 * 10 + 5;
            rectH = feild.height + 10;
        }else if (arrangeObj.index >= 4 && arrangeObj.index < 8) {
            feild = diamondFeildArr[arrangeObj.arrange[1]];
            originPos.x = feild.x;
            originPos.y = feild.y - feild.height * .5 - 5;
            rectW = feild.width + 10;
            rectH = feild.height * 4 + 3 * 10 + 5;
        }
        // console.log('feild ====> ' , arrangeObj,feild);
        let rectNode = VDNodeCache.GetNodeByType(VDNodeCache.Config.dirRect);
        rectNode.width = rectW;
        rectNode.height = rectH;
        rectNode.setPosition(originPos);
        this.diamondLayout.addChild(rectNode);
        rectNode.runAction(cc.repeatForever(cc.sequence(cc.fadeOut(1),cc.fadeIn(1))));
        
    },

    timeSchedule () {
        if(!this._isBegan) return;
        GameTime--;
        this.timeLab.string = GameTime + 's';
        //时间到 游戏结束
        if(GameTime <= 0){
            GameOver = true;
            this.unschedule(this.timeSchedule);
            this.overGame.active = true;
            this.overGame.getComponent('OverGame').setFinishScore(VDGameScore);
        }
    },

    recordAchiveNum (changeNum) {
        this._achiveNum += changeNum;
        console.log('this._achiveNum ' ,this._achiveNum);
    },

    gotoNextLevel () {
        VDUtils.playAudio('defen');
        this.perfectNode.active = true;
        this.perfectNode.scale = 0;
        this.perfectNode.opacity = 0;
        let spaAction = cc.spawn(cc.scaleTo(0.2,1),cc.fadeIn(0.2));
        this.perfectNode.runAction(cc.sequence(spaAction,cc.delayTime(0.2),cc.callFunc(() => {
            this.perfectNode.active = false;
            this.setScore();
            this._achiveNum = 0;

            let rand = VDUtils.randint(0,12);
            let arrangeObj = {};
            arrangeObj.arrange = this._arrangement[rand];
            arrangeObj.index = rand;
            this.createDiamondFeild(arrangeObj,(diamondFeildArr) => {
                this.createDrawDireLine(diamondFeildArr,arrangeObj);
            });
        })));
        
    },

    initGameLevel () {
        this.setScore();
        this._achiveNum = 0;
        this.initDiamond();
    },

    setScore () {
        this.scoreLab.string = VDGameScore;
    },

    setGameTime () {
        this.timeLab.string = GameTime + 's';
    },

    getDiamondFeild () {
        return this.diamondLayout.getChildren();
    },

    setAchiveNum (f) {
        this._achiveNum = f;
    },

    getAchiveNum () {
        return this._achiveNum;
    },

    setBeganGame (f) {
        this._isBegan = f;
        this.ruleNode.active = false;
        if(f){
            this.schedule(this.timeSchedule ,1);
        }
    },
    
});
