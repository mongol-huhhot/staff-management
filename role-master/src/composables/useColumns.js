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
        { field: 'role_code', headerName: 'ロール記号',
            cellStyle: { textAlign: 'left', padding: '4px',
                color: '#1976d2',          // blue
                textDecoration: 'underline',
                cursor: 'pointer',         // optional (クリック可能っぽく見せる)
            },
            pinned: 'left',
            onCellClicked: onRowClicked || undefined,
            flex:1,
        },
        { field: 'role_name', headerName: 'ロール名',
            cellStyle: { textAlign: 'left', padding: '4px',
                color: '#1976d2',          // blue
                textDecoration: 'underline',
                cursor: 'pointer',         // optional (クリック可能っぽく見せる)
            },
            pinned: 'left',
            onCellClicked: onRowClicked || undefined,
            flex:1,
        },
        { field: 'remarks', headerName: '説明',},
        { field: 'enabled', headerName: '有効、無効',},
    ]

}
