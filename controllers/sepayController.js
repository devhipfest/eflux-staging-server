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
    const rawContent = (data.content || '').toUpperCase().replace(/\s+/g, '')

    let isEFLUX = false
    let fluxBlock = null
    let sessionId = null

    const start = rawContent.indexOf('EFLUX')
    const end = rawContent.indexOf('.CT')

    if (start !== -1 && end !== -1 && end > start) {
      isEFLUX = true

      // Lấy đoạn giữa EFLUX → .CT
      fluxBlock = rawContent.substring(start, end)

      // Bóc lấy sessionId = phần sau EFLUX
      sessionId = fluxBlock.substring(5) // bỏ 'EFLUX'
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
