module.exports = {
    mongodb: process.env.MONGODB|| 'mongodb://localhost:27017/test',
    titan: {
        'host': 'localhost',
        'port': 8182,
        'graph': 'graph'
    }
};
