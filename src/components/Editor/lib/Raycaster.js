import EventEmitter from "events";
import * as THREE from 'three';

export class Raycaster extends EventEmitter{
    constructor (map, scene, camera) {
        super();

        this.map = map;

        this.scene = scene;

        this.camera = camera;

        this.raycaster = new THREE.Raycaster();

        this.addEventListener();
    }


    isTransformControls(object) {
        let target = object;
        while(target) {
          if (target.isTransformControls) {
            return true;
          }
          target = target.parent;
        }
        return false;
    }


    isShadowTool(object) {
        let target = object;
        while(target) {
          if (target.isShadowTool) {
            return true;
          }
          target = target.parent;
        }
        return false;
    }


    raycast(event) {
        const { map, scene, camera, raycaster } = this;

        const x = ( event.point.x / map.transform.width ) * 2 - 1;

        const y = 1 - ( event.point.y / map.transform.height ) * 2;

        const mouse = new THREE.Vector2(x, y);
    
        const projectionMatrixInvert = camera.projectionMatrix.invert();
        
        const cameraPosition = new THREE.Vector3().applyMatrix4(projectionMatrixInvert);

        const mousePosition = new THREE.Vector3(mouse.x, mouse.y, 0.95).applyMatrix4(projectionMatrixInvert);

        const viewDirection = mousePosition.clone().sub(cameraPosition).normalize();
    
        raycaster.set(cameraPosition, viewDirection);
    
        const intersectObjects = raycaster.intersectObjects(this.scene.children, true);

        let _intersectObjects = intersectObjects.filter(({ object }) => !this.isTransformControls(object) && !this.isShadowTool(object));
    
        console.log('_intersectObjects ==>', _intersectObjects);

        this.emit('intersectObjects', _intersectObjects)
    }

    addEventListener() {
        this.clickBind = this.raycast.bind(this);
        this.map.on('click', this.clickBind);
    }

    removeEventListener() {
        this.map.off('click', this.clickBind);
        this.clickBind = null;
    }

    dispose() {
        this.removeEventListener();
        this.removeAllListeners('intersectObjects');
    }
}