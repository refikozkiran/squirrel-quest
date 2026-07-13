// LivingWorldManager.js
// Oyuncunun dünyaları ne kadar "canlandırdığını" takip eden, framework'ten bağımsız sistem.
// Tüm ilerleme localStorage'a yazılır. GitHub Pages gibi statik hosting'de backend gerekmez.

import { WORLDS, getStageThresholds, STAGE_COUNT } from '../data/worldsConfig.js';

const STORAGE_KEY = 'squirrelQuest.progress.v1';

export class LivingWorldManager {
  constructor() {
    this.progress = this._load();
  }

  _defaultProgress() {
    const data = {};
    WORLDS.forEach(w => {
      data[w.id] = {
        completedLevels: [], // tamamlanan bölüm indexleri (0 tabanlı)
      };
    });
    return data;
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this._defaultProgress();
      const parsed = JSON.parse(raw);
      // Yeni dünya eklendiyse eksik anahtarları tamamla
      const base = this._defaultProgress();
      return { ...base, ...parsed };
    } catch (e) {
      console.warn('İlerleme okunamadı, varsayılana dönülüyor.', e);
      return this._defaultProgress();
    }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
    } catch (e) {
      console.warn('İlerleme kaydedilemedi.', e);
    }
  }

  getLevelsCompletedCount(worldId) {
    return this.progress[worldId]?.completedLevels.length || 0;
  }

  isLevelCompleted(worldId, levelIndex) {
    return !!this.progress[worldId]?.completedLevels.includes(levelIndex);
  }

  // Sıradaki oynanabilir bölüm indexi (0 tabanlı). Henüz hiç bitirilmemişse 0.
  getNextLevelIndex(worldId) {
    const count = this.getLevelsCompletedCount(worldId);
    const world = WORLDS.find(w => w.id === worldId);
    return Math.min(count, world.levelCount - 1);
  }

  isLevelUnlocked(worldId, levelIndex) {
    if (levelIndex === 0) return true;
    return this.isLevelCompleted(worldId, levelIndex - 1);
  }

  // İlk dünya her zaman açık; sonraki dünya, bir öncekinin en az stage 2'ye ulaşmasıyla açılır
  // (tamamen bitirmeyi beklemeden erken erişim; tasarım tercihine göre değiştirilebilir).
  isWorldUnlocked(worldId) {
    const world = WORLDS.find(w => w.id === worldId);
    if (world.order === 1) return true;
    const prevWorld = WORLDS.find(w => w.order === world.order - 1);
    if (!prevWorld) return true;
    return this.getStage(prevWorld.id) >= 2;
  }

  // 0..5 arası stage döner
  getStage(worldId) {
    const world = WORLDS.find(w => w.id === worldId);
    const thresholds = getStageThresholds(world.levelCount);
    const completed = this.getLevelsCompletedCount(worldId);
    let stage = 0;
    for (let s = STAGE_COUNT - 1; s >= 0; s--) {
      if (completed >= thresholds[s]) {
        stage = s;
        break;
      }
    }
    return stage;
  }

  getStageProgressWithinCurrent(worldId) {
    // Şu anki stage içinde ne kadar ilerlendiğini 0..1 arası döner (bar doldurmak için kullanışlı)
    const world = WORLDS.find(w => w.id === worldId);
    const thresholds = getStageThresholds(world.levelCount);
    const stage = this.getStage(worldId);
    const completed = this.getLevelsCompletedCount(worldId);
    if (stage >= STAGE_COUNT - 1) return 1;
    const cur = thresholds[stage];
    const next = thresholds[stage + 1];
    if (next === cur) return 1;
    return Phaser.Math.Clamp((completed - cur) / (next - cur), 0, 1);
  }

  // Bir bölümü tamamlar. Stage değiştiyse bunu bildirir, WorldMapScene bir "dünya canlanıyor" anı gösterebilir.
  completeLevel(worldId, levelIndex) {
    const before = this.getStage(worldId);
    if (!this.progress[worldId].completedLevels.includes(levelIndex)) {
      this.progress[worldId].completedLevels.push(levelIndex);
      this._save();
    }
    const after = this.getStage(worldId);
    return {
      stageChanged: after !== before,
      previousStage: before,
      newStage: after,
    };
  }

  resetAll() {
    this.progress = this._defaultProgress();
    this._save();
  }
}

// Tüm sahnelerin paylaştığı tek bir instance (basit singleton).
export const livingWorld = new LivingWorldManager();
