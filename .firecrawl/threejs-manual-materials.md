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

Materials

# Materials

This article is part of a series of articles about three.js. The
first article is [three.js fundamentals](https://threejs.org/manual/en/fundamentals.html). If
you haven't read that yet and you're new to three.js you might want to
consider starting there.

Three.js provides several types of materials.
They define how objects will appear in the scene.
Which materials you use really depends on what you're trying to
accomplish.

There are 2 ways to set most material properties. One at creation time which
we've seen before.

```js
const material = new THREE.MeshPhongMaterial({
  color: 0xFF0000,    // red (can also use a CSS color string here)
  flatShading: true,
});
```

The other is after creation

```js
const material = new THREE.MeshPhongMaterial();
material.color.setHSL(0, 1, .5);  // red
material.flatShading = true;
```

note that properties of type [`THREE.Color`](https://threejs.org/docs/#api/en/math/Color) have multiple ways to be set.

```js
material.color.set(0x00FFFF);    // same as CSS's #RRGGBB style
material.color.set(cssString);   // any CSS color, eg 'purple', '#F32',
                                 // 'rgb(255, 127, 64)',
                                 // 'hsl(180, 50%, 25%)'
material.color.set(someColor)    // some other THREE.Color
material.color.setHSL(h, s, l)   // where h, s, and l are 0 to 1
material.color.setRGB(r, g, b)   // where r, g, and b are 0 to 1
```

And at creation time you can pass either a hex number or a CSS string

```js
const m1 = new THREE.MeshBasicMaterial({color: 0xFF0000});         // red
const m2 = new THREE.MeshBasicMaterial({color: 'red'});            // red
const m3 = new THREE.MeshBasicMaterial({color: '#F00'});           // red
const m4 = new THREE.MeshBasicMaterial({color: 'rgb(255,0,0)'});   // red
const m5 = new THREE.MeshBasicMaterial({color: 'hsl(0,100%,50%)'}); // red
```

So let's go over three.js's set of materials.

The [`MeshBasicMaterial`](https://threejs.org/docs/#api/en/materials/MeshBasicMaterial) is not affected by lights.
The [`MeshLambertMaterial`](https://threejs.org/docs/#api/en/materials/MeshLambertMaterial) computes lighting only at the vertices vs the [`MeshPhongMaterial`](https://threejs.org/docs/#api/en/materials/MeshPhongMaterial) which computes lighting at every pixel. The [`MeshPhongMaterial`](https://threejs.org/docs/#api/en/materials/MeshPhongMaterial)
also supports specular highlights.

Basic

Lambert

Phong

low-poly models with same materials

The `shininess` setting of the [`MeshPhongMaterial`](https://threejs.org/docs/#api/en/materials/MeshPhongMaterial) determines the _shininess_ of the specular highlight. It defaults to 30.

shininess: 0

shininess: 30

shininess: 150

Note that setting the `emissive` property to a color on either a
[`MeshLambertMaterial`](https://threejs.org/docs/#api/en/materials/MeshLambertMaterial) or a [`MeshPhongMaterial`](https://threejs.org/docs/#api/en/materials/MeshPhongMaterial) and setting the `color` to black
(and `shininess` to 0 for phong) ends up looking just like the [`MeshBasicMaterial`](https://threejs.org/docs/#api/en/materials/MeshBasicMaterial).

Basic

color: 'purple'

Lambert

color: 'black'

emissive: 'purple'

Phong

color: 'black'

emissive: 'purple'

shininess: 0

Why have all 3 when [`MeshPhongMaterial`](https://threejs.org/docs/#api/en/materials/MeshPhongMaterial) can do the same things as [`MeshBasicMaterial`](https://threejs.org/docs/#api/en/materials/MeshBasicMaterial)
and [`MeshLambertMaterial`](https://threejs.org/docs/#api/en/materials/MeshLambertMaterial)? The reason is the more sophisticated material
takes more GPU power to draw. On a slower GPU like say a mobile phone
you might want to reduce the GPU power needed to draw your scene by
using one of the less complex materials. It also follows that if you
don't need the extra features then use the simplest material. If you don't
need the lighting and the specular highlight then use the [`MeshBasicMaterial`](https://threejs.org/docs/#api/en/materials/MeshBasicMaterial).

The [`MeshToonMaterial`](https://threejs.org/docs/#api/en/materials/MeshToonMaterial) is similar to the [`MeshPhongMaterial`](https://threejs.org/docs/#api/en/materials/MeshPhongMaterial)
with one big difference. Rather than shading smoothly it uses a gradient map
(an X by 1 texture) to decide how to shade. The default uses a gradient map
that is 70% brightness for the first 70% and 100% after but you can supply your
own gradient map. This ends up giving a 2 tone look that looks like a cartoon.

Next up there are 2 _physically based rendering_ materials. Physically Based
Rendering is often abbreviated PBR.

The materials above use simple math to make materials that look 3D but they
aren't what actually happens in real world. The 2 PBR materials use much more
complex math to come close to what actually happens in the real world.

The first one is [`MeshStandardMaterial`](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial). The biggest difference between
[`MeshPhongMaterial`](https://threejs.org/docs/#api/en/materials/MeshPhongMaterial) and [`MeshStandardMaterial`](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial) is it uses different parameters.
[`MeshPhongMaterial`](https://threejs.org/docs/#api/en/materials/MeshPhongMaterial) had a `shininess` setting. [`MeshStandardMaterial`](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial) has 2
settings `roughness` and `metalness`.

At a basic level [`roughness`](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial#roughness) is the opposite
of `shininess`. Something that has a high roughness, like a baseball doesn't
have hard reflections whereas something that's not rough, like a billiard ball,
is very shiny. Roughness goes from 0 to 1.

The other setting, [`metalness`](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial#metalness), says
how metal the material is. Metals behave differently than non-metals. 0
for non-metal and 1 for metal.

Here's a quick sample of [`MeshStandardMaterial`](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial) with `roughness` from 0 to 1
across and `metalness` from 0 to 1 down.

The [`MeshPhysicalMaterial`](https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial) is same as the [`MeshStandardMaterial`](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial) but it
adds a `clearcoat` parameter that goes from 0 to 1 for how much to
apply a clearcoat gloss layer and a `clearCoatRoughness` parameter
that specifies how rough the gloss layer is.

Here's the same grid of `roughness` by `metalness` as above but with
`clearcoat` and `clearCoatRoughness` settings.

The various standard materials progress from fastest to slowest
[`MeshBasicMaterial`](https://threejs.org/docs/#api/en/materials/MeshBasicMaterial) ➡ [`MeshLambertMaterial`](https://threejs.org/docs/#api/en/materials/MeshLambertMaterial) ➡ [`MeshPhongMaterial`](https://threejs.org/docs/#api/en/materials/MeshPhongMaterial) ➡
[`MeshStandardMaterial`](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial) ➡ [`MeshPhysicalMaterial`](https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial). The slower materials
can make more realistic looking scenes but you might need to design
your code to use the faster materials on low powered or mobile machines.

There are 3 materials that have special uses. [`ShadowMaterial`](https://threejs.org/docs/#api/en/materials/ShadowMaterial)
is used to get the data created from shadows. We haven't
covered shadows yet. When we do we'll use this material
to take a peek at what's happening behind the scenes.

The [`MeshDepthMaterial`](https://threejs.org/docs/#api/en/materials/MeshDepthMaterial) renders the depth of each pixel where
pixels at negative [`near`](https://threejs.org/docs/#api/en/cameras/PerspectiveCamera#near) of the camera are 0 and negative [`far`](https://threejs.org/docs/#api/en/cameras/PerspectiveCamera#far) are 1. Certain special effects can use this data which we'll
get into at another time.

The [`MeshNormalMaterial`](https://threejs.org/docs/#api/en/materials/MeshNormalMaterial) will show you the _normals_ of geometry.
_Normals_ are the direction a particular triangle or pixel faces.
[`MeshNormalMaterial`](https://threejs.org/docs/#api/en/materials/MeshNormalMaterial) draws the view space normals (the normals relative to the camera).
x is red,
y is green, and
z is blue so things facing
to the right will be pink,
to the left will be aqua,
up will be light green,
down will be purple,
and toward the screen will be lavender.

[`ShaderMaterial`](https://threejs.org/docs/#api/en/materials/ShaderMaterial) is for making custom materials using the three.js shader
system. [`RawShaderMaterial`](https://threejs.org/docs/#api/en/materials/RawShaderMaterial) is for making entirely custom shaders with
no help from three.js. Both of these topics are large and will be
covered later.

Most materials share a bunch of settings all defined by [`Material`](https://threejs.org/docs/#api/en/materials/Material).
[See the docs](https://threejs.org/docs/#api/en/materials/Material)
for all of them but let's go over two of the most commonly used
properties.

[`flatShading`](https://threejs.org/docs/#api/en/materials/Material#flatShading):
whether or not the object looks faceted or smooth. default = `false`.

flatShading: false

flatShading: true

[`side`](https://threejs.org/docs/#api/en/materials/Material#side): which sides of triangles to show. The default is `THREE.FrontSide`.
Other options are `THREE.BackSide` and `THREE.DoubleSide` (both sides).
Most 3D objects drawn in three are probably opaque solids so the back sides
(the sides facing inside the solid) do not need to be drawn. The most common
reason to set `side` is for planes or other non-solid objects where it is
common to see the back sides of triangles.

Here are 6 planes drawn with `THREE.FrontSide` and `THREE.DoubleSide`.

side: THREE.FrontSide

side: THREE.DoubleSide

There's really a lot to consider with materials and we actually still
have a bunch more to go. In particular we've mostly ignored textures
which open up a whole slew of options. Before we cover textures though
we need to take a break and cover
[setting up your development environment](https://threejs.org/manual/en/setup.html)

### material.needsUpdate

This topic rarely affects most three.js apps but just as an FYI...
Three.js applies material settings when a material is used where "used"
means "something is rendered that uses the material". Some material settings are
only applied once as changing them requires lots of work by three.js.
In those cases you need to set `material.needsUpdate = true` to tell
three.js to apply your material changes. The most common settings
that require you to set `needsUpdate` if you change the settings after
using the material are:

- `flatShading`
- adding or removing a texture


Changing a texture is ok, but if want to switch from using no texture
to using a texture or from using a texture to using no texture
then you need to set `needsUpdate = true`.


In the case of going from texture to no-texture it is often
just better to use a 1x1 pixel white texture.


As mentioned above most apps never run into these issues. Most apps
do not switch between flat shaded and non flat shaded. Most apps also
either use textures or a solid color for a given material, they rarely
switch from using one to using the other.