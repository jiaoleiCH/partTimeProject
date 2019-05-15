
/**
 * 对象池
 */

let Config = {
    rankItem : 'rankItem',
    // gift5 : 'gift5',
}

let prefabInfos = [
    {name:Config.rankItem, path:'prefabs/rankItem'},
];

let PreLoadPrefabs = {};

function preLoadPrefabs(arr,cb){
    let count = arr.length;
    if(count == 0) return cb(null);
    arr.forEach(function(prefabInfo) {
        cc.loader.loadRes(prefabInfo.path,(error,prefab)=>{
            if(!error){
                prefabInfo.prefab = prefab;
                prefabInfo.pool = new cc.NodePool();
                PreLoadPrefabs[prefabInfo.name] = prefabInfo;
                --count;
                if(count==0){
                    cb(null);
                }
            }else{
                cb(error);
            }
        });
    }, this);
}

let NodeCache = {};
function GetNodeFromPool(pool,prefab){
    let node = null;
    if (pool.size() > 0) { 
        node = pool.get();
    } else {
        node = cc.instantiate(prefab);
    }
    return node
}

function PutNodeToPool(pool,node){
    pool.put(node);
}

function GetNodeByType(typeName){
    let node = GetNodeFromPool(PreLoadPrefabs[typeName].pool,PreLoadPrefabs[typeName].prefab);
    node.typeName = typeName;
    return node;
}

function PutNode(node){
    let typeName = node.typeName;
    PutNodeToPool(PreLoadPrefabs[typeName].pool,node);
}

function preload(cb) {//循环引用的预制体不能同时加载 要有先后顺序
    preLoadPrefabs(prefabInfos,cb);
}

NodeCache.PutNode = PutNode;
NodeCache.GetNodeByType = GetNodeByType;
NodeCache.Config = Config;
NodeCache.Preload = preload;

export default NodeCache;