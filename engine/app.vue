<template>
  <canvas ref="appCanvas"></canvas>
</template>

<script setup lang="ts">

import { ref, onMounted, onUnmounted, render } from 'vue';
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

let tempCharacterX: number;
let tempCharacterY: number;


interface Character {
  id: number;
  x: number;
  y: number;
  imagePath: string;
}
const col = 10;
const row = 10;

const appCanvas = ref<HTMLCanvasElement | null>(null);

const imageMap = {
  0: '/red.png',
  1: '/blue.png',
};

const characters: Character[] = [];
const map = generateMap(col, row, 0, 1);

const tileSize = 100;

onMounted(() => {
  if (appCanvas.value instanceof HTMLCanvasElement) {
    initializeEngine(tileSize, col,row, appCanvas.value);
    placeGrid(tileSize, col, row, 1, appCanvas.value, imageMap, map);

    addCharacter(1, tileSize, 2, 3, '/character.png', appCanvas.value, characters); // static character

    // Listen for keydown event
    window.addEventListener('keydown', handleKeyDown);
  }
});

onUnmounted(() => {
  // Cleanup: remove event listener when component is unmounted
  window.removeEventListener('keydown', handleKeyDown);
});

function handleKeyDown(event: KeyboardEvent) {
  const character = characters.find((char) => char.id === 1);
  if (appCanvas.value instanceof HTMLCanvasElement) {
    if (character) {
      switch (event.key) {
        case 'w':
          //tempCharacterY = character.y;
          //tempCharacterX = character.x;
          //moveCharacter(1, tileSize, character.x, character.y - 1, appCanvas.value, imageMap,characters, map);
          //setCameraPosition(character, tileSize, appCanvas.value); Adjust the camera position based on the player's position
          //zoomCamera(2); Zoom Camera Factor. If you press key camera zoom factor + 2
          //renderScene(tileSize, 10, 10, appCanvas.value, imageMap, map, characters); //render changes with camera
          //resetCamera() // reset camera position and factor
          moveAndSummonParticles(character.x, character.y - 1); // move and summon particles
          break
        case 'a':
          //tempCharacterY = character.y;
          //tempCharacterX = character.x;
          //moveCharacter(1, tileSize, character.x - 1, character.y, appCanvas.value, imageMap,characters, map);
          //setCameraPosition(character, tileSize, appCanvas.value); Adjust the camera position based on the player's position
          //zoomCamera(2); Zoom Camera Factor. If you press key camera zoom factor + 2
          //renderScene(tileSize, 10, 10, appCanvas.value, imageMap, map, characters); //render changes with camera
          //resetCamera() // reset camera position and factor
          moveAndSummonParticles(character.x - 1, character.y); // move and summon particles
          break;
        case 's':
          //tempCharacterY = character.y;
          //tempCharacterX = character.x;
          //moveCharacter(1, tileSize, character.x, character.y + 1, appCanvas.value, imageMap,characters, map);
          //setCameraPosition(character, tileSize, appCanvas.value); Adjust the camera position based on the player's position
          //zoomCamera(2); Zoom Camera Factor. If you press key camera zoom factor + 2
          //renderScene(tileSize, 10, 10, appCanvas.value, imageMap, map, characters); //render changes with camera
          //resetCamera() // reset camera position and factor
          moveAndSummonParticles(character.x, character.y + 1); // move and summon particles
          break;
        case 'd':
          //tempCharacterY = character.y;
          //tempCharacterX = character.x;
          //moveCharacter(1, tileSize, character.x + 1, character.y, appCanvas.value, imageMap,characters, map);
          //setCameraPosition(character, tileSize, appCanvas.value); Adjust the camera position based on the player's position
          //zoomCamera(2); Zoom Camera Factor. If you press key camera zoom factor + 2
          //renderScene(tileSize, 10, 10, appCanvas.value, imageMap, map, characters); //render changes with camera
          //resetCamera() // reset camera position and factor
          moveAndSummonParticles(character.x + 1, character.y); // move and summon particles
          break;
      }
    }
  }
}

function moveAndSummonParticles(newX: number, newY: number) {
  const character = characters.find((char) => char.id === 1);
  if (character && appCanvas.value instanceof HTMLCanvasElement) {
    tempCharacterY = character.y;
    tempCharacterX = character.x;

    // Move the character
    //moveCharacter(1, tileSize, newX, newY, appCanvas.value, imageMap, characters, map);
    moveCharacter(1, tileSize, newX, newY, appCanvas.value, imageMap, characters, map);

    // Summon particles at the new position
    //TODO: Create Particle renderer
    summonParticles(newX * tileSize, newY * tileSize, 20, 5, 'rgba(255, 255, 255, 0.7)');
    renderParticles(appCanvas.value);
    animateParticles(appCanvas.value);
  }
}

</script>

<style>
body {
  background-color: #242424;
}
</style>
