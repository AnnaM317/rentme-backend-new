const stayService = require('./stay.service.js');
const logger = require('../../services/logger.service')
// const socketService = require('../../services/socket.service');

module.exports = {
    getStays,
    getStayById,
    removeStay,
    addStay,
    updateStay,
    getHostStays
};

async function getHostStays(req, res) {
    try {
        console.log('hello');
        // console.log('reg.params hostId', req.params.id);
        // const stayId = req.params._id;
        const hostId = req.params.id;
        const stays = await stayService.getHostStays(hostId);
        console.log('line20 controller stays', stays);
        res.json(stays);
        // res.send(stay);
    } catch {
        logger.error('Cannot get stay', err);
        res.status(500).send({ err: 'Failed to get stay' });
    }
}

async function getStays(req, res) {
    // console.log('heloo')

    try {
        // console.log('here');
        // console.log('req.query', req.query);
        // const filter = JSON.parse(req.query)
        // console.log('filter', filter);
        // const stays = await stayService.query(req.query);
        const stays = await stayService.query(req.query);
        res.json(stays);
        // res.send(toys);
        // console.log('toys in toy.controll:', toys);
        // return toys;
    } catch (err) {
        logger.error('Cannot get stays', err);
        res.status(500).send({ err: 'Failed to get stays' });
    }
}

// Get toy by id
async function getStayById(req, res) {
    try {
        // console.log('reg', req);
        // const stayId = req.params._id;
        const stayId = req.params.id;
        const stay = await stayService.getById(stayId);
        res.json(stay);
        // res.send(stay);
    } catch {
        logger.error('Cannot get stay', err);
        res.status(500).send({ err: 'Failed to get stay' });
    }
}

// POST (add stay)
async function addStay(req, res) {
    try {
        const stay = req.body;
        console.log('controller', stay);
        const addedStay = await stayService.add(stay)
        res.json(addedStay)
    } catch (err) {
        logger.error('Failed to add stay', err)
        res.status(500).send({ err: 'Failed to add stay' })
    }
}

// PUT (Update stay)
async function updateStay(req, res) {
    try {
        const stay = req.body;
        const updatedStay = await stayService.update(stay)
        res.json(updatedStay)
    } catch (err) {
        logger.error('Failed to update stay', err)
        res.status(500).send({ err: 'Failed to update stay' })

    }
}

// remove Stay by id
async function removeStay(req, res) {
    try {
        const stayId = req.params.id;
        await stayService.remove(stayId)
        res.send({ msg: 'Deleted successfully' })
    } catch {
        logger.error('Failed to remove stay', err);
        res.status(500).send({ err: 'Failed to remove stay' });
    }
}

// Add a new Toy
// async function saveToy(req, res) {
//     try {
//         const toy = req.body;
//         const savedToy = await toyService.save(toy);
//         res.json(savedToy);
//     } catch {
//         logger.error('Failed to add toy', err);
//         res.status(500).send({ err: 'Failed to add toy' });
//     }
// }

