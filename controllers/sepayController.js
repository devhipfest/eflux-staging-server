const WebhookLog = require('../models/WebhookLog')
const Transaction = require('../models/Transaction')

exports.webhook = async (req, res) => {
  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress || req.ip

  // --- Tạo log ngay lập tức ---
  let logEntry = await WebhookLog.create({
    ip: clientIp,
    headers: req.headers,
    body: req.body,
    status: 'received',
  })

  console.log(req.headers)
  console.log(req.body)
  try {
    // ===== 1. Validate API Key =====
    const apiKey = req.headers.authorization || ''
    if (!apiKey.startsWith('Apikey ')) {
      await logEntry.updateOne({
        status: 'error',
        errorMessage: 'Missing or invalid API key',
      })
      console.log('Unauthorized: ', 'Missing or invalid API key')
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const token = apiKey.slice(7)
    if (token !== process.env.API_SECRET_KEY) {
      await logEntry.updateOne({
        status: 'error',
        errorMessage: 'Wrong API key',
      })
      console.log('Forbidden')
      return res.status(403).json({ message: 'Forbidden' })
    }

    // ===== 2. Chuẩn hoá content =====
    const data = req.body
    const rawContent = (data.content || '').toUpperCase()
    const clean = rawContent.replace(/\s+/g, '')

    // ===== 3. Parse EFLUX content =====
    let isEFLUX = false
    let sessionId = null

    const idx = clean.indexOf('EFLUX')
    if (idx !== -1) {
      const tail = clean.substring(idx + 5) // phần sau EFLUX
      const digits = tail.match(/(\d{3,})$/) // lấy số ở cuối
      if (digits) {
        isEFLUX = true
        sessionId = digits[1]
      }
    }

    // Nếu không phải EFLUX thì bỏ qua
    if (!isEFLUX) {
      await logEntry.updateOne({
        status: 'ignored',
        note: 'Not an EFLUX payment',
      })
      console.log('Ignored (not EFLUX)')
      return res.status(200).json({ message: 'Ignored (not EFLUX)' })
    }

    // ===== 4. Chống trùng (theo referenceCode) =====
    const referenceCode = data.referenceCode
    if (referenceCode) {
      const exists = await Transaction.findOne({ referenceCode })
      if (exists) {
        await logEntry.updateOne({
          status: 'ignored',
          note: 'Duplicate transaction',
          transactionId: exists._id,
        })
        console.log('Ignored (Duplicate transaction)')
        return res.status(200).json({ message: 'Duplicate ignored' })
      }
    }

    // ===== 5. Tạo Transaction =====
    const transaction = await Transaction.create({
      sessionId,
      gateway: data.gateway,
      referenceCode: data.referenceCode,
      transferAmount: data.transferAmount, // ✔ đúng field
      transactionDate: data.transactionDate,
      content: data.content, // nếu muốn lưu nội dung CK
      transferType: data.transferType, // nếu Sepay trả
      accountNumber: data.accountNumber, // bắt buộc trong schema
      accumulated: data.accumulated,
      subAccount: data.subAccount,
      code: data.code,
      description: data.description,
    })

    // ===== 6. Update log thành công =====
    await logEntry.updateOne({
      status: 'processed',
      transactionId: transaction._id,
      parsed: { isEFLUX, sessionId },
    })

    return res.status(200).json({
      message: 'EFLUX transaction stored',
      sessionId,
      transactionId: transaction._id,
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
