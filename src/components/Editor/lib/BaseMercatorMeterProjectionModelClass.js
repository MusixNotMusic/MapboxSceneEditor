import * as THREE from 'three';

import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";

import BaseThreeModelClass from "./BaseThreeModelClass";
import mapboxgl from "mapbox-gl";

import { mat4 } from 'gl-matrix';

const defaultOption = {
    useCSS2: true
};

export const earthRadius = 6371008.8;

/*
 * The average circumference of the earth in meters.
 */
export const earthCircumference = 2 * Math.PI * earthRadius;

const meterApplyX = mx => (mx - 0.5) * earthCircumference
const meterApplyY = mx => (0.5 - mx) * earthCircumference


// const meterApplyX = mx => mx * earthCircumference
// const meterApplyY = my => my * earthCircumference
/***
 *
 */
export default class BaseMercatorMeterProjectionModelClass extends BaseThreeModelClass{
    constructor (id, map, option = {}) {
        super();

        this.id = id;

        this.map = map;

        this.lightGroup = null;

        this.option = Object.assign(defaultOption, option);

        this.exaggeration = this.map.getTerrain() ? this.map.getTerrain().exaggeration : 1;

        this.world = new THREE.Object3D();

        this.resizeBind = this.resize.bind(this);

        this.raycastCamera = new THREE.PerspectiveCamera();

        this.scene.add(this.world);

        this.once = true;
    }

    _addEventListener () {
        this.map.on('resize', this.resizeBind);
    }

    _removeEventListener () {
        this.map.off('resize', this.resizeBind);
    }

    initCanvas(map) {
        const { renderer } = this;

        if (map && renderer.domElement) {
            const mapCanvas = map.getCanvas();
            const width = mapCanvas.width;
            const height = mapCanvas.height;

            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( width, height );

            renderer.domElement.style.width = mapCanvas.style.width;
            renderer.domElement.style.height = mapCanvas.style.height;
            renderer.domElement.style.position = "absolute";
            // renderer.domElement.style.pointerEvents = "none";
            renderer.setDrawingBufferSize(width, height, 1);

            map.getCanvasContainer().appendChild(renderer.domElement);
        }
    }

    initCSS2() {
        this.css2DRenderer = new CSS2DRenderer();
        const css2DRenderer = this.css2DRenderer;
        const mapCanvas = this.map.getCanvas();

        css2DRenderer.domElement.style.width = mapCanvas.style.width;
        css2DRenderer.domElement.style.height = mapCanvas.style.height;
        css2DRenderer.domElement.style.position = "absolute";
        css2DRenderer.domElement.style.top = '0px';
        css2DRenderer.domElement.style.pointerEvents = "none";
        css2DRenderer.domElement.setAttribute('id', 'cursor3d')
        css2DRenderer.setSize( mapCanvas.clientWidth, mapCanvas.clientHeight );

        this.map.getCanvasContainer().appendChild(css2DRenderer.domElement);
    }

    addLight() {
        this.lightGroup = new THREE.Group();

        // 环境光
        const ambientLight = new THREE.AmbientLight(0x000);
        this.lightGroup.add(ambientLight);

        this.scene.add(this.lightGroup);

        this.addOneLight([0, 1, 0], [103.23595286807961, 30.19879722382271, 100])
        this.addOneLight([0, -1, 0], [103.23595286807961, 30.19879722382271, 100])
        this.addOneLight([1, 0, 1], [103.23595286807961, 30.19879722382271, 100])
        this.addOneLight([-1, 0, 1], [103.23595286807961, 30.19879722382271, 100])
    }

    addOneLight (up, target, intensity) {
        const light = new THREE.DirectionalLight(0xffffff, intensity || 0.5);
        light.position.set(up[0], up[1], up[2]);
        this.lightGroup.add(light);
    }

    addCSS2Object (mesh, text, customStyle, translate) {
        if (mesh) {
            const styles = customStyle || {
                background: 'var(--theme-bg)',
                color: 'var(--text-color)',
                borderRadius: '2px',
                padding: '5px 10px',
                width: 'content-max',
                fontSize: '12px'
            };

            const element = document.createElement('div');
            element.className = 'name';

            for(let key in styles) {
                element.style[key] = styles[key];
            }

            element.innerHTML = text;
            const container = document.createElement('div');

            container.append(element);

            const objectCSS = new CSS2DObject(container);
            if (Array.isArray(translate)) {
                objectCSS.translateX(translate[0] || 0);
                objectCSS.translateY(translate[1] || 0);
                objectCSS.translateZ(translate[2] || 0);
            } else {
                objectCSS.translateZ(translate || 1000);
            }

            mesh.layers.enableAll();
            mesh.add(objectCSS);
            mesh.layers.set(0);
        }
    }


    addHelperMesh () {
        this.data.forEach(item => {
            // 辅助 box
            const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
            const boxMaterial = new THREE.MeshBasicMaterial( { color: 'red' } );
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            this.setMeshBounds(box, item.bounds);
            boxMaterial.wireframe = true;
            this.scene.add( box );


            const axesHelper = new THREE.AxesHelper(5);
            this.setMeshBounds(axesHelper, item.bounds);
            this.scene.add(axesHelper);

        })
    }


    setMeshSide (group, side) {
        group.traverse((object) => {
            if (object.material) {
                object.material.side = side || THREE.DoubleSide;
            }
        })
    }

