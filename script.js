window.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('#model-root');
  let inPanoramaMode = false;
  let currentPanorama = null;
  let currentMode = 'sun'; // 'sun' | 'night' | 'rain'


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
    const drop = document.createElement('a-box');
    const x = Math.random() * 30 - 10;
    const y = Math.random() * 30;
    const z = Math.random() * 20 - 5;

    drop.setAttribute('position', `${x} ${y} ${z}`);
    drop.setAttribute('color', '#86c');
    drop.setAttribute('width', '0.01');
    drop.setAttribute('height', '0.04');
    drop.setAttribute('depth', '0.01');
    drop.setAttribute('animation', `property: position; to: ${x} 0 ${z}; dur: ${1000 + Math.random() * 2000}; loop: true; easing: linear`);
    rainGroup.appendChild(drop);
  }
  scene.appendChild(rainGroup);

  // === Wolkenhimmel bei Regen
  const cloudGroup = document.createElement('a-entity');
  cloudGroup.setAttribute('id', 'cloudGroup');
  cloudGroup.setAttribute('visible', 'false');

  for (let i = 0; i < 80; i++) {
    const puff = document.createElement('a-sphere');
    const x = Math.random() * 18 - 7;  
    const y = 10.3 + Math.random();
    const z = Math.random() * 10 - 5;
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
  sunAudio.loop = true;
  const nightAudio = new Audio('night.mp3');
  nightAudio.loop = true;
  const rainAudio = new Audio('rain.mp3');
  rainAudio.loop = true;

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
    currentMode = 'sun';
    stopAll(); sunAudio.play();
    sky.setAttribute('color', '#dfefff');
    ground.setAttribute('color', '#a7d899');
    rainGroup.setAttribute('visible', 'false');
    cloudGroup.setAttribute('visible', 'false');
    resetWindows();
  }

  function showNight() {
    currentMode = 'night';
    stopAll(); nightAudio.play();
    sky.setAttribute('color', '#0a0a2a');
    ground.setAttribute('color', '#223');
    rainGroup.setAttribute('visible', 'false');
    cloudGroup.setAttribute('visible', 'false');
    randomizeWindowLights('night');
  }

function showRain() {
  currentMode = 'rain';
  stopAll();
  rainAudio.play();
  sky.setAttribute('color', '#7c8a97');
  ground.setAttribute('color', '#6c7a6f');

  // Panorama-Modus: Regen nur bei "360-right"
  if (inPanoramaMode) {
    if (currentPanorama?.includes('right')) {
      rainGroup.setAttribute('visible', 'true');
      cloudGroup.setAttribute('visible', 'true');
    } else {
      rainGroup.setAttribute('visible', 'false');
      cloudGroup.setAttribute('visible', 'false');
    }
  } else {
    // Normalmodus: Regen und Wolken immer zeigen
    rainGroup.setAttribute('visible', 'true');
    cloudGroup.setAttribute('visible', 'true');
  }

  randomizeWindowLights('rain');
}



  function resetAll() {
    stopAll();
    sky.setAttribute('color', '#dfefff');
    ground.setAttribute('color', '#a7d899');
    rainGroup.setAttribute('visible', 'false');
    cloudGroup.setAttribute('visible', 'false');
    resetWindows();
  }

  // === Buttons
  document.getElementById('sunBtn')?.addEventListener('click', showSun);
  document.getElementById('nightBtn')?.addEventListener('click', showNight);
  document.getElementById('rainBtn')?.addEventListener('click', showRain);
  document.getElementById('resetBtn')?.addEventListener('click', resetAll);

  // === Kamera & VR-Panorama Wechsel

  const camera = document.querySelector('#camera');

  // 360° Panoramen
  const panoramas = {
    left: '360-left.jpg',
    center: '360-center.jpg',
    right: '360-right.jpg'
  };

  // Kugeln als Punkte zum Wechsel
  const positions = {
    left: { x: -3, y: 3, z: 0 },
    center: { x: 0, y: 3, z: 0 },
    right: { x: 4, y: 3, z: 0 }
  };

  // Kugeln erstellen
  Object.entries(positions).forEach(([key, pos]) => {
    const sphere = document.createElement('a-sphere');
    sphere.setAttribute('position', `${pos.x} ${pos.y} ${pos.z}`);
    sphere.setAttribute('radius', '0.2');
    sphere.setAttribute('color', '#ff0055');
    sphere.setAttribute('material', 'shader: flat; opacity: 0.9');
    sphere.setAttribute('class', 'panorama-point');
    root.appendChild(sphere);

    // Klick Event für Wechsel in Panorama-VR-Modus
    sphere.addEventListener('click', () => {
      enterPanorama(panoramas[key]);
    });
  });

  // Standard Himmel speichern
  const defaultSkySrc = sky.getAttribute('src');

function enterPanorama(imgSrc) {
  camera.removeAttribute('wasd-controls');
  inPanoramaMode = true;
  currentPanorama = imgSrc;

  // Alles ausblenden
  root.setAttribute('visible', 'false');
// Regen/Wolken nur zeigen, wenn 360-right aktiv ist und Regen aktuell eingeschaltet ist
const isRainActive = !rainAudio.paused;
const isRightPanorama = imgSrc.includes('right');

rainGroup.setAttribute('visible', isRainActive && isRightPanorama);
cloudGroup.setAttribute('visible', isRainActive && isRightPanorama);

  ground.setAttribute('visible', 'false');

  camera.setAttribute('position', '0 1.6 0');
  camera.setAttribute('rotation', '0 0 0');
  sky.setAttribute('src', imgSrc);
}


// Funktion um Panorama-Modus zu verlassen
function exitPanorama() {
  if (!inPanoramaMode) return;
  camera.removeAttribute('wasd-controls');
  inPanoramaMode = false;
  currentPanorama = null;

  root.setAttribute('visible', 'true');
  ground.setAttribute('visible', 'true');
  sky.removeAttribute('src');

if (currentMode === 'sun') {
  sky.setAttribute('color', '#dfefff');
} else if (currentMode === 'night') {
  sky.setAttribute('color', '#0a0a2a');
} else if (currentMode === 'rain') {
  sky.setAttribute('color', '#7c8a97');
}


  const isRainActive = !rainAudio.paused;
rainGroup.setAttribute('visible', isRainActive);
cloudGroup.setAttribute('visible', isRainActive);


  camera.setAttribute('position', '0 1.6 10');
  camera.setAttribute('rotation', '0 0 0');
}


// Beispiel: Doppelklick auf Szene verlässt Panorama
scene.addEventListener('dblclick', () => {
  exitPanorama();
});

// ESC-Taste verlässt Panorama
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    exitPanorama();
  }
});

// Klicken auf den Boden verlässt Panorama
ground.addEventListener('click', () => {
  exitPanorama();
});
});
