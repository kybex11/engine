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

const col = 10;
const row = 10;

let characters: Character[] = [];
let map: number[][] = [];

const appCanvas = ref<HTMLCanvasElement | null>(null);

const imageMap = {
  0: '/red.png',

};

const tileSize = 90;

onMounted(() => {
  // Проверка на наличие сохраненных данных
  const savedCharacters = localStorage.getItem('characters');
  const savedMap = localStorage.getItem('map');

  if (savedCharacters) {
    characters = JSON.parse(savedCharacters);
  }

  if (savedMap) {
    map = JSON.parse(savedMap);
  } else {
    // Если данных в localStorage нет, генерируем новую карту
    map = generateMap(col, row, 0, 1);
    localStorage.setItem('map', JSON.stringify(map));
  }

  if (appCanvas.value) {
    initializeEngine(tileSize, col, row, appCanvas.value);
    placeGrid(tileSize, col, row, 1, appCanvas.value, imageMap, map);

    // Восстановление персонажей
    characters.forEach((character) => {
      addCharacter(character.id, tileSize, character.x, character.y, character.imagePath, appCanvas.value, characters);
    });

    // Listen for keydown event
    window.addEventListener('keydown', handleKeyDown);
  }
});

onUnmounted(() => {
  // Перед выходом со страницы сохраняем данные в localStorage
  localStorage.setItem('characters', JSON.stringify(characters));
  localStorage.setItem('map', JSON.stringify(map));
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
    //setCameraPosition(character, tileSize, appCanvas.value);

    // Zoom the camera (if needed)
    //zoomCamera(2); // Adjust the zoom factor as needed

    // Render the scene with the updated camera position
    renderScene(tileSize, col, row, appCanvas.value, imageMap, map, characters);

    // Reset the camera position and factor
    //resetCamera();

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
