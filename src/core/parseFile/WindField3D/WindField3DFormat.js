import { readBufferByTable } from "../Common/readBufferByConfigTable";;

export class WindField3DFormat {

    static headTable = [
        { label: 'minLongitude',      type: 'float',        byteSize: 4, size: 1,  content: '最小经度',    description: '最小经度' },
        { label: 'minLatitude',       type: 'float',        byteSize: 4, size: 1,  content: '最小纬度',    description: '雷达型号' },
        { label: 'maxLongitude',      type: 'float',        byteSize: 4, size: 1,  content: '最大经度',    description: '最大经度'},
        { label: 'maxLatitude',       type: 'float',        byteSize: 4, size: 1,  content: '最大纬度',    description: '最大纬度' },
        { label: 'time',              type: 'int',          byteSize: 4, size: 1,  content: '时间',       description: '时间' },
        { label: 'levelCnt',          type: 'int',          byteSize: 4, size: 1,  content: '高度层数',    description: '高度层数' },
        { label: 'horDataCnt',        type: 'int',          byteSize: 4, size: 1,  content: '水平数量',    description: '水平数量' },
        { label: 'verDataCnt',        type: 'int',          byteSize: 4, size: 1,  content: '垂直数量',    description: '垂直数量' },
        { label: 'sampleScale',       type: 'int',          byteSize: 4, size: 1,  content: '采样比例',    description: '采样比例' },
    ];

    constructor() {
        this.header = {}

        this.U = null;
        this.V = null;
        this.W = null;
    }

    readHead (bytes) {
        this.header = readBufferByTable(bytes.buffer, WindField3DFormat.headTable);
    }

    readU (bytes) {
        this.U = new Float32Array(bytes.buffer);
    }

    readV (bytes) {
        this.V = new Float32Array(bytes.buffer);
    }

    readW (bytes) {
        this.W = new Float32Array(bytes.buffer);
    }

    dispose () {
        WindField3DFormat.headTable = null;
        this.U = null;
        this.V = null;
        this.W = null;
    }

    /**
     *
     * @param bytes
     */
    static parser(bytes) {
        const instance = new WindField3DFormat();

        let offset = 0;
        const headSize = WindField3DFormat.headTable.reduce((cur, next) => cur + next.size * next.byteSize, 0);

        instance.readHead(bytes.slice(offset, headSize));

        const { levelCnt, horDataCnt, verDataCnt, sampleScale } = instance.header;

        instance.header.widthSize = Math.floor(horDataCnt / sampleScale);
        instance.header.heightSize = Math.floor(verDataCnt / sampleScale);
        instance.header.depthSize = levelCnt;

        const boxSize = instance.header.widthSize * instance.header.heightSize * instance.header.depthSize * 4;

        offset = +headSize

        instance.readU(bytes.slice(offset, offset + boxSize));

        offset += boxSize;

        instance.readV(bytes.slice(offset, offset + boxSize));

        offset += boxSize;

        instance.readW(bytes.slice(offset, offset + boxSize));
        
        return instance;
    }
}