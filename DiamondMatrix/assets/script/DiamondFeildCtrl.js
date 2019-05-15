

cc.Class({
    extends: cc.Component,

    properties: {
        feildFrame : {
            default : [],
            type : cc.SpriteFrame
        }
    },


    init (gameCtrl, index, arrangeArr) {
        this.gameCtrl = gameCtrl;
        this.initData(index,arrangeArr);
    },

    initData (index,arrangeArr) {
        this.node.getComponent(cc.Sprite).spriteFrame = this.feildFrame[0];
        this.node.diamondTarget = false;
        for (let i = 0; i < arrangeArr.length; i++) {
            if(index == arrangeArr[i]){
                this.node.diamondTarget = true;
                break;
            }else{
                this.node.diamondTarget = false;
            }
        }
        this.node.getComponent(cc.Sprite).spriteFrame = this.feildFrame[0];
    },

    setFeildFrame (isLeave) {
        if(isLeave){
            this.node.getComponent(cc.Sprite).spriteFrame = this.feildFrame[0];
            
        }else {
            this.node.getComponent(cc.Sprite).spriteFrame = this.feildFrame[2];
        }
        
    }

});
