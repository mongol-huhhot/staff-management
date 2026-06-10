import iconv from 'iconv-lite';

function __convertToCSV(objArray, columns) {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let fields = [];
    let headers = [];

    if (columns && columns.length > 0) {
        fields = columns.map(col => col.field);
        headers = columns.map(col => col.headerName);
    } else {
        fields = Object.keys(objArray[0]);
        headers = fields.slice(); // If no columns provided, headers same as fields
    }

    // Fields names in the first row
    str += fields.map(field => `"${field}"`).join(',') + '\r\n';

    // Customized header row if columns are provided
    str += headers.map(header => `"${header}"`).join(',') + '\r\n';

    // Data rows
    for (let i = 0; i < array.length; i++) {
        let line = fields.map(field => {
            let value = array[i][field] !== undefined ? array[i][field] : '';
            return `"${value}"`;
        }).join(',');
        str += line + '\r\n';
    }

    return str;
}

function _getFilteredData(data, filters) {
    if (!filters || filters.length === 0) return data;

    return data.map(obj => {
        let newObj = {};

        Object.keys(obj).forEach(key => {
            if (!filters.includes(key)) {
                newObj[key] = obj[key];
            }
        });

        return newObj;
    });
}

// To download an Object Array as CSV file with a header
export function downloadCSV(array, columndDef = null, filename = "output.csv", filters = [], encode = 'UTF-8') {
    const data = _getFilteredData(array, filters);
    const csvStr = __convertToCSV(data, columndDef);

    let strbuff = csvStr;

    if (encode.toLowerCase() === 'shift_jis') {
        strbuff = iconv.encode(csvStr, encode);
    }

    const blob = new Blob([strbuff], { type: `text/csv;charset=${encode};` });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
