const f_color = (params) => {
    if (params.data?.is_monthly_changed && params.data.approved_status) {
        return {
            backgroundColor: '#22a710',
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center'
        }
    }
    if (params.data?.is_monthly_changed) {
        return {
            backgroundColor: '#409EFF',
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center'
        }
    }
    if (params.data?.is_monthly_change_candidate) {
        return {
            backgroundColor: '#ffd966',
            color: '#333',
            fontWeight: 'bold',
            textAlign: 'center'
        }
    }
    return { textAlign: 'center',  }
}

/**
 * Build "init" columns on-demand.
 * - can safely include functions (onCellClicked) because this result is NOT stored in pinia state.
 */
export function buildInitColumns(onRowClicked) {
    return [
        {
            headerName: '給与月',
            field: 'salary_date',
            cellStyle: { textAlign: 'center', padding: '4px' },
            pinned: 'left',
            resizable: true,
            sortable: true,
            filter: true,
            flex: 1,
        },
        // { FIELD: 'staff_id', headerName: 'スタッフID', },
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
            flex:1,
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
            flex:1,
        },
        {
            headerName: '状態',
            field: 'row_status',
            valueGetter: (params) => {
                if (params.data?.is_monthly_changed && params.data.approved_status) return '1.月変確定'
                if (params.data?.is_monthly_changed) return '2.月変保存'
                if (params.data?.is_monthly_change_candidate) return '3.候補者'
                return '4.未定'
            },
            cellStyle: f_color,
        },
        { field: 'group_code', headerName: '給与グループコード',cellStyle: { textAlign: 'left', padding: '4px' }, flex:1, },
        { field: 'group_name', headerName: '給与グループ名', cellStyle: { textAlign: 'left', padding: '4px' }, flex:1, },
        { field: 'department_id', headerName: '部門ID', cellStyle: { textAlign: 'left', padding: '4px' }, flex:1, },
        { field: 'department_name', headerName: '部門名', cellStyle: { textAlign: 'left', padding: '4px' }, flex:1, },
        { field: 'pre_department_id', headerName: '上流部門コード', cellStyle: { textAlign: 'left', padding: '4px' }, flex:1, },
        { field: 'emp_status_name', headerName: '雇用区分', cellStyle: { textAlign: 'left', padding: '4px' }, flex:1, },

        { field: 'is_monthly_changed', headerName: '固定的賃金変動あり',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'is_monthly_change_candidate', headerName: '月額変更候補',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },

        { field: 'monthly_change_candidate_reason', headerName: '候補判定理由',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },            
        { field: 'is_common_monthly_change_target', headerName: '健保月変対象',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'is_nation_monthly_change_target', headerName: '年金月変対象',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },

        { field: 'result_source', headerName: '判定データ種別',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'base_day_check', headerName: '支払基礎日数判定',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },


        { field: 'existing_common_insurance_grade', headerName: '従前健保等級',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'existing_nation_insurance_grade', headerName: '従前年金等級',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },

        { field: 'change_start_month', headerName: '変動開始月',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'revision_apply_month', headerName: '改定適用月',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'avg_common_insurance_grade', headerName: '平均健保等級',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'avg_nation_insurance_grade', headerName: '平均年金等級',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'common_grade_diff', headerName: '健保等級差',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'nation_grade_diff', headerName: '年金等級差',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'is_common_grade_changed_2_or_more', headerName: '健保2等級差以上',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'is_nation_grade_changed_2_or_more', headerName: '年金2等級差以上',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'is_common_grade_changed_1_at_edge', headerName: '健保1等級端差特例',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'is_nation_grade_changed_1_at_edge', headerName: '年金1等級端差特例',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },

        { field: 'short_time_worker_flag', headerName: '短時間労働者区分', cellStyle: { textAlign: 'center', padding: '4px' }, flex:1,},
        { field: 'short_time_worker_type', headerName: '被保険者種別', cellStyle: { textAlign: 'center', padding: '4px' }, flex:1,},
        { field: 'required_days', headerName: '判定必要日数',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'required_days_3m_ago', headerName: '3か月前必要日数',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'required_days_2m_ago', headerName: '2か月前必要日数',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'required_days_1m_ago', headerName: '1か月前必要日数',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'j9107_3m_ago', headerName: '3か月前報酬月額',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'j9107_2m_ago', headerName: '2か月前報酬月額',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'j9107_1m_ago', headerName: '1か月前報酬月額',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'j150_3m_ago', headerName: '3か月前支払基礎日数',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'j150_2m_ago', headerName: '2か月前支払基礎日数',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'j150_1m_ago', headerName: '1か月前支払基礎日数',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'is_base_day_ok_3m_ago', headerName: '3か月前日数充足',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'is_base_day_ok_2m_ago', headerName: '2か月前日数充足',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'is_base_day_ok_1m_ago', headerName: '1か月前日数充足',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'total_j9107_3m', headerName: '3か月報酬合計',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'avg_j9107_3m', headerName: '3か月平均報酬月額',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'average_target_month_count', headerName: '平均対象月数',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'is_retroactive', headerName: '遡及対象',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },

        { field: 'health_insured_flag', headerName: '健康保険加入フラグ',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'employment_insured_flag', headerName: '雇用保険加入フラグ',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'maternity_childcare_exempt_flag', headerName: '産休・育休等保険料免除フラグ',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'fixed_wage_change_suspected', headerName: '固定的賃金変動の疑い',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },            
        { field: 'fixed_wage_change_reason', headerName: '固定的賃金変動の判断理由',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },
        { field: 'already_processed_flag', headerName: '既処理フラグ',  cellStyle: { textAlign: 'right', padding: '4px' }, flex:1,  },            
    ]

    // [
    // // {
    // //     headerName: '',
    // //     colId: '__select__',
    // //     width: 42,
    // //     pinned: 'left',
    // //     checkboxSelection: true,
    // //     headerCheckboxSelection: 'multiple',
    // //     headerCheckboxSelectionFilteredOnly: true,
    // //     sortable: false,
    // //     filter: false,
    // //     resizable: false,
    // //     suppressHeaderMenuButton: true,
    // //     cellStyle: { textAlign: 'center', padding: '4px' },
    // //     flex:1,
    // // },

    // ]
}
