<template>
  <canvas ref="appCanvas"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import {
  initializeEngine,
  placeGrid,
  addCharacter,
  moveCharacter,
  setCameraPosition,
  zoomCamera,
  renderScene,
  addAnimatedCharacter,
  generateMap,
  summonParticles,
  resetCamera,
  animateParticles,
  renderParticles
} from '~/engine';

interface Character {
  id: number;
  x: number;
  y: number;
  imagePath: string;
}

interface CanvasWithMap extends HTMLCanvasElement {
  map?: number[][];
}

const col = 10;
const row = 10;

let characters: Character[] = [];
let map: number[][] = [];

const appCanvas = ref<CanvasWithMap>(null!);

const imageMap = {
  0: '/red.png',
  1: '/blue.png',
};

const tileSize = 90;

onMounted(() => {
  map = generateMap(col, row, 0, 1);
  if (appCanvas.value) {
    initializeEngine(tileSize, col, row, appCanvas.value);
    placeGrid(tileSize, col, row, 1, appCanvas.value, imageMap, map);

    const character: Character = { id: 1, x: 0, y: 0, imagePath: '/character.png' };
    addCharacter(character.id, tileSize, character.x, character.y, character.imagePath, appCanvas.value, characters);
    window.addEventListener('keydown', handleKeyDown);
  }
});

onUnmounted(() => {
  // Clean up any resources or event listeners when the component is unmounted
  window.removeEventListener('keydown', handleKeyDown);
});

function handleKeyDown(event: KeyboardEvent) {
  const character = characters.find((char) => char.id === 1);

  if (appCanvas.value instanceof HTMLCanvasElement && character) {
    const { x, y } = character;
    const moveOffset = 1; // Adjust as needed

    switch (event.key) {
      case 'w':
        moveAndSummonParticles(x, y - moveOffset);
        break;
      case 'a':
        moveAndSummonParticles(x - moveOffset, y);
        break;
      case 's':
        moveAndSummonParticles(x, y + moveOffset);
        break;
      case 'd':
        moveAndSummonParticles(x + moveOffset, y);
        break;
    }
  }
}

function moveAndSummonParticles(newX: number, newY: number) {
  const character = characters.find((char) => char.id === 1);

  if (character && appCanvas.value instanceof HTMLCanvasElement) {
    // Store the current character position
    const tempCharacterX = character.x;
    const tempCharacterY = character.y;

    // Move the character
    moveCharacter(1, tileSize, newX, newY, appCanvas.value, imageMap, characters, map);

    // Set the camera position based on the player's new position
    // setCameraPosition(character, tileSize, appCanvas.value);

    // Zoom the camera (if needed)
    // zoomCamera(2); // Adjust the zoom factor as needed

    // Render the scene with the updated camera position
    renderScene(tileSize, col, row, appCanvas.value, imageMap, map, characters);

    // Reset the camera position and factor
    // resetCamera();

    // Move and summon particles at the new position
    summonParticles(newX * tileSize, newY * tileSize, 20, 5, 'rgba(255, 255, 255, 0.7)');

    // Render particles
    renderParticles(appCanvas.value);

    // Animate particles
    animateParticles(appCanvas.value);
  }
}
</script>

<style>
body {
  background-color: #242424;
}
</style>
