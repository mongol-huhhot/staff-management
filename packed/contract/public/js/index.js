window.appConfig = window.appConfig || {};
window.appConfig.MAIN_CONFIG = {
    staff_code: '11018',
    debug_mode: true,
    condition_date_mode: 'date',
    condition_date_format: 'YYYY-MM-DD',
    workflow_status: [ // 契約ワークフローステータス
        { value:'draft', label:'下書き' },
        { value:'prepared', label:'作成済み' },
        { value:'reviewing', label:'確認中' },
        { value:'waiting_employee_input', label:'本人入力待ち' },

        { value:'awaiting_employee_signature', label:'本人署名待ち' },
        { value:'employee_signed', label:'本人署名済み' },

        { value:'awaiting_company_signature', label:'組織署名待ち' },
        { value:'fully_signed', label:'締結済み' },

        { value:'cancelled', label:'取消' }
    ],
    contract_status : [ // 契約ステータス
        { value:'future', label:'将来適用' },
        { value:'current', label:'適用中' },
        { value:'expired', label:'期限切れ' },
    ],
    contract_type: [ // 契約種別
        { value: 'full_time', label: '正社員',},
        { value: 'part_time', label: 'パート',},
        { value: 'fixed_term', label: '契約社員（有期）',},
        { value: 'temporary', label: '派遣',},
    ],
    work_flow_definitions: {
        full_time: {
            step_order: 1,
            operator_role: 'admin, department_admin,operator,'
        }
    }

}


// -- 4. ワークフロー工程（承認・受領ステップ）
// CREATE TABLE workflow_steps (
//     step_id INT PRIMARY KEY AUTO_INCREMENT,
//     contract_id INT NOT NULL,
//     step_sequence INT NOT NULL,          -- 処理順序
//     step_type ENUM('approval', 'review', 'signature', 'receipt', 'notification') NOT NULL,
//     assignee_id INT NOT NULL,            -- 担当ユーザー
//     status ENUM('pending', 'completed', 'rejected', 'delegated', 'skipped') DEFAULT 'pending',
//     decision ENUM('approved', 'rejected') NULL, -- 完了時の判断
//     comment TEXT,
//     completed_at TIMESTAMP NULL,
//     deadline DATE NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (contract_id) REFERENCES contracts(contract_id) ON DELETE CASCADE,
//     FOREIGN KEY (assignee_id) REFERENCES users(user_id)
// );


