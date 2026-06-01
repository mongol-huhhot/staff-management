/**
 * タブ設定に応じて SQL 保存用ペイロードを組み立てる。
 *
 * save_strategy（index.js）:
 *   - jsonb_profile … staffs.upsert_staff_profile 形式
 *   - jsonb_field  … 単一 JSONB カラム（traffic_info 等）
 *   - flat         … カラム直マッピング（bank 等）
 */

function buildContext(currentRow = {}) {
  return {
    staff_code: currentRow.staff_code,
    staff_id: currentRow.staff_id,
    profile_version: currentRow.profile_version,
    files: currentRow.files,
  }
}

function requireStaffCode(ctx, formData) {
  const staffCode = ctx.staff_code || formData?.staff_code
  if (!staffCode) {
    throw new Error('staff_code が未設定です')
  }
  return staffCode
}

const strategies = {
  jsonb_profile(formData, ctx) {
    const staffCode = requireStaffCode(ctx, formData)
    return {
      staff_code: staffCode,
      profile_version: (ctx.profile_version ?? formData?.profile_version ?? 0) + 1,
      profile_jsonb: JSON.stringify(formData ?? {}),
      files: JSON.stringify(ctx.files ?? {}),
    }
  },

  jsonb_field(formData, ctx, tabConfig) {
    const staffCode = requireStaffCode(ctx, formData)
    const key = tabConfig.jsonb_fields?.[0]
    if (!key) {
      throw new Error(`jsonb_fields が未設定です (tab: ${tabConfig.label ?? 'unknown'})`)
    }
    return {
      staff_code: staffCode,
      [key]: JSON.stringify(formData ?? {}),
    }
  },

  flat(formData, ctx, tabConfig) {
    const payload = { ...(formData ?? {}) }

    for (const field of tabConfig.context_fields ?? []) {
      if (ctx[field] != null && payload[field] == null) {
        payload[field] = ctx[field]
      }
    }

    if (!payload.staff_code && !payload.staff_id && !ctx.staff_code && !ctx.staff_id) {
      throw new Error('staff_code または staff_id が未設定です')
    }

    if (!payload.staff_code && ctx.staff_code) {
      payload.staff_code = ctx.staff_code
    }
    if (!payload.staff_id && ctx.staff_id) {
      payload.staff_id = ctx.staff_id
    }

    return payload
  },
}

/**
 * save_strategy 未指定時は jsonb_fields から推論する。
 */
export function resolveSaveStrategy(tabConfig = {}) {
  if (tabConfig.save_strategy) {
    return tabConfig.save_strategy
  }
  const jsonbKey = tabConfig.jsonb_fields?.[0]
  if (jsonbKey === 'profile_jsonb') return 'jsonb_profile'
  if (jsonbKey) return 'jsonb_field'
  return 'flat'
}

/**
 * @param {object} tabConfig - tab2sqltag_list[tabCode]
 * @param {object} formData - タブのフラットフォームデータ
 * @param {object|null} currentRow - dataStore.states.currentRow
 * @returns {object} SQL パラメータ
 */
export function buildTabSavePayload(tabConfig, formData, currentRow = null) {
  const strategyName = resolveSaveStrategy(tabConfig)
  const strategy = strategies[strategyName]

  if (!strategy) {
    throw new Error(`Unknown save_strategy: ${strategyName}`)
  }

  const ctx = buildContext(currentRow ?? {})
  return strategy(formData, ctx, tabConfig)
}
