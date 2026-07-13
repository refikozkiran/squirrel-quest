import { BootScene } from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { WorldMapScene } from './scenes/WorldMapScene.js';
import { GameScene } from './scenes/GameScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#0b0f0c',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 480,
    height: 854, // mobil öncelikli dikey oran (9:16'ya yakın)
  },
  render: {
    antialias: true,
    roundPixels: true,
  },
  scene: [BootScene, PreloadScene, MainMenuScene, WorldMapScene, GameScene],
};

new Phaser.Game(config);
