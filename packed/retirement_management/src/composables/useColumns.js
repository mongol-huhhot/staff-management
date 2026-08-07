export const RETIREMENT_STATUS_LABELS = {
    self_applied: '本人申請',
    proxy_applied: '代理申請',
    approving: '承認中',
    approved: '承認済',
    remanded: '差戻し',
    draft: '下書き',
    submitted: '提出済',
    completed: '完了',
}

// 手続き進捗（コード→表示名）
export const PROCEDURE_STATUS_LABELS = {
    not_started: '未着手',
    in_progress: '対応中',
    completed: '完了',
}

// 資料添付状況（コード→表示名）
export const ATTACH_STATUS_LABELS = {
    not_attached: '資料未添付',
    attached: '資料添付済',
}

const statusLabel = (code) =>
    RETIREMENT_STATUS_LABELS[code] || code || ''

const attachLabel = (code) =>
    ATTACH_STATUS_LABELS[code] || code || ''

function statusCellStyle(params) {
    const base = { textAlign: 'center' }

    switch (params.data?.status) {
        case 'approved':
            return { ...base, color: '#2e7d32', fontWeight: 'bold' }
        case 'remanded':
            return { ...base, color: '#c62828', fontWeight: 'bold' }
        default:
            return base
    }
}

// 複数行表示セル（id + 名称 など）の共通スタイル
const MULTILINE_CELL_STYLE = {
    whiteSpace: 'pre-line',
    lineHeight: '1.5',
    textAlign: 'center',
}

// ---- スタッフ入退管理 (現場手続き / 人事手続き) 共通の列 ----
// 先頭: 手続きボタン + 進捗。以降は旧 退職願承認 一覧の情報列を引き継ぐ。
export function buildProcedureColumns({ onProcedureClicked } = {}) {
    return [
        {
            field: '__procedure__',
            headerName: '手続き',
            pinned: 'left',
            width: 110,
            sortable: false,
            filter: false,
            valueGetter: () => '',
            cellRenderer: () => '<span class="rm-btn rm-btn--primary">手続き</span>',
            onCellClicked: (p) => onProcedureClicked?.(p),
            cellStyle: { textAlign: 'center', cursor: 'pointer' },
        },
        {
            field: 'procedure_status',
            headerName: '進捗',
            width: 130,
            valueGetter: (p) =>
                PROCEDURE_STATUS_LABELS[p.data?.procedure_status] || p.data?.procedure_status || '',
            cellRenderer: (p) => {
                const cls = p.data?.procedure_status === 'completed'
                    ? 'rm-badge rm-badge--ok'
                    : 'rm-badge rm-badge--warn'
                return `<span class="${cls}">${p.value}（${p.data?.done_cnt ?? 0}/${p.data?.req_cnt ?? 0}）</span>`
            },
            cellStyle: { textAlign: 'center' },
        },
        {
            field: 'attach_status',
            headerName: '資料添付',
            width: 140,
            valueGetter: (p) => attachLabel(p.data?.attach_status),
            cellRenderer: (p) => {
                const cls = p.data?.attach_status === 'attached'
                    ? 'rm-badge rm-badge--ok'
                    : 'rm-badge rm-badge--warn'
                return `<span class="${cls}">${p.value}</span>`
            },
            cellStyle: { textAlign: 'center' },
        },
        {
            field: 'required_documents',
            headerName: '必要資料',
            autoHeight: true,
            valueGetter: (p) => {
                const v = p.data?.required_documents
                return Array.isArray(v) ? v.join('\n') : (v ?? '')
            },
            cellStyle: { ...MULTILINE_CELL_STYLE, textAlign: 'left' },
        },
        {
            field: 'staff_name',
            headerName: 'スタッフ名',
            autoHeight: true,
            valueGetter: (p) =>
                `id:${p.data?.staff_code ?? ''}\n${p.data?.staff_name ?? ''}`,
            cellStyle: { ...MULTILINE_CELL_STYLE, textAlign: 'left' },
        },
        {
            field: 'employee_category',
            headerName: '社員区分',
            cellStyle: { textAlign: 'center' },
        },
        {
            field: 'department_name',
            headerName: '部署/事業所',
            autoHeight: true,
            valueGetter: (p) =>
                `id: ${p.data?.department_id ?? ''}\n${p.data?.department_name ?? ''}`,
            cellStyle: { ...MULTILINE_CELL_STYLE, textAlign: 'left' },
        },
        {
            field: 'branch_name',
            headerName: '親部署/支店',
            autoHeight: true,
            valueGetter: (p) =>
                `id: ${p.data?.branch_id ?? ''}\n${p.data?.branch_name ?? ''}`,
            cellStyle: MULTILINE_CELL_STYLE,
        },
        {
            field: 'request_status',
            headerName: '申請ステータス',
            width: 130,
            valueGetter: (p) => statusLabel(p.data?.request_status),
            cellStyle: { textAlign: 'center' },
        },
        {
            field: 'submitted_at',
            headerName: '提出日',
            sortable: true,
            cellStyle: { textAlign: 'center' },
        },
        {
            field: 'mail_registered',
            headerName: 'メール登録状況',
            width: 120,
            valueGetter: (p) => (p.data?.mail_registered ? '○' : '×'),
            cellStyle: { textAlign: 'center' },
        },
        {
            field: 'hire_date',
            headerName: '入社日',
            sortable: true,
            cellStyle: { textAlign: 'center' },
        },
        {
            field: 'resignation_date',
            headerName: '退職日',
            sortable: true,
            cellStyle: { textAlign: 'center' },
        },
    ]
}

