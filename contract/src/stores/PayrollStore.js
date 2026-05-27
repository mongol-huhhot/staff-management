// PayrollStore.js
// 給与計算項目のデフォルト値の管理関連ストア
// import { reactive, computed, ref,} from 'vue'
import { reactive, computed, ref, markRaw } from 'vue'
import { defineStore } from 'pinia'
import { useBaseStore } from '@/components/payroll/stores/BaseStore.js'
import { useAppConfigStore } from '@/components/payroll/stores/AppConfigStore'
import { ElNotification } from 'element-plus'
import dayjs from 'dayjs'
// import HeaderButton from '@/components/payroll/HeaderButton.vue'
// import HeaderButtonDialog from '@/components/payroll/HeaderButtonDialog.vue'

/**
 * IMPORTANT:
 *  - Do NOT store AG Grid colDefs (functions/components) inside Pinia state.
 *  - Build them on-demand with buildColumnsDefine().
 */
export const usePayrollStore = defineStore('payrollStore', () => {
  const baseStore = useBaseStore()
  const configStore = useAppConfigStore()
  configStore.loadFromWindow()

  // 定数定義コンテナー
  const CONST_DEF = {
    get_v_dat_salary_values: 'get_v_dat_salary_values',
    salary_item_list: 'get_salary_item',
    get_salary_detail: 'get_salary_detail',
    get_dat_salary_values: 'get_salary_list',
    save_tbx_salary_item_values: 'save_salary_detail',
    save_remarks_item_values: 'save_remarks_item_values',
    delete_restore_staff_salary: 'delete_restore_staff_salary',
    save_monthly_closed: 'save_monthly_closed',
    cancel_monthly_closed: 'cancel_monthly_closed',
    prn_month_end_do_payroll: 'prn_month_end_do_payroll',
    prn_month_end_do_payroll_batch: 'prn_month_end_do_payroll_batch',
    prn_monthly_type_change_payroll_batch: 'prn_monthly_type_change_payroll_batch',
    get_salary_list: 'get_salary_list',
    payroll_calculation: 'payroll_calculation',
    salary_payroll_closing_cancel: 'salary_payroll_closing_cancel',
    do_master_interoperability: 'do_master_interoperability',
    salary_payroll_approving: 'salary_payroll_approving',
  }

  // ✅ Pinia state must be JSON-serializable
  const states = reactive({
    current_month: '',
    current_approve_deadline: '',
    attributes: null,
    window_btn: 3,
    currentRow: null,
    currentItemDetails: null,
  })

  // ✅ data container (keep serializable only)
  const data = reactive({
    get_v_dat_salary_values: [],
    salary_item_list: [],
    staff_salary_details: [],
    staff_remarks_details: [],
    get_salary_detail: [],
    get_dat_salary_values: [],
    dialog_data: [],
    get_salary_list: [], // you use it
  })

  const params = reactive({
    attributes: {},
  })

  /**
   * ✅ Serializables only:
   * store only the salary item definitions (item_name, item_label, etc.)
   * DO NOT store AG Grid colDefs here.
   */
  const salaryItemDefs = ref([]) // array of DB items (serializable)

  /**
   * Build "init" columns on-demand.
   * - can safely include functions (onCellClicked) because this result is NOT stored in pinia state.
   */
  function buildInitColumns(onRowClicked) {
    return [
      {
        headerName: '',
        colId: '__select__',
        width: 42,
        pinned: 'left',
        checkboxSelection: true,
        headerCheckboxSelection: 'multiple',
        headerCheckboxSelectionFilteredOnly: true,
        sortable: false,
        filter: false,
        resizable: false,
        suppressHeaderMenuButton: true,
        cellStyle: { textAlign: 'center', padding: '4px' },
      },
      {
        headerName: '給与月',
        field: 'salary_month',
        cellStyle: { textAlign: 'center', padding: '4px' },
        pinned: 'left',
        resizable: true,
        sortable: true,
        filter: true,
        flex: 1,
      },
      {
        field: 'staff_code',
        headerName: '社員コード',
        cellStyle: { textAlign: 'center', padding: '4px',
            color: '#1976d2',          // blue
            textDecoration: 'underline',
            cursor: 'pointer',         // optional (クリック可能っぽく見せる)
        },
        pinned: 'left',
        onCellClicked: onRowClicked || undefined,
      },
      {
        field: 'staff_name',
        headerName: '社員名',
        cellStyle: { textAlign: 'left', padding: '4px',
            color: '#1976d2',          // blue
            textDecoration: 'underline',
            cursor: 'pointer',         // optional (クリック可能っぽく見せる)
        },
        pinned: 'left',
        onCellClicked: onRowClicked || undefined,
      },
      {
          field: 'payroll_closed_status',
          headerName: '締め状態',
          pinned: 'left',
          cellStyle: { textAlign: 'center', padding: '4px' },
      },
      {
          field: 'payroll_approved_status',
          headerName: '承認状態',
          pinned: 'left',
          cellStyle: { textAlign: 'center', padding: '4px' },
      },
      { field: 'group_name', headerName: '給与形態名', cellStyle: { textAlign: 'left', padding: '4px' } },
      { field: 'pre_department_id', headerName: '上流部門コード', cellStyle: { textAlign: 'left', padding: '4px' } },
      { field: 'department_id', headerName: '事業所コード', cellStyle: { textAlign: 'center', padding: '4px' } },
      { field: 'department_name', headerName: '事業所名', cellStyle: { textAlign: 'left', padding: '4px' } },
    ]
  }

  /**
   * ✅ Build colDefs for the current salary items list.
   * This replaces your old columnsDefine ref.
   *
   * Usage in component:
   *   const cols = salaryData.buildColumnsDefine((p)=>salaryData.rowCliked(p))
   *   <AgGridPro :columns="cols" ... />
   */
  function buildColumnsDefine(onRowClicked) {
    const cols = buildInitColumns(onRowClicked)

    const items = Array.isArray(salaryItemDefs.value) ? salaryItemDefs.value : []
    for (let i = 0; i < items.length; i++) {
      cols.push({
        headerName: items[i].item_label,
        field: items[i].item_name,
        cellStyle: { textAlign: 'right', padding: '4px' },
      })
    }
    return cols
  }

  /**
   * Keep the CSV / dialog column templates OUT of pinia state.
   * markRaw prevents Vue from making them reactive (extra-safe).
   */
  const columns = markRaw({
    salary_csv: [
      {
        field: 'salary_month',
        headerName: '給与支給日付',
        cellStyle: { textAlign: 'center', padding: '4px' },
        // headerComponent: markRaw(HeaderButtonDialog),
        pinned: 'left',
        // resizable: true,
        // sortable: true,
        // filter: true,
        // flex: 1,
      },
      { field: 'staff_code', headerName: '社員コード', cellStyle: { textAlign: 'center', padding: '4px' }, pinned: 'left' },
      { field: 'staff_name', headerName: '社員名', cellStyle: { textAlign: 'left', padding: '4px' }, pinned: 'left' },
      // ... (keep the rest as-is; they are templates, not persisted)
    ],

    monthly_closed: [
      {
        field: 'salary_month',
        headerName: '給与支給日付',
        cellStyle: { textAlign: 'center', padding: '4px' },
        // headerComponent: markRaw(HeaderButtonDialog),
        pinned: 'left',
        // resizable: true,
        // sortable: true,
        // filter: true,
        // flex: 1,
      },
      { field: 'staff_id', headerName: '社員コード', cellStyle: { textAlign: 'center', padding: '4px' }, pinned: 'left' },
      { field: 'staff_name', headerName: '社員名', cellStyle: { textAlign: 'left', padding: '4px' }, pinned: 'left' },
      { field: 'department_id', headerName: '部門コード', cellStyle: { textAlign: 'left', padding: '4px' } },
      { field: 'department_name', headerName: '部門名', cellStyle: { textAlign: 'left', padding: '4px' } },
      {
        field: 'monthly_closed',
        headerName: 'ステータス',
        cellStyle: { textAlign: 'left', padding: '4px' },
        cellClassRules: {
          'light-green-background': (params) => params.value === '月次締め処理済み',
          'light-red-background': (params) => params.value !== '月次締め処理済み',
        },
      },
    ],

    type_change: [
      {
        headerName: '給与月',
        field: 'salary_month',
        cellStyle: { textAlign: 'center', padding: '4px' },
        // headerComponent: markRaw(HeaderButton),
        pinned: 'left',
        // resizable: true,
        // sortable: true,
        // filter: true,
        // flex: 1,
      },
      { field: 'staff_id', headerName: '社員コード', cellStyle: { textAlign: 'center', padding: '4px' }, pinned: 'left' },
      { headerName: '社員名', field: 'staff_name', cellStyle: { textAlign: 'left', padding: '4px' }, pinned: 'left' },
      { headerName: '新体系', field: 'new_salary_type_code', cellStyle: { textAlign: 'center', padding: '4px' } },
      { headerName: '適用開始日', field: 'effective_date', cellStyle: { textAlign: 'center', padding: '4px' } },
      { headerName: '基本給', field: 'JA100', cellStyle: { textAlign: 'center', padding: '4px' } },
      { headerName: '日給単価', field: 'J1101', cellStyle: { textAlign: 'center', padding: '4px' } },
      { headerName: '時給単価A', field: 'J1201', cellStyle: { textAlign: 'center', padding: '4px' } },
    ],
  })

  // 給与日と表示している月から算出する「承認、承認解除操作ができるか」のフラグ。2026/02/24 佐藤編集
  const checkPayrollClosingCancelable = computed(() => {
    const cancelablePeriodDay = configStore.PAYROLL_MAIN_CONFIG.CANCELABLE_PERIOD

    const salaryDay = dayjs(states.current_month).format(`YYYY-MM-${configStore.PAYROLL_MAIN_CONFIG.SALARY_DAY}`)
    const today = dayjs()
    const diffDays = today.diff(dayjs(salaryDay), "day")
    console.log('diffDay is:',diffDays)
    // we use "disabled" of the HTMML TAG. it will be disabled is true
    if (diffDays > cancelablePeriodDay) return true

    return false
  })

  /**
   * Replace old setColumns(dat)
   * now it stores only the serializable item defs list.
   */
  function setColumns(dat) {
    if (!dat) return []
    salaryItemDefs.value = Array.isArray(dat) ? dat : [dat]
    return salaryItemDefs.value
  }

  /**
   * 月次スタッフ給与項目を取得する
   */
  const getSalaryItems = async (p = {}) => {
    const ret = await load('salary_item_list', { ...p })
    if (!ret || ret.length === 0) return ret

    data.salary_item_list = ret
    setColumns(ret)
    return ret
  }

  async function rowCliked(v) {
    states.currentRow = v?.data || null
    await loadCurrentStaffSalary()
  }

  /**
   * 月次スタッフ給与明細一覧を取得する
   */
  const getStaffSalaryList = async (p = {}) => {
    await load('get_salary_list', { ...p })

    data.get_salary_list?.forEach(el => {
      if (!el.jsonb_item) return
      try {
        if (typeof el.jsonb_item === 'string') {
          el.jsonb_item = JSON.parse(el.jsonb_item)
          Object.assign(el, el.jsonb_item)
          delete el.jsonb_item
        }
      } catch (error) {
        console.error('Error parsing JSON string:', error)
      }
    })

  }

  async function loadCurrentStaffSalary() {
    if (!states.currentRow) return

    const p = {
      salary_date: states.currentRow.salary_date,
      staff_id: states.currentRow.staff_code,
      salary_group_code: states.currentRow.salary_group_code,
    }

    const ret = await load('get_salary_detail', { ...p })
    if (!ret || ret.length === 0) return
    return ret
  }

  const doInteroperability = async ( p = {} ) => {
    return await load('do_master_interoperability', p)
  }

  const payrollCalculation = async (p = {}) => {
    return await load('payroll_calculation', p)
  }

  const saveValuesBatch = async (p = {}) => {
    await save('save_tbx_salary_item_values', p)
    loadCurrentStaffSalary()
  }

  const salaryPayrollClosingCancel = async (p = {}) => {
    return await save('salary_payroll_closing_cancel', p)
  }

  const salaryPayrollApproving = async (p = {}) => {
    await save('salary_payroll_approving', p)
  }

  const deleteStaffSalary = async (p = {}) => {
    const ret = await load('delete_restore_staff_salary', p)
    if (ret && ret.length !== 0) {
      ElNotification({
        title: '',
        message: '給与データが削除されました',
        type: 'warning',
      })
    }
  }

  const createResidentFBData = async () => {
    const p = {
      yearmonth: states.current_month,      // 現在表示している月。YYYY-MM-DD形式。
      fb_type: '11',                        // 給与情報を扱う部分なので11固定。
      updated_by: 'sysadmin'                // ログインして外部ファイルから操作ユーザの情報が渡ってきたらここで受け取る。
    }
    await save('create_resident_fb_data', p)
  }

  // const cancelMonthlyClosed = async (p = {}) => {
  //   await save('cancel_monthly_closed', p)
  // }

  // const saveRemarksBatch = async (p = {}) => {
  //   await save('save_remarks_item_values', p)
  //   loadCurrentStaffSalary()
  // }

  const monthEndPayroll = async (p = {}) => {
    await load('prn_month_end_do_payroll', p)

    const ret = await load('prn_month_end_do_payroll_batch', p)
    if (ret && ret.length !== 0) {
      ElNotification({
        title: '',
        message: '再計算されました',
        type: 'warning',
      })
    }
  }

  const doTypeChangeBatch = async (p = {}) => {
    await load('prn_monthly_type_change_payroll_batch', p)
  }

  const csvData = [
    { salary_month: '202409', staff_id: '319096', staff_name: '鶴岡　良枝', new_salary_type_code: 'jfsg230540_monthly', effective_date: '2024/9/11', JA100: 210000, J1201: 0, J1101: 0 },
    { salary_month: '202409', staff_id: '110591', staff_name: '三浦　美香', new_salary_type_code: 'jfsg230540_hourly', effective_date: '2024/8/30', JA100: 0, J1201: 1500, J1101: 0 },
    { salary_month: '202409', staff_id: '110026', staff_name: '八木　清子', new_salary_type_code: 'jfsg230540_daily', effective_date: '2024/9/6', JA100: 0, J1201: 0, J1101: 10000 },
  ]

  const generateComputedCategory = (category) => {
    return computed(() => data.get_salary_detail?.filter(e => e.setting_tag === category))
  }

  const useSalaryCategories = () => {
    const categories = ['payment_main', 'deduction_main', 'attendance_main', 'unit_price', 'remarks']
    const computedCategories = {}
    categories.forEach(category => {
      computedCategories[`${category}Items`] = generateComputedCategory(category)
    })
    return computedCategories
  }

  const useRemarksCategories = () => {
    const categories = ['remarks']
    const computedCategories = {}
    categories.forEach(category => {
      computedCategories[`${category}Items`] = {}
    })
    return computedCategories
  }

  async function load(sqlkey = null, param = {}) {
    if (!sqlkey) return null
    const sqltag = CONST_DEF[sqlkey]

    try {
      const ret = await baseStore.load(sqltag, param)
      data[sqlkey] = ret ? ret : []
      return data[sqlkey]
    } catch (error) {
      console.log(error)
      return null
    }
  }

  const save = async (sqlkey = null, p = {}) => {
    const sqltag = CONST_DEF[sqlkey]
    try {
      return await baseStore.save(sqltag, p)
    } catch (error) {
      console.log(error)
      return null
    }
  }

  const loadData = async (p = {}) => {
    const sql_tag = p.itemkey
    return await baseStore.load(sql_tag, p)
  }

  return {
    // state
    states,
    data,
    params,

    // serializable defs
    salaryItemDefs,

    // templates (NOT persisted)
    columns,

    // build AG Grid columns on-demand
    buildColumnsDefine,
    buildInitColumns,

    // actions
    getSalaryItems,
    getStaffSalaryList,
    useSalaryCategories,
    useRemarksCategories,
    setColumns,
    rowCliked,
    salaryPayrollClosingCancel, 
    saveValuesBatch,
    // saveRemarksBatch,
    // saveMonthlyClosed,
    // cancelMonthlyClosed,
    deleteStaffSalary,
    loadData,
    payrollCalculation,
    monthEndPayroll,
    doTypeChangeBatch,
    doInteroperability,
    salaryPayrollApproving,
    createResidentFBData,
    csvData,
    checkPayrollClosingCancelable,
  }
})
