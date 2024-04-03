import { 
    checkFileName,
    checkFileType,
    checkFileContent, 
    fileNameRuleList,
    fileTypeRuleList,
    fileContentRuleList 
} from '../src/core/geojson.io/file/fileType.js'

const fileTypeTestList = [
    { name: '', type: 'application/vnd.google-earth.kml+xml', text: '' },
]

const fileNameTestList = [
    { name: 'google earch.kml', type: '', text: '' },
    { name: 'abc.gpx', type: '', text: ''  },
    { name: 'abc.geojson', type: '', text: ''  },
    { name: 'abc.json', type: '', text: ''  },
    { name: 'abc.topojson', type: '', text: ''  },
    { name: 'abc.csv', type: '', text: ''  },
    { name: 'abc.tsv', type: '', text: ''  },
    { name: 'abc.dsv', type: '', text: ''  },
    { name: 'abc.xml', type: '', text: ''  },
    { name: 'abc.osm', type: '', text: ''  },
    { name: 'abc.poly', type: '', text: ''  },
    { name: 'abc.shp', type: '', text: ''  },
]

const fileContentTestList = [
    { name: '', type: '', text: 'shape_id,shape_pt_lat,shape_pt_lon'  },
    { name: '', type: '', text: '"shape_id","shape_pt_lat","shape_pt_lon"'  },
    { name: '', type: '', text: 'stop_id,stop_code,stop_name,stop_desc,stop_lat,stop_lon'  },
    { name: '', type: '', text: '"stop_id","stop_code","stop_name","stop_desc","stop_lat","stop_lon"'  },
]

const testList = [
    { describe: 'google-earth', it: 'google-earth type:' },
    { describe: 'file extent name kml', it: 'expanded-name .kml:' },
    { describe: 'file extent name gpx:', it: 'expanded-name .gpx:' },
    { describe: 'file extent name geojson', it: "expanded-name .geojson:" },
    { describe: 'file extent name json:', it: 'expanded-name .json:' },
    { describe: 'file extent name topojson:', it: 'expanded-name .topojson:' },
    { describe: 'file extent name csv:', it: 'expanded-name .csv:' },
    { describe: 'file extent name tsv:', it: 'expanded-name .tsv:' },
    { describe: 'file extent name dsv:', it: 'expanded-name .dsv:' },
    { describe: 'file extent name xml:', it: 'expanded-name .xml:' },
    { describe: 'file extent name osm:', it: 'expanded-name .osm:' },
    { describe: 'file extent name poly:', it: 'expanded-name .poly:' },
    { describe: 'file extent name shp:', it: 'expanded-name .shp:' },
    { describe: 'file text content include:', it: 'shape_id,shape_pt_lat,shape_pt_lon' },
    { describe: 'file text content include:', it: '"shape_id","shape_pt_lat","shape_pt_lon"' },
    { describe: 'file text content include:', it: 'stop_id,stop_code,stop_name,stop_desc,stop_lat,stop_lon' },
    { describe: 'file text content include:', it: '"stop_id","stop_code","stop_name","stop_desc","stop_lat","stop_lon"' },
]

testList.slice(0, 1).forEach((spec, index) => {
    describe(spec.describe, () => {
        it(spec.it, () => {
            expect(checkFileType(fileTypeTestList[index])).toEqual(fileTypeRuleList[index].returnType);
        }); 
    });
})

testList.slice(1, 10).forEach((spec, index) => {
    describe(spec.describe, () => {
        it(spec.it, () => {
            expect(checkFileName(fileNameTestList[index])).toEqual(fileNameRuleList[index].returnType);
        }); 
    });
})

testList.slice(10, 14).forEach((spec, index) => {
    describe(spec.describe, () => {
        it(spec.it, () => {
            expect(checkFileContent(fileContentTestList[index].text)).toEqual(fileContentRuleList[index].returnType);
        }); 
    });
})