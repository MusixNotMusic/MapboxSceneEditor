export const _ext = (filename, _) => {
    return filename.indexOf(_) !== -1;
}


export const fileTypeRuleList = [
    { name: 'google-earth',  returnType: 'kml', type: 'application/vnd.google-earth.kml+xml', description: 'google earth file type' },
    { name: 'dsv',           returnType: 'dsv', type: 'text/csv', description: 'dsv' },

]

/**
 *  判断 ext type extFunction 返回
 */
export const fileNameRuleList = [
    { name: 'google-earth', ext: '.kml',      returnType: 'kml',       type: '',  description: 'google earth file type' },
    { name: 'gpx',          ext: '.gpx',      returnType: 'gpx',       type: '',  description: 'Convert a GPX document to GeoJSON,  the GPS Exchange Format, https://www.topografix.com/gpx.asp' },
    { name: 'geojson',      ext: '.geojson',  returnType: 'geojson',   type: '',  description: 'geojson' },
    { name: 'json',         ext: '.json',     returnType: 'geojson',   type: '',  description: 'geojson' },
    { name: 'topojson',     ext: '.topojson', returnType: 'geojson',   type: '',  description: 'geojson' },
    { name: 'csv',          ext: '.csv',      returnType: 'dsv',       type: '',  description: 'csv' },
    { name: 'tsv',          ext: '.tsv',      returnType: 'dsv',       type: '',  description: 'tsv' },
    { name: 'dsv',          ext: '.dsv',      returnType: 'dsv',       type: '',  description: 'dsv' },
    { name: 'xml',          ext: '.xml',      returnType: 'xml',       type: '',  description: 'xml' },
    { name: 'osm',          ext: '.osm',      returnType: 'xml',       type: '',  description: 'osm' },
    { name: 'poly',         ext: '.poly',     returnType: 'poly',      type: '',  description: 'poly' },
    { name: 'shp',          ext: '.shp',      returnType: 'shp',       type: '',  description: 'shapfile' },
    { name: 'z',            ext: '.z',        returnType: 'z',         type: '',  description: 'zip or zstd file' },
    { name: 'zip',          ext: '.zip',      returnType: 'zip',       type: '',  description: 'zip file' },
    { name: 'zstd',         ext: '.zstd',     returnType: 'zstd',      type: '',  description: 'zstd file' },
]

export const fileContentRuleList = [
    { name: 'text1',        extTextFunction: (text) => _ext(text, 'shape_id,shape_pt_lat,shape_pt_lon'),                                    returnType: 'gtfs-shapes',      type: '',  description: 'gtfs-shapes' },
    { name: 'text2',        extTextFunction: (text) => _ext(text, '"shape_id","shape_pt_lat","shape_pt_lon"'),                              returnType: 'gtfs-shapes',      type: '',  description: 'gtfs-shapes' },
    { name: 'text1',        extTextFunction: (text) => _ext(text, 'stop_id,stop_code,stop_name,stop_desc,stop_lat,stop_lon'),               returnType: 'gtfs-stops',       type: '',  description: 'gtfs-stops' },
    { name: 'text2',        extTextFunction: (text) => _ext(text, '"stop_id","stop_code","stop_name","stop_desc","stop_lat","stop_lon"'),   returnType: 'gtfs-stops',       type: '',  description: 'gtfs-stops' },
]

/**
 * 检测文件名称
 * @param {*} file 
 * @param {*} text 
 * @returns 
 */
export const checkFileName = (file) => {
    
    const len = fileNameRuleList.length;

    for(let i = 0; i < len; i++) {
        const rule = fileNameRuleList[i];

        if (rule.ext && _ext(file.name, rule.ext)) {
            return rule.returnType;
        }
    }
    return '';
}

/**
 * 检测文件类型 meta type 
 * @param {*} file 
 * @param {*} text 
 * @returns 
 */
export const checkFileType = (file) => {
    
    const len = fileTypeRuleList.length;

    for(let i = 0; i < len; i++) {
        const rule = fileTypeRuleList[i];

        if (rule.type && rule.type === file.type) {
            return rule.returnType;
        }
    }
    return '';
}

/**
 * 检查文件内容
 * @param {*} text 
 * @returns 
 */
export const checkFileContent = (text) => {
    
    const len = fileContentRuleList.length;

    for(let i = 0; i < len; i++) {
        const rule = fileContentRuleList[i];

        if (rule.extTextFunction && rule.extTextFunction(text)) {
            return rule.returnType;
        }
    }
    return '';
}