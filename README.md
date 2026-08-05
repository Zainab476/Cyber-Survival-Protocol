# Cyber Survival Protocol

You are an expert senior game developer, UI/UX designer, and software architect.

Build a complete production-quality browser game called "Cyber Survivor: Rogue Protocol."

The goal is to create a polished portfolio-quality project that demonstrates clean architecture, modern frontend development, game programming, responsive design, animations, and maintainable code.

==================================================

TECH STACK

==================================================

Frontend

- React 19

- TypeScript

- Vite

Game Engine

- Phaser 3

Styling

- Tailwind CSS

- Framer Motion

State Management

- Zustand

Audio

- Howler.js

Backend (optional but architecture-ready)

- Supabase

Code Quality

- Modular architecture

- Reusable components

- Custom hooks

- Strong typing

- Well-commented code

==================================================

GAMEPLAY

==================================================

The player wakes inside a cyber simulation after an AI network has taken over the city.

Objective:

Survive as long as possible while defeating enemy robots, collecting experience, unlocking upgrades, and defeating bosses.

Movement:

- WASD

- Arrow Keys

Mouse:

- Aim

- Click UI buttons

Gameplay style:

- Automatic shooting

- Constant enemy spawning

- Fast-paced survival

==================================================

PLAYER SYSTEM

==================================================

Player Stats

Health

Armor

Movement Speed

Attack Speed

Damage

Critical Chance

Critical Damage

Luck

Experience

Level

Coins

Health Bar

XP Bar

Animated Level Up

==================================================

LEVEL UP SYSTEM

==================================================

Every level gives the player three random upgrade cards.

Examples:

+20% Damage

+15% Speed

+25% Fire Rate

+10 Max Health

Double Shot

Triple Shot

Piercing Bullets

Electric Bullets

Poison Bullets

Laser Beam

Drone Companion

Shield Generator

Magnet Radius

Health Regeneration

Rare upgrades should appear less frequently.

==================================================

WEAPONS

==================================================

Starting Weapon

Pulse Rifle

Unlockable Weapons

Laser Cannon

Plasma Shotgun

Rocket Launcher

Energy Blade

Lightning Orb

Mini Drone

Flamethrower

Each weapon has

Level

Damage

Cooldown

Range

Special Effect

==================================================

ENEMIES

==================================================

Enemy Types

Small Drone

Heavy Robot

Flying Eye

Sniper Bot

Fast Runner

Exploding Robot

Mini Boss

Boss

Enemies become stronger every minute.

==================================================

BOSS SYSTEM

==================================================

Spawn Boss every 5 minutes.

Boss has

Unique attacks

Large health pool

Attack patterns

Dash attack

Projectile attack

Shockwave attack

Reward:

Huge XP

Coins

Random Legendary Upgrade

==================================================

MAP

==================================================

Infinite scrolling cyber city.

Animated background.

Neon lights.

Broken roads.

Computer terminals.

Energy crystals.

Particle effects.

==================================================

VISUAL EFFECTS

==================================================

Glow

Bloom

Hit flashes

Damage numbers

Critical hit animation

Screen shake

Smooth camera

Explosions

Particles

Floating XP

Coin animations

==================================================

AUDIO

==================================================

Background synth music.

Menu music.

Boss music.

Button sounds.

Weapon sounds.

Explosion sounds.

Level-up sound.

Victory sound.

Game over sound.

Mute button.

Volume slider.

==================================================

UI

==================================================

Beautiful cyberpunk interface.

Main Menu

Play

Settings

Achievements

Leaderboard

Credits

Pause Menu

Resume

Restart

Quit

HUD

Health

XP

Coins

Level

Time Survived

Kills

Current Weapon

Mini-map

FPS Counter (optional)

==================================================

SAVE SYSTEM

==================================================

Automatically save

Unlocked weapons

Achievements

Settings

High score

Best survival time

Statistics

Use Local Storage.

Architecture should support Supabase later.

==================================================

ACHIEVEMENTS

==================================================

First Kill

100 Kills

1000 Kills

Reach Level 10

Reach Level 25

Defeat Boss

Unlock All Weapons

Survive 20 Minutes

==================================================

STATISTICS

==================================================

Games Played

Highest Level

Longest Survival

Enemies Killed

Bosses Defeated

Coins Collected

Damage Dealt

==================================================

RESPONSIVE DESIGN

==================================================

Desktop

Tablet

Mobile

Landscape support.

Touch joystick for mobile.

Touch buttons.

==================================================

ANIMATIONS

==================================================

Framer Motion animations for menus.

Smooth transitions.

Hover effects.

Loading animation.

Card flip animation.

Victory animation.

==================================================

DESIGN

==================================================

Modern cyberpunk aesthetic.

Dark interface.

Purple

Blue

Cyan

Neon highlights.

Rounded UI.

Glassmorphism.

Professional typography.

High-quality icons.

==================================================

CODE QUALITY

==================================================

Use scalable folder structure.

Separate game logic from UI.

Use reusable React components.

Use reusable Phaser scenes.

No duplicated code.

Strong TypeScript typing.

Readable naming.

Easy to extend.

==================================================

BONUS FEATURES

==================================================

Daily challenges.

Difficulty selection.

Skill tree.

Unlockable skins.

Photo mode.

Replay last run.

Keyboard remapping.

Gamepad support.

Localization (English and Arabic).

Accessibility settings.

Performance optimization.

Loading screen.

==================================================

FINAL GOAL

==================================================

The final result should look like a polished indie game that could realistically be showcased in a professional software engineering portfolio.

The application should feel complete, visually impressive, responsive, maintainable, and ready for future online multiplayer and cloud-save integration.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bc8af5f1-9be1-49b7-aee2-085d2f11a7d4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