export function buildRetirementColumns({ onProcessClicked, onConfirmClicked, onAttachClicked } = {}) {
    return [
        {
            field: '__request__',
            headerName: '退職届',
            pinned: 'left',
            width: 130,
            sortable: false,
            filter: false,
            valueGetter: () => '',
            cellRenderer: (p) => p.data?.status
                ? '<span class="rm-btn rm-btn--primary">退職届確認</span>'
                : '<span class="rm-btn rm-btn--secondary">退職処理</span>',
            onCellClicked: (p) => {
                const handler = p.data?.status ? onConfirmClicked : onProcessClicked
                handler?.(p)
            },
            cellStyle: { textAlign: 'center', cursor: 'pointer' },
        },
        {
            field: 'attach_status',
            headerName: '資料添付',
            width: 140,
            valueGetter: (p) => attachLabel(p.data?.attach_status),
            cellRenderer: (p) => {
                if (!p.data?.status) return ''
                const cls = p.data?.attach_status === 'attached'
                    ? 'rm-badge rm-badge--ok'
                    : 'rm-badge rm-badge--warn'
                return `<span class="${cls}">${p.value}</span>`
            },
            onCellClicked: onAttachClicked || undefined,
            cellStyle: { textAlign: 'center', cursor: 'pointer' },
        },
        {
            field: 'required_documents',
            headerName: '必要資料',
            autoHeight: true,
            valueGetter: (p) => {
                const v = p.data?.required_documents
                return Array.isArray(v) ? v.join('\n') : (v ?? '')
            },
            cellStyle: { ...MULTILINE_CELL_STYLE, textAlign: 'left' },
        },
        {
            field: 'staff_name',
            headerName: 'スタッフ名',
            autoHeight: true,
            valueGetter: (p) =>
                `id:${p.data?.staff_code ?? ''}\n${p.data?.staff_name ?? ''}`,
            cellStyle: { ...MULTILINE_CELL_STYLE, textAlign: 'left' },
        },
        {
            field: 'employee_category',
            headerName: '社員区分',
            cellStyle: { textAlign: 'center' },
        },
        {
            field: 'department_name',
            headerName: '部署/事業所',
            autoHeight: true,
            valueGetter: (p) =>
                `id: ${p.data?.department_id ?? ''}\n${p.data?.department_name ?? ''}`,
            cellStyle: { ...MULTILINE_CELL_STYLE, textAlign: 'left' },
        },
        {
            field: 'parent_department_name',
            headerName: '親部署/支店',
            autoHeight: true,
            valueGetter: (p) =>
                `id: ${p.data?.parent_department_id ?? ''}\n${p.data?.parent_department_name ?? ''}`,
            cellStyle: MULTILINE_CELL_STYLE,
        },
        {
            field: 'status',
            headerName: '退職届ステータス',
            valueGetter: (p) => statusLabel(p.data?.status),
            cellStyle: statusCellStyle,
        },
        {
            field: 'submitted_at',
            headerName: '提出日',
            sortable: true,
            cellStyle: { textAlign: 'center' },
        },
        {
            field: 'mail_registered',
            headerName: 'メール登録状況',
            width: 120,
            valueGetter: (p) => (p.data?.mail_registered ? '○' : '×'),
            cellStyle: { textAlign: 'center' },
        },
        {
            field: 'hire_date',
            headerName: '入社日',
            sortable: true,
            cellStyle: { textAlign: 'center' },
        },
        {
            field: 'resignation_date',
            headerName: '退職日',
            sortable: true,
            cellStyle: { textAlign: 'center' },
        },
        {
            field: 'proxy_creator',
            headerName: '代理作成者',
            cellStyle: { textAlign: 'center' },
        },
        {
            field: 'last_approval_history',
            headerName: '最終承認履歴',
            cellStyle: { textAlign: 'center' },
        },
    ]
}
