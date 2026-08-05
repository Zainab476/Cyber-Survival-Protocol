import Phaser from "phaser";
import { ENEMIES, SPAWN_TABLE } from "../config/enemies";
import { WEAPONS } from "../config/weapons";
import { rollUpgrades, weaponCard } from "../config/upgrades";
import { useGameStore, registerUpgradeHandler } from "../state/gameStore";
import { useMetaStore, pendingWeaponUnlocks } from "../state/metaStore";
import { sfx, playMusic } from "../audio/audioEngine";
import type { EnemyKind, PlayerStats, UpgradeCard, WeaponId } from "../types";

interface Enemy {
  sprite: Phaser.GameObjects.Image;
  kind: EnemyKind;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  xp: number;
  coins: number;
  radius: number;
  nextShot: number;
  burnUntil: number;
  dashUntil: number;
  nextPattern: number;
  vx: number;
  vy: number;
}

interface Bullet {
  sprite: Phaser.GameObjects.Image;
  vx: number;
  vy: number;
  damage: number;
  pierce: number;
  crit: boolean;
  life: number;
  explosive?: boolean;
  chain?: number;
  hit: Set<Enemy>;
}

interface EnemyBullet {
  sprite: Phaser.GameObjects.Image;
  vx: number;
  vy: number;
  damage: number;
  life: number;
}

interface Pickup {
  sprite: Phaser.GameObjects.Image;
  kind: "xp" | "coin" | "crystal";
  value: number;
}

const DIFFICULTY_MULT = { recruit: 0.75, operative: 1, nightmare: 1.4 } as const;

/** Movement vector published by the on-screen touch joystick. */
export const touchInput = { x: 0, y: 0 };

/**
 * Core gameplay scene. Owns simulation only — all presentation of HUD/menus is
 * handled by React, synced through the zustand game store.
 */
