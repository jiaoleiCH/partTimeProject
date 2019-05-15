
cc.Class({
    extends: cc.Component,

    properties: {
        diamondFrame : {
            default : [],
            type : cc.SpriteFrame
        },
        diamondSpr : cc.Node,
    },

    init (gameCtrl,frame,index) {
        this._gameCtrl = gameCtrl;
        this.initData(frame,index);
    },

    initData (frame,index) {
        this.node.isMove = false;
        this.diamondSpr.getComponent(cc.Sprite).spriteFrame = this.diamondFrame[DiamondIndex[frame]];
        this.node.index = index;
        this.node.diamondIndex = DiamondIndex[frame];
        // console.log('create diamond ' , this.node.parent.diamondTarget , this.node.diamondIndex , TargetIndex);
        if (this.node.parent.diamondTarget && this.node.diamondIndex == TargetIndex) {
                this.node.parent.getComponent('DiamondFeildCtrl').setFeildFrame(false);
                this._gameCtrl.recordAchiveNum(1);
                if(this._gameCtrl.getAchiveNum() == 4){
                    VDGameScore += 20;
                    this._gameCtrl.gotoNextLevel();
                }
            }
        this.node.on('click',this.clickEvent,this);
    },

    clickEvent () {
        VDUtils.playAudio('dianji');
        this.diamondFeildArr = this._gameCtrl.getDiamondFeild();
        // console.log('diamond click' , this.node.index);
        if(this.node.index - 1 >= 0 && !this.diamondFeildArr[this.node.index - 1].getChildren().length){
            if(this.node.index != 4 && this.node.index != 8 && this.node.index != 12){
                this.checkIsDestination(this.node.parent,this.diamondFeildArr[this.node.index - 1]); 
                this.node.parent = this.diamondFeildArr[this.node.index - 1];
                this.node.position = cc.v2(0,0);
                this.node.index = this.node.index - 1;
            }else{
                console.log('没有多余的位置移动');
                if(this.node.isMove) return;
                this.node.runAction(cc.sequence(cc.callFunc(() => {this.node.isMove = true}), cc.rotateTo(0.1,-20),cc.rotateTo(0.2,20),cc.rotateTo(0.1,0),cc.callFunc(() => {this.node.isMove = false})));
            }
        }else if (this.node.index + 1 < 16 && !this.diamondFeildArr[this.node.index + 1].getChildren().length) {
            if((this.node.index != 3 && this.node.index != 7 && this.node.index != 11 && this.node.index != 15)){
                this.checkIsDestination(this.node.parent,this.diamondFeildArr[this.node.index + 1]);
                this.node.parent = this.diamondFeildArr[this.node.index + 1];
                this.node.position = cc.v2(0,0);
                this.node.index = this.node.index + 1;
            }else{
                console.log('没有多余的位置移动');
                if(this.node.isMove) return;
                this.node.runAction(cc.sequence(cc.callFunc(() => {this.node.isMove = true}), cc.rotateTo(0.1,-20),cc.rotateTo(0.2,20),cc.rotateTo(0.1,0),cc.callFunc(() => {this.node.isMove = false})));
            }
        }else if (this.node.index - 4 >= 0 && !this.diamondFeildArr[this.node.index - 4].getChildren().length) {
            this.checkIsDestination(this.node.parent,this.diamondFeildArr[this.node.index - 4]);
            this.node.parent = this.diamondFeildArr[this.node.index - 4];
            this.node.position = cc.v2(0,0);
            this.node.index = this.node.index - 4;
        }else if (this.node.index + 4 < 16 && !this.diamondFeildArr[this.node.index + 4].getChildren().length) {
            this.checkIsDestination(this.node.parent,this.diamondFeildArr[this.node.index + 4]);
            this.node.parent = this.diamondFeildArr[this.node.index + 4];
            this.node.position = cc.v2(0,0);
            this.node.index = this.node.index + 4;
        }else{
            console.log('没有多余的位置移动');
            if(this.node.isMove) return;
            this.node.runAction(cc.sequence(cc.callFunc(() => {this.node.isMove = true}), cc.rotateTo(0.1,-20),cc.rotateTo(0.2,20),cc.rotateTo(0.1,0),cc.callFunc(() => {this.node.isMove = false})));
        }

        if(this._gameCtrl.getAchiveNum() == 4){
            VDGameScore += 20;
            this._gameCtrl.gotoNextLevel();
        }
        
    },

    checkIsDestination (movePreNode,moveAfterNode) {
        if(movePreNode.diamondTarget && this.node.diamondIndex == TargetIndex){
            movePreNode.getComponent('DiamondFeildCtrl').setFeildFrame(true);
            this._gameCtrl.recordAchiveNum(-1);
            // console.log('achiveNum leave' ,this._gameCtrl.getAchiveNum());
        }
        if (moveAfterNode.diamondTarget && this.node.diamondIndex == TargetIndex) {
            moveAfterNode.getComponent('DiamondFeildCtrl').setFeildFrame(false);
            this._gameCtrl.recordAchiveNum(1);
            // console.log('achiveNum arive' ,this._gameCtrl.getAchiveNum());
            
        }
        
    }

});
