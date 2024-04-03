import * as THREE from 'three';

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

import { TransformControls } from './tool/TransformControls';

import BaseMercatorMeterProjectionModelClass from "./BaseMercatorMeterProjectionModelClass";

import mapboxgl from "mapbox-gl";

import { WGS84Object3D } from './WGS84Object3D';
import { VerticalShadowTool } from './tool/VerticalShadowTool';
import { OutlineEffectTool } from './tool/OutlineEffectTool';
import { Raycaster } from './Raycaster';

/***
 * 矩形立方体的 等值面结构
 */
export default class MapboxThreeLayer extends BaseMercatorMeterProjectionModelClass{
  constructor (id, map) {
    super(id, map);
    
    this.id = id;
    
    this.map = map;

    this.zoomBind = this.zoom.bind(this);

    this.control = new TransformControls(this.camera, this.renderer.domElement, this.raycastCamera );

    this.outlineEffect = null;

    this.control.addEventListener('dragging-changed', (event) => {
        event.value ? this.disableAll() : this.enableAll()
        this.verticalShadowTool.follow();
    })

    this.control.addEventListener('objectChange', (event) => {
      this.verticalShadowTool.follow();
    })

    this.verticalShadowTool = new VerticalShadowTool(this.scene);

    this.scene.add( this.control );

    window.control = this.control;
    window.radarModel = this;
    window.THREE = THREE;
  }


  initTool () {
    // init transform controls
    this.control = new TransformControls(this.camera, this.renderer.domElement, this.raycastCamera );

    this.scene.add( this.control );

    this.control.addEventListener('dragging-changed', (event) => {
      event.value ? this.disableAll() : this.enableAll()
      this.verticalShadowTool.follow();
    })

    this.control.addEventListener('objectChange', (event) => {
      this.verticalShadowTool.follow();
    })

    // init shadowTool
    this.verticalShadowTool = new VerticalShadowTool(this.scene);

    // init outlineEffect
    this.outlineEffect = new OutlineEffectTool(this.map, this.scene, this.camera);

    // init raycast 
    this.raycast = new Raycaster(this.map, this.scene, this.raycastCamera);

    this.raycast.on('intersectObjects', (objects) => {
      if (objects.length > 0) {
        this.focusObject = objects[0].object;
        if (this.isTransformMode())  this.control.attach(this.focusObject);
        this.verticalShadowTool.attach(this.focusObject)
        this.outlineEffect.clear();
        this.outlineEffect.add(this.focusObject)
      } else {
        this.focusObject = null;
        this.control.detach();
        this.verticalShadowTool.detach();
        this.outlineEffect.clear();
      }
    })
  }


  onBeforeRender() {
    this.initTool();
  }

  zoom() {
    let zoom = this.map.getZoom();
    if (this.css2DRenderer) {
      const list = this.css2DRenderer.domElement.querySelectorAll('.name')
      list.forEach(dom => {
        dom.style.transform = `scale(${zoom / 10})`;
      })
    }
  }


  addEventListener() {
    if (this.map) {
      this.map.on('zoom', this.zoomBind);
    }
  }

  removeEventListener() {
    if (this.map) {
      this.map.off('zoom', this.zoomBind);
    }
  }

  render () {
    return this.initRadarModel().then(() => {
      this.drawLayer();
      // this.initPointLightHelper();
      this.initSphere();
      // this.initDirectionalLightHelper();
      return null;
    })
  }


  initRadarModel () {
    const loader = new FBXLoader();

    return new Promise((resolve) => {
      loader.load( '/model/fbx/radar2.fbx',  ( model ) => {

        const object = new WGS84Object3D(model);

        object.WGS84Position = new THREE.Vector3(104, 30, 3000);

        object.rotation.x = Math.PI / 2;

        object.scale.set(10, 10, 10);

        object.add(new THREE.AxesHelper(1000))

        window.demoModel = object;

        this.addCSS2Object(object, 'demo', null, [0, 500, 0]);

        this.scene.add(object)

        resolve(model);
      });
    
    })
  }

  initSphere () {
      const sphere = new THREE.SphereGeometry(500);
      const material = new THREE.MeshNormalMaterial();
      sphere.computeVertexNormals();

      const mesh = new THREE.Mesh(sphere, material);

      mesh.castShadow = true;
      mesh.receiveShadow = false;

      const sphereObject = new WGS84Object3D(mesh);

      sphereObject.WGS84Position = new THREE.Vector3(103.8, 30, 2000);

      window.sphere = sphereObject;

      this.scene.add(sphereObject);
  }

  initPlaneShadow() {
    const geometryP = new THREE.PlaneGeometry(10000, 10000);
    const materialP = new THREE.MeshStandardMaterial({ color:0xffffff, transparent: true, opacity: 0.5 })
    const plane = new THREE.Mesh(geometryP, materialP);

    plane.receiveShadow = true;

    const planeWrap = new WGS84Object3D(plane);

    planeWrap.WGS84Position = new THREE.Vector3(104, 30, 0);

    this.scene.add(planeWrap);
  }

  initDirectionalLightHelper () {

    const light = new THREE.DirectionalLight( 0xffffff );

    light.castShadow = true;

    light.shadow.mapSize.width = 512; // default
    light.shadow.mapSize.height = 512; // default
    light.shadow.camera.near = 0.5; // default
    light.shadow.camera.far = 50000; // default

    light.shadow.camera.right = 512;
    light.shadow.camera.left = - 512;
    light.shadow.camera.top	= 512;
    light.shadow.camera.bottom = - 512;

    light.position.set( 0, 1, 0 ); 

    light.target = window.demoModel;
    const helper = new THREE.DirectionalLightHelper( light, 1000, 0x0f0fcc );

    const object = new WGS84Object3D(light);
    object.WGS84Position = new THREE.Vector3(104, 30, 10000);

    window.DirectionalLight = object;

    object.add(new THREE.AxesHelper(1000));
    object.add(helper);

    this.scene.add( object );
  }

  initPointLightHelper () {
    const pointLight = new THREE.PointLight( 0xff0000, 1, 10000 );
    const lightObject = new WGS84Object3D(pointLight);
    lightObject.WGS84Position = new THREE.Vector3(104, 29.95, 4400);
    lightObject.add(new THREE.AxesHelper(1000));

    this.scene.add( lightObject );

    window.PointLight = lightObject;

    const sphereSize = 100;
    const pointLightHelper = new THREE.PointLightHelper( pointLight.clone(), sphereSize );
    const helper = new WGS84Object3D(pointLightHelper);
    helper.WGS84Position = new THREE.Vector3(104, 29.95, 4400);
    this.scene.add( helper );
  }
  
 

  isTransformMode () {
    const mode = this.control.getMode();;
    return mode === 'translate' || mode === 'rotate' || mode === 'scale'
  }

  setMode (mode) {
    if (mode === 'default') {
      this.control.detach();
    } else if (this.isTransformMode()){
      this.control.setMode(mode);
      if (!this.control.object) {
        this.control.attach(this.focusObject);
      }
    } 
  }

  renderHook() {
    if (this.outlineEffect && this.outlineEffect.composer) {
      this.outlineEffect.composer.render();
    }
  }

  disableAll() {
    this.map.dragPan.disable();
    this.map.doubleClickZoom.disable();
  }

  enableAll() {
    this.map.dragPan.enable();
    this.map.doubleClickZoom.enable();
  }


  destroy () {
    super.destroy();
  }

  dispose () {
    this.destroy()
  }

}
