// to convert an Object Array to CSV string with a header
import iconv from 'iconv-lite';

function __convertToCSV(objArray, columns) {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';

    // headers
    for (let field in objArray[0]) {
        if (str !== '') str += ',';
        str += `"${field}"`;
    }
    str += '\r\n';

    console.log("str==,  columns == ",  str, columns)

    if(columns) {
        let coldef = {}
        columns.map(el => coldef[el.field] = el.headerName)

        let head = ''
        for (let field in objArray[0]) {
            if (head !== '') head += ',';
            let fieldName = coldef[field]
            if(!fieldName) fieldName = ''
            head += `"${fieldName}"`;
        }
        head += '\r\n';
        str += head
    }

    // data rows
    for (let i = 0; i < array.length; i++) {
        let line = '';
        for (let index in array[i]) {
            if (line !== '') line += ',';
            line += `"${array[i][index]}"`;
        }
        str += line + '\r\n';
    }

    return str;
}

function _getFilteredData(data, filters) {
    if( !filters || filters.length === 0 ) return data

    return data.map(obj => {
        // Create a new object for each element in oldArray
        let newObj = {};

        // Iterate over the keys of the current object
        Object.keys(obj).forEach(key => {
            // console.log(key)
            // If the key is not in filterArray, add it to newObj
            if (!filters.includes(key)) {
                newObj[key] = obj[key];
            }
        });

        return newObj;
    });
}

// to downlaod an Object Array as CSV file with a header
export function downloadCSV(array, columndDef = null, filename = "output.csv", filters=[], encode='Shift_JIS') {
    const data = _getFilteredData(array, filters)
    const csvStr = __convertToCSV(data, columndDef);

    let strbuff = csvStr
    // let mycondode = encode

    if( encode.toLowerCase() === 'Shift_JIS'.toLowerCase() ) {
        strbuff  = iconv.encode(csvStr, encode);
    }

    const blob = new Blob([strbuff], { type: `text/csv;charset=${encode};` });

    // const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
