import EventEmitter from "events";
import { readFileData } from '../file/readFileData';

export class DropFileTransfer extends EventEmitter  {
    constructor() {
        super();
        this.dom = document.body;

        this.dropBind= this.drop.bind(this);
        this.dragOverBind= this.over.bind(this);
        this.dragEnterBind= this.enter.bind(this);
        this.dragLeaveBind= this.leave.bind(this);

        window.DropFileTransfer = this;

        this.initBodyDom();
        this.addEventListener();
    }

    initBodyDom() {
        this.dom.setAttribute('dropzone', 'copy');
    }

    drop(event) {
        event.stopPropagation(); 
        event.preventDefault();
        this.dropOver(event);
    }

    dropOver(event) {
        event.stopPropagation();
        event.preventDefault();

        if ( event.dataTransfer &&
            event.dataTransfer &&
            event.dataTransfer.files &&
            event.dataTransfer.files.length) {
            [...event.dataTransfer.files].forEach(fd => {
                readFileData(fd).then((data) => {
                    if (data.type === 'geojson') {
                        this.emit('geojson-data', data);
                    } else if(data.type === 'zip') {
                        this.emit('zip-data', data);
                    }
                }).catch(e => {
                    this.emit('error', e);
                })
            })
        }
        this.emit('drop-over');
    }

    over(event) {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        this.emit('drag-over');
    }

    enter(event) {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        this.emit('drag-enter');
    }

    leave(event) {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        this.emit('drag-leave');
    }

    addEventListener() {
        this.dom.addEventListener('drop', this.dropBind);
        this.dom.addEventListener('dragenter', this.dragEnterBind);
        this.dom.addEventListener('dragleave', this.dragLeaveBind);
        this.dom.addEventListener('dragover', this.dragOverBind);
    }

    removeEventListener() {
        this.dom.removeEventListener('drop', this.dropBind);
        this.dom.removeEventListener('dragenter', this.dragEnterBind);
        this.dom.removeEventListener('dragleave', this.dragLeaveBind);
        this.dom.removeEventListener('dragover', this.dragOverBind);
    }

    dispose() {
        this.removeAllListeners();
        this.dropBind = null;
        this.drapOverBind = null;
        this.dropExitBind = null;

        this.removeAllListeners('error');
        this.removeAllListeners('geojson-data');
        this.removeAllListeners('zip-data');
        this.removeAllListeners('drag-enter');
        this.removeAllListeners('drag-leave');
        this.removeAllListeners('drop-over');
    }

    destroy() {
        this.dispose();
    }
}