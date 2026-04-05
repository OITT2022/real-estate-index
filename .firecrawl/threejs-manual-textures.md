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

Textures

# Textures

This article is one in a series of articles about three.js.
The first article was [about three.js fundamentals](https://threejs.org/manual/en/fundamentals.html).
The [previous article](https://threejs.org/manual/en/setup.html) was about setting up for this article.
If you haven't read that yet you might want to start there.

Textures are a kind of large topic in Three.js and
I'm not 100% sure at what level to explain them but I will try.
There are many topics and many of them interrelate so it's hard to explain
them all at once. Here's quick table of contents for this article.

- [Hello Texture](https://threejs.org/manual/en/textures.html#hello)
- [6 textures, a different one on each face of a cube](https://threejs.org/manual/en/textures.html#six)
- [Loading textures](https://threejs.org/manual/en/textures.html#loading)

  - [The easy way](https://threejs.org/manual/en/textures.html#easy)
  - [Waiting for a texture to load](https://threejs.org/manual/en/textures.html#wait1)
  - [Waiting for multiple textures to load](https://threejs.org/manual/en/textures.html#waitmany)
  - [Loading textures from other origins](https://threejs.org/manual/en/textures.html#cors)

- [Memory usage](https://threejs.org/manual/en/textures.html#memory)
- [JPG vs PNG](https://threejs.org/manual/en/textures.html#format)
- [Filtering and mips](https://threejs.org/manual/en/textures.html#filtering-and-mips)
- [Repeating, offseting, rotating, wrapping](https://threejs.org/manual/en/textures.html#uvmanipulation)

## Hello Texture

Textures are _generally_ images that are most often created
in some 3rd party program like Photoshop or GIMP. For example let's
put this image on cube.

![](https://threejs.org/manual/examples/resources/images/wall.jpg)

We'll modify one of our first samples. All we need to do is create a [`TextureLoader`](https://threejs.org/docs/#api/en/loaders/TextureLoader). Call its
[`load`](https://threejs.org/docs/#api/en/loaders/TextureLoader#load) method with the URL of an
image and set the material's `map` property to the result instead of setting its `color`.

```js
const loader = new THREE.TextureLoader();
const texture = loader.load( 'resources/images/wall.jpg' );
texture.colorSpace = THREE.SRGBColorSpace;

const material = new THREE.MeshBasicMaterial({
  color: 0xFF8844,
  map: texture,
});
```

Note that we're using [`MeshBasicMaterial`](https://threejs.org/docs/#api/en/materials/MeshBasicMaterial) so no need for any lights.

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

Copy and paste the text below into a [stack overflow question](https://threejs.org/manual/examples/resources/editor.html?url=/manual/examples/textured-cube.html).

```

```

[click here to open in a separate window](https://threejs.org/manual/examples/textured-cube.html)

## 6 Textures, a different one on each face of a cube

How about 6 textures, one on each face of a cube?

![](https://threejs.org/manual/examples/resources/images/flower-1.jpg)![](https://threejs.org/manual/examples/resources/images/flower-2.jpg)![](https://threejs.org/manual/examples/resources/images/flower-3.jpg)

![](https://threejs.org/manual/examples/resources/images/flower-4.jpg)![](https://threejs.org/manual/examples/resources/images/flower-5.jpg)![](https://threejs.org/manual/examples/resources/images/flower-6.jpg)

We just make 6 materials and pass them as an array when we create the [`Mesh`](https://threejs.org/docs/#api/en/objects/Mesh)

```js
const loader = new THREE.TextureLoader();
const texture = loader.load( 'resources/images/wall.jpg' );
texture.colorSpace = THREE.SRGBColorSpace;

const material = new THREE.MeshBasicMaterial({
  map: texture,
});
const materials = [\
  new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-1.jpg')}),\
  new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-2.jpg')}),\
  new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-3.jpg')}),\
  new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-4.jpg')}),\
  new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-5.jpg')}),\
  new THREE.MeshBasicMaterial({map: loadColorTexture('resources/images/flower-6.jpg')}),\
];
const cube = new THREE.Mesh(geometry, material);
const cube = new THREE.Mesh(geometry, materials);

function loadColorTexture( path ) {
  const texture = loader.load( path );
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
```

It works!

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

Copy and paste the text below into a [stack overflow question](https://threejs.org/manual/examples/resources/editor.html?url=/manual/examples/textured-cube-6-textures.html).

```

```

[click here to open in a separate window](https://threejs.org/manual/examples/textured-cube-6-textures.html)

It should be noted though that not all geometry types supports multiple
materials. [`BoxGeometry`](https://threejs.org/docs/#api/en/geometries/BoxGeometry) can use 6 materials one for each face.
[`ConeGeometry`](https://threejs.org/docs/#api/en/geometries/ConeGeometry) can use 2 materials, one for the bottom and one for the cone.
[`CylinderGeometry`](https://threejs.org/docs/#api/en/geometries/CylinderGeometry) can use 3 materials, bottom, top, and side.
For other cases you will need to build or load custom geometry and/or modify texture coordinates.

It's far more common in other 3D engines and far more performant to use a
[Texture Atlas](https://en.wikipedia.org/wiki/Texture_atlas)
if you want to allow multiple images on a single geometry. A Texture atlas
is where you put multiple images in a single texture and then use texture coordinates
on the vertices of your geometry to select which parts of a texture are used on
each triangle in your geometry.

What are texture coordinates? They are data added to each vertex of a piece of geometry
that specify what part of the texture corresponds to that specific vertex.
We'll go over them when we start [building custom geometry](https://threejs.org/manual/en/custom-buffergeometry.html).

## Loading Textures

### The Easy Way

Most of the code on this site uses the easiest method of loading textures.
We create a [`TextureLoader`](https://threejs.org/docs/#api/en/loaders/TextureLoader) and then call its [`load`](https://threejs.org/docs/#api/en/loaders/TextureLoader#load) method.
This returns a [`Texture`](https://threejs.org/docs/#api/en/textures/Texture) object.

```js
const texture = loader.load('resources/images/flower-1.jpg');
```

It's important to note that using this method our texture will be transparent until
the image is loaded asynchronously by three.js at which point it will update the texture
with the downloaded image.

This has the big advantage that we don't have to wait for the texture to load and our
page will start rendering immediately. That's probably okay for a great many use cases
but if we want we can ask three.js to tell us when the texture has finished downloading.

### Waiting for a texture to load

To wait for a texture to load the `load` method of the texture loader takes a callback
that will be called when the texture has finished loading. Going back to our top example
we can wait for the texture to load before creating our [`Mesh`](https://threejs.org/docs/#api/en/objects/Mesh) and adding it to scene
like this

```js
const loader = new THREE.TextureLoader();
loader.load('resources/images/wall.jpg', (texture) => {
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  cubes.push(cube);  // add to our list of cubes to rotate
});
```

Unless you clear your browser's cache and have a slow connection you're unlikely
to see the any difference but rest assured it is waiting for the texture to load.

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

Copy and paste the text below into a [stack overflow question](https://threejs.org/manual/examples/resources/editor.html?url=/manual/examples/textured-cube-wait-for-texture.html).

```

```

[click here to open in a separate window](https://threejs.org/manual/examples/textured-cube-wait-for-texture.html)

### Waiting for multiple textures to load

To wait until all textures have loaded you can use a [`LoadingManager`](https://threejs.org/docs/#api/en/loaders/managers/LoadingManager). Create one
and pass it to the [`TextureLoader`](https://threejs.org/docs/#api/en/loaders/TextureLoader) then set its [`onLoad`](https://threejs.org/docs/#api/en/loaders/managers/LoadingManager#onLoad)
property to a callback.

```js
const loadManager = new THREE.LoadingManager();
const loader = new THREE.TextureLoader(loadManager);

const materials = [\
  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-1.jpg')}),\
  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-2.jpg')}),\
  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-3.jpg')}),\
  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-4.jpg')}),\
  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-5.jpg')}),\
  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-6.jpg')}),\
];

loadManager.onLoad = () => {
  const cube = new THREE.Mesh(geometry, materials);
  scene.add(cube);
  cubes.push(cube);  // add to our list of cubes to rotate
};
```

The [`LoadingManager`](https://threejs.org/docs/#api/en/loaders/managers/LoadingManager) also has an [`onProgress`](https://threejs.org/docs/#api/en/loaders/managers/LoadingManager#onProgress) property
we can set to another callback to show a progress indicator.

First we'll add a progress bar in HTML

```html
<body>
  <canvas id="c"></canvas>
  <div id="loading">
    <div class="progress"><div class="progressbar"></div></div>
  </div>
</body>
```

and the CSS for it

```css
#loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
#loading .progress {
    margin: 1.5em;
    border: 1px solid white;
    width: 50vw;
}
#loading .progressbar {
    margin: 2px;
    background: white;
    height: 1em;
    transform-origin: top left;
    transform: scaleX(0);
}
```

Then in the code we'll update the scale of the `progressbar` in our `onProgress` callback. It gets
called with the URL of the last item loaded, the number of items loaded so far, and the total
number of items loaded.

```js
const loadingElem = document.querySelector('#loading');
const progressBarElem = loadingElem.querySelector('.progressbar');

loadManager.onLoad = () => {
  loadingElem.style.display = 'none';
  const cube = new THREE.Mesh(geometry, materials);
  scene.add(cube);
  cubes.push(cube);  // add to our list of cubes to rotate
};

loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
  const progress = itemsLoaded / itemsTotal;
  progressBarElem.style.transform = scaleX(${progress});
};
```

Unless you clear your cache and have a slow connection you might not see
the loading bar.

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

Copy and paste the text below into a [stack overflow question](https://threejs.org/manual/examples/resources/editor.html?url=/manual/examples/textured-cube-wait-for-all-textures.html).

```

```

[click here to open in a separate window](https://threejs.org/manual/examples/textured-cube-wait-for-all-textures.html)

## Loading textures from other origins

To use images from other servers those servers need to send the correct headers.
If they don't you cannot use the images in three.js and will get an error.
If you run the server providing the images make sure it
[sends the correct headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).
If you don't control the server hosting the images and it does not send the
permission headers then you can't use the images from that server.

For example [imgur](https://imgur.com/), [flickr](https://flickr.com/), and
[github](https://github.com/) all send headers allowing you to use images
hosted on their servers in three.js. Most other websites do not.

## Memory Usage

Textures are often the part of a three.js app that use the most memory. It's important to understand
that _in general_, textures take `width * height * 4 * 1.33` bytes of memory.

Notice that says nothing about compression. I can make a .jpg image and set its compression super
high. For example let's say I was making a scene of a house. Inside the house there is a table
and I decide to put this wood texture on the top surface of the table

![](https://threejs.org/manual/resources/images/compressed-but-large-wood-texture.jpg)

That image is only 157k so it will download relatively quickly but [it is actually\\
3024 x 3761 pixels in size](https://threejs.org/manual/en/resources/images/compressed-but-large-wood-texture.jpg).
Following the equation above that's

```
3024 * 3761 * 4 * 1.33 = 60505764.5
```

That image will take **60 MEG OF MEMORY!** in three.js.
A few textures like that and you'll be out of memory.

I bring this up because it's important to know that using textures has a hidden cost.
In order for three.js to use the texture it has to hand it off to the GPU and the
GPU _in general_ requires the texture data to be uncompressed.

The moral of the story is make your textures small in dimensions not just small
in file size. Small in file size = fast to download. Small in dimensions = takes
less memory. How small should you make them?
As small as you can and still look as good as you need them to look.

## JPG vs PNG

This is pretty much the same as regular HTML in that JPGs have lossy compression,
PNGs have lossless compression so PNGs are generally slower to download.
But, PNGs support transparency. PNGs are also probably the appropriate format
for non-image data like normal maps, and other kinds of non-image maps which we'll go over later.

It's important to remember that a JPG doesn't use
less memory than a PNG in WebGL. See above.

## Filtering and Mips

Let's apply this 16x16 texture

![](https://threejs.org/manual/resources/images/mip-low-res-enlarged.png)

To a cube

Let's draw that cube really small

Hmmm, I guess that's hard to see. Let's magnify that tiny cube

How does the GPU know which colors to make each pixel it's drawing for the tiny cube?
What if the cube was so small that it's just 1 or 2 pixels?

This is what filtering is about.

If it was Photoshop, Photoshop would average nearly all the pixels together to figure out what color
to make those 1 or 2 pixels. That would be a very slow operation. GPUs solve this issue
using mipmaps.

Mips are copies of the texture, each one half as wide and half as tall as the previous
mip where the pixels have been blended to make the next smaller mip. Mips are created
until we get all the way to a 1x1 pixel mip. For the image above all of the mips would
end up being something like this

![](https://threejs.org/manual/resources/images/mipmap-low-res-enlarged.png)

Now, when the cube is drawn so small that it's only 1 or 2 pixels large the GPU can choose
to use just the smallest or next to smallest mip level to decide what color to make the
tiny cube.

In three.js you can choose what happens both when the texture is drawn
larger than its original size and what happens when it's drawn smaller than its
original size.

For setting the filter when the texture is drawn larger than its original size
you set [`texture.magFilter`](https://threejs.org/docs/#api/en/textures/Texture#magFilter) property to either `THREE.NearestFilter` or
`THREE.LinearFilter`. `NearestFilter` means
just pick the closet single pixel from the original texture. With a low
resolution texture this gives you a very pixelated look like Minecraft.

`LinearFilter` means choose the 4 pixels from the texture that are closest
to the where we should be choosing a color from and blend them in the
appropriate proportions relative to how far away the actual point is from
each of the 4 pixels.

Nearest

Linear

For setting the filter when the texture is drawn smaller than its original size
you set the [`texture.minFilter`](https://threejs.org/docs/#api/en/textures/Texture#minFilter) property to one of 6 values.

- `THREE.NearestFilter`

same as above, choose the closest pixel in the texture

- `THREE.LinearFilter`

same as above, choose 4 pixels from the texture and blend them

- `THREE.NearestMipmapNearestFilter`

choose the appropriate mip then choose one pixel

- `THREE.NearestMipmapLinearFilter`

choose 2 mips, choose one pixel from each, blend the 2 pixels

- `THREE.LinearMipmapNearestFilter`

chose the appropriate mip then choose 4 pixels and blend them

- `THREE.LinearMipmapLinearFilter`

choose 2 mips, choose 4 pixels from each and blend all 8 into 1 pixel


Here's an example showing all 6 settings

click to

change

texture

nearest

linear

nearest

mipmap

nearest

nearest

mipmap

linear

linear

mipmap

nearest

linear

mipmap

linear

One thing to notice is the top left and top middle using `NearestFilter` and `LinearFilter`
don't use the mips. Because of that they flicker in the distance because the GPU is
picking pixels from the original texture. On the left just one pixel is chosen and
in the middle 4 are chosen and blended but it's not enough come up with a good
representative color. The other 4 strips do better with the bottom right,
`LinearMipmapLinearFilter` being best.

If you click the picture above it will toggle between the texture we've been using above
and a texture where every mip level is a different color.

This makes it more clear
what is happening. You can see in the top left and top middle the first mip is used all the way
into the distance. The top right and bottom middle you can clearly see where a different mip
is used.

Switching back to the original texture you can see the bottom right is the smoothest,
highest quality. You might ask why not always use that mode. The most obvious reason
is sometimes you want things to be pixelated for a retro look or some other reason.
The next most common reason is that reading 8 pixels and blending them is slower
than reading 1 pixel and blending. While it's unlikely that a single texture is going
to be the difference between fast and slow as we progress further into these articles
we'll eventually have materials that use 4 or 5 textures all at once. 4 textures \* 8
pixels per texture is looking up 32 pixels for ever pixel rendered.
This can be especially important to consider on mobile devices.

## Repeating, offseting, rotating, wrapping a texture

Textures have settings for repeating, offseting, and rotating a texture.

By default textures in three.js do not repeat. To set whether or not a
texture repeats there are 2 properties, [`wrapS`](https://threejs.org/docs/#api/en/textures/Texture#wrapS) for horizontal wrapping
and [`wrapT`](https://threejs.org/docs/#api/en/textures/Texture#wrapT) for vertical wrapping.

They can be set to one of:

- `THREE.ClampToEdgeWrapping`

the last pixel on each edge is repeated forever

- `THREE.RepeatWrapping`

the texture is repeated

- `THREE.MirroredRepeatWrapping`

the texture is mirrored and repeated


For example to turn on wrapping in both directions:

```js
someTexture.wrapS = THREE.RepeatWrapping;
someTexture.wrapT = THREE.RepeatWrapping;
```

Repeating is set with the \[repeat\] repeat property.

```js
const timesToRepeatHorizontally = 4;
const timesToRepeatVertically = 2;
someTexture.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
```

Offseting the texture can be done by setting the `offset` property. Textures
are offset with units where 1 unit = 1 texture size. On other words 0 = no offset
and 1 = offset one full texture amount.

```js
const xOffset = .5;   // offset by half the texture
const yOffset = .25;  // offset by 1/4 the texture
someTexture.offset.set(xOffset, yOffset);
```

Rotating the texture can be set by setting the `rotation` property in radians
as well as the `center` property for choosing the center of rotation.
It defaults to 0,0 which rotates from the bottom left corner. Like offset
these units are in texture size so setting them to `.5, .5` would rotate
around the center of the texture.

```js
someTexture.center.set(.5, .5);
someTexture.rotation = THREE.MathUtils.degToRad(45);
```

Let's modify the top sample above to play with these values

First we'll keep a reference to the texture so we can manipulate it

```js
const texture = loader.load('resources/images/wall.jpg');
const material = new THREE.MeshBasicMaterial({
  map: loader.load('resources/images/wall.jpg');
  map: texture,
});
```

Then we'll use [lil-gui](https://github.com/georgealways/lil-gui) again to provide a simple interface.

```js
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';
```

As we did in previous lil-gui examples we'll use a simple class to
give lil-gui an object that it can manipulate in degrees
but that will set a property in radians.

```js
class DegRadHelper {
  constructor(obj, prop) {
    this.obj = obj;
    this.prop = prop;
  }
  get value() {
    return THREE.MathUtils.radToDeg(this.obj[this.prop]);
  }
  set value(v) {
    this.obj[this.prop] = THREE.MathUtils.degToRad(v);
  }
}
```

We also need a class that will convert from a string like `"123"` into
a number like `123` since three.js requires numbers for enum settings
like `wrapS` and `wrapT` but lil-gui only uses strings for enums.

```js
class StringToNumberHelper {
  constructor(obj, prop) {
    this.obj = obj;
    this.prop = prop;
  }
  get value() {
    return this.obj[this.prop];
  }
  set value(v) {
    this.obj[this.prop] = parseFloat(v);
  }
}
```

Using those classes we can setup a simple GUI for the settings above

```js
const wrapModes = {
  'ClampToEdgeWrapping': THREE.ClampToEdgeWrapping,
  'RepeatWrapping': THREE.RepeatWrapping,
  'MirroredRepeatWrapping': THREE.MirroredRepeatWrapping,
};

function updateTexture() {
  texture.needsUpdate = true;
}

const gui = new GUI();
gui.add(new StringToNumberHelper(texture, 'wrapS'), 'value', wrapModes)
  .name('texture.wrapS')
  .onChange(updateTexture);
gui.add(new StringToNumberHelper(texture, 'wrapT'), 'value', wrapModes)
  .name('texture.wrapT')
  .onChange(updateTexture);
gui.add(texture.repeat, 'x', 0, 5, .01).name('texture.repeat.x');
gui.add(texture.repeat, 'y', 0, 5, .01).name('texture.repeat.y');
gui.add(texture.offset, 'x', -2, 2, .01).name('texture.offset.x');
gui.add(texture.offset, 'y', -2, 2, .01).name('texture.offset.y');
gui.add(texture.center, 'x', -.5, 1.5, .01).name('texture.center.x');
gui.add(texture.center, 'y', -.5, 1.5, .01).name('texture.center.y');
gui.add(new DegRadHelper(texture, 'rotation'), 'value', -360, 360)
  .name('texture.rotation');
```

The last thing to note about the example is that if you change `wrapS` or
`wrapT` on the texture you must also set [`texture.needsUpdate`](https://threejs.org/docs/#api/en/textures/Texture#needsUpdate)
so three.js knows to apply those settings. The other settings are automatically applied.

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

Copy and paste the text below into a [stack overflow question](https://threejs.org/manual/examples/resources/editor.html?url=/manual/examples/textured-cube-adjust.html).

```

```

[click here to open in a separate window](https://threejs.org/manual/examples/textured-cube-adjust.html)

This is only one step into the topic of textures. At some point we'll go over
texture coordinates as well as 9 other types of textures that can be applied
to materials.

For now let's move on to [lights](https://threejs.org/manual/en/lights.html).