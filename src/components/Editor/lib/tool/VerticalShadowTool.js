import * as THREE from 'three';
import { WGS84Object3D } from '../WGS84Object3D';

export class VerticalShadowTool {
    constructor(scene) {
        this.scene = scene;
        
        this.lightWrap = null;

        this.planeWrap = null;

        this.isShadowTool = true;

        this.initDirectionalLight();
        
        this.initPlaneShadow();
    }

    initDirectionalLight () {

        const light = new THREE.DirectionalLight( 0xffffff );
    
        light.castShadow = true;
    
        light.position.set( 0, 1, 0 ); 

        light.isShadowTool = true;

        this.light = light;

        const lightWrap = new WGS84Object3D(light);

        lightWrap.isShadowTool = true;

        lightWrap.visible = false;

        lightWrap.WGS84Position = new THREE.Vector3();
    
        lightWrap.add(new THREE.AxesHelper(1000));

        this.lightWrap = lightWrap;
    
        this.scene.add( lightWrap );
    }

    initPlaneShadow() {
        const geometry = new THREE.PlaneGeometry(1, 1);

        const material = new THREE.ShadowMaterial({ opacity: 0.5 });
        
        const plane = new THREE.Mesh(geometry, material);

        plane.isShadowTool = true;

        plane.receiveShadow = true;

        const planeWrap = new WGS84Object3D(plane);

        planeWrap.visible = false;

        planeWrap.WGS84Position = new THREE.Vector3();

        planeWrap.isShadowTool = true;

        this.planeWrap = planeWrap;

        this.scene.add(planeWrap);
    }

    visible (show) {
        this.lightWrap.visible = show;
        this.planeWrap.visible = show;
    }

    setDirectionalLightCamera(size) {
        const light = this.light;

        const { x, y, z } = this.object.scale;

        const maxScale = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));

        light.shadow.camera.scale.set(maxScale, maxScale, maxScale );

        light.shadow.camera.near = 0; // default

        light.shadow.camera.far = this.lightWrap.position.z + 1e6; // default

        light.shadow.camera.right = size.x;
        light.shadow.camera.left = -size.x;
        light.shadow.camera.top	= size.y;
        light.shadow.camera.bottom = -size.y;
        
        if (light.shadow.map) {
            light.shadow.mapSize.set( 512, 512);
		    light.shadow.map.setSize( 512, 512 );	
        }
    }

    getObjectSize (object, scale) {
        const aabb = new THREE.Box3().setFromObject(object, true);
        const size = new THREE.Vector3();
        aabb.getSize(size);
        return size.multiply(scale);
    }

    follow () {
        const object = this.object;

        // get object position quaternion scale

        const position = new THREE.Vector3();

        const quaternion = new THREE.Quaternion();
        
        const scale = new THREE.Vector3();

        object.matrixWorld.decompose( position, quaternion, scale );

        // size 
        const size = this.getObjectSize(object, scale);

        // set light plane position
        
        const positionLight = position.clone().setZ(position.z + 1e6);

        const positionPlane = position.clone().setZ(-1);

        this.lightWrap.position.set(positionLight.x, positionLight.y, positionLight.z);

        this.planeWrap.position.set(positionPlane.x, positionPlane.y, positionPlane.z);

        // update plane

        const plane = this.planeWrap.children[0];

        plane.scale.set(size.x, size.y, 1);

        // update light 
        this.setDirectionalLightCamera(size);
    }

    attach (object) {
        if (!object || object === this.object) return;
        
        this.object = object;

        object.traverse(obj => {
            if (obj.isMesh) {
                obj.castShadow = true;
            }
        })

        object.castShadow = true;

        this.light.target = object;

        this.follow();

        this.visible(true);
    }

    detach () {
        if (!this.object) return;

        this.light.target = null;

        this.object.castShadow = false;

        this.object.traverse(obj => {
            if (obj.isMesh) {
                obj.castShadow = false;
            }
        })

        this.object = null;

        this.visible(false);
    }

    dispose () {
        this.lightWrap.clear();
        this.planeWrap.clear();
        this.lightWrap = null;
        this.planeWrap = null;
        this.object = null;
    }
} 