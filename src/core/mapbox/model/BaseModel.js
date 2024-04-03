import * as THREE from 'three';
import mapboxgl from "mapbox-gl";

import {colors} from "./constants";
/**
 * BaseThreeModel 挤压模型
 */
export default class BaseModel {
    constructor() {
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        this.scene = new THREE.Scene();

        this.camera = new THREE.Camera();
    }

    initColorTexture () {
        // Colormap textures
        const loader = new THREE.TextureLoader()
        const promiseArr = colors.map(color => {
            return new Promise((resolve, reject) => {
                loader.load( color.path, (texture) => { this.colorMapTexture[color.name] = texture; resolve(texture); } )
            })
        })

        return Promise.allSettled(promiseArr)
    }

    setScenePosition (scene, bounds, maxH) {
        // const min = mapboxgl.MercatorCoordinate.fromLngLat([bounds.minX, bounds.maxY - 0.2], 0);
        // const max = mapboxgl.MercatorCoordinate.fromLngLat([bounds.maxX, bounds.minY - 0.2], maxH);

        const min = mapboxgl.MercatorCoordinate.fromLngLat([bounds.minX, bounds.maxY], 0);
        const max = mapboxgl.MercatorCoordinate.fromLngLat([bounds.maxX, bounds.minY], maxH);

        const boundScaleBox = [  min.x, min.y, min.z, max.x, max.y, max.z ];

        scene.position.x = (boundScaleBox[0] + boundScaleBox[3]) / 2;
        scene.position.y = (boundScaleBox[1] + boundScaleBox[4]) / 2;
        scene.position.z = (boundScaleBox[2] + boundScaleBox[5]) / 2;

        scene.scale.x = (boundScaleBox[3] - boundScaleBox[0]);
        scene.scale.y = (boundScaleBox[4] - boundScaleBox[1]);
        scene.scale.z = (boundScaleBox[5] - boundScaleBox[2]);
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

        if(this.css2AxesSystem) this.css2AxesSystem.css2DRenderer.setSize(clientWidth, clientHeight);
    }

    setColorMap (value) {
        const { renderer, scene, camera } = this;

        this.parameters.colorType = value
        const texture = this.colorMapTexture[this.parameters.colorType]
        if (texture) {
            this.scene.children.forEach(mesh => {
                if (mesh && mesh.material && mesh.material.uniforms) {
                    mesh.material.uniforms.colorMap.value = texture;
                }
            })
            renderer.render( scene, camera )
        } else {
            console.warn('this texture not exist')
        }
    }

    setExaggeration (val) {
        this.parameters.exaggeration = val
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

        if (this.volume) {
            delete this.volume.data;
            this.volume = null;
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
