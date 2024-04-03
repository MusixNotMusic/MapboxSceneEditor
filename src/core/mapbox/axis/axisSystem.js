import * as THREE from 'three';
import { Float32BufferAttribute, BufferGeometry, Color } from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export default class AxisSystem {
  constructor (option) {
    this.setOption(option);
    this.unit = 'km';
  }

  setOption (option = {}) {
    this.width = option.width || 1e5;
    this.height = option.height || 1e5;
    this.high = option.high || 1e4;
    this.scale = option.scale;
    this.lineColor = option.lineColor || '#fff';
    this.lineWidth = option.lineWidth || 10;
    this.divisions = option.divisions || 6;
    this.textColor = option.textColor || '#fff';
    this.fontSize = option.fontSize
    return this;
  }

  /***
   * 三维划线 不失真
   * @return {{meshLeft: LineSegments, meshBottom: LineSegments, meshText: CSS2DObject, meshBack: LineSegments}}
   */
  drawGridAxis () {
    // bottom grid
    const bottomGeometry = new BufferGeometry();
    const data = this.bottomAxisLineSegments(this.width, this.height, this.high, 1);
    bottomGeometry.setAttribute('position', new Float32BufferAttribute(data.vertices, 3));
    bottomGeometry.setAttribute('color', new Float32BufferAttribute(data.colors, 3));
    const materialBottom = new THREE.LineBasicMaterial({ vertexColors: true, toneMapped: false, lineWidth: this.lineWidth });
    const meshBottom = new THREE.LineSegments(bottomGeometry, materialBottom);
    meshBottom.rotation.x = Math.PI;
    meshBottom.rotation.y = Math.PI;

    // back grid
    const backGeometry = new BufferGeometry();
    const data1 = this.backAxisLineSegments(this.width, this.height, this.high, this.divisions);
    backGeometry.setAttribute('position', new Float32BufferAttribute(data1.vertices, 3));
    backGeometry.setAttribute('color', new Float32BufferAttribute(data1.colors, 3));
    const materialBack = new THREE.LineBasicMaterial({ vertexColors: true, toneMapped: false, lineWidth: this.lineWidth });
    const meshBack = new THREE.LineSegments(backGeometry, materialBack);

    // left grid
    const leftGeometry = new BufferGeometry();
    const data2 = this.leftAxisLineSegments(this.width, this.height, this.high, this.divisions);
    leftGeometry.setAttribute('position', new Float32BufferAttribute(data2.vertices, 3));
    leftGeometry.setAttribute('color', new Float32BufferAttribute(data2.colors, 3));

    const materialLeft = new THREE.LineBasicMaterial({ vertexColors: true, toneMapped: false, lineWidth: this.lineWidth });
    const meshLeft = new THREE.LineSegments(leftGeometry, materialLeft);

    const meshText = this.highAxisUnit(this.high, this.divisions);

    if (this.scale) meshBack.scale.set(this.scale.x, this.scale.y, this.scale.z);
    if (this.scale) meshLeft.scale.set(this.scale.x, this.scale.y, this.scale.z);

    return {
      meshBottom,
      meshBack,
      meshLeft,
      meshText
    };
  }


  /**
   * @return {{meshLeft: LineSegments, meshBottom: LineSegments, meshText: Group, meshBack: LineSegments}}
   */
  drawMercatorProjectionAxis (highUnit) {
    // bottom grid
    const bottomGeometry = new BufferGeometry();
    const data = this.bottomAxisLineSegments(this.width, this.height, this.high, 1);
    bottomGeometry.setAttribute('position', new Float32BufferAttribute(data.vertices, 3));
    bottomGeometry.setAttribute('color', new Float32BufferAttribute(data.colors, 3));
    const materialBottom = new THREE.LineBasicMaterial({ vertexColors: true, toneMapped: false });
    const meshBottom = new THREE.LineSegments(bottomGeometry, materialBottom);
    meshBottom.rotation.x = Math.PI;
    meshBottom.rotation.y = Math.PI;
    meshBottom.name = 'bottom'

    // back grid
    const backGeometry = new BufferGeometry();
    const data1 = this.backAxisLineSegments(this.width, -this.height, this.high, this.divisions);
    backGeometry.setAttribute('position', new Float32BufferAttribute(data1.vertices, 3));
    backGeometry.setAttribute('color', new Float32BufferAttribute(data1.colors, 3));
    const materialBack = new THREE.LineBasicMaterial({ vertexColors: true, toneMapped: false });
    const meshBack = new THREE.LineSegments(backGeometry, materialBack);
    meshBack.name = 'back'

    // left grid
    const leftGeometry = new BufferGeometry();
    const data2 = this.leftAxisLineSegments(this.width, this.height, this.high, this.divisions);
    leftGeometry.setAttribute('position', new Float32BufferAttribute(data2.vertices, 3));
    leftGeometry.setAttribute('color', new Float32BufferAttribute(data2.colors, 3));

    const materialLeft = new THREE.LineBasicMaterial({ vertexColors: true, toneMapped: false });
    const meshLeft = new THREE.LineSegments(leftGeometry, materialLeft);
    meshLeft.name = 'left'

    const { backLabel, leftLabel } = this.highAxisUnitInMercatorProjection(this.high, this.divisions, highUnit);

    meshBack.layers.enableAll();
    meshBack.add(backLabel);
    meshBack.layers.set( 0 );

    meshLeft.layers.enableAll();
    meshLeft.add(leftLabel);
    meshLeft.layers.set( 0 );

    if (this.scale) meshBack.scale.set(this.scale.x, this.scale.y, this.scale.z);
    if (this.scale) meshLeft.scale.set(this.scale.x, this.scale.y, this.scale.z);

    return {
      meshBottom,
      meshBack,
      meshLeft,
      // meshText
    };
  }

  /***
   * 左侧连接线
   * @param width
   * @param height
   * @param high
   * @param divisions
   * @return {{color: Color, vertices: []}}
   *    ________________________
   *   |_______________________|
   *   |_______________________|
   *   |_______________________|
   *   |_______________________|
   *   |_______________________|
   */
  leftAxisLineSegments (width, height, high, divisions) {
    const step = high / divisions;
    const halfX = width / 2;
    const halfY = height / 2;

    const vertices = [];
    const colors = [];
    const color = new Color(this.lineColor);
    let j = 0;
    for (let k = 0; k <= high; k += step) {
      vertices.push(-halfX, -halfY, k, -halfX, halfY, k);
      color.toArray(colors, j); j += 3;
      color.toArray(colors, j); j += 3;
    }
    vertices.push(-halfX, halfY, 0, -halfX, halfY, high);
    vertices.push(-halfX, -halfY, 0, -halfX, -halfY, high);
    color.toArray(colors, j); j += 3;
    color.toArray(colors, j); j += 3;
    color.toArray(colors, j); j += 3;
    color.toArray(colors, j);
    return {
      vertices,
      colors
    };
  }

  /***
   * 左侧连接线
   * @param width
   * @param height
   * @param high
   * @param divisions
   * @return {{color: Color, vertices: []}}
   */
  backAxisLineSegments (width, height, high, divisions) {
    const step = high / divisions;
    const halfX = width / 2;
    const halfY = height / 2;

    const vertices = [];
    const colors = [];
    const color = new Color(this.lineColor);
    let j = 0;
    for (let k = 0; k <= high; k += step) {
      vertices.push(-halfX, halfY, k, halfX, halfY, k);
      color.toArray(colors, j); j += 3;
      color.toArray(colors, j); j += 3;
    }

    vertices.push(-halfX, halfY, 0, -halfX, halfY, high);
    vertices.push(halfX, halfY, 0, halfX, halfY, high);
    color.toArray(colors, j); j += 3;
    color.toArray(colors, j); j += 3;
    color.toArray(colors, j); j += 3;
    color.toArray(colors, j);

    return {
      vertices,
      colors
    };
  }

  /***
   * 左侧连接线
   * @param width
   * @param height
   * @param high
   * @param divisions
   * @return {{color: Color, vertices: []}}
   */
  bottomAxisLineSegments (width, height, high, divisions) {
    const halfX = width / 2;
    const halfY = height / 2;
    high = 0;
    const step = height / divisions;

    const vertices = [];
    const colors = [];
    const color = new Color(this.lineColor);
    let j = 0;
    for (let k = 0; k <= height; k += step) {
      vertices.push(-halfX, k - halfY, high, halfX, k - halfY, high);
      color.toArray(colors, j); j += 3;
      color.toArray(colors, j); j += 3;
    }
    vertices.push(-halfX, -halfY, high, -halfX, halfY, high);
    vertices.push(halfX, -halfY, high, halfX, halfY, high);
    color.toArray(colors, j); j += 3;
    color.toArray(colors, j);

    return {
      vertices,
      colors
    };
  }


  highAxisUnit (high, divisions) {
    const highMeshGroup = new THREE.Group();

    const step = high / divisions;

    for (let k = 0; k <= high; k += step) {
      const meshText = this.makeTextSprite(`  ${(k / 1000).toFixed(1)}  ${'(km)'} `,
        {
          fontsize: this.fontSize || 50,
          borderThickness: 0,
          textColor: this.textColor || 'black',
          borderColor: { r: 0, g: 0, b: 0, a: 1.0 },
          backgroundColor: { r: 255, g: 255, b: 255, a: 0.0 }
        });
      meshText.position.z = k * (this.scale ? this.scale.z : 1);
      meshText.position.x = -this.width / 2 - 100;
      meshText.position.y = -this.height / 2 - 7100;
      meshText.rotation.y = Math.PI / 2;
      meshText.rotation.z = Math.PI / 2;
      highMeshGroup.add(meshText);

      const meshText1 = meshText.clone();
      meshText1.position.x = this.width / 2 + 7000;
      meshText1.position.y = this.height / 2 + 1000;
      meshText1.rotation.y = 0;
      highMeshGroup.add(meshText1);
    };

    return highMeshGroup;
  }

  /**
   *
   * @param high
   * @param divisions
   * @return {Group}
   */
  highAxisUnitInMercatorProjection (high, divisions, highUnit = 1000) {
    const css2DGroupBack = new THREE.Group();
    const css2DGroupLeft = new THREE.Group();

    const step = high / divisions;

    for (let k = 0; k <= high; k += step) {
      const context = `${(k * highUnit / 1000).toFixed(1)} ` + (k === high ? '(km)' : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')

      const element = document.createElement( 'div' );
      element.className = 'element';

      const details = document.createElement( 'div' );
      details.className = 'details';
      details.style.color = this.textColor
      details.style.transform = 'translateX(50%)';
      details.style.fontSize = '18px';
      details.style.textAlign = 'left';
      details.innerHTML = context;
      element.appendChild( details );


      const elementLeft = document.createElement( 'div' );
      element.className = 'element';

      const detailsLeft = document.createElement( 'div' );
      detailsLeft.className = 'details';
      detailsLeft.style.color = this.textColor
      detailsLeft.style.transform = 'translateX(-50%)';
      detailsLeft.style.fontSize = '18px';
      detailsLeft.innerHTML = context;
      elementLeft.appendChild( detailsLeft );

      const objectCSSBack = new CSS2DObject( element );
      const objectCSSLeft = new CSS2DObject( elementLeft );

      objectCSSBack.position.x = this.width / 2;
      objectCSSBack.position.y = -this.height / 2;
      objectCSSBack.position.z = k;


      objectCSSLeft.position.x = -this.width / 2;
      objectCSSLeft.position.y = this.height / 2;
      objectCSSLeft.position.z = k;


      css2DGroupBack.add(objectCSSBack);
      css2DGroupLeft.add(objectCSSLeft);
    }

    return {
      backLabel: css2DGroupBack,
      leftLabel: css2DGroupLeft
    };
  }

  /**
   * https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/Sprite-Text-Labels.html
   * @param message
   * @param parameters
   * @return {Sprite}
   */
  makeTextSprite (message, parameters) {
    if (parameters === undefined) parameters = {};

    const fontface = 'fontface' in parameters ? parameters.fontface : '微软雅黑';

    const fontsize = 'fontsize' in parameters ? parameters.fontsize : 18;

    const borderThickness = 'borderThickness' in parameters ? parameters.borderThickness : 4;

    const borderColor = 'borderColor' in parameters ? parameters.borderColor : { r: 0, g: 0, b: 0, a: 1.0 };

    const backgroundColor = 'backgroundColor' in parameters ? parameters.backgroundColor : { r: 0, g: 0, b: 0, a: 1.0 };

    // const spriteAlignment = THREE.SpriteAlignment.topLeft;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = 'Bold ' + fontsize + 'px ' + fontface;

    // get size data (height depends only on font size)
    const metrics = context.measureText(message);
    const textWidth = metrics.width;

    // background color
    context.fillStyle = 'rgba(' + backgroundColor.r + ',' + backgroundColor.g + ',' + backgroundColor.b + ',' + backgroundColor.a + ')';
    // border color
    context.strokeStyle = 'rgba(' + borderColor.r + ',' + borderColor.g + ',' + borderColor.b + ',' + borderColor.a + ')';

    context.lineWidth = borderThickness;
    // this.roundRect(context, borderThickness / 2, borderThickness / 2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.

    // text color
    context.fillStyle = parameters.textColor || '#fff';
    // context.fillStyle = 'orange';
    context.textAlign = 'start';
    context.textBaseline = 'top';

    context.fillText(message, borderThickness, fontsize + borderThickness);
    // canvas.width = textWidth;
    // canvas.height = textWidth * 0.5;
    // canvas contents will be used for a texture
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    const plane = new THREE.PlaneGeometry(textWidth * fontsize, textWidth * fontsize * 0.5, 1.0);
    const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: texture, depthTest: false, depthWrite: false, transparent: true });
    const mesh = new THREE.Mesh(plane, material);
    // const spriteMaterial = new THREE.SpriteMaterial(
    //   { map: texture });
    // const sprite = new THREE.Sprite(spriteMaterial);
    // sprite.scale.set(20000, 10000, 1.0);
    return mesh;
  }

  // function for drawing rounded rectangles
  roundRect (ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}
