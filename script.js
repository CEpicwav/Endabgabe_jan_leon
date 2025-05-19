window.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('#model-root');
  const scene = document.querySelector('a-scene');

  const frontWindows = [];
  const backWindows = [];

  // === Gebäude
  const mainBlock = document.createElement('a-box');
  mainBlock.setAttribute('position', '0 1 0');
  mainBlock.setAttribute('width', '6');
  mainBlock.setAttribute('height', '2');
  mainBlock.setAttribute('depth', '4');
  mainBlock.setAttribute('color', '#a17c5b');
  mainBlock.setAttribute('material', 'roughness: 1; metalness: 0.1');
  root.appendChild(mainBlock);

  const roof = document.createElement('a-box');
  roof.setAttribute('position', '4.5 1.5 1.25');
  roof.setAttribute('width', '3');
  roof.setAttribute('height', '1');
  roof.setAttribute('depth', '1.5');
  roof.setAttribute('color', '#a17c5b');
  root.appendChild(roof);

  [-1, 0, 1].forEach((x) => {
    const col = document.createElement('a-cylinder');
    col.setAttribute('position', `${4.5 + x} 0.5 1.5`);
    col.setAttribute('radius', '0.05');
    col.setAttribute('height', '1');
    col.setAttribute('color', '#efefef');
    root.appendChild(col);
  });

  const plattform = document.createElement('a-box');
  plattform.setAttribute('position', '4.5 0.05 -0.5');
  plattform.setAttribute('width', '3');
  plattform.setAttribute('height', '0.1');
  plattform.setAttribute('depth', '5');
  plattform.setAttribute('color', '#ccc');
  root.appendChild(plattform);

  // === Fenster
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 6; col++) {
      const win = document.createElement('a-box');
      win.setAttribute('width', '0.6');
      win.setAttribute('height', '0.6');
      win.setAttribute('depth', '0.01');
      win.setAttribute('color', '#222');
      win.setAttribute('material', 'opacity: 0.5; metalness: 0.3; roughness: 0.1; emissive: #000; emissiveIntensity: 0;');
      const x = -2.4 + col * 0.95;
      const y = 1.3 + row * -0.9;

      const front = win.cloneNode();
      front.setAttribute('position', `${x} ${y} -2`);
      root.appendChild(front);
      frontWindows.push(front);

      const back = win.cloneNode();
      back.setAttribute('position', `${x} ${y} 2`);
      root.appendChild(back);
      backWindows.push(back);
    }
  }

  // === Glas
  const entry = document.createElement('a-box');
  entry.setAttribute('position', '3 1 0.1');
  entry.setAttribute('width', '0.9');
  entry.setAttribute('height', '2');
  entry.setAttribute('depth', '0.01');
  entry.setAttribute('color', '#222');
  entry.setAttribute('rotation', '0 90 0');
  entry.setAttribute('material', 'opacity: 0.5; metalness: 0.3; roughness: 0.1;');
  root.appendChild(entry);

  const studioG = document.createElement('a-box');
  studioG.setAttribute('position', '3 0.5 1.25');
  studioG.setAttribute('width', '1.4');
  studioG.setAttribute('height', '1');
  studioG.setAttribute('depth', '0.01');
  studioG.setAttribute('color', '#222');
  studioG.setAttribute('rotation', '0 90 0');
  studioG.setAttribute('material', 'opacity: 0.5; metalness: 0.3; roughness: 0.1;');
  root.appendChild(studioG);

  // === Regen-Partikel
  const rainGroup = document.createElement('a-entity');
  rainGroup.setAttribute('id', 'rainGroup');
  rainGroup.setAttribute('visible', 'false');

for (let i = 0; i < 2000; i++) {
  const drop = document.createElement("a-box");
  const x = Math.random() * 30 - 10;
  const y = Math.random() * 30 - 0;
  const z = Math.random() * 20 - 5;

  drop.setAttribute("position", `${x} ${y} ${z}`);
  drop.setAttribute("color", "#86c");
  drop.setAttribute("width", "0.01");
  drop.setAttribute("height", "0.04");
  drop.setAttribute("depth", "0.01");

  drop.setAttribute("animation", `property: position; to: ${x} 0 ${z}; dur: ${1000 + Math.random() * 2000}; loop: true; easing: linear`);
  rainGroup.appendChild(drop);
}
  scene.appendChild(rainGroup);

// === Wolkenhimmel bei Regen
const cloudGroup = document.createElement('a-entity');
cloudGroup.setAttribute('id', 'cloudGroup');
cloudGroup.setAttribute('visible', 'false');

// === Kugeln als Wolken
for (let i = 0; i < 80; i++) {
  const puff = document.createElement('a-sphere');
  const x = Math.random() * 18 - 9 + 2;  
  const y = 10.3 + Math.random() * 1;
  const z = Math.random() * 10 - 5 + 0.5;
  const scale = 1 + Math.random() * 1.5;

  puff.setAttribute('position', `${x} ${y} ${z}`);
  puff.setAttribute('radius', `${scale}`);
  puff.setAttribute('color', '#aaa');
  puff.setAttribute('material', 'transparent: true; opacity: 0.4; side: double');

  cloudGroup.appendChild(puff);
}
scene.appendChild(cloudGroup);

  // === Audio
  const sunAudio = new Audio('sun.mp3');
  const nightAudio = new Audio('night.mp3');
  const rainAudio = new Audio('rain.mp3');
  const sky = document.getElementById('sky');
  const ground = document.getElementById('ground');

  function stopAll() {
    [sunAudio, nightAudio, rainAudio].forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  function resetWindows() {
    [...frontWindows, ...backWindows].forEach(win => {
      win.setAttribute('color', '#222');
      win.setAttribute('material', 'opacity: 0.5; metalness: 0.3; roughness: 0.1; emissive: #000; emissiveIntensity: 0;');
    });
  }

  function randomizeWindowLights(mode) {
    resetWindows();
    if (mode === 'night' || mode === 'rain') {
      const allWindows = [...frontWindows, ...backWindows];
      const selected = [];

      const pool = [...allWindows];
      while (selected.length < 5 && pool.length > 0) {
        const index = Math.floor(Math.random() * pool.length);
        selected.push(pool.splice(index, 1)[0]);
      }

      selected.forEach(win => {
        win.setAttribute('color', '#ffd700');
        win.setAttribute('material', 'emissive: #ffea00; emissiveIntensity: 1;');
      });
    }
  }

  // === Modi
  function showSun() {
    stopAll(); sunAudio.play();
    sky.setAttribute('color', '#dfefff');
    ground.setAttribute('color', '#a7d899');
    document.getElementById('rainGroup')?.setAttribute('visible', 'false');
    resetWindows();
  }

  function showNight() {
    stopAll(); nightAudio.play();
    sky.setAttribute('color', '#0a0a2a');
    ground.setAttribute('color', '#223');
    document.getElementById('rainGroup')?.setAttribute('visible', 'false');
    randomizeWindowLights('night');
  }

  function showRain() {
    stopAll(); rainAudio.play();
    sky.setAttribute('color', '#7c8a97');
    ground.setAttribute('color', '#6c7a6f');
    document.getElementById('rainGroup')?.setAttribute('visible', 'true');
    randomizeWindowLights('rain');
  }

  // === Buttons
  document.getElementById('sunBtn')?.addEventListener('click', showSun);
  document.getElementById('nightBtn')?.addEventListener('click', showNight);
  document.getElementById('rainBtn')?.addEventListener('click', showRain);
});
