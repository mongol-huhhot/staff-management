export const mockTaskMaster = [
    // tab1 現場手続き (scope: branch)
    { task_code: 'handover_confirm', task_name: '業務引継確認',             task_scope: 'branch', required: true,  show_order: 10 },
    { task_code: 'uniform_return',   task_name: '制服・貸与品返却',         task_scope: 'branch', required: true,  show_order: 20 },
    { task_code: 'key_return',       task_name: '鍵・社員証返却',           task_scope: 'branch', required: true,  show_order: 30 },
    // tab2 人事手続き (scope: hr)
    { task_code: 'final_approval',   task_name: '最終承認',                 task_scope: 'hr', required: true,  show_order: 10 },
    { task_code: 'final_payroll',    task_name: '最終給与計算確認',         task_scope: 'hr', required: true,  show_order: 20 },
    { task_code: 'social_ins_loss',  task_name: '社会保険資格喪失手続',     task_scope: 'hr', required: true,  show_order: 30 },
    { task_code: 'doc_gensen',       task_name: '源泉徴収票発行・PDF添付',  task_scope: 'hr', required: false, show_order: 40 },
    { task_code: 'doc_rishoku',      task_name: '離職票発行・PDF添付',      task_scope: 'hr', required: false, show_order: 50 },
    { task_code: 'doc_shikaku',      task_name: '資格喪失証明書発行・PDF添付', task_scope: 'hr', required: false, show_order: 60 },
]

export const mockProcedureRows = [
    {
        request_id: 'req-001', staff_code: '407003', staff_name: '田中 花子',
        employee_category: '有期パート',
        department_id: '206240', department_name: '営業一課',
        branch_id: 'BR-TOKYO', branch_name: '東京支店',
        request_status: 'submitted', attach_status: 'not_attached',
        submitted_at: '2026-08-01 09:12:00', mail_registered: true,
        hire_date: '2022-04-01', resignation_date: '2026-09-30',
        doc_gensen: '要', doc_rishoku: '要', doc_shikaku: '不要',
    },
    {
        request_id: 'req-002', staff_code: '407004', staff_name: '鈴木 一郎',
        employee_category: '社員Ⅰ種（月給制）',
        department_id: '206250', department_name: '総務課',
        branch_id: 'BR-TOKYO', branch_name: '東京支店',
        request_status: 'submitted', attach_status: 'not_attached',
        submitted_at: '2026-08-03 14:40:00', mail_registered: true,
        hire_date: '2018-10-01', resignation_date: '2026-08-31',
        doc_gensen: '要', doc_rishoku: '不要', doc_shikaku: '不要',
    },
    {
        request_id: 'req-003', staff_code: '512001', staff_name: '佐藤 次郎',
        employee_category: '有期パート',
        department_id: '101830', department_name: '介護一課',
        branch_id: 'BR-OSAKA', branch_name: '大阪支店',
        request_status: 'submitted', attach_status: 'not_attached',
        submitted_at: '2026-08-05 11:05:00', mail_registered: false,
        hire_date: '2024-06-16', resignation_date: '2026-10-15',
        doc_gensen: '不要', doc_rishoku: '要', doc_shikaku: '要',
    },
    {
        request_id: 'req-004', staff_code: '512002', staff_name: '高橋 三郎',
        employee_category: '嘱託社員（日給月給制）',
        department_id: '101840', department_name: '介護二課',
        branch_id: 'BR-OSAKA', branch_name: '大阪支店',
        request_status: 'completed', attach_status: 'attached',
        submitted_at: '2026-07-20 10:00:00', mail_registered: true,
        hire_date: '2015-03-01', resignation_date: '2026-08-20',
        doc_gensen: '要', doc_rishoku: '要', doc_shikaku: '要',
    },
]

const DOC_LABELS = {
    doc_gensen: '源泉徴収票',
    doc_rishoku: '離職票',
    doc_shikaku: '資格喪失証明書',
}

const requiredDocuments = (row) =>
    Object.entries(DOC_LABELS)
        .filter(([key]) => row[key] === '要')
        .map(([, label]) => label)

// モジュールスコープで保持するので、画面遷移してもセッション中は残る
export const mockProgress = {
    'req-002': {
        handover_confirm: { task_status: 'done', note: '', done_at: '2026-08-05 10:00', done_by: '406001' },
    },
    'req-004': {
        handover_confirm: { task_status: 'done', note: '', done_at: '2026-08-10 09:00', done_by: '406001' },
        uniform_return:   { task_status: 'done', note: '', done_at: '2026-08-10 09:00', done_by: '406001' },
        key_return:       { task_status: 'done', note: '', done_at: '2026-08-10 09:00', done_by: '406001' },
        final_approval:   { task_status: 'done', note: '', done_at: '2026-08-11 15:00', done_by: 'hr0001' },
        final_payroll:    { task_status: 'done', note: '', done_at: '2026-08-12 14:00', done_by: 'hr0001' },
        social_ins_loss:  { task_status: 'done', note: '', done_at: '2026-08-12 14:00', done_by: 'hr0001' },
        doc_gensen:       { task_status: 'done', note: '', done_at: '2026-08-13 11:00', done_by: 'hr0001' },
        doc_rishoku:      { task_status: 'done', note: '', done_at: '2026-08-13 11:00', done_by: 'hr0001' },
        doc_shikaku:      { task_status: 'done', note: '', done_at: '2026-08-13 11:00', done_by: 'hr0001' },
    },
}

export const isTaskRequired = (task, row) =>
    task.required || (row && row[task.task_code] === '要')

// get_task_progress 相当
export const getMockTaskProgress = (requestId, scope) => {
    const row = mockProcedureRows.find(r => r.request_id === requestId)
    const progress = mockProgress[requestId] || {}

    return mockTaskMaster
        .filter(t => t.task_scope === scope)
        .sort((a, b) => a.show_order - b.show_order)
        .map(t => ({
            ...t,
            required: isTaskRequired(t, row),
            task_status: progress[t.task_code]?.task_status || 'pending',
            note: progress[t.task_code]?.note || '',
            done_at: progress[t.task_code]?.done_at || '',
            done_by: progress[t.task_code]?.done_by || '',
        }))
}

// save_task_progress 相当 
export const saveMockTaskProgress = (requestId, taskCode, taskStatus, note, loginUser) => {
    if (!mockProgress[requestId]) mockProgress[requestId] = {}

    mockProgress[requestId][taskCode] = {
        task_status: taskStatus,
        note: note || '',
        done_at: taskStatus === 'pending' ? '' : new Date().toISOString().slice(0, 16).replace('T', ' '),
        done_by: taskStatus === 'pending' ? '' : (loginUser || 'dev_user'),
    }

    const row = mockProcedureRows.find(r => r.request_id === requestId)
    const allDone = mockTaskMaster
        .filter(t => isTaskRequired(t, row))
        .every(t => ['done', 'na'].includes(mockProgress[requestId][t.task_code]?.task_status))

    if (row && allDone && row.request_status === 'submitted') {
        row.request_status = 'completed'
    }
}

// get_procedure_list 相当
export const getMockProcedureList = (scope) => {
    return mockProcedureRows
        .map(r => {
            const tasks = getMockTaskProgress(r.request_id, scope).filter(t => t.required)
            const done = tasks.filter(t => ['done', 'na'].includes(t.task_status)).length

            return {
                ...r,
                required_documents: requiredDocuments(r),
                done_cnt: done,
                req_cnt: tasks.length,
                procedure_status: done === 0 ? 'not_started'
                    : done < tasks.length ? 'in_progress' : 'completed',
            }
        })
}
