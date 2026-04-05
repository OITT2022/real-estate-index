/**
 * Craft Facade Pipeline
 *
 * Takes project facade images + building geometry and computes optimal
 * texture mappings with UV alignment to the apartment grid.
 *
 * Pipeline: Load → Preprocess → Match → UV Compute → Validate
 */

type FaceName = "front" | "left" | "right" | "back";

export interface FacadeImageInput {
  face: FaceName;
  url: string;
}

export interface FacadeUV {
  offsetX: number;
  offsetY: number;
  repeatX: number;
  repeatY: number;
  rotation: number;
}

export interface CraftedFacade {
  face: FaceName;
  url: string;
  confidence: number;
  uv: FacadeUV;
  imageWidth: number;
  imageHeight: number;
  warnings: string[];
}

export interface BuildingGeometry {
  width: number;
  height: number;
  depth: number;
  floorCount: number;
  floorHeight: number;
  apartmentsPerFloor: number;
}

export interface CraftResult {
  facades: CraftedFacade[];
  overallConfidence: number;
  log: string[];
}

// --- Step 1: Image Loading ---

interface LoadedImage {
  face: FaceName;
  url: string;
  img: HTMLImageElement;
  width: number;
  height: number;
  aspectRatio: number;
}

async function loadImage(input: FacadeImageInput): Promise<LoadedImage | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      resolve({
        face: input.face,
        url: input.url,
        img,
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight,
      });
    };
    img.onerror = () => resolve(null);
    img.src = input.url;
  });
}

// --- Step 2: Image Preprocessing ---

interface PreprocessResult {
  loaded: LoadedImage;
  brightness: number;       // 0-255 average
  contrast: number;         // 0-1 normalized std deviation
  dominantVertical: boolean; // more vertical than horizontal edges
  cropSuggestion: { top: number; bottom: number; left: number; right: number } | null;
}

function preprocessImage(loaded: LoadedImage): PreprocessResult {
  const canvas = document.createElement("canvas");
  const sampleSize = 128; // downsample for analysis
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(loaded.img, 0, 0, sampleSize, sampleSize);
  const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
  const pixels = imageData.data;

  // Brightness: average luminance
  let totalLum = 0;
  const lums: number[] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    const lum = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
    totalLum += lum;
    lums.push(lum);
  }
  const brightness = totalLum / lums.length;

  // Contrast: normalized standard deviation
  const mean = brightness;
  const variance = lums.reduce((s, l) => s + (l - mean) ** 2, 0) / lums.length;
  const contrast = Math.min(1, Math.sqrt(variance) / 128);

  // Edge detection: simple Sobel-like horizontal vs vertical
  let hEdges = 0;
  let vEdges = 0;
  for (let y = 1; y < sampleSize - 1; y++) {
    for (let x = 1; x < sampleSize - 1; x++) {
      const idx = (y * sampleSize + x) * 4;
      const l = lums[y * sampleSize + x];
      const lRight = lums[y * sampleSize + x + 1];
      const lDown = lums[(y + 1) * sampleSize + x];
      hEdges += Math.abs(l - lRight);
      vEdges += Math.abs(l - lDown);
    }
  }
  const dominantVertical = vEdges > hEdges;

  // Margin crop detection: check if edges are very uniform (potential empty margins)
  let cropSuggestion: PreprocessResult["cropSuggestion"] = null;
  const edgeThreshold = 8;
  const cornerLum = lums[0];
  let topMargin = 0;
  let bottomMargin = 0;

  // Check top rows
  for (let y = 0; y < sampleSize / 4; y++) {
    const rowAvg = lums.slice(y * sampleSize, (y + 1) * sampleSize).reduce((a, b) => a + b, 0) / sampleSize;
    if (Math.abs(rowAvg - cornerLum) < edgeThreshold) topMargin++;
    else break;
  }
  // Check bottom rows
  for (let y = sampleSize - 1; y > sampleSize * 3 / 4; y--) {
    const rowAvg = lums.slice(y * sampleSize, (y + 1) * sampleSize).reduce((a, b) => a + b, 0) / sampleSize;
    if (Math.abs(rowAvg - cornerLum) < edgeThreshold) bottomMargin++;
    else break;
  }

  if (topMargin > 3 || bottomMargin > 3) {
    cropSuggestion = {
      top: topMargin / sampleSize,
      bottom: bottomMargin / sampleSize,
      left: 0,
      right: 0,
    };
  }

  return { loaded, brightness, contrast, dominantVertical, cropSuggestion };
}

// --- Step 3: Facade Matching ---