export class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Image;
  private stats!: PlayerStats;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private bg!: Phaser.GameObjects.TileSprite;
  private grid!: Phaser.GameObjects.TileSprite;

  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private enemyBullets: EnemyBullet[] = [];
  private pickups: Pickup[] = [];
  private drones: Phaser.GameObjects.Image[] = [];
  private blades: Phaser.GameObjects.Image[] = [];

  private weapons: WeaponId[] = ["pulse_rifle"];
  private weaponTimers = new Map<WeaponId, number>();

  private elapsed = 0;
  private spawnAcc = 0;
  private level = 1;
  private xp = 0;
  private xpNeeded = 12;
  private coins = 0;
  private kills = 0;
  private bossKills = 0;
  private damageDealt = 0;
  private hudAcc = 0;
  private nextBossAt = 300; // 5 minutes
  private nextMiniBossAt = 120;
  private bossRef: Enemy | null = null;
  private paused = false;
  private ended = false;
  private bladeAngle = 0;

  constructor() {
    super("Main");
  }

  create() {
    const { difficulty } = useMetaStore.getState().settings;
    this.resetRun();

    // ---------- infinite scrolling cyber city ----------
    const w = this.scale.width;
    const h = this.scale.height;
    this.bg = this.add
      .tileSprite(0, 0, w, h, this.makeCityTexture())
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(-20);
    this.grid = this.add
      .tileSprite(0, 0, w, h, this.makeGridTexture())
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(-19)
      .setAlpha(0.5);

    // ---------- player ----------
    this.player = this.add.image(0, 0, "player").setDepth(10);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.cameras.main.setBackgroundColor(0x05060f);

    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = this.input.keyboard!.addKeys({
      w: K.W,
      a: K.A,
      s: K.S,
      d: K.D,
      up: K.UP,
      left: K.LEFT,
      down: K.DOWN,
      right: K.RIGHT,
      esc: K.ESC,
      p: K.P,
    }) as Record<string, Phaser.Input.Keyboard.Key>;

    this.input.keyboard!.on("keydown-ESC", () => this.togglePause());
    this.input.keyboard!.on("keydown-P", () => this.togglePause());

    this.stats.damage *= 1 / DIFFICULTY_MULT[difficulty];
    registerUpgradeHandler((card) => this.applyUpgrade(card));
    playMusic("battle");
    this.syncHud();
  }

  // ---------------------------------------------------------------- setup

  private resetRun() {
    this.stats = {
      health: 100,
      maxHealth: 100,
      armor: 0,
      moveSpeed: 220,
      attackSpeed: 1,
      damage: 1,
      critChance: 0.08,
      critDamage: 1.6,
      luck: 0,
      magnet: 90,
      regen: 0,
      projectiles: 0,
      pierce: 0,
      shield: 0,
      drones: 0,
    };
    this.enemies = [];
    this.bullets = [];
    this.enemyBullets = [];
    this.pickups = [];
    this.weapons = ["pulse_rifle"];
    this.weaponTimers.clear();
    this.elapsed = 0;
    this.level = 1;
    this.xp = 0;
    this.xpNeeded = 12;
    this.coins = 0;
    this.kills = 0;
    this.bossKills = 0;
    this.damageDealt = 0;
    this.nextBossAt = 300;
    this.nextMiniBossAt = 120;
    this.ended = false;
  }

  private makeCityTexture(): string {
    const key = "tex_city";
    if (this.textures.exists(key)) return key;
    const size = 512;
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0x070a18, 1);
    g.fillRect(0, 0, size, size);
    for (let i = 0; i < 26; i++) {
      const x = Phaser.Math.Between(0, size);
      const y = Phaser.Math.Between(0, size);
      const w = Phaser.Math.Between(30, 90);
      const h = Phaser.Math.Between(30, 110);
      g.fillStyle(0x0d1230, 1);
      g.fillRect(x, y, w, h);
      g.lineStyle(1, 0x1d2a6b, 0.9);
      g.strokeRect(x, y, w, h);
      for (let k = 0; k < 4; k++) {
        g.fillStyle(Phaser.Math.RND.pick([0x22d3ee, 0x8b5cf6, 0x3b82f6]), 0.5);
        g.fillRect(x + Phaser.Math.Between(3, w - 6), y + Phaser.Math.Between(3, h - 6), 3, 3);
      }
    }
    g.generateTexture(key, size, size);
    g.destroy();
    return key;
  }

  private makeGridTexture(): string {
    const key = "tex_grid";
    if (this.textures.exists(key)) return key;
    const size = 128;
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.lineStyle(1, 0x22d3ee, 0.16);
    g.strokeRect(0, 0, size, size);
    g.lineStyle(1, 0x8b5cf6, 0.08);
    g.lineBetween(size / 2, 0, size / 2, size);
    g.lineBetween(0, size / 2, size, size / 2);
    g.generateTexture(key, size, size);
    g.destroy();
    return key;
  }

  // ---------------------------------------------------------------- loop

  update(_time: number, deltaMs: number) {
    const store = useGameStore.getState();
    if (store.phase !== "playing") {
      this.paused = true;
      return;
    }
    this.paused = false;
    const dt = Math.min(deltaMs, 50) / 1000;
    this.elapsed += dt;

    this.updateBackground();
    this.movePlayer(dt);
    this.updateWeapons(dt);
    this.updateBullets(dt);
    this.updateEnemies(dt);
    this.updateEnemyBullets(dt);
    this.updatePickups(dt);
    this.updateSpawning(dt);
    this.updateCompanions(dt);

    if (this.stats.regen > 0) {
      this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + this.stats.regen * dt);
    }

    this.hudAcc += dt;
    if (this.hudAcc > 0.1) {
      this.hudAcc = 0;
      this.syncHud();
    }
  }

  private updateBackground() {
    const cam = this.cameras.main;
    this.bg.tilePositionX = cam.scrollX * 0.35;
    this.bg.tilePositionY = cam.scrollY * 0.35;
    this.grid.tilePositionX = cam.scrollX;
    this.grid.tilePositionY = cam.scrollY;
  }

  private movePlayer(dt: number) {
    let dx = 0;
    let dy = 0;
    const k = this.keys;
    if (k["a"]?.isDown || k["left"]?.isDown) dx -= 1;
    if (k["d"]?.isDown || k["right"]?.isDown) dx += 1;
    if (k["w"]?.isDown || k["up"]?.isDown) dy -= 1;
    if (k["s"]?.isDown || k["down"]?.isDown) dy += 1;
    dx += touchInput.x;
    dy += touchInput.y;

    const len = Math.hypot(dx, dy);
    if (len > 0) {
      dx /= len;
      dy /= len;
      this.player.x += dx * this.stats.moveSpeed * dt;
      this.player.y += dy * this.stats.moveSpeed * dt;
      this.player.rotation = Phaser.Math.Angle.RotateTo(
        this.player.rotation,
        Math.atan2(dy, dx),
        10 * dt,
      );
    }
  }

  // ---------------------------------------------------------------- combat

  private nearestEnemy(range: number, from = this.player): Enemy | null {
    let best: Enemy | null = null;
    let bestD = range * range;
    for (const e of this.enemies) {
      const d = Phaser.Math.Distance.Squared(from.x, from.y, e.sprite.x, e.sprite.y);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  private updateWeapons(dt: number) {
    for (const id of this.weapons) {
      const def = WEAPONS[id];
      const timer = (this.weaponTimers.get(id) ?? 0) - dt * 1000 * this.stats.attackSpeed;
      if (timer > 0) {
        this.weaponTimers.set(id, timer);
        continue;
      }
      this.weaponTimers.set(id, def.cooldown);
      this.fireWeapon(id);
    }

    // Orbiting energy blades
    if (this.weapons.includes("energy_blade")) {
      this.bladeAngle += dt * 3.2;
      const count = 2 + this.stats.projectiles;
      while (this.blades.length < count) {
        this.blades.push(this.add.image(0, 0, "blade").setDepth(9));
      }
      this.blades.forEach((b, i) => {
        const a = this.bladeAngle + (Math.PI * 2 * i) / this.blades.length;
        b.x = this.player.x + Math.cos(a) * 78;
        b.y = this.player.y + Math.sin(a) * 78;
        b.rotation = a;
        for (const e of this.enemies) {
          if (Phaser.Math.Distance.Between(b.x, b.y, e.sprite.x, e.sprite.y) < e.radius + 12) {
            this.damageEnemy(e, WEAPONS.energy_blade.damage * this.stats.damage * dt * 6, false);
          }
        }
      });
    }
  }

  private fireWeapon(id: WeaponId) {
    const def = WEAPONS[id];
    const target = this.nearestEnemy(def.range);
    if (!target && id !== "flamethrower") return;
    const angle = target
      ? Math.atan2(target.sprite.y - this.player.y, target.sprite.x - this.player.x)
      : this.player.rotation;

    switch (id) {
      case "pulse_rifle":
        this.spawnVolley(angle, 1 + this.stats.projectiles, 0.12, "bullet", def.damage, def.speed);
        sfx.shoot();
        break;
      case "laser_cannon": {
        const b = this.spawnBullet(angle, "laser", def.damage, def.speed);
        b.pierce += 6;
        sfx.laser();
        break;
      }
      case "plasma_shotgun":
        this.spawnVolley(angle, 5 + this.stats.projectiles, 0.16, "bullet", def.damage, def.speed);
        sfx.shoot();
        break;
      case "rocket_launcher": {
        const b = this.spawnBullet(angle, "rocket", def.damage, def.speed);
        b.explosive = true;
        sfx.shoot();
        break;
      }
      case "lightning_orb": {
        const b = this.spawnBullet(angle, "spark", def.damage, def.speed);
        b.chain = 3;
        sfx.laser();
        break;
      }
      case "flamethrower":
        for (let i = 0; i < 2; i++) {
          const b = this.spawnBullet(
            angle + Phaser.Math.FloatBetween(-0.28, 0.28),
            "flame",
            def.damage,
            def.speed,
          );
          b.life = 0.6;
        }
        break;
      case "mini_drone":
        // handled by companion drones
        break;
      default:
        break;
    }
  }

  private spawnVolley(
    angle: number,
    count: number,
    spread: number,
    tex: string,
    dmg: number,
    speed: number,
  ) {
    const start = -((count - 1) / 2) * spread;
    for (let i = 0; i < count; i++) {
      this.spawnBullet(angle + start + i * spread, tex, dmg, speed);
    }
  }

  private spawnBullet(
    angle: number,
    tex: string,
    baseDamage: number,
    speed: number,
    from = this.player,
  ): Bullet {
    const crit = Math.random() < this.stats.critChance;
    const damage = baseDamage * this.stats.damage * (crit ? this.stats.critDamage : 1);
    const sprite = this.add.image(from.x, from.y, tex).setDepth(8).setRotation(angle);
    if (crit) sprite.setScale(1.4).setTint(0xffe066);
    const bullet: Bullet = {
      sprite,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      damage,
      pierce: this.stats.pierce,
      crit,
      life: 1.6,
      hit: new Set(),
    };
    this.bullets.push(bullet);
    return bullet;
  }

  private updateBullets(dt: number) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i]!;
      b.sprite.x += b.vx * dt;
      b.sprite.y += b.vy * dt;
      b.life -= dt;

      let dead = b.life <= 0;
      if (!dead) {
        for (const e of this.enemies) {
          if (b.hit.has(e)) continue;
          if (
            Phaser.Math.Distance.Between(b.sprite.x, b.sprite.y, e.sprite.x, e.sprite.y) <
            e.radius + 6
          ) {
            b.hit.add(e);
            this.damageEnemy(e, b.damage, b.crit);
            if (b.explosive) this.explode(b.sprite.x, b.sprite.y, b.damage * 0.8, 110);
            if (b.chain && b.chain > 0) this.chainLightning(e, b.damage * 0.6, b.chain);
            if (b.pierce-- <= 0) {
              dead = true;
              break;
            }
          }
        }
      }
      if (dead) {
        b.sprite.destroy();
        this.bullets.splice(i, 1);
      }
    }
  }

  private chainLightning(from: Enemy, damage: number, jumps: number) {
    let source = from;
    const struck = new Set<Enemy>([from]);
    for (let j = 0; j < jumps; j++) {
      let next: Enemy | null = null;
      let bestD = 200 * 200;
      for (const e of this.enemies) {
        if (struck.has(e)) continue;
        const d = Phaser.Math.Distance.Squared(
          source.sprite.x,
          source.sprite.y,
          e.sprite.x,
          e.sprite.y,
        );
        if (d < bestD) {
          bestD = d;
          next = e;
        }
      }
      if (!next) break;
      const line = this.add
        .line(0, 0, source.sprite.x, source.sprite.y, next.sprite.x, next.sprite.y, 0xa78bfa)
        .setOrigin(0)
        .setLineWidth(2)
        .setDepth(9);
      this.tweens.add({ targets: line, alpha: 0, duration: 220, onComplete: () => line.destroy() });
      this.damageEnemy(next, damage, false);
      struck.add(next);
      source = next;
    }
  }

  private explode(x: number, y: number, damage: number, radius: number) {
    sfx.explode();
    const ring = this.add.circle(x, y, 8, 0xffb347, 0.55).setDepth(9);
    this.tweens.add({
      targets: ring,
      radius,
      scale: radius / 8,
      alpha: 0,
      duration: 320,
      onComplete: () => ring.destroy(),
    });
    this.burst(x, y, 0xffb347, 14);
    this.shake(0.006, 160);
    for (const e of this.enemies) {
      if (Phaser.Math.Distance.Between(x, y, e.sprite.x, e.sprite.y) < radius) {
        this.damageEnemy(e, damage, false);
      }
    }
  }

  private burst(x: number, y: number, color: number, count = 8) {
    for (let i = 0; i < count; i++) {
      const p = this.add.image(x, y, "spark").setTint(color).setDepth(9);
      const a = Math.random() * Math.PI * 2;
      const d = Phaser.Math.Between(20, 70);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(a) * d,
        y: y + Math.sin(a) * d,
        alpha: 0,
        scale: 0.2,
        duration: Phaser.Math.Between(220, 480),
        onComplete: () => p.destroy(),
      });
    }
  }

  private floatText(x: number, y: number, text: string, color: string, big = false) {
    const label = this.add
      .text(x, y, text, {
        fontFamily: "Orbitron, monospace",
        fontSize: big ? "22px" : "15px",
        color,
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(20);
    this.tweens.add({
      targets: label,
      y: y - (big ? 62 : 38),
      alpha: 0,
      scale: big ? 1.35 : 1,
      duration: big ? 900 : 620,
      onComplete: () => label.destroy(),
    });
  }

  private shake(intensity: number, duration: number) {
    if (useMetaStore.getState().settings.screenShake) {
      this.cameras.main.shake(duration, intensity);
    }
  }

  // ---------------------------------------------------------------- enemies

  private difficultyScale() {
    const minutes = this.elapsed / 60;
    const d = DIFFICULTY_MULT[useMetaStore.getState().settings.difficulty];
    return (1 + minutes * 0.34) * d;
  }

  private updateSpawning(dt: number) {
    const rate = 1.1 + this.elapsed / 42; // spawns per second
    this.spawnAcc += dt * rate;
    while (this.spawnAcc >= 1) {
      this.spawnAcc -= 1;
      if (this.enemies.length < 340) this.spawnRandomEnemy();
    }

    if (this.elapsed >= this.nextMiniBossAt) {
      this.nextMiniBossAt += 120;
      this.spawnEnemy("mini_boss");
      useGameStore.getState().pushToast("WARNING", "Mini-boss signature detected", "⚠");
      sfx.boss();
    }
    if (this.elapsed >= this.nextBossAt) {
      this.nextBossAt += 300;
      this.bossRef = this.spawnEnemy("boss");
      useGameStore.getState().pushToast("ALERT", "ROGUE PROTOCOL CORE incoming", "☠");
      playMusic("boss");
      sfx.boss();
      this.shake(0.012, 700);
    }
  }

  private spawnRandomEnemy() {
    const pool = SPAWN_TABLE.filter((s) => this.elapsed >= s.after);
    const total = pool.reduce((a, b) => a + b.weight, 0);
    let r = Math.random() * total;
    for (const entry of pool) {
      r -= entry.weight;
      if (r <= 0) {
        this.spawnEnemy(entry.kind);
        return;
      }
    }
    this.spawnEnemy("small_drone");
  }

  private spawnEnemy(kind: EnemyKind): Enemy {
    const def = ENEMIES[kind];
    const scale = this.difficultyScale();
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.max(this.scale.width, this.scale.height) * 0.7 + 80;
    const sprite = this.add
      .image(this.player.x + Math.cos(angle) * dist, this.player.y + Math.sin(angle) * dist, `e_${kind}`)
      .setDepth(6);

    const enemy: Enemy = {
      sprite,
      kind,
      hp: def.health * scale,
      maxHp: def.health * scale,
      speed: def.speed,
      damage: def.damage * Math.min(3, scale),
      xp: def.xp,
      coins: def.coins,
      radius: def.radius,
      nextShot: Phaser.Math.Between(800, 2200),
      burnUntil: 0,
      dashUntil: 0,
      nextPattern: 2500,
      vx: 0,
      vy: 0,
    };
    if (kind === "boss" || kind === "mini_boss") {
      this.tweens.add({
        targets: sprite,
        scale: 1.12,
        yoyo: true,
        repeat: -1,
        duration: 700,
        ease: "Sine.inOut",
      });
    }
    this.enemies.push(enemy);
    return enemy;
  }

  private updateEnemies(dt: number) {
    const px = this.player.x;
    const py = this.player.y;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i]!;
      const dx = px - e.sprite.x;
      const dy = py - e.sprite.y;
      const dist = Math.hypot(dx, dy) || 1;
      const nx = dx / dist;
      const ny = dy / dist;
      let speed = e.speed;

      switch (e.kind) {
        case "sniper_bot": {
          if (dist < 320) speed = -e.speed * 0.6;
          e.nextShot -= dt * 1000;
          if (e.nextShot <= 0 && dist < 620) {
            e.nextShot = 2400;
            this.spawnEnemyBullet(e, nx, ny, e.damage * 0.7, 300);
          }
          break;
        }
        case "flying_eye": {
          e.nextShot -= dt * 1000;
          if (e.nextShot <= 0 && dist < 460) {
            e.nextShot = 2800;
            this.spawnEnemyBullet(e, nx, ny, e.damage * 0.6, 240);
          }
          break;
        }
        case "exploding_robot": {
          speed = e.speed * 1.15;
          if (dist < e.radius + 26) {
            this.explode(e.sprite.x, e.sprite.y, e.damage, 90);
            this.hurtPlayer(e.damage);
            this.killEnemy(e, false);
            continue;
          }
          break;
        }
        case "mini_boss":
        case "boss": {
          e.nextPattern -= dt * 1000;
          if (e.nextPattern <= 0) {
            e.nextPattern = e.kind === "boss" ? 3000 : 4200;
            const pattern = Phaser.Math.Between(0, 2);
            if (pattern === 0) {
              // dash
              e.dashUntil = 700;
              e.vx = nx;
              e.vy = ny;
            } else if (pattern === 1) {
              // radial projectiles
              const n = e.kind === "boss" ? 16 : 10;
              for (let a = 0; a < n; a++) {
                const ang = (Math.PI * 2 * a) / n;
                this.spawnEnemyBullet(e, Math.cos(ang), Math.sin(ang), e.damage * 0.5, 220);
              }
            } else {
              // shockwave
              const ring = this.add.circle(e.sprite.x, e.sprite.y, 20, 0xff2f6d, 0.35).setDepth(5);
              this.tweens.add({
                targets: ring,
                scale: 12,
                alpha: 0,
                duration: 620,
                onComplete: () => ring.destroy(),
              });
              this.time.delayedCall(300, () => {
                if (Phaser.Math.Distance.Between(e.sprite.x, e.sprite.y, this.player.x, this.player.y) < 240) {
                  this.hurtPlayer(e.damage * 0.8);
                }
              });
              this.shake(0.008, 300);
            }
          }
          if (e.dashUntil > 0) {
            e.dashUntil -= dt * 1000;
            speed = e.speed * 5;
            e.sprite.x += e.vx * speed * dt;
            e.sprite.y += e.vy * speed * dt;
            if (dist < e.radius + 24) this.hurtPlayer(e.damage * 0.35);
            continue;
          }
          break;
        }
        default:
          break;
      }

      e.sprite.x += nx * speed * dt;
      e.sprite.y += ny * speed * dt;
      e.sprite.rotation = Math.atan2(ny, nx);

      if (dist < e.radius + 16) this.hurtPlayer(e.damage * dt * 2.2);

      // despawn stragglers far behind the player
      if (dist > 2200) {
        e.sprite.destroy();
        this.enemies.splice(i, 1);
      }
    }
  }

  private spawnEnemyBullet(e: Enemy, nx: number, ny: number, damage: number, speed: number) {
    const sprite = this.add
      .image(e.sprite.x, e.sprite.y, "bullet_enemy")
      .setDepth(7)
      .setRotation(Math.atan2(ny, nx));
    this.enemyBullets.push({ sprite, vx: nx * speed, vy: ny * speed, damage, life: 4 });
  }

  private updateEnemyBullets(dt: number) {
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const b = this.enemyBullets[i]!;
      b.sprite.x += b.vx * dt;
      b.sprite.y += b.vy * dt;
      b.life -= dt;
      const hit =
        Phaser.Math.Distance.Between(b.sprite.x, b.sprite.y, this.player.x, this.player.y) < 20;
      if (hit) this.hurtPlayer(b.damage);
      if (hit || b.life <= 0) {
        b.sprite.destroy();
        this.enemyBullets.splice(i, 1);
      }
    }
  }

  private damageEnemy(e: Enemy, amount: number, crit: boolean) {
    e.hp -= amount;
    this.damageDealt += amount;
    e.sprite.setTintFill(0xffffff);
    this.time.delayedCall(45, () => e.sprite.clearTint());
    if (amount >= 1) {
      this.floatText(
        e.sprite.x,
        e.sprite.y - e.radius,
        crit ? `${Math.round(amount)}!` : `${Math.round(amount)}`,
        crit ? "#ffe066" : "#e2f5ff",
        crit,
      );
    }
    sfx.hit();
    if (e.hp <= 0) this.killEnemy(e, true);
  }

  private killEnemy(e: Enemy, drop: boolean) {
    const idx = this.enemies.indexOf(e);
    if (idx === -1) return;
    this.enemies.splice(idx, 1);
    this.burst(e.sprite.x, e.sprite.y, ENEMIES[e.kind].color, e.kind === "boss" ? 40 : 10);
    e.sprite.destroy();
    this.kills++;

    if (drop) {
      this.dropPickup(e.sprite.x, e.sprite.y, "xp", e.xp);
      if (Math.random() < 0.45 || e.coins > 3) this.dropPickup(e.sprite.x, e.sprite.y, "coin", e.coins);
    }

    if (e.kind === "boss" || e.kind === "mini_boss") {
      this.bossKills++;
      sfx.explode();
      this.shake(0.02, 600);
      this.dropPickup(e.sprite.x, e.sprite.y, "crystal", e.xp);
      this.grant("boss_slayer");
      if (this.bossRef === e) {
        this.bossRef = null;
        playMusic("battle");
      }
      useGameStore.getState().pushToast("TARGET DOWN", `${ENEMIES[e.kind].name} destroyed`, "✷");
    }

    this.checkKillAchievements();
  }

  // ---------------------------------------------------------------- pickups

  private dropPickup(x: number, y: number, kind: Pickup["kind"], value: number) {
    const sprite = this.add.image(x, y, kind).setDepth(4);
    this.tweens.add({ targets: sprite, scale: 1.2, yoyo: true, repeat: -1, duration: 620 });
    this.pickups.push({ sprite, kind, value });
  }

  private updatePickups(dt: number) {
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i]!;
      const d = Phaser.Math.Distance.Between(p.sprite.x, p.sprite.y, this.player.x, this.player.y);
      if (d < this.stats.magnet) {
        const a = Math.atan2(this.player.y - p.sprite.y, this.player.x - p.sprite.x);
        const pull = 260 + (this.stats.magnet - d);
        p.sprite.x += Math.cos(a) * pull * dt;
        p.sprite.y += Math.sin(a) * pull * dt;
      }
      if (d < 22) {
        if (p.kind === "coin") {
          this.coins += p.value;
          sfx.coin();
        } else {
          this.gainXp(p.kind === "crystal" ? p.value * 2 : p.value);
          sfx.pickup();
        }
        p.sprite.destroy();
        this.pickups.splice(i, 1);
      }
    }
  }

  private gainXp(amount: number) {
    this.xp += amount;
    while (this.xp >= this.xpNeeded) {
      this.xp -= this.xpNeeded;
      this.level++;
      this.xpNeeded = Math.floor(12 + this.level * this.level * 1.6);
      this.onLevelUp();
    }
  }

  private onLevelUp() {
    sfx.levelUp();
    this.floatText(this.player.x, this.player.y - 40, "LEVEL UP", "#22d3ee", true);
    this.burst(this.player.x, this.player.y, 0x22d3ee, 22);
    if (this.level === 10) this.grant("level_10");
    if (this.level === 25) this.grant("level_25");

    const owned = useMetaStore.getState().unlockedWeapons;
    const weaponPool = owned
      .filter((id) => !this.weapons.includes(id))
      .map((id) => weaponCard(id, WEAPONS[id].name, WEAPONS[id].special));
    const cards = rollUpgrades(this.stats, weaponPool);
    this.syncHud();
    useGameStore.getState().offerUpgrades(cards);
  }

  private applyUpgrade(card: UpgradeCard) {
    if (card.grants) {
      if (!this.weapons.includes(card.grants)) this.weapons.push(card.grants);
    } else {
      card.apply(this.stats);
    }
    this.syncHud();
  }

  private updateCompanions(dt: number) {
    const wanted = this.stats.drones + (this.weapons.includes("mini_drone") ? 1 : 0);
    while (this.drones.length < wanted) {
      this.drones.push(this.add.image(this.player.x, this.player.y, "drone").setDepth(9));
    }
    this.drones.forEach((d, i) => {
      const a = this.elapsed * 1.6 + (Math.PI * 2 * i) / Math.max(1, this.drones.length);
      const tx = this.player.x + Math.cos(a) * 54;
      const ty = this.player.y + Math.sin(a) * 54;
      d.x += (tx - d.x) * Math.min(1, dt * 8);
      d.y += (ty - d.y) * Math.min(1, dt * 8);
    });
    if (this.drones.length > 0) {
      const timer = (this.weaponTimers.get("mini_drone") ?? 0) - dt * 1000;
      if (timer <= 0) {
        this.weaponTimers.set("mini_drone", WEAPONS.mini_drone.cooldown);
        for (const d of this.drones) {
          const t = this.nearestEnemy(WEAPONS.mini_drone.range, d);
          if (!t) continue;
          const ang = Math.atan2(t.sprite.y - d.y, t.sprite.x - d.x);
          this.spawnBullet(ang, "bullet", WEAPONS.mini_drone.damage, WEAPONS.mini_drone.speed, d);
        }
      } else {
        this.weaponTimers.set("mini_drone", timer);
      }
    }
  }

  // ---------------------------------------------------------------- player damage

  private hurtPlayer(amount: number) {
    if (this.ended) return;
    const reduced = Math.max(1, amount - this.stats.armor * (amount > 5 ? 1 : 0.2));
    if (this.stats.shield > 0) {
      this.stats.shield -= reduced;
      if (this.stats.shield < 0) {
        this.stats.health += this.stats.shield;
        this.stats.shield = 0;
      }
    } else {
      this.stats.health -= reduced;
    }
    if (reduced > 3) {
      this.player.setTintFill(0xff4d6d);
      this.time.delayedCall(70, () => this.player.clearTint());
      sfx.hurt();
      this.shake(0.005, 120);
    }
    if (this.stats.health <= 0) this.gameOver();
  }

  private gameOver() {
    if (this.ended) return;
    this.ended = true;
    sfx.gameOver();
    this.explode(this.player.x, this.player.y, 0, 0);
    const score = Math.floor(this.kills * 12 + this.elapsed * 8 + this.level * 120 + this.coins * 4);
    const meta = useMetaStore.getState();
    meta.recordRun({
      level: this.level,
      time: this.elapsed,
      kills: this.kills,
      coins: this.coins,
      bosses: this.bossKills,
      damage: Math.floor(this.damageDealt),
      score,
    });
    // Weapon unlocks are tied to lifetime kills.
    const unlocks = pendingWeaponUnlocks(
      useMetaStore.getState().stats.enemiesKilled,
      meta.unlockedWeapons,
    );
    unlocks.forEach((id) => meta.unlockWeapon(id));
    if (useMetaStore.getState().unlockedWeapons.length >= 8) this.grant("all_weapons");
    if (this.elapsed >= 1200) this.grant("survive_20");

    useGameStore.getState().endRun({
      level: this.level,
      time: this.elapsed,
      kills: this.kills,
      coins: this.coins,
      bosses: this.bossKills,
      damage: Math.floor(this.damageDealt),
      score,
      victory: this.elapsed >= 1200,
    });
  }

  // ---------------------------------------------------------------- misc

  private checkKillAchievements() {
    if (this.kills === 1) this.grant("first_kill");
    const lifetime = useMetaStore.getState().stats.enemiesKilled + this.kills;
    if (lifetime >= 100) this.grant("kills_100");
    if (lifetime >= 1000) this.grant("kills_1000");
  }

  private grant(id: string) {
    const granted = useMetaStore.getState().grantAchievement(id);
    if (granted) {
      const list = useGameStore.getState();
      list.pushToast("ACHIEVEMENT", id.replace(/_/g, " ").toUpperCase(), "★");
    }
  }

  private togglePause() {
    const store = useGameStore.getState();
    if (store.phase === "playing") store.setPhase("paused");
    else if (store.phase === "paused") store.setPhase("playing");
  }

  private syncHud() {
    const minimap = this.enemies.slice(0, 90).map((e) => ({
      x: e.sprite.x - this.player.x,
      y: e.sprite.y - this.player.y,
      kind: e.kind,
    }));
    useGameStore.getState().setHud({
      health: Math.max(0, this.stats.health),
      maxHealth: this.stats.maxHealth,
      shield: this.stats.shield,
      maxShield: this.stats.shield,
      level: this.level,
      xp: this.xp,
      xpNeeded: this.xpNeeded,
      coins: this.coins,
      kills: this.kills,
      time: this.elapsed,
      weapon: this.weapons[this.weapons.length - 1] ?? "pulse_rifle",
      bossHealth: this.bossRef ? this.bossRef.hp : null,
      bossMaxHealth: this.bossRef ? this.bossRef.maxHp : 1,
      bossName: this.bossRef ? ENEMIES[this.bossRef.kind].name : "",
      fps: Math.round(this.game.loop.actualFps),
      minimap,
      playerAngle: this.player.rotation,
    });
  }

  shutdown() {
    registerUpgradeHandler(null);
  }
}
