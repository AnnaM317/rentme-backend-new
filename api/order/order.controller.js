const logger = require('../../services/logger.service');
const orderService = require('../order/order.service');
const socketService = require('../../services/socket.service');

module.exports = {
    getOrders,
    getOrdersById,
    removeOrder,
    addOrder,
    updateOrder,
};

async function getOrders(req, res) {
    try {
        // console.log('backend controller: userId-userType', req.query.params);
        //{"userId":"61ae43ad659811151ae092cc","userType":"host"}
        const userId = JSON.parse(req.query.params).userId;
        const userType = JSON.parse(req.query.params).userType;
        const orders = await orderService.query(userId, userType);
        res.json(orders);
    } catch (err) {
        logger.error('Cannot get orders', err);
        res.status(500).send({ err: 'Failed to get orders' });
    }
}

async function getOrdersById(req, res) {
    try {
        const orderId = req.params.id;
        // const userId = JSON.parse(req.query.params);
        // const = JSON.parse(req.query.params)
        const order = await orderService.getById(orderId);
        res.json(order);
    } catch (err) {
        logger.error('Failed to get order', err);
        res.status(500).send({ err: 'Failed to get order' });
    }
}

async function removeOrder(req, res) {
    try {
        const orderId = req.params.id;
        await orderService.remove(orderId);
        res.json({ msg: 'Deleted successfully' });
    } catch (err) {
        logger.error('Failed to delete order', err);
        res.status(500).send({ err: 'Failed to delete order' });
    }
}

async function addOrder(req, res) {
    try {
        // console.log('req.body', req.body);
        // console.log('req.session.user._id', req.session.user._id);
        var order = req.body;
        // order.buyer._id = req.session.user._id;
        // order['buyer.fullname'] = req.session.user.fullname;
        // console.log('ObjectId(req.session.user._id)', ObjectId(req.session.user._id));
        order.buyer.id = req.session.user._id;
        order.buyer.fullname = req.session.user.fullname;
        order.buyer.imgUrl = req.session.user.imgUrl;
        const addedOrder = await orderService.add(order);
        // console.log('addedOrder backend controller', addedOrder);
        // socketService.emitToUser({ type: 'order-added', data: order, userId: order.hostId })
        res.json(addedOrder);
    } catch (err) {
        logger.error('Failed to add order', err);
        res.status(500).send({ err: 'Failed to add order' });
    }
}

async function updateOrder(req, res) {
    try {
        const order = req.body;
        const updatedOrder = await orderService.update(order);
        console.log('updatedOrder backend', updatedOrder);
        console.log('order', order);
        socketService.emitToUser({
            type: 'order-updated',
            data: order,
            userId: order.buyer._id,
        })
        // socketService.emitToUser({ type: 'order-updated', data: order, userId: userId })

        res.json(updatedOrder);
    } catch (err) {
        logger.error('Failed to update order', err);
        res.status(500).send({ err: 'Failed to update order' });
    }
}