interface MatchResult {
  face: FaceName;
  url: string;
  loaded: LoadedImage;
  preprocessed: PreprocessResult;
  matchConfidence: number;
}

function matchFacades(
  preprocessed: PreprocessResult[],
  geometry: BuildingGeometry
): MatchResult[] {
  // Images are already assigned to faces from the DB/transform layer.
  // Here we validate the assignment quality and compute confidence.
  return preprocessed.map((pp) => {
    let confidence = 0.7; // base confidence

    const isSideFace = pp.loaded.face === "left" || pp.loaded.face === "right";
    const faceWidth = isSideFace ? geometry.depth : geometry.width;
    const faceAspect = faceWidth / geometry.height;
    const imageAspect = pp.loaded.aspectRatio;

    // Aspect ratio similarity boosts confidence
    const aspectDiff = Math.abs(faceAspect - imageAspect) / Math.max(faceAspect, imageAspect);
    if (aspectDiff < 0.15) confidence += 0.15;
    else if (aspectDiff < 0.3) confidence += 0.08;
    else confidence -= 0.1;

    // Good contrast means usable image
    if (pp.contrast > 0.3) confidence += 0.05;
    if (pp.contrast < 0.1) confidence -= 0.1;

    // Dominant vertical lines suggest a building photo
    if (pp.dominantVertical) confidence += 0.05;

    // Filename hints (already handled by transform, but double check)
    const filename = pp.loaded.url.toLowerCase();
    if (filename.includes(pp.loaded.face)) confidence += 0.05;

    // Reasonable brightness (not blown out or too dark)
    if (pp.brightness > 40 && pp.brightness < 220) confidence += 0.05;

    confidence = Math.max(0.1, Math.min(1.0, confidence));

    return {
      face: pp.loaded.face,
      url: pp.loaded.url,
      loaded: pp.loaded,
      preprocessed: pp,
      matchConfidence: confidence,
    };
  });
}

// --- Step 4: UV Mapping Calculation ---

function computeUV(
  match: MatchResult,
  geometry: BuildingGeometry
): { uv: FacadeUV; warnings: string[] } {
  const warnings: string[] = [];
  const isSide = match.face === "left" || match.face === "right";
  const faceWidth = isSide ? geometry.depth : geometry.width;
  const faceHeight = geometry.height;
  const faceAspect = faceWidth / faceHeight;
  const imgAspect = match.loaded.aspectRatio;

  // "Cover" strategy: scale image to fully cover the face, allow cropping
  let repeatX: number;
  let repeatY: number;
  let offsetX = 0;
  let offsetY = 0;

  if (imgAspect > faceAspect) {
    // Image is wider than face → fit height, crop sides
    repeatY = 1;
    repeatX = faceAspect / imgAspect;
    offsetX = (1 - repeatX) / 2; // center horizontally
  } else {
    // Image is taller than face → fit width, crop top/bottom
    repeatX = 1;
    repeatY = imgAspect / faceAspect;
    offsetY = (1 - repeatY) * 0.3; // bias toward bottom (ground level visible)
  }

  // Apply crop suggestion from preprocessing
  const crop = match.preprocessed.cropSuggestion;
  if (crop) {
    if (crop.top > 0.02) {
      offsetY += crop.top * repeatY;
      repeatY *= (1 - crop.top);
      warnings.push(`Auto-cropped ${Math.round(crop.top * 100)}% top margin`);
    }
    if (crop.bottom > 0.02) {
      repeatY *= (1 - crop.bottom);
      warnings.push(`Auto-cropped ${Math.round(crop.bottom * 100)}% bottom margin`);
    }
  }

  // Floor alignment: try to make repeatY align with floor count
  // The image's building should roughly match our floor count
  const targetFloorRatio = 1 / geometry.floorCount;
  const currentFloorPixels = match.loaded.height * repeatY / geometry.floorCount;
  if (currentFloorPixels < 20) {
    warnings.push("Image resolution may be too low for floor alignment");
  }

  // Validation
  const stretchRatio = (repeatX * match.loaded.width / faceWidth) / (repeatY * match.loaded.height / faceHeight);
  if (stretchRatio > 1.5 || stretchRatio < 0.67) {
    warnings.push("Image may appear stretched");
    // Reduce stretch by compromising cover
    if (stretchRatio > 1.5) {
      repeatX *= 0.9;
      offsetX = (1 - repeatX) / 2;
    } else {
      repeatY *= 0.9;
      offsetY = (1 - repeatY) * 0.3;
    }
  }

  return {
    uv: {
      offsetX: Math.round(offsetX * 1000) / 1000,
      offsetY: Math.round(offsetY * 1000) / 1000,
      repeatX: Math.round(repeatX * 1000) / 1000,
      repeatY: Math.round(repeatY * 1000) / 1000,
      rotation: 0,
    },
    warnings,
  };
}

