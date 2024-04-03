import * as THREE from "three";
import { isEmpty, defaultsDeep } from 'lodash'


import vertexShader from './glsl/vertex.vert';
import fragmentShader  from './glsl/semitransparent.frag';

import { colors, getColorSystem, getResourceCache } from '../constants'

import CSS2AxesSystem from '../../axis/CSS2AxesSystem';
import BaseModel from "../BaseModel";

/**
 * VoxelRender
 */

export default class VoxelRender extends BaseModel{
    constructor(id, map, options) {
        super();
        
        this.id = id;
        this.map = map;


        this.material = null;
        this.geometry = null;
        this.mesh = null;

        this.parameters = defaultsDeep(options || {} ,{
            colorType: 'Z',
            threshold: 0.0,
            threshold1: 1.0,
            depthSampleCount: 128,
            brightness: 1.0,
            exaggeration: 4,
            show: true
        });

        this.colorMapTexture = getColorSystem().colorMapTexture;

        this.uniforms = {
            cameraPosition:   { value: new THREE.Vector3() },
            map:              { value: null },
            colorMap:         { value: null },
            depthSampleCount: { value: 256 },
            threshold:        { value: 0 },
            threshold1:       { value: 1 },
            brightness:       { value: 1 },
            rangeColor1:      { value: 0 },
            rangeColor2:      { value: 1 },
            maxLat:           { value: 0 },
            minLat:           { value: 0 },
        };

        this.colorNames = colors.map(color => { return { name: color.name } });

        this.isLoaded = true;

        window.voxelRender = this;

        this.css2AxesSystem = new CSS2AxesSystem(map);

        this.resizeBind = this.resize.bind(this);
    }


    render (volume) {
        this.initVolume(volume);
        this.setColorMap(this.parameters.colorType);
        this.drawLayer();
        this.showLayer(this.parameters.show);
    }

    initCanvas(map, gl) {
        const { renderer } = this;

        if (map && renderer.domElement) {
            const mapCanvas = map.getCanvas();

            const width = mapCanvas.width;
            const height = mapCanvas.height;

            this.renderer.setPixelRatio( window.devicePixelRatio );
            this.renderer.setSize( width, height );

            renderer.domElement.style.width = mapCanvas.style.width;
            renderer.domElement.style.height = mapCanvas.style.height;
            renderer.domElement.style.position = "absolute";
            renderer.domElement.style.pointerEvents = "none";
            renderer.setDrawingBufferSize(width, height, 1);

            map.getCanvasContainer().appendChild(renderer.domElement);
        }

        this.css2AxesSystem.init();
    }


    initVolume(volume) {
        const texture = new THREE.Data3DTexture( volume.data, volume.width, volume.height, volume.depth );
        texture.format = THREE.RedFormat;
        texture.type = THREE.UnsignedByteType;
        texture.minFilter = texture.magFilter = THREE.LinearFilter;
        texture.unpackAlignment = 1;
        texture.needsUpdate = true;

        this.volume = volume;

        // Material

        this.uniforms.map.value =  texture;
        this.uniforms.colorMap.value =  this.colorMapTexture[this.parameters.colorType];
        this.uniforms.maxLat.value = volume.maxLatitude;
        this.uniforms.minLat.value = volume.minLatitude;

        const geometry = new THREE.BoxGeometry( 1, 1, 1 );

        const material = new THREE.RawShaderMaterial( {
            glslVersion: THREE.GLSL3,
            uniforms: this.uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            side: THREE.DoubleSide
        });

        // THREE.Mesh
        const mesh = new THREE.Mesh( geometry, material );

        this.geometry = geometry;
        this.material = material;
        this.mesh     = mesh;

        this.scene.add(mesh)

        // highlight box
        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        const materialHL = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.3, transparent: true });
        const meshHL = new THREE.LineSegments( edgesGeometry, materialHL);
        this.meshHL = meshHL;
        this.scene.add(meshHL)

        const bounds = {
            minX: volume.minLongitude,
            minY: volume.minLatitude,
            maxX: volume.maxLongitude,
            maxY: volume.maxLatitude,
        };

        this.setScenePosition(this.scene, bounds, volume.cutHeight * volume.depth * this.parameters.exaggeration);

        this.renderer.render( this.scene, this.camera );
    }

    /**
     * 设置垂直高度倍数
     * @param value
     */
    setExaggeration (value) {
        if (this.volume && this.scene) {
            this.parameters.exaggeration = value;
            const bounds = {
                minX: this.volume.minLongitude,
                minY: this.volume.minLatitude,
                maxX: this.volume.maxLongitude,
                maxY: this.volume.maxLatitude,
            };

            this.setScenePosition(this.scene, bounds, this.volume.depth * this.volume.cutHeight * this.parameters.exaggeration);
        }
    }

    /***
     * 设置色卡
     * @param value
     */

    colorTypeChange (colorType) {
        this.setColorMap(colorType);
    }

    /***
     * 设置亮度
     * @param value
     */
    setBrightness (value) {
        if (this.isLoaded) {
            this.material.uniforms.brightness.value = value;
        }
    }

    /***
     * 设置阈值
     * @param value
     */
    setDepthSampleCount (value) {
        if (this.isLoaded) {
            this.material.uniforms.depthSampleCount.value = value;
        }
    }

    /***
     * 设置亮度
     * @param value
     */
    setThreshold (value) {
        if (this.isLoaded) {
            this.material.uniforms.threshold.value = value;
        }
    }

    setThreshold1 (value) {
        if (this.isLoaded) {
            this.material.uniforms.threshold1.value = value;
        }
    }

    /***
     * 设置亮度
     * @param value
     */
    setColorRange (value) {
        if (this.isLoaded) {
            this.material.uniforms.rangeColor1.value = value[0];
            this.material.uniforms.rangeColor2.value = value[1];
        }
    }

    showLayer (show) {
        console.log('showLayer', show);
        this.parameters.show = show;
        if(this.renderer) {
            this.renderer.domElement.style.display = show ? 'block' : 'none';
        }

        this.css2AxesSystem.show(show);
    }

    drawLayer () {
        const customLayer = {
            id: this.id,
            type: 'custom',
            renderingMode: '3d',
            onAdd: (map, gl) => {
                this.initCanvas(map, gl);
                this.map.on('resize', this.resizeBind)
            },

            render: (gl, matrix) => {
                const { renderer, scene, camera } = this;

                const translateScaleMatrix = new THREE.Matrix4()
                    .makeTranslation(0, 0, 0)
                    .scale(new THREE.Vector3(1, 1, 1));

                camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix).multiply(translateScaleMatrix);

                if (this.mesh && this.mesh.material.uniforms && this.mesh.material.uniforms.cameraPosition) {
                    const camera = this.map.getFreeCameraOptions();

                    const cameraPosition = camera._position

                    this.mesh.material.uniforms.cameraPosition.value.copy( { x: cameraPosition.x, y: cameraPosition.y, z: cameraPosition.z } );
                }

                 if (renderer) {
                    renderer.resetState();
                    renderer.render(scene, camera);
                }

                this.css2AxesSystem.css2DRenderer.render( scene, camera )

                if (this.map) {
                    this.map.triggerRepaint();
                }
            },


            onRemove: () => {
                console.log('onRemove')
                this.cleanScene();
                this.map.off('resize', this.resizeBind)
            }
        };

        if (!this.map.getLayer(this.id)) {
            this.map.addLayer(customLayer);
        }
    }


    /**
     * 清除
     */

    destroy () {
        super.destroy();
    }

    dispose () {
        this.destroy()
    }
}
