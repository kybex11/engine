interface Collision {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Camera {
  x: number;
  y: number;
  zoom: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: {
    x: number;
    y: number;
  };
  lifespan: number;
  age: number;
}

const defaultCamera: Camera = {
  x: 0,
  y: 0,
  zoom: 1,
};

let currentCamera: Camera = { ...defaultCamera };

const particles: Particle[] = [];
const collisions: Collision[] = [];

interface CanvasWithMap extends HTMLCanvasElement {
  map?: number[][];
}

interface Character {
  id: number;
  x: number;
  y: number;
  imagePath: string;
}

interface AnimatedCharacter extends Character {
  frames: HTMLImageElement[];
  currentFrame: number;
}

interface ImageMap<T = string> {
  [key: number]: T;
}

// Add this enum for different user actions

export function initializeEngine(
  tileSize: number,
  col: number,
  row: number,
  component: CanvasWithMap
) {
  const ctx = component.getContext("2d");

  component.width = col * tileSize;
  component.height = row * tileSize;

  if (ctx) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, component.width, component.height);
  }
}

export function generateMap(
  col: number,
  row: number,
  fromnumber: number,
  tonumber: number
): number[][] {
  const map: number[][] = [];

  for (let i = 0; i < col; i++) {
    const rowArray: number[] = [];

    for (let j = 0; j < row; j++) {
      const randomValue =
        Math.floor(Math.random() * (tonumber - fromnumber + 1)) + fromnumber;
      rowArray.push(randomValue);
    }

    map.push(rowArray);
  }

  return map;
}

export function placeGrid(
  tileSize: number,
  col: number,
  row: number,
  lineWidth: number,
  component: CanvasWithMap,
  imageMap: ImageMap,
  map: number[][]
) {
  const ctx = component.getContext("2d");

  if (ctx) {
    // map: number[][] to interface and refactor map
    ctx.strokeStyle = "white";
    //ctx.lineWidth = lineWidth;

    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[i].length; j++) {
        const x = j * tileSize;
        const y = i * tileSize;

        const value = map[i][j];
        const imagePath = imageMap[value] || "";

        const img = new Image();
        img.src = imagePath;

        img.onload = function () {
          ctx.drawImage(img, x, y, tileSize, tileSize);
          ctx.stroke();
        };

        img.onerror = function () {
          console.error("Error loading image:", img.src);
        };
      }
    }
  }
}

export function addCharacter(
  id: number,
  tileSize: number,
  x: number,
  y: number,
  imagePath: string,
  component: CanvasWithMap,
  characters: Character[]
) {
  const ctx = component.getContext("2d");

  if (ctx) {
    const character: Character = { id, x, y, imagePath };
    characters.push(character);

    const img = new Image();
    img.src = imagePath;

    img.onload = function () {
      ctx.drawImage(img, x * tileSize, y * tileSize, tileSize, tileSize);
    };

    img.onerror = function () {
      console.error("Error loading character image:", img.src);
    };
  }
}

