const { webhook } = require('../controllers/sepayController')
const router = require('express').Router()
router.post('/webhook', webhook)

module.exports = router
