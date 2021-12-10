const dbService = require('../../services/db.service');
const ObjectId = require('mongodb').ObjectId;
const asyncLocalStorage = require('../../services/als.service');

module.exports = {
  remove,
  query,
  add,
  update,
  getById,
};

async function query(userId, userType) {
  try {
    console.log('backend service: userId-userType', userId, userType);
    const criteria = _buildCriteria(userId, userType);
    const collection = await dbService.getCollection('order');
    var orders = await collection.find(criteria).toArray();
    console.log('orders backend', orders);
    return orders;
  } catch (err) {
    console.log(err);
    logger.error('cannot find orders', err);
    throw err;
  }
}

function _buildCriteria(userId, userType) {
  let criteria = {};
  console.log('typeof usertype', typeof userType);
  //user = {type: userId}
  if (userType === 'host') criteria['host._id'] = ObjectId(userId);
  else criteria['buyer._id'] = ObjectId(userId);
  // criteria = (userType === 'host') ? { 'host._id': userId } : { 'buyer._id': ObjectId(userId) };
  console.log('criteria', criteria);
  return criteria;
}

async function getById(orderId) {
  try {
    const collection = await dbService.getCollection('order');
    const order = collection.findOne({ _id: ObjectId(orderId) });
    return order;
  } catch (err) {
    logger.error(`while finding order ${orderId}`, err);
    throw err;
  }
}

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
      fullname: order.buyer.fullname,
    };
    order.buyer = buyer;
    order.hostId = ObjectId(order.hostId);
    const stay = {
      _id: ObjectId(order.stay._id),
      name: order.stay.name,
      price: order.stay.price,
    };
    order.stay = stay;
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
