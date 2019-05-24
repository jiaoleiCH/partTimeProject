
cc.Class({
    extends: cc.Component,

    properties: {
        topNode : cc.Node,
        backBtnNode : cc.Node,
        shareBtnNode : cc.Node,
        gameBg : cc.Node,
        timeLab : cc.Label,
        scoreLab : cc.Label,
        diamondLayout : cc.Node,
        overGame : cc.Node,
        targetDiamond : cc.Sprite,
        dirNode : cc.Node,
        ruleNode : cc.Node,
        ruleBeganBtn : cc.Node,
        perfectNode : cc.Node,
        newPlayerNode : cc.Node,
        maskNode : cc.Node,
        handGuideNode : cc.Node,
        diamondFrame : {
            default : [],
            type : cc.SpriteFrame
        },
        maskSpriteFrame : [cc.SpriteFrame]
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
        this.initClickEvent();
        // this.initGameRule();
        this.initGuide();
        this.initUi();
        // this.initDiamond();
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

         // 刘海屏 像素 高/宽 > 2.1 
         if (window.wx != undefined && cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.getSystemInfo({
                success : res =>{
                    console.log('mobile --->' , res);
                    if(res.screenHeight / res.screenWidth > 2.1){
                        this.topNode.y = size.height * 0.5 - 680;
                        // this.logoNode.y = visbleSize.height * 0.5 - 280 -60;
                    }
                }
            })
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

        this._guideTargetDiamond = [];
        this._diamondFeildArr = [];
        this._is_guide_status = false;
        this._guideStepIndex = 0;
        this._rectNode = null;

        this._guideText = ['点击移动狗狗至发光区域','点击狗狗向下移动,调整位置','点击小蛇向右移动,调整位置','点击狗狗向上移动,调整位置','点击狗狗向左移动,调整位置'];
    },

    initClickEvent () {
        this.ruleBeganBtn.on('click',this.beganGame,this);
        this.backBtnNode.on('click',this.backBtnEvent,this);
        this.shareBtnNode.on('click',this.shareEvent,this);
    },

    beganGame () {
        this.ruleNode.active = false;
        this._isBegan = true;  
    },

    backBtnEvent () {
        cc.director.loadScene('game');
    },

    shareEvent () {
        // this.relife();
        let title = "我已经达到" + VDGameScore + "分了，你能到多少？";
        let paramList = "";
        let imageUrl =  "share.png";
        let success = () => {
            //Todo 按照分享类型响应事件
            
        }
       
        VDWeChat.share(title, paramList, imageUrl, success);
    },

    initGuide () {
        let initGuide = VDUtils2.getLocalData('initGuide');
        // console.log('initGuide' ,initGuide);
        if(!initGuide || initGuide != 'yes'){
            VDUtils2.setLocalData('initGuide', "yes");
            this.initNewPlayerDiamond();
        }else{
            this.initDiamond(); 
            this.ruleNode.active = true;
        }
    },

    initUi () {
        this.setGameTime();
        this.setScore();
        this.overGame.getComponent('OverGame').init(this);
    },

    initDiamond () {
        let rand = VDUtils.randint(0,12);
        let arrangeObj = {};
        arrangeObj.arrange = this._arrangement[rand];
        arrangeObj.index = rand;
        this.createDiamondFeild(arrangeObj, 0, (diamondFeildArr) => {
            this.createDrawDireLine(diamondFeildArr,arrangeObj);
        });
        
    },

    createDiamondFeild (arrangeObj,nullNumber,callback) {
        this.clearDiamond();
        TargetIndex = nullNumber == 0 ? VDUtils.randint(0,2) : 1;
        this.targetDiamond.spriteFrame = this.diamondFrame[TargetIndex];
        let diamondArrange = (nullNumber == 0) ? VDUtils.shuffle(this._diamondArr) : ['red','green','red','blue','red',,'red','green','gray','blue','gray','green','blue','green','gray','blue'];
        this._diamondFeildArr = [];
        let index = 0;
        for (var i = 0; i < this._diamondNum.raw; i++) {
            for (var j = 0; j < this._diamondNum.col; j++) {
                let diamondFeild = VDNodeCache.GetNodeByType(VDNodeCache.Config.diamondFeild);
                diamondFeild.getComponent('DiamondFeildCtrl').init(this,index,arrangeObj.arrange);
                diamondFeild.index = i + '_' + j;
                diamondFeild.position = cc.v2(-this.diamondLayout.width * 0.5 + diamondFeild.width * 0.5 + 15 + (15 + diamondFeild.width) * j , 
                                        this.diamondLayout.height * 0.5 - 15 - diamondFeild.height* 0.5 - (15 + diamondFeild.height) * i);
                this.diamondLayout.addChild(diamondFeild);
                this._diamondFeildArr.push(diamondFeild);
                
                if(index != nullNumber){
                    let _index = nullNumber == 0 ? index - 1 : index;
                    this.createDiamond(diamondFeild,diamondArrange[_index],index);
                    console.log('index === > ' ,index);
                }
                index++;

                if(index == this._diamondNum.raw * this._diamondNum.col){
                    callback ? callback(this._diamondFeildArr) : null;
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
        diamond.position = cc.v2(3,-5);
    },

    createDrawDireLine (diamondFeildArr,arrangeObj) {
        // console.log('======创建目标区域线======',diamondFeildArr,arrangeObj,diamondFeildArr[arrangeObj.arrange[3]]);
        var feild;
        let originPos = cc.v2(0,0), rectW = 0,rectH = 0;
        if(arrangeObj.index >= 8){
            feild = diamondFeildArr[arrangeObj.arrange[0]];
            originPos.x = feild.x + feild.width * .5 + 8;
            originPos.y = feild.y - feild.height * .5 - 8;
            rectW = feild.width * 2 + 2 * 15 + 4;
            rectH = feild.height * 2 + 2 * 15 + 4;
        } else if(arrangeObj.index >= 0 && arrangeObj.index < 4){
            feild = diamondFeildArr[arrangeObj.arrange[1]];
            originPos.x = feild.x + feild.width * .5 + 8;
            originPos.y = feild.y;
            rectW = feild.width * 4 + 3 * 20 + 8;
            rectH = feild.height + 15;
        }else if (arrangeObj.index >= 4 && arrangeObj.index < 8) {
            feild = diamondFeildArr[arrangeObj.arrange[1]];
            originPos.x = feild.x;
            originPos.y = feild.y - feild.height * .5 - 8;
            rectW = feild.width + 20;
            rectH = feild.height * 4 + 3 * 20;
        }
        // console.log('feild ====> ' , arrangeObj,feild);
        this._rectNode = VDNodeCache.GetNodeByType(VDNodeCache.Config.dirRect);
        this._rectNode.width = rectW;
        this._rectNode.height = rectH;
        this._rectNode.setPosition(originPos);
        this.dirNode.addChild(this._rectNode);
        this._rectNode.runAction(cc.repeatForever(cc.sequence(cc.fadeOut(1),cc.fadeIn(1))));
        
    },

    initNewPlayerDiamond () {
        this._is_guide_status = true;
        this._guideTargetDiamond = [6,2,1,5,6];
        let arrangeObj = {};
        arrangeObj.arrange = this._arrangement[8];
        arrangeObj.index = 8;
        this.createDiamondFeild(arrangeObj, 5, (diamondFeildArr) => {
            this.createDrawDireLine(diamondFeildArr,arrangeObj);
        });

        let pos = this._diamondFeildArr[this._guideTargetDiamond[this._guideStepIndex]].convertToWorldSpaceAR(cc.Vec2.ZERO);
        this.maskNode.position = this.maskNode.parent.convertToNodeSpaceAR(pos);
        this.maskNode.active = true;
        this.handGuideNode.active = true;

        this.resetMaskPosition();
    },

    

    resetMaskPosition () {
        if(this._guideStepIndex >= this._guideTargetDiamond.length){
            this.maskNode.active = false;
            this.handGuideNode.active = false;
            this._is_guide_status = false;
            this._isBegan = true;
            return;
        }
        let pos = this._diamondFeildArr[this._guideTargetDiamond[this._guideStepIndex]].convertToWorldSpaceAR(cc.Vec2.ZERO);
        let maskPos = this.maskNode.parent.convertToNodeSpaceAR(pos);
        
        console.log("this._guideStepIndex" ,this._guideStepIndex);
        if(this._guideStepIndex != 2){
            this.maskNode.width = 104;
            this.maskNode.height = 120;
            this.maskNode.position = cc.v2(maskPos.x - 2 ,maskPos.y + 4);
        }else{
            this.maskNode.width = 104;
            this.maskNode.height = 115;
            this.maskNode.position = maskPos;

        }
        // this.maskNode.width = 
        this.maskNode.getComponent(cc.Mask).spriteFrame = this.maskSpriteFrame[this._guideStepIndex];

        this.handGuideNode.position = maskPos;
        this.handGuideNode.getChildByName('labSpr').getChildByName('guideLab').getComponent(cc.Label).string = this._guideText[this._guideStepIndex];
        // this.maskNode.active = true;
        this._guideStepIndex++;
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
        VDNodeCache.PutNode(this._rectNode);
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
            this.createDiamondFeild(arrangeObj, 0,(diamondFeildArr) => {
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
        if(f){
            this.schedule(this.timeSchedule ,1);
        }
    },

    getGuideStatus () {
        return this._is_guide_status;
    },

    againGame (func) {
        VDGameScore = 0;
        GameTime = 30;
        VDNodeCache.PutNode(this._rectNode);
        this.initData();
        this.setScore();
        this.setGameTime();
        this.initDiamond();
        this.setBeganGame(true);
        func ? func() : null;
        console.log('再来一局');
    }
    
});
