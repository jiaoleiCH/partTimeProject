
cc.Class({
    extends: cc.Component,

    properties: {
        userName : cc.Label,
        rankNum : cc.Label,
        score : cc.Label,
        userHead : cc.Sprite,
        // rankLogo : cc.Sprite,
        rankLogoFrame : {
            default : [],
            type : cc.SpriteFrame
        }
    },

    init (data,index,myRank,rankType) {
        this.initUserData(data,index,myRank,rankType);
    },

    initUserData (data,index,myRank,rankType) {
        // if(index < 3){
        //     this.rankNum.node.active = false;
        //     // this.rankLogo.node.active = true;
        //     // this.rankLogo.spriteFrame = this.rankLogoFrame[index];
        // }else{
        //     this.rankNum.node.active = true;
        //     // this.rankLogo.node.active = false;
        // }

        if(rankType == 1){  //微信排行榜
            this.userName.string = data.nickname;
            this.rankNum.string = index+1;
            let scoreData = JSON.parse(data.KVDataList[0].value);
            this.score.string = "最高分:" + scoreData.score;
            this.createImage(data.avatarUrl)
        }else if (rankType == 2){   //世界排行榜
            this.userName.string = data.worldData.nick_name;
            this.rankNum.string = index+1;
            this.score.string = data.worldData.score;
            this.createImage(data.worldData.head_url)
        }
    },

    setLabelColor (data,index,myRank,rankType) {
        let selfColor = cc.color(231,212,17);
        let otherColor = cc.color(0,0,0);
        if(rankType == 1){  //微信排行榜
            if(index == myRank){
                this.userName.node.color = selfColor;
                this.rankNum.node.color = selfColor;
                this.score.node.color = selfColor;
            }else{
                this.userName.node.color = otherColor;
                this.rankNum.node.color = otherColor;
                this.score.node.color = otherColor;
            }

        }else if (rankType == 2){   //世界排行榜
            if(data.worldData.head_url == data.myRankData.head_url){
                this.userName.node.color = selfColor;
                this.rankNum.node.color = selfColor;
                this.score.node.color = selfColor;
            }else {
                this.userName.node.color = otherColor;
                this.rankNum.node.color = otherColor;
                this.score.node.color = otherColor;
            }
        }
    },

    // 创建头像
    createImage(avatarUrl) {
        if (WCGAME) {
            try {
                let image = wx.createImage();
                image.onload = () => {
                    try {
                        let texture = new cc.Texture2D();
                        texture.initWithElement(image);
                        texture.handleLoadedTexture();
                        this.userHead.spriteFrame = new cc.SpriteFrame(texture);
                    } catch (e) {
                        cc.log(e);
                        this.userHead.node.active = false;
                    }
                };
                image.src = avatarUrl;
            }catch (e) {
                cc.log(e);
                this.userHead.node.active = false;
            }
        } else {
            cc.loader.load({
                url: avatarUrl, type: 'jpg'
            }, (err, texture) => {
                this.userHead.spriteFrame = new cc.SpriteFrame(texture);
            });
        }
    },

});
