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

Post Processing

# Post Processing

_Post processing_ generally refers to applying some kind of effect or filter to
a 2D image. In the case of THREE.js we have a scene with a bunch of meshes in
it. We render that scene into a 2D image. Normally that image is rendered
directly into the canvas and displayed in the browser but instead we can [render\\
it to a render target](https://threejs.org/manual/en/rendertargets.html) and then apply some _post_
_processing_ effects to the result before drawing it to the canvas. It's called
post processing because it happens after (post) the main scene processing.

Examples of post processing are Instagram like filters,
Photoshop filters, etc...

THREE.js has some example classes to help setup a post processing pipeline. The
way it works is you create an `EffectComposer` and to it you add multiple `Pass`
objects. You then call `EffectComposer.render` and it renders your scene to a
[render target](https://threejs.org/manual/en/rendertargets.html) and then applies each `Pass`.

Each `Pass` can be some post processing effect like adding a vignette, blurring,
applying a bloom, applying film grain, adjusting the hue, saturation, contrast,
etc... and finally rendering the result to the canvas.

It's a little bit important to understand how `EffectComposer` functions. It
creates two [render targets](https://threejs.org/manual/en/rendertargets.html). Let's call them
**rtA** and **rtB**.

Then, you call `EffectComposer.addPass` to add each pass in the order you want
to apply them. The passes are then applied _something like_ this.

![](https://threejs.org/manual/resources/images/threejs-postprocessing.svg)

First the scene you passed into `RenderPass` is rendered to **rtA**, then
**rtA** is passed to the next pass, whatever it is. That pass uses **rtA** as
input to do whatever it does and writes the results to **rtB**. **rtB** is then
passed to the next pass which uses **rtB** as input and writes back to **rtA**.
This continues through all the passes.

Each `Pass` has 4 basic options

## `enabled`

Whether or not to use this pass

## `needsSwap`

Whether or not to swap `rtA` and `rtB` after finishing this pass

## `clear`

Whether or not to clear before rendering this pass

## `renderToScreen`

Whether or not to render to the canvas instead the current destination render
target. In most use cases you do not set this flag explicitly since the last pass in the pass chain is automatically rendered to screen.

Let's put together a basic example. We'll start with the example from [the\\
article on responsiveness](https://threejs.org/manual/en/responsive.html).

To that first we create an `EffectComposer`.

```js
const composer = new EffectComposer(renderer);
```

Then as the first pass we add a `RenderPass` that will render our scene with our
camera into the first render target.

```js
composer.addPass(new RenderPass(scene, camera));
```

Next we add a `BloomPass`. A `BloomPass` renders its input to a generally
smaller render target and blurs the result. It then adds that blurred result on
top of the original input. This makes the scene _bloom_

```js
const bloomPass = new BloomPass(
    1,    // strength
    25,   // kernel size
    4,    // sigma ?
    256,  // blur render target resolution
);
composer.addPass(bloomPass);
```

Next we had a `FilmPass` that draws noise and scanlines on top of its input.

```js
const filmPass = new FilmPass(
    0.5,   // intensity
    false,  // grayscale
);
composer.addPass(filmPass);
```

Finally we had a `OutputPass` which performs color space conversion to sRGB and optional tone mapping.
This pass is usually the last pass of the pass chain.

```js
const outputPass = new OutputPass();
composer.addPass(outputPass);
```

To use these classes we need to import a bunch of scripts.

```js
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {BloomPass} from 'three/addons/postprocessing/BloomPass.js';
import {FilmPass} from 'three/addons/postprocessing/FilmPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
```

For pretty much any post processing `EffectComposer.js`, `RenderPass.js` and `OutputPass.js`
are required.

The last things we need to do are to use `EffectComposer.render` instead of
[`WebGLRenderer.render`](https://threejs.org/docs/#api/en/renderers/WebGLRenderer.render) _and_ to tell the `EffectComposer` to match the size of
the canvas.

```js
function render(now) {
  time *= 0.001;
let then = 0;
function render(now) {
  now *= 0.001;  // convert to seconds
  const deltaTime = now - then;
  then = now;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    composer.setSize(canvas.width, canvas.height);
  }

  cubes.forEach((cube, ndx) => {
    const speed = 1 + ndx * .1;
    const rot = time * speed;
    const rot = now * speed;
    cube.rotation.x = rot;
    cube.rotation.y = rot;
  });

  renderer.render(scene, camera);
  composer.render(deltaTime);

  requestAnimationFrame(render);
}
```

`EffectComposer.render` takes a `deltaTime` which is the time in seconds since
the last frame was rendered. It passes this to the various effects in case any
of them are animated. In this case the `FilmPass` is animated.

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

Copy and paste the text below into a [stack overflow question](https://threejs.org/manual/examples/resources/editor.html?url=/manual/examples/postprocessing.html).

```

```

[click here to open in a separate window](https://threejs.org/manual/examples/postprocessing.html)

To change effect parameters at runtime usually requires setting uniform values.
Let's add a gui to adjust some of the parameters. Figuring out which values you
can easily adjust and how to adjust them requires digging through the code for
that effect.

Looking inside
[`BloomPass.js`](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/BloomPass.js)
I found this line:

```js
this.combineUniforms[ 'strength' ].value = strength;
```

So we can set the strength by setting

```js
bloomPass.combineUniforms.strength.value = someValue;
```

Similarly looking in
[`FilmPass.js`](https://github.com/mrdoob/three.js/blob/master/examples/jsm/postprocessing/FilmPass.js)
I found these lines:

```js
this.uniforms.intensity.value = intensity;
this.uniforms.grayscale.value = grayscale;
```

So which makes it pretty clear how to set them.

Let's make a quick GUI to set those values

```js
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';
```

and

```js
const gui = new GUI();
{
  const folder = gui.addFolder('BloomPass');
  folder.add(bloomPass.combineUniforms.strength, 'value', 0, 2).name('strength');
  folder.open();
}
{
  const folder = gui.addFolder('FilmPass');
  folder.add(filmPass.uniforms.grayscale, 'value').name('grayscale');
  folder.add(filmPass.uniforms.intensity, 'value', 0, 1).name('intensity');
  folder.open();
}
```

and now we can adjust those settings

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

Copy and paste the text below into a [stack overflow question](https://threejs.org/manual/examples/resources/editor.html?url=/manual/examples/postprocessing-gui.html).

```

```

[click here to open in a separate window](https://threejs.org/manual/examples/postprocessing-gui.html)

That was a small step to making our own effect.

Post processing effects use shaders. Shaders are written in a language called
[GLSL (Graphics Library Shading Language)](https://www.khronos.org/files/opengles_shading_language.pdf). Going
over the entire language is way too large a topic for these articles. A few
resources to get start from would be maybe [this article](https://webglfundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html)
and maybe [the Book of Shaders](https://thebookofshaders.com/).

I think an example to get you started would be helpful though so let's make a
simple GLSL post processing shader. We'll make one that lets us multiply the
image by a color.

For post processing THREE.js provides a useful helper called the `ShaderPass`.
It takes an object with info defining a vertex shader, a fragment shader, and
the default inputs. It will handling setting up which texture to read from to
get the previous pass's results and where to render to, either one of the
`EffectComposer`s render target or the canvas.

Here's a simple post processing shader that multiplies the previous pass's
result by a color.

```js
const colorShader = {
  uniforms: {
    tDiffuse: { value: null },
    color:    { value: new THREE.Color(0x88CCFF) },
  },
  vertexShader:
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
    }
  ,
  fragmentShader:
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform vec3 color;
    void main() {
      vec4 previousPassColor = texture2D(tDiffuse, vUv);
      gl_FragColor = vec4(
          previousPassColor.rgb * color,
          previousPassColor.a);
    }
  ,
};
```

Above `tDiffuse` is the name that `ShaderPass` uses to pass in the previous
pass's result texture so we pretty much always need that. We then declare
`color` as a THREE.js [`Color`](https://threejs.org/docs/#api/en/math/Color).

Next we need a vertex shader. For post processing the vertex shader shown here
is pretty much standard and rarely needs to be changed. Without going into too
many details (see articles linked above) the variables `uv`, `projectionMatrix`,
`modelViewMatrix` and `position` are all magically added by THREE.js.

Finally we create a fragment shader. In it we get a pixel color from the
previous pass with this line

```glsl
vec4 previousPassColor = texture2D(tDiffuse, vUv);
```

we multiply it by our color and set `gl_FragColor` to the result

```glsl
gl_FragColor = vec4(
    previousPassColor.rgb * color,
    previousPassColor.a);
```

Adding some simple GUI to set the 3 values of the color

```js
const gui = new GUI();
gui.add(colorPass.uniforms.color.value, 'r', 0, 4).name('red');
gui.add(colorPass.uniforms.color.value, 'g', 0, 4).name('green');
gui.add(colorPass.uniforms.color.value, 'b', 0, 4).name('blue');
```

Gives us a simple postprocessing effect that multiplies by a color.

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

Copy and paste the text below into a [stack overflow question](https://threejs.org/manual/examples/resources/editor.html?url=/manual/examples/postprocessing-custom.html).

```

```

[click here to open in a separate window](https://threejs.org/manual/examples/postprocessing-custom.html)

As mentioned about all the details of how to write GLSL and custom shaders is
too much for these articles. If you really want to know how WebGL itself works
then check out [these articles](https://webglfundamentals.org/). Another great
resources is just to
[read through the existing post processing shaders in the THREE.js repo](https://github.com/mrdoob/three.js/tree/master/examples/jsm/shaders). Some
are more complicated than others but if you start with the smaller ones you can
hopefully get an idea of how they work.

Most of the post processing effects in the THREE.js repo are unfortunately
undocumented so to use them you'll have to [read through the examples](https://github.com/mrdoob/three.js/tree/master/examples) or
[the code for the effects themselves](https://github.com/mrdoob/three.js/tree/master/examples/jsm/postprocessing).
Hopefully these simple example and the article on
[render targets](https://threejs.org/manual/en/rendertargets.html) provide enough context to get started.