    setMeshBounds (mesh, bounds) {
        const min = mapboxgl.MercatorCoordinate.fromLngLat([bounds.minX, bounds.maxY], bounds.minZ);
        const max = mapboxgl.MercatorCoordinate.fromLngLat([bounds.maxX, bounds.minY], bounds.maxZ);

        const boundScaleBox = [  min.x, min.y, min.z, max.x, max.y, max.z ];

        const worldSize = 1 || this.map.transform.worldSize;

        mesh.position.x = (boundScaleBox[0] + boundScaleBox[3]) / 2 * worldSize;
        mesh.position.y = (boundScaleBox[1] + boundScaleBox[4]) / 2 * worldSize;
        mesh.position.z = (boundScaleBox[2] + boundScaleBox[5]) / 2 * worldSize;
    }

    getObjectSize (object) {
        const aabb = new THREE.Box3().setFromObject(object);
        const size = new THREE.Vector3();
        aabb.getSize(size);
        return size;
    }

    setObjectCenter (object) {
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.set(-center.x, -center.y, -center.z);
    }

    setObjectCoords (object) {
        const { lon, lat, alt, scale } = object.userData;
        const mercator = mapboxgl.MercatorCoordinate.fromLngLat([lon, lat], alt);

        // mercator x -> 0 ~ 1
        // mercator y -> 0 ~ 1
        // meter x coordination [-earthCircumference / 2, earthCircumference / 2]
        // meter y coordination [earthCircumference / 2, -earthCircumference / 2]

        object.position.set(meterApplyX(mercator.x), meterApplyY(mercator.y), alt || 0);
        if (Array.isArray(scale)) {
            object.scale.set(scale[0], scale[1], scale[2]);
        } else {
            object.scale.set(scale, scale, scale);
        }
    }

    updateWorldPosition(lnglat) {
        const { lng, lat, alt } = lnglat;
        const mercator = mapboxgl.MercatorCoordinate.fromLngLat([lng, lat], alt);
        this.scene.position.set(-meterApplyX(mercator.x), -meterApplyY(mercator.y), alt || 0);
    }

    /**
     * 添加到新场景中
     * @param {*} object
     */
    addNewScene(object) {
        this.scene.add(object);
    }


    drawLayer () {
        const customLayer = {
            id: this.id,
            type: 'custom',
            renderingMode: '3d',
            onAdd: (map, gl) => {
                this.initCanvas(map);
                if (this.option.useCSS2) {
                    this.initCSS2();
                }
                this._addEventListener()
                this.addEventListener();

                if (this.onBeforeRender) {
                    this.onBeforeRender();
                }
            },

            render: (gl, matrix) => {
                const { renderer, scene, camera } = this;

                const mercator = mapboxgl.MercatorCoordinate.fromLngLat([0, 0]);
                const scale = mercator.meterInMercatorCoordinateUnits();

                const translateScaleMatrix = new THREE.Matrix4().scale(new THREE.Vector3(scale, -scale, scale))
                // console.log('render ==>',  scale);
                if(this.once) {
                    console.log('render ==>',  scale);
                    console.log('render ==>',  matrix);
                    this.once = false;
                }

                const { _fov, _nearZ, _farZ, width, height, _camera } = this.map.transform;
                

                const projection = mat4.perspective(new Float32Array(16), _fov, width / height, _nearZ, _farZ);

                const projectionMatrix = new THREE.Matrix4().fromArray(projection);
                const viewProjectionMatrix = new THREE.Matrix4().fromArray(matrix).multiply(translateScaleMatrix);
                const invProjectionMatrix = projectionMatrix.clone().invert();

                const viewMatrix = invProjectionMatrix.clone().multiply(viewProjectionMatrix.clone());

                const invViewMatrix = viewMatrix.clone().invert()

                const position = _camera.position;
                invViewMatrix.elements[12] = position[0] / scale;
                invViewMatrix.elements[13] = -position[1] / scale;
                invViewMatrix.elements[14] = position[2] / scale;

                camera.projectionMatrix = projectionMatrix;

                camera.matrix = invViewMatrix;
                camera.matrix.decompose(camera.position, camera.quaternion, camera.scale);
                camera.fov = _fov / Math.PI * 180;


                this.raycastCamera.projectionMatrix = new THREE.Matrix4().fromArray(matrix).clone().multiply(translateScaleMatrix);
                // ====================================================
                if (renderer) {
                    renderer.resetState();
                    renderer.render(scene, camera);
                }

                if (this.renderHook) {
                    this.renderHook()
                }

                if (this.css2DRenderer) {
                    this.css2DRenderer.render( this.scene, this.camera );
                }


                if (this.map) {
                    this.map.triggerRepaint();
                }
            },


            onRemove: () => {
                this.cleanScene()
                this._removeEventListener();
                this.removeEventListener();
            }
        };

        if (!this.map.getLayer(this.id)) {
            this.map.addLayer(customLayer)
        }
    }

    renderHook () {

    }


    /**
     * 显示 图层
     * @param show
     */
    showLayer (show) {
        if(this.renderer) {
            this.renderer.domElement.style.display = show ? 'block' : 'none';
        }
    }

    // ==========================
    /**
     * 清除
     */

    destroy () {
        this.removeEventListener()
        super.destroy();
    }

    dispose () {
        this.destroy()
    }

}
