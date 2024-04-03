import * as THREE from 'three';

import {
	BlendFunction,
	OutlineEffect,
	OverrideMaterialManager,
	EffectComposer,
	EffectPass,
	KernelSize,
	RenderPass
} from "postprocessing";


export class OutlineEffectTool {
    constructor(map, scene, camera) {
        this.map = map;

        this.renderer = new THREE.WebGLRenderer({
            powerPreference: "high-performance",
            antialias: false,
            stencil: false,
            depth: false,
            alpha: true
        });

        this.scene = scene;
        this.camera = camera;

        this.initCanvas();
        this.initPass();
    }

    initCanvas() {
        const { renderer, map } = this;

        if (map && renderer.domElement) {
            const mapCanvas = map.getCanvas();
            const width = mapCanvas.width;
            const height = mapCanvas.height;

            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( width, height );

            renderer.domElement.style.width = mapCanvas.style.width;
            renderer.domElement.style.height = mapCanvas.style.height;
            renderer.domElement.style.position = "absolute";
            renderer.domElement.setAttribute('id', 'outline-effect');
            renderer.domElement.style.pointerEvents = "none";
            renderer.setDrawingBufferSize(width, height, 1);

            map.getCanvasContainer().appendChild(renderer.domElement);
        }
    }

    initPass() {
        const { scene, camera, renderer } = this;

        const multisampling = Math.min(4, renderer.capabilities.maxSamples);

	    const composer = new EffectComposer(renderer, { multisampling });

        this.composer = composer;

        const effect = new OutlineEffect(scene, camera, {
            blendFunction: BlendFunction.SCREEN,
            patternScale: 40,
            edgeStrength: 7,
            visibleEdgeColor: 'orangered',
            hiddenEdgeColor: 'orangered',
            resolutionScale: 0.75,
            blur: true,
            xRay: true,
            multisampling
        });

        this.effect = effect;

        composer.addPass(new RenderPass(scene, camera));
	    composer.addPass(new EffectPass(camera, effect));
    }


    add(objects) {

        const { effect } = this;

        if(objects) {
            if (Array.isArray(objects) && objects.length > 0) {
                effect.selection.toggle(objects[0]);
            } else {
                effect.selection.toggle(objects);
            }
        }
    }

    clear() {
        const { effect } = this;

        if(effect) {
            effect.selection.clear();
        } 
    }

    render() {
        this.composer.render();
    }
}