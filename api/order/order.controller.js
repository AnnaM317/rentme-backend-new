const logger = require('../../services/logger.service')
const orderService = require('../order/order.service')
const ObjectId = require('mongodb').ObjectId


module.exports = {
    getOrders,
    getOrdersById,
    removeOrder,
    addOrder,
    updateOrder
}

async function getOrders(req, res) {
    try {
        const userId = req.query.params.userId;
        const userType = req.query.params.userType;
        const orders = await orderService.query(userId, userType)
        res.json(orders)
    } catch (err) {
        logger.error('Cannot get orders', err)
        res.status(500).send({ err: 'Failed to get orders' })
    }
}

async function getOrdersById(req, res) {
    try {
        const orderId = req.params.id;
        // const userId = JSON.parse(req.query.params);
        // const = JSON.parse(req.query.params)
        const order = await orderService.getById(orderId)
        res.json(order)
    } catch (err) {
        logger.error('Failed to get order', err)
        res.status(500).send({ err: 'Failed to get order' })
    }
}

async function removeOrder(req, res) {
    try {
        const orderId = req.params.id;
        await orderService.remove(orderId)
        res.json({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete order', err)
        res.status(500).send({ err: 'Failed to delete order' })
    }
}

async function addOrder(req, res) {
    try {
        console.log('req.body', req.body);
        console.log('req.session.user._id', req.session.user._id);
        var order = req.body;
        // order.buyer._id = req.session.user._id;
        // order['buyer.fullname'] = req.session.user.fullname;
        // console.log('ObjectId(req.session.user._id)', ObjectId(req.session.user._id));
        order.buyer.id = req.session.user._id;
        const addedOrder = await orderService.add(order)
        console.log('addedOrder backend controller', addedOrder);
        res.json(addedOrder)
    } catch (err) {
        logger.error('Failed to add order', err)
        res.status(500).send({ err: 'Failed to add order' })
    }
}

async function updateOrder(req, res) {
    try {
        const order = req.body;
        const updatedOrder = await orderService.update(order);
        res.json(updatedOrder);
    } catch (err) {
        logger.error('Failed to update order', err);
        res.status(500).send({ err: 'Failed to update order' });
    }
}
