module.exports = {
    mongodb: process.env.MONGODB|| 'mongodb://localhost:27017/test',
    titan: {
        'host': 'localhost',
        'port': 8182,
        'graph': 'graph'
    },
    titan2: {
        'host': '104.236.8.205',
        'port': 8182,
        'graph': 'graph'
    },
    titan3: {
        'host': '10.132.119.251',
        'port': 8182,
        'graph': 'prod'
    },
    tokenSecret: 'TheQuickBrownTurdJumpedOverTheNothingAndSomeGuySteppedInShitFoRealziezTimes9000BITCHES'
    //104.236.8.205
};
