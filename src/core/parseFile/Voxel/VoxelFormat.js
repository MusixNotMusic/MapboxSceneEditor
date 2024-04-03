import { readBufferByTable } from "../Common/readBufferByConfigTable";;

export class VoxelFormat {

    static headTable = [
        { label: 'version',           type: 'int',    byteSize: 4,  size: 1,  content: '版本' },
        { label: 'leftLongitude',     type: 'int',    byteSize: 4,  size: 1,  content: '最小经度' },
        { label: 'topLatitude',       type: 'int',    byteSize: 4,  size: 1,  content: '最大纬度' },
        { label: 'rightLongitude',    type: 'int',    byteSize: 4,  size: 1,  content: '最大经度'},
        { label: 'bottomLatitude',    type: 'int',    byteSize: 4,  size: 1,  content: '最小纬度' },
        { label: 'altitide',          type: 'int',    byteSize: 4,  size: 1,  content: '海拔高度' },
        { label: 'ratioCnt',          type: 'int',    byteSize: 4,  size: 1,  content: '采样分辨率' },
        { label: 'horDataCnt',        type: 'int',    byteSize: 4,  size: 1,  content: '水平数量' },
        { label: 'verDataCnt',        type: 'int',    byteSize: 4,  size: 1,  content: '垂直数量' },
        { label: 'levelCnt',          type: 'int',    byteSize: 4,  size: 1,  content: '采样比例' },
    ];

    constructor() {
        this.header = {};

        this.evelationList = [];

        this.voxelData = null;
    }

    readHead (bytes) {
        this.header = readBufferByTable(bytes.buffer, VoxelFormat.headTable);
    }

    readEvelationList (bytes) {
        this.evelationList = new Int32Array(bytes.buffer);
    }

    readVoxelData (bytes) {
        this.voxelData = new Uint8Array(bytes.buffer);
    }

    dispose () {
        VoxelFormat.headTable = null;
        this.voxelData = null;
    }

    /**
     *
     * @param bytes
     */
    static parser(bytes) {
        const instance = new VoxelFormat();

        let offset = 0;

        let byteLength = 0;

        //  head
        byteLength = VoxelFormat.headTable.reduce((cur, next) => cur + next.size * next.byteSize, 0);

        instance.readHead(bytes.slice(offset, offset + byteLength));

        // evelation 
        const { horDataCnt, verDataCnt, levelCnt, ratioCnt } = instance.header;

        offset += byteLength;

        byteLength = levelCnt * 4;

        instance.readEvelationList(bytes.slice(offset, offset + byteLength));

        // voxel data
        offset += byteLength;

        byteLength = horDataCnt * verDataCnt * levelCnt;

        console.log('offset ==>', offset);
        console.log('byteLength ==>', byteLength);

        instance.readVoxelData(bytes.slice(offset, offset + byteLength));
    
        return instance;
    }
}