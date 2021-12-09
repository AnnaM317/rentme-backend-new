const logger = require('../../services/logger.service')
const orderService = require('../order/order.service')


async function getOrders(req, res) {
    try {
        const orders = await orderService.query(req.query)
        res.json(orders)
    } catch (err) {
        logger.error('Cannot get orders', err)
        res.status(500).send({ err: 'Failed to get orders' })
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
        var order = req.body;
        const addedOrder = await orderService.add(order)
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

module.exports = {
    getOrders,
    removeOrder,
    addOrder,
    updateOrder
}