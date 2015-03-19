module.exports = {
    mongodb: process.env.MONGODB|| 'mongodb://localhost:27017/test',
    titan: {
        'host': 'localhost',
        'port': 8182,
        'graph': 'graph'
    },
    titan2: {
        'host': 'XXX.XXX.X.XXX',
        'port': 8182,
        'graph': 'graph'
    },
    titan3: {
        'host': 'XX.XXX.XXX.XXX',
        'port': 8182,
        'graph': 'prod'
    },
    tokenSecret: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
    //104.236.8.205
};