export async function moveCharacter(
  id: number,
  tileSize: number,
  newX: number,
  newY: number,
  component: CanvasWithMap,
  imageMap: ImageMap,
  characters: Character[],
  map: number[][]
) {
  const ctx = component.getContext("2d");

  if (ctx) {
    const character = characters.find((char) => char.id === id);

    if (character) {
      // Clear the previous position by clearing the entire area
      ctx.clearRect(
        character.x * tileSize,
        character.y * tileSize,
        tileSize,
        tileSize
      );

      // Update character position
      character.x = newX;
      character.y = newY;

      // Draw the map again to refresh it
      placeGrid(tileSize, 10, 10, 1, component, imageMap, map);

      // Draw the character at the new position
      const img = await loadImage(character.imagePath);
      ctx.drawImage(img, newX * tileSize, newY * tileSize, tileSize, tileSize);
    }
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function setCameraPosition(
  player: Character,
  tileSize: number,
  component: CanvasWithMap
) {
  const centerX = (player.x + 0.5) * tileSize;
  const centerY = (player.y + 0.5) * tileSize;

  const cameraX = centerX - component.width / 2;
  const cameraY = centerY - component.height / 2;

  currentCamera.x = cameraX;
  currentCamera.y = cameraY;
}

export function zoomCamera(factor: number) {
  currentCamera.zoom *= factor;
}

export function resetCamera() {
  currentCamera = { ...defaultCamera };
}

function applyCameraTransform(ctx: CanvasRenderingContext2D) {
  ctx.setTransform(
    currentCamera.zoom,
    0,
    0,
    currentCamera.zoom,
    -currentCamera.x,
    -currentCamera.y
  );
}


export function renderScene(
  tileSize: number,
  col: number,
  row: number,
  component: CanvasWithMap,
  imageMap: ImageMap,
  map: number[][],
  characters: Character[]
  ) {
  const ctx = component.getContext("2d");

  if (ctx) {
    // Save the current transformation state
    ctx.save();

    // Apply the camera transformation
    applyCameraTransform(ctx);

    // Draw the characters
    for (const character of characters) {
      const img = new Image();
      img.src = character.imagePath;

      img.onload = function () {
        ctx.drawImage(
          img,
          character.x * tileSize,
          character.y * tileSize,
          tileSize,
          tileSize
          );
      };

      img.onerror = function () {
        console.error("Error loading character image:", img.src);
      };
    }

    // Draw the particles
    renderParticles(component);

    // Restore the transformation state
    ctx.restore();
  }
}


export async function addAnimatedCharacter(
  id: number,
  tileSize: number,
  x: number,
  y: number,
  spriteSheetPath: string,
  frameCount: number, // number of frames in the spritesheet
  component: CanvasWithMap,
  characters: AnimatedCharacter[]
) {
  const ctx = component.getContext("2d");

  if (ctx) {
    const character: AnimatedCharacter = {
      id,
      x,
      y,
      imagePath: spriteSheetPath,
      frames: [],
      currentFrame: 0,
    };

    characters.push(character);

    const spriteSheet = new Image();
    spriteSheet.src = spriteSheetPath;

    spriteSheet.onload = function () {
      const frameWidth = spriteSheet.width / frameCount;

      for (let i = 0; i < frameCount; i++) {
        const frame = document.createElement("canvas");
        frame.width = tileSize;
        frame.height = tileSize;

        const frameCtx = frame.getContext("2d");

        if (frameCtx) {
          frameCtx.drawImage(
            spriteSheet,
            i * frameWidth,
            0,
            frameWidth,
            spriteSheet.height,
            0,
            0,
            tileSize,
            tileSize
          );

          character.frames.push(new Image());
          character.frames[i].src = frame.toDataURL();
        }
      }

      renderCharacter(character, tileSize, ctx);
    };

    spriteSheet.onerror = function () {
      console.error("Error loading character spritesheet:", spriteSheet.src);
    };
  }
}

export function renderCharacter(
  character: AnimatedCharacter,
  tileSize: number,
  ctx: CanvasRenderingContext2D
) {
  const img = character.frames[character.currentFrame];

  img.onload = function () {
    ctx.drawImage(
      img,
      character.x * tileSize,
      character.y * tileSize,
      tileSize,
      tileSize
    );
  };

  img.onerror = function () {
    console.error("Error loading character frame:", img.src);
  };
}

export async function moveAnimatedCharacter(
  id: number,
  tileSize: number,
  newX: number,
  newY: number,
  component: CanvasWithMap,
  imageMap: ImageMap,
  characters: AnimatedCharacter[],
  map: number[][]
) {
  const ctx = component.getContext("2d");

  if (ctx) {
    const character = characters.find((char) => char.id === id);

    if (character) {
      const framesPerSecond = 6; // Adjust as needed
      const animationDuration = 1000 / framesPerSecond;

      const startX = character.x;
      const startY = character.y;

      const deltaX = newX - startX;
      const deltaY = newY - startY;

      const frameCount = framesPerSecond * (animationDuration / 1000);

      for (let frame = 0; frame < frameCount; frame++) {
        const progress = frame / frameCount;
        const currentX = startX + deltaX * progress;
        const currentY = startY + deltaY * progress;

        character.x = Math.round(currentX);
        character.y = Math.round(currentY);

        placeGrid(tileSize, 10, 10, 1, component, imageMap, map);
        renderCharacter(character, tileSize, ctx);

        await new Promise((resolve) =>
          setTimeout(resolve, animationDuration / frameCount)
        );
      }
    }
  }
}

export function summonParticles(
  x: number,
  y: number,
  count: number,
  maxSize: number,
  color: string
  ) {
  for (let i = 0; i < count; i++) {
    const particle: Particle = {
      x,
      y,
      size: Math.random() * maxSize,
      color,
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: Math.random() * -2,
      },
      lifespan: 100, // Adjust the lifespan as needed (in frames)
      age: 0,
    };

    particles.push(particle);
  }
}

// Modify the updateParticles function to handle particle lifespan and fading
export function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];

    // Update particle position based on velocity
    particle.x += particle.velocity.x;
    particle.y += particle.velocity.y;

    // Update particle age
    particle.age++;

    // Fade out the particle based on its age and lifespan
    const alpha = 1 - particle.age / particle.lifespan;
    particle.color = `rgba(255, 255, 255, ${alpha})`;

    // Remove particles that have reached the end of their lifespan
    if (particle.age >= particle.lifespan || particle.size <= 1) {
      particles.splice(i, 1);
    }
  }
}

// Modify the renderParticles function to draw particles with the updated color
export function renderParticles(component: HTMLCanvasElement) {
  const ctx = component.getContext("2d");
  for (const particle of particles) {
    if (ctx) {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
    }
  }
}


let animationId: any;
export function animateParticles(canvas: HTMLCanvasElement) {
  const ct = canvas.getContext("2d");
  if (ct) {
    updateParticles();
    renderParticles(canvas);

    if (particles.length > 0) {
      animationId = requestAnimationFrame(animateParticles.bind(null, canvas));
    }
  }
}

export function startAnimation(component: HTMLCanvasElement) {
  const ctx = component.getContext("2d");
  if (ctx) {
    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(animateParticles.bind(null, component));
  }
}
