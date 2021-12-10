const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

module.exports = {
    remove,
    query,
    add,
    update,
    getById
}

async function query(userId, userType) {
    try {
        const criteria = _buildCriteria(userId, userType)
        const collection = await dbService.getCollection('order')
        var orders = await collection.find(criteria).toArray()
        return orders;
    } catch (err) {
        console.log(err);
        logger.error('cannot find orders', err)
        throw err
    }
}


function _buildCriteria(userId, userType) {
    let criteria = {}
    //user = {type: userId}
    criteria = (userType === 'host') ? { 'host._id': userId } : { 'buyer._id': userId };
    return criteria
}

async function getById(orderId) {
    try {
        const collection = await dbService.getCollection('order')
        const order = collection.findOne({ '_id': ObjectId(orderId) })
        return order
    } catch (err) {
        logger.error(`while finding order ${orderId}`, err)
        throw err
    }
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
        // const store = asyncLocalStorage.getStore();
        // const { userId, isHost } = store;
        // console.log('asynclocal store', store);
        // const collection = await dbService.getCollection('order');
        // // remove only if user is owner/admin
        // const query = { _id: ObjectId(order._id) };
        // if (!isHost) query.userId = ObjectId(userId);
        order.buyer.id = ObjectId(order.buyer.id);
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

