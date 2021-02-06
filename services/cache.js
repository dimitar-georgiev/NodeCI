const mongoose = require('mongoose');
const util = require('util');
const redis = require('redis');
const keys = require('../config/keys');

// const redisURL = 'redis://127.0.0.1:6379';
// const client = redis.createClient(redisURL);
const client = redis.createClient(keys.redisUrl);

client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || ''); // stringify because redis takes only numbers and strings

    return this; // to make this function chainable
};

mongoose.Query.prototype.exec = async function () {
    console.log('RUN QUERY');

    if (!this.useCache) {
        return exec.apply(this, arguments);
    }

    const key = JSON.stringify(
        Object.assign({}, this.getQuery(), {
            collection: this.mongooseCollection.name
        })    
    );
    
    console.log('Key: ', key);

    // const cacheValue = await client.get(key);
    const cacheValue = await client.hget(this.hashKey, key);

    if (cacheValue) {
        const doc = JSON.parse(cacheValue);

        return Array.isArray(doc)
        ? doc.map(item => new this.model(item))
        : new this.model(doc);
    }

    const result = await exec.apply(this, arguments);

    // client.set(key, JSON.stringify(result));
    client.hset(this.hashKey, key, JSON.stringify(result));

    return result;
};

module.exports = {
    clearHash (hashKey) {
        client.del(JSON.stringify(hashKey));
    }
};