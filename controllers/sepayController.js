exports.webhook = async (req, res) => {
  try {
    console.log('📩 Webhook received!')

    console.log('🔹 Headers:')
    console.log(JSON.stringify(req.headers, null, 2))

    console.log('🔹 Body:')
    console.log(JSON.stringify(req.body, null, 2))

    // trả về luôn OK cho Sepay
    res.status(200).send('OK')
  } catch (error) {
    console.error('❌ Webhook error:', error)
    res.status(500).send('ERR')
  }
}

exports.sepayWebhook = async (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip

  let logEntry = await WebhookLog.create({
    ip: clientIp,
    headers: req.headers,
    body: req.body,
    status: 'received',
  })

  try {
    // ===== 1. Validate API Key =====
    const apiKey = req.headers.authorization

    if (!apiKey || !apiKey.startsWith('Apikey ')) {
      await logEntry.updateOne({
        status: 'error',
        errorMessage: 'Missing or invalid API key',
      })

      return res.status(401).json({ message: 'Unauthorized' })
    }

    const token = apiKey.replace('Apikey ', '')

    if (token !== process.env.API_SECRET_KEY) {
      await logEntry.updateOne({
        status: 'error',
        errorMessage: 'Wrong API key',
      })
      return res.status(403).json({ message: 'Forbidden' })
    }

    // ===== 2. Lấy body =====
    const data = req.body
    const content = (data.content || '').toUpperCase().replace(/\s+/g, '')

    console.log('📩 Incoming SePay Webhook:', data)

    // ===== 3. Nhận diện nội dung EFLUX =====
    // Ví dụ content thật: "EFLUXCH0112345" hoặc "e f l u x ch01  12345"
    const isEFLUX = content.includes('EFLUX')

    // Lấy sessionId (là số phía sau)
    // Ví dụ: EFLUXCH0112345  =>  "12345"
    let sessionId = null
    if (isEFLUX) {
      const digits = content.match(/(\d{3,})$/)
      if (digits) sessionId = digits[1]
    }

    // ===== 4. Tạo webhook log =====
    await logEntry.updateOne({
      status: 'processed',
      parsed: {
        isEFLUX,
        sessionId,
      },
    })

    return res.status(200).json({
      message: 'Webhook logged',
      isEFLUX,
      sessionId,
    })
  } catch (err) {
    console.error('❌ Webhook Error:', err)

    await logEntry.updateOne({
      status: 'error',
      errorMessage: err.message,
    })

    return res.status(500).json({ message: 'Server error' })
  }
}
