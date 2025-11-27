const { sepayWebhook } = require('../controllers/sepayController')
const router = require('express').Router()
router.post('/webhook', sepayWebhook)

module.exports = router
