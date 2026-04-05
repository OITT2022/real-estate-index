enfrru한국어中文日本語

### Getting Started

- [Installation](https://threejs.org/manual/en/installation.html)
- [Creating a Scene](https://threejs.org/manual/en/creating-a-scene.html)
- [Creating Text](https://threejs.org/manual/en/creating-text.html)
- [Drawing Lines](https://threejs.org/manual/en/drawing-lines.html)
- [FAQ](https://threejs.org/manual/en/faq.html)
- [Libraries and Plugins](https://threejs.org/manual/en/libraries-and-plugins.html)
- [Loading 3D Models](https://threejs.org/manual/en/loading-3d-models.html)
- [Uniform Types](https://threejs.org/manual/en/uniform-types.html)
- [Useful Links](https://threejs.org/manual/en/useful-links.html)
- [WebGL Compatibility Check](https://threejs.org/manual/en/webgl-compatibility-check.html)

### Next Steps

- [Animation System](https://threejs.org/manual/en/animation-system.html)
- [Color Management](https://threejs.org/manual/en/color-management.html)
- [How to create VR content](https://threejs.org/manual/en/how-to-create-vr-content.html)
- [How to dispose of Objects](https://threejs.org/manual/en/how-to-dispose-of-objects.html)
- [How to update Things](https://threejs.org/manual/en/how-to-update-things.html)
- [How to use Post Processing](https://threejs.org/manual/en/how-to-use-post-processing.html)
- [Matrix Transformations](https://threejs.org/manual/en/matrix-transformations.html)

* * *

### Basics

- [Fundamentals](https://threejs.org/manual/en/fundamentals.html)
- [Responsive Design](https://threejs.org/manual/en/responsive.html)
- [Prerequisites](https://threejs.org/manual/en/prerequisites.html)
- [Setup](https://threejs.org/manual/en/setup.html)

### Fundamentals

- [Primitives](https://threejs.org/manual/en/primitives.html)
- [Scenegraph](https://threejs.org/manual/en/scenegraph.html)
- [Materials](https://threejs.org/manual/en/materials.html)
- [Textures](https://threejs.org/manual/en/textures.html)
- [Lights](https://threejs.org/manual/en/lights.html)
- [Cameras](https://threejs.org/manual/en/cameras.html)
- [Shadows](https://threejs.org/manual/en/shadows.html)
- [Fog](https://threejs.org/manual/en/fog.html)
- [Render Targets](https://threejs.org/manual/en/rendertargets.html)
- [Custom BufferGeometry](https://threejs.org/manual/en/custom-buffergeometry.html)
- [Physics](https://threejs.org/manual/en/physics.html)

### Tips

- [Rendering On Demand](https://threejs.org/manual/en/rendering-on-demand.html)
- [Debugging JavaScript](https://threejs.org/manual/en/debugging-javascript.html)
- [Debugging GLSL](https://threejs.org/manual/en/debugging-glsl.html)
- [Taking a screenshot](https://threejs.org/manual/en/tips.html#screenshot)
- [Prevent the Canvas Being Cleared](https://threejs.org/manual/en/tips.html#preservedrawingbuffer)
- [Get Keyboard Input From a Canvas](https://threejs.org/manual/en/tips.html#tabindex)
- [Make the Canvas Transparent](https://threejs.org/manual/en/tips.html#transparent-canvas)
- [Use three.js as Background in HTML](https://threejs.org/manual/en/tips.html#html-background)

### Optimization

- [Optimizing Lots of Objects](https://threejs.org/manual/en/optimize-lots-of-objects.html)
- [Optimizing Lots of Objects Animated](https://threejs.org/manual/en/optimize-lots-of-objects-animated.html)
- [Using OffscreenCanvas in a Web Worker](https://threejs.org/manual/en/offscreencanvas.html)

### Solutions

- [Load an .OBJ file](https://threejs.org/manual/en/load-obj.html)
- [Load a .GLTF file](https://threejs.org/manual/en/load-gltf.html)
- [Add a Background or Skybox](https://threejs.org/manual/en/backgrounds.html)
- [How to Draw Transparent Objects](https://threejs.org/manual/en/transparency.html)
- [Multiple Canvases, Multiple Scenes](https://threejs.org/manual/en/multiple-scenes.html)
- [Picking Objects with the mouse](https://threejs.org/manual/en/picking.html)
- [Post Processing](https://threejs.org/manual/en/post-processing.html)
- [Using Shadertoy shaders](https://threejs.org/manual/en/shadertoy.html)
- [Aligning HTML Elements to 3D](https://threejs.org/manual/en/align-html-elements-to-3d.html)
- [Using Indexed Textures for Picking and Color](https://threejs.org/manual/en/indexed-textures.html)
- [Using A Canvas for Dynamic Textures](https://threejs.org/manual/en/canvas-textures.html)
- [Billboards and Facades](https://threejs.org/manual/en/billboards.html)
- [Freeing Resources](https://threejs.org/manual/en/cleanup.html)
- [Making Voxel Geometry (Minecraft)](https://threejs.org/manual/en/voxel-geometry.html)
- [Start making a Game](https://threejs.org/manual/en/game.html)

### WebGPU

- [WebGPURenderer](https://threejs.org/manual/en/webgpurenderer.html)
- [Post-Processing](https://threejs.org/manual/en/webgpu-postprocessing.html)

### WebXR

- [VR - Basics](https://threejs.org/manual/en/webxr-basics.html)
- [VR - Look To Select](https://threejs.org/manual/en/webxr-look-to-select.html)
- [VR - Point To Select](https://threejs.org/manual/en/webxr-point-to-select.html)

### Reference

- [Material Table](https://threejs.org/manual/en/material-table.html)

Lights

# Lights

This article is part of a series of articles about three.js. The
first article is [three.js fundamentals](https://threejs.org/manual/en/fundamentals.html). If
you haven't read that yet and you're new to three.js you might want to
consider starting there and also the article on [setting up your environment](https://threejs.org/manual/en/setup.html). The
[previous article was about textures](https://threejs.org/manual/en/textures.html).

Let's go over how to use the various kinds of lights in three.

Starting with one of our previous samples let's update the camera.
We'll set the field of view to 45 degrees, the far plane to 100 units,
and we'll move the camera 10 units up and 20 units back from the origin

```js
const fov = 45;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 10, 20);
```

Next let's add [`OrbitControls`](https://threejs.org/docs/#examples/en/controls/OrbitControls). [`OrbitControls`](https://threejs.org/docs/#examples/en/controls/OrbitControls) let the user spin
or _orbit_ the camera around some point. The [`OrbitControls`](https://threejs.org/docs/#examples/en/controls/OrbitControls) are
an optional feature of three.js so first we need to include them
in our page

```js
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
```

Then we can use them. We pass the [`OrbitControls`](https://threejs.org/docs/#examples/en/controls/OrbitControls) a camera to
control and the DOM element to use to get input events

```js
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.update();
```

We also set the target to orbit around to 5 units above the origin
and then call `controls.update` so the controls will use the new
target.

Next up let's make some things to light up. First we'll make ground
plane. We'll apply a tiny 2x2 pixel checkerboard texture that looks
like this

![](https://threejs.org/manual/examples/resources/images/checker.png)

First we load the texture, set it to repeating, set the filtering to
nearest, and set how many times we want it to repeat. Since the
texture is a 2x2 pixel checkerboard, by repeating and setting the
repeat to half the size of the plane each check on the checkerboard
will be exactly 1 unit large;

```js
const planeSize = 40;

const loader = new THREE.TextureLoader();
const texture = loader.load('resources/images/checker.png');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;
texture.colorSpace = THREE.SRGBColorSpace;
const repeats = planeSize / 2;
texture.repeat.set(repeats, repeats);
```

We then make a plane geometry, a material for the plane, and a mesh
to insert it in the scene. Planes default to being in the XY plane
but the ground is in the XZ plane so we rotate it.

```js
const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
const planeMat = new THREE.MeshPhongMaterial({
  map: texture,
  side: THREE.DoubleSide,
});
const mesh = new THREE.Mesh(planeGeo, planeMat);
mesh.rotation.x = Math.PI * -.5;
scene.add(mesh);
```

Let's add a cube and a sphere so we have 3 things to light including the plane

```js
{
  const cubeSize = 4;
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMat = new THREE.MeshPhongMaterial({color: '#8AC'});
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
  scene.add(mesh);
}
{
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
  const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
  const mesh = new THREE.Mesh(sphereGeo, sphereMat);
  mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  scene.add(mesh);
}
```

Now that we have a scene to light up let's add lights!

## [`AmbientLight`](https://threejs.org/docs/\#api/en/lights/AmbientLight)

First let's make an [`AmbientLight`](https://threejs.org/docs/#api/en/lights/AmbientLight)

```js
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);
```

Let's also make it so we can adjust the light's parameters.
We'll use [lil-gui](https://github.com/georgealways/lil-gui) again.
To be able to adjust the color via lil-gui we need a small helper
that presents a property to lil-gui that looks like a CSS hex color string
(eg: `#FF8844`). Our helper will get the color from a named property,
convert it to a hex string to offer to lil-gui. When lil-gui tries
to set the helper's property we'll assign the result back to the light's
color.

Here's the helper:

```js
class ColorGUIHelper {
  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }
  get value() {
    return '#' + this.object[this.prop].getHexString();
  }
  set value(hexString) {
    this.object[this.prop].set(hexString);
  }
}
```

And here's our code setting up lil-gui

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 5, 0.01);
```

And here's the result

JSHTMLCSSExportResultRun

[three.js](https://threejs.org/) [![](https://threejs.org/files/icon.svg)](https://threejs.org/)

1

import\* as THREEfrom'three';

1

<canvasid="c"></canvas>

1

html,body{

[three.js](https://threejs.org/) [![](https://threejs.org/files/icon.svg)](https://threejs.org/)

Export To:

jsGistCodepenJSFiddleCodeSandboxStack Overflow

Copy and paste the text below into a [stack overflow question](https://threejs.org/manual/examples/resources/editor.html?url=/manual/examples/lights-ambient.html).

```

```

[click here to open in a separate window](https://threejs.org/manual/examples/lights-ambient.html)

Click and drag in the scene to _orbit_ the camera.

Notice there is no definition. The shapes are flat. The [`AmbientLight`](https://threejs.org/docs/#api/en/lights/AmbientLight) effectively
just multiplies the material's color by the light's color times the
intensity.

```
color = materialColor * light.color * light.intensity;
```

That's it. It has no direction.
This style of ambient lighting is actually not all that
useful as lighting as it's 100% even so other than changing the color
of everything in the scene it doesn't look much like _lighting_.
What it does help with is making the darks not too dark.

## [`HemisphereLight`](https://threejs.org/docs/\#api/en/lights/HemisphereLight)

Let's switch the code to a [`HemisphereLight`](https://threejs.org/docs/#api/en/lights/HemisphereLight). A [`HemisphereLight`](https://threejs.org/docs/#api/en/lights/HemisphereLight)
takes a sky color and a ground color and just multiplies the
material's color between those 2 colors—the sky color if the
surface of the object is pointing up and the ground color if
the surface of the object is pointing down.

Here's the new code

```js
const color = 0xFFFFFF;
const skyColor = 0xB1E1FF;  // light blue
const groundColor = 0xB97A20;  // brownish orange
const intensity = 1;
const light = new THREE.AmbientLight(color, intensity);
const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
scene.add(light);
```

Let's also update the lil-gui code to edit both colors

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('skyColor');
gui.addColor(new ColorGUIHelper(light, 'groundColor'), 'value').name('groundColor');
gui.add(light, 'intensity', 0, 5, 0.01);
```

The result:

JSHTMLCSSExportResultRun

[three.js](https://threejs.org/) [![](https://threejs.org/files/icon.svg)](https://threejs.org/)

1

import\* as THREEfrom'three';

1

<canvasid="c"></canvas>

1

html,body{

[three.js](https://threejs.org/) [![](https://threejs.org/files/icon.svg)](https://threejs.org/)

Export To:

jsGistCodepenJSFiddleCodeSandboxStack Overflow

Copy and paste the text below into a [stack overflow question](https://threejs.org/manual/examples/resources/editor.html?url=/manual/examples/lights-hemisphere.html).

```

```

[click here to open in a separate window](https://threejs.org/manual/examples/lights-hemisphere.html)

Notice again there is almost no definition, everything looks kind
of flat. The [`HemisphereLight`](https://threejs.org/docs/#api/en/lights/HemisphereLight) used in combination with another light
can help give a nice kind of influence of the color of the sky
and ground. In that way it's best used in combination with some
other light or a substitute for an [`AmbientLight`](https://threejs.org/docs/#api/en/lights/AmbientLight).

## [`DirectionalLight`](https://threejs.org/docs/\#api/en/lights/DirectionalLight)

Let's switch the code to a [`DirectionalLight`](https://threejs.org/docs/#api/en/lights/DirectionalLight).
A [`DirectionalLight`](https://threejs.org/docs/#api/en/lights/DirectionalLight) is often used to represent the sun.

```js
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(0, 10, 0);
light.target.position.set(-5, 0, 0);
scene.add(light);
scene.add(light.target);
```

Notice that we had to add the `light` and the `light.target`
to the scene. A three.js [`DirectionalLight`](https://threejs.org/docs/#api/en/lights/DirectionalLight) will shine
in the direction of its target.

Let's make it so we can move the target by adding it to
our GUI.

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 5, 0.01);
gui.add(light.target.position, 'x', -10, 10);
gui.add(light.target.position, 'z', -10, 10);
gui.add(light.target.position, 'y', 0, 10);
```

JSHTMLCSSExportResultRun

[three.js](https://threejs.org/) [![](https://threejs.org/files/icon.svg)](https://threejs.org/)

1

import\* as THREEfrom'three';

1

<canvasid="c"></canvas>

1

html,body{

[three.js](https://threejs.org/) [![](https://threejs.org/files/icon.svg)](https://threejs.org/)

Export To:

jsGistCodepenJSFiddleCodeSandboxStack Overflow

Copy and paste the text below into a [stack overflow question](https://threejs.org/manual/examples/resources/editor.html?url=/manual/examples/lights-directional.html).

```

```

[click here to open in a separate window](https://threejs.org/manual/examples/lights-directional.html)

It's kind of hard to see what's going on. Three.js has a bunch
of helper objects we can add to our scene to help visualize
invisible parts of a scene. In this case we'll use the
[`DirectionalLightHelper`](https://threejs.org/docs/#api/en/helpers/DirectionalLightHelper) which will draw a plane, to represent
the light, and a line from the light to the target. We just
pass it the light and add it to the scene.

```js
const helper = new THREE.DirectionalLightHelper(light);
scene.add(helper);
```

While we're at it let's make it so we can set both the position
of the light and the target. To do this we'll make a function
that given a [`Vector3`](https://threejs.org/docs/#api/en/math/Vector3) will adjust its `x`, `y`, and `z` properties
using `lil-gui`.

```js
function makeXYZGUI(gui, vector3, name, onChangeFn) {
  const folder = gui.addFolder(name);
  folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
  folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
  folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
  folder.open();
}
```

Note that we need to call the helper's `update` function
anytime we change something so the helper knows to update
itself. As such we pass in an `onChangeFn` function to
get called anytime lil-gui updates a value.

Then we can use that for both the light's position
and the target's position like this

```js
function updateLight() {
  light.target.updateMatrixWorld();
  helper.update();
}
updateLight();

const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 5, 0.01);

makeXYZGUI(gui, light.position, 'position', updateLight);
makeXYZGUI(gui, light.target.position, 'target', updateLight);
```

Now we can move the light, and its target

JSHTMLCSSExportResultRun

[three.js](https://threejs.org/) [![](https://threejs.org/files/icon.svg)](https://threejs.org/)

1

import\* as THREEfrom'three';

1

<canvasid="c"></canvas>

1

html,body{

[three.js](https://threejs.org/) [![](https://threejs.org/files/icon.svg)](https://threejs.org/)

Export To:

jsGistCodepenJSFiddleCodeSandboxStack Overflow

Copy and paste the text below into a [stack overflow question](https://threejs.org/manual/examples/resources/editor.html?url=/manual/examples/lights-directional-w-helper.html).

```

```

[click here to open in a separate window](https://threejs.org/manual/examples/lights-directional-w-helper.html)

Orbit the camera and it gets easier to see. The plane
represents a [`DirectionalLight`](https://threejs.org/docs/#api/en/lights/DirectionalLight) because a directional
light computes light coming in one direction. There is no
_point_ the light comes from, it's an infinite plane of light
shooting out parallel rays of light.

## [`PointLight`](https://threejs.org/docs/\#api/en/lights/PointLight)

A [`PointLight`](https://threejs.org/docs/#api/en/lights/PointLight) is a light that sits at a point and shoots light
in all directions from that point. Let's change the code.

```js
const color = 0xFFFFFF;
const intensity = 1;
const intensity = 150;
const light = new THREE.DirectionalLight(color, intensity);
const light = new THREE.PointLight(color, intensity);
light.position.set(0, 10, 0);
light.target.position.set(-5, 0, 0);
scene.add(light);
scene.add(light.target);
```

Let's also switch to a [`PointLightHelper`](https://threejs.org/docs/#api/en/helpers/PointLightHelper)

```js
const helper = new THREE.DirectionalLightHelper(light);
const helper = new THREE.PointLightHelper(light);
scene.add(helper);
```

and as there is no target the `onChange` function can be simpler.

```js
function updateLight() {
  light.target.updateMatrixWorld();
  helper.update();
}
updateLight();
```

Note that at some level a [`PointLightHelper`](https://threejs.org/docs/#api/en/helpers/PointLightHelper) has no um, point.
It just draws a small wireframe diamond. It could just as easily
be any shape you want, just add a mesh to the light itself.

A [`PointLight`](https://threejs.org/docs/#api/en/lights/PointLight) has the added property of [`distance`](https://threejs.org/docs/#api/en/lights/PointLight#distance).
If the `distance` is 0 then the [`PointLight`](https://threejs.org/docs/#api/en/lights/PointLight) shines to
infinity. If the `distance` is greater than 0 then the light shines
its full intensity at the light and fades to no influence at `distance`
units away from the light.

Let's setup the GUI so we can adjust the distance.

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 250, 1);
gui.add(light, 'distance', 0, 40).onChange(updateLight);

makeXYZGUI(gui, light.position, 'position', updateLight);
makeXYZGUI(gui, light.target.position, 'target', updateLight);
```

And now try it out.

JSHTMLCSSExportResultRun

[three.js](https://threejs.org/) [![](https://threejs.org/files/icon.svg)](https://threejs.org/)

1

import\* as THREEfrom'three';

1

<canvasid="c"></canvas>

1

html,body{

[three.js](https://threejs.org/) [![](https://threejs.org/files/icon.svg)](https://threejs.org/)

Export To:

jsGistCodepenJSFiddleCodeSandboxStack Overflow

Copy and paste the text below into a [stack overflow question](https://threejs.org/manual/examples/resources/editor.html?url=/manual/examples/lights-point.html).

```

```

[click here to open in a separate window](https://threejs.org/manual/examples/lights-point.html)

Notice when `distance` is > 0 how the light fades out.

## [`SpotLight`](https://threejs.org/docs/\#api/en/lights/SpotLight)

Spotlights are effectively a point light with a cone
attached where the light only shines inside the cone.
There's actually 2 cones. An outer cone and an inner
cone. Between the inner cone and the outer cone the
light fades from full intensity to zero.

To use a [`SpotLight`](https://threejs.org/docs/#api/en/lights/SpotLight) we need a target just like
the directional light. The light's cone will
open toward the target.

Modifying our [`DirectionalLight`](https://threejs.org/docs/#api/en/lights/DirectionalLight) with helper from above

```js
const color = 0xFFFFFF;
const intensity = 1;
const intensity = 150;
const light = new THREE.DirectionalLight(color, intensity);
const light = new THREE.SpotLight(color, intensity);
scene.add(light);
scene.add(light.target);

const helper = new THREE.DirectionalLightHelper(light);
const helper = new THREE.SpotLightHelper(light);
scene.add(helper);
```

The spotlight's cone's angle is set with the [`angle`](https://threejs.org/docs/#api/en/lights/SpotLight#angle)
property in radians. We'll use our `DegRadHelper` from the
[texture article](https://threejs.org/manual/en/textures.html) to present a UI in
degrees.

```js
gui.add(new DegRadHelper(light, 'angle'), 'value', 0, 90).name('angle').onChange(updateLight);
```

The inner cone is defined by setting the [`penumbra`](https://threejs.org/docs/#api/en/lights/SpotLight#penumbra) property
as a percentage from the outer cone. In other words when `penumbra` is 0 then the
inner cone is the same size (0 = no difference) from the outer cone. When the
`penumbra` is 1 then the light fades starting in the center of the cone to the
outer cone. When `penumbra` is .5 then the light fades starting from 50% between
the center of the outer cone.

```js
gui.add(light, 'penumbra', 0, 1, 0.01);
```

JSHTMLCSSExportResultRun

[three.js](https://threejs.org/) [![](https://threejs.org/files/icon.svg)](https://threejs.org/)

1

import\* as THREEfrom'three';

1

<canvasid="c"></canvas>

1

html,body{

[three.js](https://threejs.org/) [![](https://threejs.org/files/icon.svg)](https://threejs.org/)

Export To:

jsGistCodepenJSFiddleCodeSandboxStack Overflow

Copy and paste the text below into a [stack overflow question](https://threejs.org/manual/examples/resources/editor.html?url=/manual/examples/lights-spot-w-helper.html).

```

```

[click here to open in a separate window](https://threejs.org/manual/examples/lights-spot-w-helper.html)

Notice with the default `penumbra` of 0 the spotlight has a very sharp edge
whereas as you adjust the `penumbra` toward 1 the edge blurs.

It might be hard to see the _cone_ of the spotlight. The reason is it's
below the ground. Shorten the distance to around 5 and you'll see the open
end of the cone.

## [`RectAreaLight`](https://threejs.org/docs/\#api/en/lights/RectAreaLight)

There's one more type of light, the [`RectAreaLight`](https://threejs.org/docs/#api/en/lights/RectAreaLight), which represents
exactly what it sounds like, a rectangular area of light like a long
fluorescent light or maybe a frosted sky light in a ceiling.

The [`RectAreaLight`](https://threejs.org/docs/#api/en/lights/RectAreaLight) only works with the [`MeshStandardMaterial`](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial) and the
[`MeshPhysicalMaterial`](https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial) so let's change all our materials to [`MeshStandardMaterial`](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial)

```js
  ...

  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
  const planeMat = new THREE.MeshPhongMaterial({
  const planeMat = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.rotation.x = Math.PI * -.5;
  scene.add(mesh);
}
{
  const cubeSize = 4;
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
 const cubeMat = new THREE.MeshPhongMaterial({color: '#8AC'});
 const cubeMat = new THREE.MeshStandardMaterial({color: '#8AC'});
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
  scene.add(mesh);
}
{
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
  const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
 const sphereMat = new THREE.MeshStandardMaterial({color: '#CA8'});
  const mesh = new THREE.Mesh(sphereGeo, sphereMat);
  mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  scene.add(mesh);
}
```

To use the [`RectAreaLight`](https://threejs.org/docs/#api/en/lights/RectAreaLight) we need to include some extra three.js optional data and we'll
include the [`RectAreaLightHelper`](https://threejs.org/docs/#api/en/helpers/RectAreaLightHelper) to help us visualize the light

```js
import * as THREE from 'three';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {RectAreaLightHelper} from 'three/addons/helpers/RectAreaLightHelper.js';
```

and we need to call `RectAreaLightUniformsLib.init`

```js
function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
  RectAreaLightUniformsLib.init();
```

If you forget the data the light will still work but it will look funny so
be sure to remember to include the extra data.

Now we can create the light

```js
const color = 0xFFFFFF;
const intensity = 5;
const width = 12;
const height = 4;
const light = new THREE.RectAreaLight(color, intensity, width, height);
light.position.set(0, 10, 0);
light.rotation.x = THREE.MathUtils.degToRad(-90);
scene.add(light);

const helper = new RectAreaLightHelper(light);
light.add(helper);
```

One thing to notice is that unlike the [`DirectionalLight`](https://threejs.org/docs/#api/en/lights/DirectionalLight) and the [`SpotLight`](https://threejs.org/docs/#api/en/lights/SpotLight), the
[`RectAreaLight`](https://threejs.org/docs/#api/en/lights/RectAreaLight) does not use a target. It just uses its rotation. Another thing
to notice is the helper needs to be a child of the light. It is not a child of the
scene like other helpers.

Let's also adjust the GUI. We'll make it so we can rotate the light and adjust
its `width` and `height`

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 10, 0.01);
gui.add(light, 'width', 0, 20);
gui.add(light, 'height', 0, 20);
gui.add(new DegRadHelper(light.rotation, 'x'), 'value', -180, 180).name('x rotation');
gui.add(new DegRadHelper(light.rotation, 'y'), 'value', -180, 180).name('y rotation');
gui.add(new DegRadHelper(light.rotation, 'z'), 'value', -180, 180).name('z rotation');

makeXYZGUI(gui, light.position, 'position');
```

And here is that.

JSHTMLCSSExportResultRun

[three.js](https://threejs.org/) [![](https://threejs.org/files/icon.svg)](https://threejs.org/)

1

import\* as THREEfrom'three';

1

<canvasid="c"></canvas>

1

html,body{

[three.js](https://threejs.org/) [![](https://threejs.org/files/icon.svg)](https://threejs.org/)

Export To:

jsGistCodepenJSFiddleCodeSandboxStack Overflow

Copy and paste the text below into a [stack overflow question](https://threejs.org/manual/examples/resources/editor.html?url=/manual/examples/lights-rectarea.html).

```

```

[click here to open in a separate window](https://threejs.org/manual/examples/lights-rectarea.html)

It's important to note each light you add to the scene slows down how fast
three.js renders the scene so you should always try to use as few as
possible to achieve your goals.

Next up let's go over [dealing with cameras](https://threejs.org/manual/en/cameras.html).