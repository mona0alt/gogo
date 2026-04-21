const cloud = require('wx-server-sdk')

function init() {
  cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
  const db = cloud.database()
  const wxContext = cloud.getWXContext()
  return { db, openid: wxContext.OPENID }
}

function success(data = {}) {
  return { success: true, ...data }
}

function fail(message, data = {}) {
  return { success: false, error: message, ...data }
}

function unauthorized() {
  return fail('无法获取用户信息')
}

function notFound(resource = '资源') {
  return fail(`${resource}不存在`)
}

/**
 * 轻量 schema 校验器
 * @param {object} data — 待校验数据
 * @param {object} schema — 校验规则
 *   - required: boolean
 *   - type: 'string' | 'number' | 'boolean' | 'array' | 'object'
 *   - enum: any[]
 *   - min: number (string 为最小长度, number 为最小值)
 *   - max: number (string 为最大长度, number 为最大值)
 * @returns {string|null} — 错误信息或 null
 */
function validate(data, schema) {
  const errors = []
  for (const [key, rule] of Object.entries(schema)) {
    const value = data[key]
    const hasValue = value !== undefined && value !== null && value !== ''

    if (rule.required && !hasValue) {
      errors.push(`${key} 不能为空`)
      continue
    }

    if (!hasValue) continue

    if (rule.type) {
      let valid = false
      switch (rule.type) {
        case 'string': valid = typeof value === 'string'; break
        case 'number': valid = typeof value === 'number' && !isNaN(value); break
        case 'boolean': valid = typeof value === 'boolean'; break
        case 'array': valid = Array.isArray(value); break
        case 'object': valid = typeof value === 'object' && !Array.isArray(value) && value !== null; break
      }
      if (!valid) {
        errors.push(`${key} 类型错误，期望 ${rule.type}`)
        continue
      }
    }

    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(`${key} 值不合法`)
      continue
    }

    if (rule.min !== undefined) {
      if (typeof value === 'string' && value.length < rule.min) {
        errors.push(`${key} 长度不能小于 ${rule.min}`)
      } else if (typeof value === 'number' && value < rule.min) {
        errors.push(`${key} 不能小于 ${rule.min}`)
      }
    }

    if (rule.max !== undefined) {
      if (typeof value === 'string' && value.length > rule.max) {
        errors.push(`${key} 长度不能大于 ${rule.max}`)
      } else if (typeof value === 'number' && value > rule.max) {
        errors.push(`${key} 不能大于 ${rule.max}`)
      }
    }
  }
  return errors.length > 0 ? errors.join('；') : null
}

/**
 * 获取当前用户（通过 OPENID 查 users 表）
 * @param {object} db — 数据库实例
 * @param {string} openid — 微信 OPENID
 * @returns {Promise<object|null>}
 */
async function getCurrentUser(db, openid) {
  if (!openid) return null
  const res = await db.collection('users').where({ openid }).get()
  return res.data[0] || null
}

/**
 * 云函数入口包装器
 * @param {object} options
 * @param {object} [options.schema] - 校验规则
 * @param {boolean} [options.requireAuth=true] - 是否需要登录
 * @param {boolean} [options.requireUser=true] - 是否需要查询 users 表
 * @param {Function} handler - 业务逻辑处理器 (event, context, { db, openid, user }) => Promise<result>
 */
function createHandler(options = {}, handler) {
  const { schema = null, requireAuth = true, requireUser = true } = options

  return async (event, context) => {
    try {
      const { db, openid } = init()
      const _ = db.command

      // 鉴权
      if (requireAuth && !openid) {
        return unauthorized()
      }

      // 参数校验
      if (schema) {
        const validationError = validate(event, schema)
        if (validationError) {
          return fail(validationError)
        }
      }

      // 查询当前用户
      let user = null
      if (requireAuth && requireUser) {
        user = await getCurrentUser(db, openid)
        if (!user) {
          return notFound('用户')
        }
      }

      // 执行业务逻辑
      return await handler(event, context, { db, openid, user, _ })
    } catch (err) {
      console.error('Handler error:', err)

      // 统一处理集合不存在
      if (err.message?.includes('DATABASE_COLLECTION_NOT_EXIST')) {
        return fail('系统数据未初始化，请联系管理员')
      }

      return fail(err.message || '操作失败')
    }
  }
}

/**
 * 基于云数据库的简单限流
 * @param {object} db
 * @param {string} key - 限流键
 * @param {number} maxRequests - 最大请求数
 * @param {number} windowSeconds - 时间窗口（秒）
 */
async function rateLimit(db, key, maxRequests = 10, windowSeconds = 60) {
  const now = new Date()
  const windowStart = new Date(now.getTime() - windowSeconds * 1000)

  const collection = db.collection('rate_limits')

  // 清理过期记录
  await collection.where({
    key,
    createdAt: db.command.lt(windowStart)
  }).remove()

  // 统计当前窗口内的请求数
  const countRes = await collection.where({
    key,
    createdAt: db.command.gte(windowStart)
  }).count()

  if (countRes.total >= maxRequests) {
    return false
  }

  // 记录本次请求
  await collection.add({
    data: { key, createdAt: now }
  })

  return true
}

module.exports = {
  init,
  success,
  fail,
  unauthorized,
  notFound,
  validate,
  getCurrentUser,
  createHandler,
  rateLimit,
}
