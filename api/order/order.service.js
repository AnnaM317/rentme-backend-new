<<<<<<< HEAD
const dbService = require('../../services/db.service');
const ObjectId = require('mongodb').ObjectId;
const asyncLocalStorage = require('../../services/als.service');

async function query(user) {
  try {
    const criteria = _buildCriteria(user);
    const collection = await dbService.getCollection('order');
    var orders = await collection.find(criteria).toArray();
    return orders;
  } catch (err) {
    console.log(err);
    logger.error('cannot find orders', err);
    throw err;
  }
}

function _buildCriteria(user) {
  let criteria = {};
  //user = {type: userId}
  if (key === 'host') criteria = { 'host._id': user._id };
  else criteria = { 'buyer._id': user._id };
  return criteria;
}

=======
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

>>>>>>> fd56f511e2165b3f3c5947ea53fa6a4e2f573557
async function remove(orderId) {
  try {
    const collection = await dbService.getCollection('order');
    await collection.deleteOne({ _id: ObjectId(orderId) });
    return orderId;
  } catch (err) {
    logger.error(`cannot remove order ${orderId}`, err);
    throw err;
  }
}

async function add(order) {
<<<<<<< HEAD
  try {
    const store = asyncLocalStorage.getStore();
    const { userId, isHost } = store;
    console.log('asynclocal store', store);
    // const collection = await dbService.getCollection('order');
    // // remove only if user is owner/admin
    // const query = { _id: ObjectId(order._id) };
    // if (!isHost) query.userId = ObjectId(userId);
    const collection = await dbService.getCollection('order');
    const addedOrder = await collection.insertOne(order);
    return addedOrder;
  } catch (err) {
    logger.error('cannot insert order', err);
    throw err;
  }
=======
    try {
        // const store = asyncLocalStorage.getStore();
        // const { userId, isHost } = store;
        // console.log('asynclocal store', store);
        // const collection = await dbService.getCollection('order');
        // // remove only if user is owner/admin
        // const query = { _id: ObjectId(order._id) };
        // if (!isHost) query.userId = ObjectId(userId);
        // const orderToAdd = {
        //     buyerId: ObjectId(order.buyer.id),
        // }
        const buyer = {
            _id: ObjectId(order.buyer.id),
            fullname: order.buyer.fullname
        }
        order.buyer = buyer;
        order.hostId = ObjectId(order.hostId);
        const stay = {
            _id: ObjectId(order.stay._id),
            name: order.stay.name,
            price: order.stay.price
        }
        order.stay = stay;
        const collection = await dbService.getCollection('order');
        const addedOrder = await collection.insertOne(order);
        return addedOrder;
    } catch (err) {
        logger.error('cannot insert order', err);
        throw err;
    }
>>>>>>> fd56f511e2165b3f3c5947ea53fa6a4e2f573557
}
async function update(order) {
  try {
    var id = ObjectId(order._id);
    delete order._id;
    const collection = await dbService.getCollection('order');
    await collection.updateOne({ _id: id }, { $set: { ...order } });
    return order;
  } catch (err) {
    logger.error(`cannot update order ${order._id}`, err);
    throw err;
  }
}

<<<<<<< HEAD
module.exports = {
  remove,
  query,
  add,
  update,
};
=======
>>>>>>> fd56f511e2165b3f3c5947ea53fa6a4e2f573557
