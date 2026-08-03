const LIST_COLUMNS = [
    { category: null, field: 'staff_code', headerName: '社員番号', clickable: true },
    { category: 'basic', field: 'staff_name', headerName: '氏名（漢字）', clickable: true },
    { category: 'basic', field: 'kana_name', headerName: '氏名（カナ）' },
    { category: 'contract', field: 'is_activity', headerName: '有効状態' },
    { category: 'basic', field: 'koseki_given_name', headerName: '戸籍（名）' },
    { category: 'basic', field: 'remarks', headerName: '備考欄' },
    { category: 'contract', field: 'student_type', headerName: '学生区分' },
    { category: 'address', field: 'town', headerName: '町域' },
    { category: 'contact', field: 'mobile_phone', headerName: '携帯電話' },
    { category: 'contact', field: 'phone_number', headerName: '電話番号' },
    { category: 'address', field: 'prefecture', headerName: '都道府県' },
    { category: 'basic', field: 'koseki_family_name', headerName: '戸籍（姓）' },
    { category: 'mynumber', field: 'mynumber', headerName: 'マイナンバー' },
    { category: 'address', field: 'postal_code', headerName: '郵便番号' },
    { category: 'basic', field: 'koseki_family_name_kana', headerName: '戸籍フリガナ（姓）' },
    { category: 'basic', field: 'koseki_given_name_kana', headerName: '戸籍フリガナ（名）' },
    { category: 'traffic', field: 'method_transport', headerName: '通勤手段' },
    { category: 'mynumber', field: 'reference_number', headerName: '参照番号' },
    { category: 'address', field: 'residence_address1', headerName: '住民票住所1' },
    { category: 'address', field: 'residence_address1_kana', headerName: '住民票住所1（カナ）' },
    { category: 'contract', field: 'resignation_date_actual', headerName: '退職日（資格喪失日）' },
    { category: 'contract', field: 'resignation_date', headerName: '退職日' },
    { category: 'address', field: 'address_line1', headerName: '番地' },
    { category: 'address', field: 'address_line2', headerName: '建物名・部屋番号' },
    { category: 'basic', field: 'birthday', headerName: '生年月日' },
    { category: 'address', field: 'city', headerName: '市区町村' },
    { category: 'address', field: 'residence_address2', headerName: '住民票住所2' },
    { category: 'address', field: 'residence_address2_kana', headerName: '住民票住所2（カナ）' },
    { category: 'address', field: 'residence_expire', headerName: '在留期限' },
    { category: 'address', field: 'residence_post_code1', headerName: '住民票 郵便番号（前3桁）' },
    { category: 'address', field: 'residence_post_code2', headerName: '住民票 郵便番号（後4桁）' },
    { category: 'contract', field: 'resignation_remark', headerName: '退職備考' },
    { category: 'contract', field: 'company_id', headerName: '会社ID' },
    { category: 'basic', field: 'country', headerName: '国' },
    { category: 'contract', field: 'department_id', headerName: '部署ID' },
    { category: 'contact', field: 'email', headerName: 'メールアドレス' },
    { category: 'contact', field: 'emergency_address1', headerName: '緊急連絡先住所1' },
    { category: 'contact', field: 'emergency_address2', headerName: '緊急連絡先住所2' },
    { category: 'contact', field: 'emergency_contact_name', headerName: '緊急連絡先氏名' },
    { category: 'contact', field: 'emergency_contact_phone', headerName: '緊急連絡先電話番号' },
    { category: 'contact', field: 'emergency_contact_relationship', headerName: '続柄' },
    { category: 'contract', field: 'employee_number', headerName: '従業員番号' },
    { category: 'basic', field: 'disabled_info', headerName: '障がい区分' },
    { category: 'contract', field: 'enrollment_class', headerName: '在籍区分' },
    { category: 'basic', field: 'foreigner', headerName: '国籍区分' },
    { category: 'contract', field: 'hire_date', headerName: '入社日（資格取得日）' },
    { category: 'contract', field: 'induction_date', headerName: '入社日' },
    { category: 'insurance', field: 'insurance_qualification_code', headerName: '保険資格コード' },
    { category: 'contract', field: 'resignation_category', headerName: '退職事由カテゴリ' },
    { category: 'contract', field: 'employee_category', headerName: '雇用形態カテゴリ' },
    { category: 'basic', field: 'gender', headerName: '性別' },
]

// クリック可能セル（行選択）用の共通スタイル
const CELL_LINK_STYLE = {
    textAlign: 'center', padding: '4px',
    color: '#1976d2',          // blue
    textDecoration: 'underline',
    cursor: 'pointer',         // optional (クリック可能っぽく見せる)
}

/**
 * Build "init" columns on-demand.
 * - can safely include functions (onCellClicked) because this result is NOT stored in pinia state.
 */
export function buildInitColumns(onRowClicked) {
    return LIST_COLUMNS.map((col) => {
        const def = {
            field: col.category ? `${col.category}.${col.field}` : col.field,
            headerName: col.headerName,
        }

        if (col.category) {
            def.valueGetter = (p) => p.data?.[col.category]?.[col.field] ?? ''
        }

        if (col.clickable) {
            def.cellStyle = { ...CELL_LINK_STYLE }
            def.pinned = 'left'
            def.onCellClicked = onRowClicked || undefined
            def.flex = 1
        }

        return def
    })
}
