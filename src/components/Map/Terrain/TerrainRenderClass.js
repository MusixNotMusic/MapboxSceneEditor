import * as THREE from 'three'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'
import mapboxgl from 'mapbox-gl'
import { isEmpty } from 'lodash'

import vertexShader from './glsl/global.vert'
import fragmentShader from './glsl/global.frag'

export default class TerrainRenderClass{
    constructor(id, map) {
        this.id = id;
        this.map = map;

        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();

        this.material = null;
        this.geometry = null;
        this.mesh = null;

        this.parameters = {
            scale: 1.0,
            threshold:  1.0,
            depthSampleCount: 128
        };


        this.bounds = {
            minX: 71.798,
            minY: 14.68,
            maxX: 136.268,
            maxY: 55.928,
        };

        this.uniforms = {
            cameraPosition:   { value: new THREE.Vector3() },
            tex:              { value: null },
            depthSampleCount: { value: 256 },
            scale:            { value: 1 },
            threshold:        { value: 1 },
            maxLat:           { value: 50 },
            minLat:           { value: 20 },
        };
    }
   
    initGui () {
        const gui = new GUI();
    
        const updateUniforms = this.updateUniforms.bind(this);

        gui.add( this.parameters, 'scale', 0, 1, 0.01 ).onChange( updateUniforms );
        gui.add( this.parameters, 'threshold', 0, 1, 0.01 ).onChange( updateUniforms );
        gui.add( this.parameters, 'depthSampleCount', 0, 1024, 1 ).onChange( updateUniforms );
    }

    updateUniforms() {
        this.material.uniforms.threshold.value = this.parameters.threshold;
        this.material.uniforms.scale.value = this.parameters.scale;
        this.material.uniforms.depthSampleCount.value = this.parameters.depthSampleCount;
    }


    init() {
        const loader = new THREE.TextureLoader();
    
        loader.load('/texture/china-terrain-600dpi.png', 
            (texture) => { 
                // 清除场景
                this.clearScene();

                this.texture = texture;

                this.initGui();

                this.render();
            }, 
            (xhr) => { }, 
            (err) => { console.error( 'An error happened' ) }
        )
    
    }
    
    render () {
        this.initMesh();
        this.drawLayer()
    }


    initCanvas(map, gl) {
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
            renderer.domElement.style.pointerEvents = "none";
            renderer.setDrawingBufferSize(width, height, 1);

            map.getCanvasContainer().appendChild(renderer.domElement);
        }
    }


    initMesh() {
        const texture = this.texture;

        texture.format = THREE.RedFormat;
        texture.type = THREE.UnsignedByteType;
        texture.minFilter = texture.magFilter = THREE.LinearFilter;
        texture.unpackAlignment = 1;
        texture.needsUpdate = true;

        // Material

        this.uniforms.tex.value =  texture

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

        // mesh.rotation.z = -Math.PI / 2;
        // mesh.rotation.z = Math.PI;

        this.geometry = geometry;
        this.material = material;
        this.mesh     = mesh;

        this.scene.add(mesh)

        // box
        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        const materialHL = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.9, transparent: true });
        const meshHL = new THREE.LineSegments( edgesGeometry, materialHL);

        this.meshHL = meshHL;

        this.scene.add(meshHL)

        const bounds = this.bounds;

        this.setScenePosition(this.scene, bounds);

        this.renderer.render( this.scene, this.camera );
    }

    setScenePosition (scene, bounds) {
        const min = mapboxgl.MercatorCoordinate.fromLngLat([bounds.minX, bounds.minY], 0);
        const max = mapboxgl.MercatorCoordinate.fromLngLat([bounds.maxX, bounds.maxY], this.altitude || 80000);

        const boundScaleBox = [  min.x, min.y, min.z, max.x, max.y, max.z ];

        scene.position.x = (boundScaleBox[0] + boundScaleBox[3]) / 2;
        scene.position.y = (boundScaleBox[1] + boundScaleBox[4]) / 2;
        scene.position.z = (boundScaleBox[2] + boundScaleBox[5]) / 2;

        scene.scale.x = (boundScaleBox[3] - boundScaleBox[0]);
        scene.scale.y = (boundScaleBox[4] - boundScaleBox[1]);
        scene.scale.z = (boundScaleBox[5] - boundScaleBox[2]);
    }


    /**
     * 设置垂直高度倍数
     * @param value
     */
    setExaggeration (value) {
        this.mesh.scale.z = this.mesh.scale.z * value;
    }

    /***
     * 设置色卡
     * @param value
     */
    setColorMap (value) {
        this.parameters.colorMap = value
        const texture = this.colorMapTexture[this.parameters.colorMap]
        if (texture && this.isLoaded) {
            this.material.uniforms.colorMap.value = texture;
        } else {
            console.warn('this texture not exist')
        }
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


    showLayer (show) {
        if(this.renderer) {
            this.renderer.domElement.style.display = show ? 'block' : 'none';
        }
    }

    drawLayer () {
        const customLayer = {
            id: this.id,
            type: 'custom',
            renderingMode: '3d',
            onAdd: (map, gl) => {
                window.mapIns = this.map = map;
                this.initCanvas(map, gl);
            },

            render: (gl, matrix) => {
                const { renderer, scene, camera } = this;


                camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix)

                if (this.mesh && this.mesh.material.uniforms && this.mesh.material.uniforms.cameraPosition) {
                    const camera = this.map.getFreeCameraOptions();

                    const cameraPosition = camera._position

                    this.mesh.material.uniforms.cameraPosition.value.copy( { x: cameraPosition.x, y: cameraPosition.y, z: cameraPosition.z } );
                }

                 if (renderer) {
                    renderer.resetState();
                    renderer.render(scene, camera);
                }

                if (this.map) {
                    this.map.triggerRepaint();
                }
            },


            onRemove: () => {
                this.clearScene();
            }
        };

        if (!this.map.getLayer(this.id)) {
            this.map.addLayer(customLayer);
        }
    }

    clearScene() {
        if (this.scene && this.scene.children.length > 0) {
            this.scene.children.forEach(mesh => {
                if (mesh) {
                    if (mesh.material && mesh.material.uniforms) {
                        if (mesh.material.uniforms.tex.value) {
                            mesh.material.uniforms.tex.value.dispose();
                            mesh.material.uniforms.tex.value.source.data = null;
                            mesh.material.uniforms.tex.value.source = null;
                        }
                        mesh.material.uniforms.tex.value = null;
                    }

                    if (mesh.material) {
                        mesh.material.dispose();
                    }

                    if (mesh.geometry) {
                        mesh.geometry.dispose();
                    }
                    mesh = null;
                }
            })
            this.scene.children = [];
        }

        if (this.volume) {
            delete this.volume.data;
            this.volume = null;
        }
    }

    // ==========================
    removeLayer () {
        if (this.map && this.map.getLayer(this.id)) {
            this.map.removeLayer(this.id)
        }
    }

    /**
     * 清除
     */

    destroy () {
        this.removeLayer()

        if (this.renderer) {
            this.renderer.domElement.remove();
            this.renderer.dispose();
        }

        this.id = null;
        this.map = null;

        this.renderer = null;

        this.camera = null;
        this.scene = null;
    }

    dispose () {
        this.destroy()
    }

}