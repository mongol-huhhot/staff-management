import dayjs from 'dayjs'

export function notNullString(s) {
    if ( !s || s === '') return '値入れてないです';
    return null;
}

export function validateKatakana(kana) {
    const regex = /^[\u30A0-\u30FF]+$/;
    const b = regex.test(kana);
    return b?'':'カタカナではないです'
}

export function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const b = regex.test(email);
    return b?'':'E-Mailアドレス構造ではないです'
}

export function currentYear() { return dayjs().format('YYYY') }
  
export function anotherValidationFunction(s) {
    console.log('Another validation function:', s);
}


export function setDepartmentFunction(filter,store) {
    console.log("setDepartmentFunction=====", filter, store)
    
    const slist = store.data.staff_list
    const editData = store.editData

    if( !slist || slist.length === 0 ) return
    if( !editData ) return

    const staff_m_id = editData[filter.field]
    if( !staff_m_id ) return

    const staff = slist.filter(el => el.staff_m_id === staff_m_id)
    if( !staff || staff.length === 0 ) return
    console.log("staff=====", staff)

    return staff[0].department_id
}



/*** wahtever functions you want to validate, just write thme here!!!. chen. 2024/07/18 */

/** not  */
