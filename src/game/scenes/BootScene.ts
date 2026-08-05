import Phaser from "phaser";

/**
 * Generates every sprite procedurally so the game ships with zero binary assets.
 * Keeps the repo light and guarantees the neon palette stays in sync with the UI.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  private circle(key: string, radius: number, color: number, glow = true) {
    const size = radius * 2 + 8;
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    if (glow) {
      g.fillStyle(color, 0.18);
      g.fillCircle(size / 2, size / 2, radius + 4);
      g.fillStyle(color, 0.35);
      g.fillCircle(size / 2, size / 2, radius + 2);
    }
    g.fillStyle(color, 1);
    g.fillCircle(size / 2, size / 2, radius);
    g.lineStyle(2, 0xffffff, 0.85);
    g.strokeCircle(size / 2, size / 2, radius);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  private diamond(key: string, radius: number, color: number) {
    const size = radius * 2 + 8;
    const c = size / 2;
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(color, 0.25);
    g.fillCircle(c, c, radius + 4);
    g.fillStyle(color, 1);
    g.beginPath();
    g.moveTo(c, c - radius);
    g.lineTo(c + radius, c);
    g.lineTo(c, c + radius);
    g.lineTo(c - radius, c);
    g.closePath();
    g.fillPath();
    g.generateTexture(key, size, size);
    g.destroy();
  }

  private rect(key: string, w: number, h: number, color: number) {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(color, 0.3);
    g.fillRoundedRect(0, 0, w + 6, h + 6, 4);
    g.fillStyle(color, 1);
    g.fillRoundedRect(3, 3, w, h, 3);
    g.generateTexture(key, w + 6, h + 6);
    g.destroy();
  }

  override create() {
    // Player + companion
    this.circle("player", 14, 0x22d3ee);
    this.circle("drone", 8, 0x8b5cf6);

    // Enemies
    this.circle("e_small_drone", 12, 0x36e0ff);
    this.circle("e_fast_runner", 11, 0x7cff6b);
    this.circle("e_flying_eye", 14, 0xb46bff);
    this.circle("e_heavy_robot", 20, 0xff7a3d);
    this.circle("e_sniper_bot", 15, 0xffd166);
    this.circle("e_exploding_robot", 16, 0xff4d6d);
    this.circle("e_mini_boss", 30, 0xff2fb0);
    this.circle("e_boss", 44, 0xff2f6d);

    // Projectiles
    this.rect("bullet", 10, 4, 0x67e8f9);
    this.rect("bullet_enemy", 8, 4, 0xff5c8a);
    this.rect("laser", 34, 5, 0xa78bfa);
    this.rect("rocket", 14, 6, 0xffb347);
    this.rect("flame", 10, 8, 0xff8a3d);
    this.circle("spark", 4, 0xffffff, false);
    this.circle("blade", 12, 0x22d3ee);

    // Pickups
    this.diamond("xp", 7, 0x38bdf8);
    this.circle("coin", 6, 0xfacc15);
    this.circle("crystal", 10, 0xa78bfa);

    this.scene.start("Main");
  }
}
