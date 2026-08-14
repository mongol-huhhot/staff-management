// src/composables/formParamBuilder.js

export function removeSystemFields(data) {
  if (Array.isArray(data)) {
    return data.map(item => removeSystemFields(item))
  }

  if (data == null || typeof data !== 'object') {
    return data
  }

  const copied = {}

  Object.entries(data).forEach(([key, value]) => {
    if (key === '__uuid') return

    copied[key] = removeSystemFields(value)
  })

  return copied
}

export function omitKeys(data, keys = []) {
  if (Array.isArray(data)) {
    return data.map(item => omitKeys(item, keys))
  }

  if (data == null || typeof data !== 'object') {
    return data
  }

  const copied = { ...data }

  keys.forEach(key => {
    delete copied[key]
  })

  return copied
}

/**
 * 通常保存用パラメータ生成
 *
 * tabConfig example:
 *
 * {
 *   jsonb_fields: ['data_jsonb'],
 *   separate_items: [
 *     'id',
 *     'staff_id',
 *     'data_type',
 *     'valid_from',
 *     'request_type',
 *     'request_status',
 *     'request_comment',
 *     'new_request_status',
 *     'record_id'
 *   ]
 * }
 */
export function buildSaveParams(
  row = {},
  tabConfig = {},
  commonParams = {}
) {
  const cleanRow = removeSystemFields(row) || {}

  const jsonbFields = Array.isArray(tabConfig?.jsonb_fields)
    ? tabConfig.jsonb_fields
    : []

  const separateItems = Array.isArray(tabConfig?.separate_items)
    ? tabConfig.separate_items
    : []

  const params = {
    ...commonParams,
  }

  if (jsonbFields.length > 0) {
    separateItems.forEach(key => {
      params[key] =
        cleanRow[key] ??
        commonParams[key] ??
        null
    })

    /*
     * 通常カラムと既存のdata_jsonb自身をJSON内部から除外する。
     * data_jsonbを除外しない場合、再保存時に次のような入れ子になる可能性がある。
     *
     * {
     *   "data_jsonb": "{...}",
     *   "field1": "..."
     * }
     */
    const jsonData = omitKeys(
      cleanRow,
      [
        ...separateItems,
        ...jsonbFields,
      ]
    )

    const jsonbColumn = jsonbFields[0]

    params[jsonbColumn] = JSON.stringify(jsonData || {})

    return params
  }

  return {
    ...params,
    ...cleanRow,
  }
}

/**
 * LOOP保存用
 */
export function buildLoopParams(
  rows = [],
  tabConfig = {},
  commonParams = {}
) {
  return {
    LOOP: rows.map(row =>
      buildSaveParams(
        row,
        tabConfig,
        commonParams
      )
    ),
  }
}