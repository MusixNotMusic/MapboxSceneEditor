import * as THREE from 'three';
import mapboxgl from "mapbox-gl";

/**
 * BaseThreeModel 挤压模型
 */
export default class BaseThreeModelClass {
    constructor() {
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.shadowMap.enabled = true;
        
        // this.renderer.shadowMap.type = THREE.VSMShadowMap;

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera();
    }

    resize() {
        const mapCanvas = this.map.getCanvas();
        const width = mapCanvas.width;
        const height = mapCanvas.height;

        const clientWidth = mapCanvas.clientWidth;
        const clientHeight = mapCanvas.clientHeight;

        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( width, height );

        this.renderer.domElement.style.width = mapCanvas.style.width;
        this.renderer.domElement.style.height = mapCanvas.style.height;

        this.renderer.setDrawingBufferSize(width, height, 1);

        if(this.css2DRenderer) this.css2DRenderer.setSize(clientWidth, clientHeight);
    }

    cleanScene() {
        if (this.scene && this.scene.children.length > 0) {
            this.scene.children.forEach(mesh => {
                if (mesh) {
                    if (mesh.material && mesh.material.uniforms && mesh.material.uniforms.map) {
                        if (mesh.material.uniforms.map.value) {
                            mesh.material.uniforms.map.value.dispose();
                            mesh.material.uniforms.map.value.source.data = null
                            mesh.material.uniforms.map.value.source = null
                        }
                        mesh.material.uniforms.map.value = null;
                    }

                    if (mesh.material) {
                        mesh.material.dispose()
                    }

                    if (mesh.geometry) {
                        mesh.geometry.dispose()
                    }
                    mesh = null
                }
            })
            this.scene.children = []
        }

        if (this.css2DRenderer && this.css2DRenderer.domElement) {
            const children = [...this.css2DRenderer.domElement.children]
            children.forEach(dom => dom.remove())
        }

        if (this.css2AxesSystem) {
            this.css2AxesSystem.disposeDom()
        }

        if (this.volume) {
            delete this.volume.data;
            this.volume = null;
        }
    }

    removeLayer () {
        if (this.map && this.map.getLayer(this.id)) {
            this.map.removeLayer(this.id)
        }

        if (this.renderer) {
            this.renderer.domElement.remove();
            this.renderer.dispose();
        }
    }

    destroy () {
        this.removeLayer();
        if (this.renderer) {
            this.renderer.domElement.remove();
            this.renderer.dispose();
            this.renderer.forceContextLoss();
        }

        if (this.css2DRenderer) {
            this.css2DRenderer.domElement.remove();
        }


        this.id = null;
        this.map = null;

        this.renderer = null;
        this.css2DRenderer = null;

        this.camera = null;
        this.scene = null;
    }

    dispose () {
        this.destroy();
    }
}