// --- Step 7: Visual Validation ---

function validateMapping(
  crafted: CraftedFacade,
  geometry: BuildingGeometry
): CraftedFacade {
  const issues: string[] = [];

  // Check stretch
  const isSide = crafted.face === "left" || crafted.face === "right";
  const faceW = isSide ? geometry.depth : geometry.width;
  const faceH = geometry.height;
  const texelDensityX = (crafted.uv.repeatX * crafted.imageWidth) / faceW;
  const texelDensityY = (crafted.uv.repeatY * crafted.imageHeight) / faceH;
  const densityRatio = texelDensityX / texelDensityY;

  if (densityRatio > 1.6 || densityRatio < 0.625) {
    issues.push("Excessive stretch detected");
    crafted.confidence *= 0.8;
  }

  // Check coverage
  if (crafted.uv.repeatX < 0.5 || crafted.uv.repeatY < 0.5) {
    issues.push("Low coverage — image may not fill facade");
    crafted.confidence *= 0.85;
  }

  // Check resolution
  const effectivePixelsPerMeter = Math.min(
    crafted.imageWidth * crafted.uv.repeatX / faceW,
    crafted.imageHeight * crafted.uv.repeatY / faceH
  );
  if (effectivePixelsPerMeter < 15) {
    issues.push("Low resolution for facade size");
    crafted.confidence *= 0.9;
  }

  crafted.warnings.push(...issues);
  crafted.confidence = Math.max(0.1, Math.min(1.0, crafted.confidence));
  return crafted;
}

// --- Main Pipeline ---

export async function craftFacades(
  images: FacadeImageInput[],
  geometry: BuildingGeometry
): Promise<CraftResult> {
  const log: string[] = [];
  log.push(`Starting Craft pipeline with ${images.length} image(s)`);
  log.push(`Building: ${geometry.width.toFixed(1)}m x ${geometry.height.toFixed(1)}m, ${geometry.floorCount} floors`);

  // Step 1: Load
  const loaded: LoadedImage[] = [];
  for (const input of images) {
    const result = await loadImage(input);
    if (result) {
      loaded.push(result);
      log.push(`Loaded ${input.face}: ${result.width}x${result.height} (AR ${result.aspectRatio.toFixed(2)})`);
    } else {
      log.push(`WARN: Failed to load ${input.face}: ${input.url}`);
    }
  }

  if (loaded.length === 0) {
    return { facades: [], overallConfidence: 0, log: [...log, "No images loaded"] };
  }

  // Step 2: Preprocess
  const preprocessed: PreprocessResult[] = loaded.map((l) => {
    const pp = preprocessImage(l);
    log.push(`Preprocessed ${l.face}: brightness=${pp.brightness.toFixed(0)}, contrast=${pp.contrast.toFixed(2)}, edges=${pp.dominantVertical ? "vertical" : "horizontal"}${pp.cropSuggestion ? ", has margins" : ""}`);
    return pp;
  });

  // Step 3: Match
  const matches = matchFacades(preprocessed, geometry);
  for (const m of matches) {
    log.push(`Matched ${m.face}: confidence=${m.matchConfidence.toFixed(2)}`);
  }

  // Steps 4-7: UV + Validate per facade
  const facades: CraftedFacade[] = matches.map((m) => {
    const { uv, warnings } = computeUV(m, geometry);
    log.push(`UV ${m.face}: oX=${uv.offsetX} oY=${uv.offsetY} rX=${uv.repeatX} rY=${uv.repeatY}`);

    let crafted: CraftedFacade = {
      face: m.face,
      url: m.url,
      confidence: m.matchConfidence,
      uv,
      imageWidth: m.loaded.width,
      imageHeight: m.loaded.height,
      warnings,
    };

    crafted = validateMapping(crafted, geometry);

    if (crafted.warnings.length > 0) {
      log.push(`Warnings ${m.face}: ${crafted.warnings.join("; ")}`);
    }
    return crafted;
  });

  const overallConfidence = facades.length > 0
    ? facades.reduce((s, f) => s + f.confidence, 0) / facades.length
    : 0;

  log.push(`Pipeline complete: ${facades.length} facade(s), overall confidence=${overallConfidence.toFixed(2)}`);

  return { facades, overallConfidence, log };
}
