import {CSS2DRenderer} from "three/examples/jsm/renderers/CSS2DRenderer";
import AxisSystem from './axisSystem';

export default class CSS2AxesSystem {
    constructor(map) {
        this.map = map;
        this.css2DRenderer = new CSS2DRenderer();
        this.axisSystem = new AxisSystem({});
        this.options = {
            width: 1,
            height: 1,
            high: 1,
            scale: { x: 1, y: 1, z: 1 },
            lineColor: 'orange',
            textColor: '#fff',
            divisions: 5
        };
    }

    init () {
        const { map, css2DRenderer } = this;
        const mapCanvas = map.getCanvas();
        const width = mapCanvas.clientWidth;
        const height = mapCanvas.clientHeight;

        css2DRenderer.domElement.style.width = mapCanvas.style.width;
        css2DRenderer.domElement.style.height = mapCanvas.style.height;
        css2DRenderer.domElement.style.position = "absolute";
        css2DRenderer.domElement.style.top = '0px';
        css2DRenderer.domElement.style.pointerEvents = "none";
        css2DRenderer.setSize( width, height );
        map.getCanvasContainer().appendChild(css2DRenderer.domElement);
    }

    createAxesSystem (cutHeight, depth) {
        this.options.scale.z = 1;
        let { meshBack, meshLeft } = this.axisSystem.setOption(this.options).drawMercatorProjectionAxis(cutHeight * depth);
        return {
            meshBack,
            meshLeft
        }
    }

    show (show) {
        if(this.css2DRenderer) {
            this.css2DRenderer.domElement.style.display = show ? 'block' : 'none';
        }
    }

    disposeDom() {
        if (this.css2DRenderer && this.css2DRenderer.domElement) {
            const children = [...this.css2DRenderer.domElement.children]
            children.forEach(dom => dom.remove())
        }
    }

    dispose() {
        if (this.css2DRenderer) {
            this.css2DRenderer.domElement.remove();
            this.css2DRenderer = null;
        }
    }
}
