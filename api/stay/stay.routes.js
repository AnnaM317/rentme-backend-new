const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { getStays, getHostStays, getStayById, addStay, updateStay, removeStay } = require('./stay.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', getStays)
router.get('/', getHostStays)
router.post('/', requireAuth, requireAdmin, addStay)
router.get('/:id', getStayById)
router.put('/:id', requireAuth, requireAdmin, updateStay)
router.delete('/:id', requireAuth, requireAdmin, removeStay)


// router.get('/', log, getStays)
// router.get('/:id', log, getStayById)
// router.post('/', addStay)
// router.post('/:id?',  requireAuth, saveStay)
// router.put('/:id?', updateStay)
// router.put('/:id', updateStay)
// router.post('/:id?',  requireAuth, saveStay)
// router.delete('/:id', removeStay)
// router.delete('/:id',  requireAuth, removeStay)

module.exports = router