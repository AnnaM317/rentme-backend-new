const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')


async function query(filterBy) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('order')
        var orders = await collection.find(criteria).toArray()
        return orders;
    } catch (err) {
        console.log(err);
        logger.error('cannot find orders', err)
        throw err
    }
}


function _buildCriteria(filterBy) {
    let criteria = {}
    return criteria;
}


async function remove(orderId) {
    try {
        const collection = await dbService.getCollection('order');
        await collection.deleteOne({ '_id': ObjectId(orderId) });
        return orderId;
    } catch (err) {
        logger.error(`cannot remove order ${orderId}`, err);
        throw err;
    }
}

async function add(order) {
    try {
        const collection = await dbService.getCollection('order');
        const addedOrder = await collection.insertOne(order);
        return addedOrder;
    } catch (err) {
        logger.error('cannot insert order', err);
        throw err;
    }
}
async function update(order) {
    try {
        var id = ObjectId(order._id)
        delete order._id
        const collection = await dbService.getCollection('order')
        await collection.updateOne({ '_id': id }, { $set: { ...order } })
        return order
    } catch (err) {
        logger.error(`cannot update order ${order._id}`, err)
        throw err
    }
}

module.exports = {
    remove,
    query,
    add,
    update,
}