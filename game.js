(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = 960, H = 540;
  const keys = new Set();
  const robot = { x: 475, y: 0, facing: 1, step: 0 };
  const floorY = 453;
  let lastTime = 0;

  window.addEventListener('keydown', (event) => {
    if (['ArrowLeft', 'ArrowRight', ' '].includes(event.key)) event.preventDefault();
    keys.add(event.key.toLowerCase());
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
  window.addEventListener('blur', () => keys.clear());

  function roundedRect(x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 3; ctx.stroke(); }
  }

  function drawSaturn() {
    const cx = 480, cy = 207;
    const glow = ctx.createRadialGradient(cx, cy, 30, cx, cy, 210);
    glow.addColorStop(0, '#28394a');
    glow.addColorStop(1, '#172432');
    ctx.fillStyle = glow;
    ctx.fillRect(205, 62, 550, 290);

    // Distant stars
    for (let i = 0; i < 65; i++) {
      const x = 220 + ((i * 137) % 520);
      const y = 72 + ((i * 83) % 255);
      ctx.fillStyle = i % 5 === 0 ? '#d8d6c8' : '#8295a4';
      ctx.globalAlpha = .35 + (i % 4) * .13;
      ctx.fillRect(x, y, i % 7 === 0 ? 2 : 1, i % 7 === 0 ? 2 : 1);
    }
    ctx.globalAlpha = 1;

    // Saturn and its rings
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-.16);
    ctx.strokeStyle = '#b99d72';
    ctx.lineWidth = 17;
    ctx.beginPath(); ctx.ellipse(0, 0, 137, 43, 0, Math.PI * 1.02, Math.PI * 1.98); ctx.stroke();
    ctx.strokeStyle = '#d0b78b';
    ctx.lineWidth = 8;
    ctx.beginPath(); ctx.ellipse(0, 0, 137, 43, 0, Math.PI * 1.02, Math.PI * 1.98); ctx.stroke();
    const planet = ctx.createRadialGradient(-35, -28, 8, 0, 0, 84);
    planet.addColorStop(0, '#e0c89d');
    planet.addColorStop(.7, '#b99568');
    planet.addColorStop(1, '#80684f');
    ctx.fillStyle = planet;
    ctx.beginPath(); ctx.arc(0, 0, 69, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.arc(0, 0, 69, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#8f765b';
    for (let i = 0; i < 5; i++) ctx.fillRect(-75, -37 + i * 17, 150, 5);
    ctx.restore();
    ctx.strokeStyle = '#d5bd93';
    ctx.lineWidth = 12;
    ctx.beginPath(); ctx.ellipse(0, 0, 137, 43, 0, .05, Math.PI - .05); ctx.stroke();
    ctx.strokeStyle = '#78664f';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(0, 0, 137, 43, 0, .05, Math.PI - .05); ctx.stroke();
    ctx.restore();
  }

  function drawRoom() {
    const wall = ctx.createLinearGradient(0, 0, 0, H);
    wall.addColorStop(0, '#52606a');
    wall.addColorStop(.55, '#394852');
    wall.addColorStop(1, '#26343e');
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, W, H);

    // Wall panels
    ctx.strokeStyle = '#65737b';
    ctx.lineWidth = 2;
    for (let x = 25; x < W; x += 145) {
      ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x, 450); ctx.stroke();
    }
    ctx.fillStyle = '#293741';
    ctx.fillRect(0, 0, W, 25);
    ctx.fillRect(0, 438, W, 15);

    // Window frame
    roundedRect(188, 45, 584, 320, 15, '#18242e', '#87939a');
    roundedRect(204, 61, 552, 288, 8, '#152332', '#202f3c');
    ctx.save();
    ctx.beginPath(); ctx.roundRect(205, 62, 550, 286, 5); ctx.clip();
    drawSaturn();
    ctx.restore();
    ctx.strokeStyle = '#73818a';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(480, 48); ctx.lineTo(480, 363); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(190, 205); ctx.lineTo(770, 205); ctx.stroke();

    // Window sill and small room details
    roundedRect(165, 356, 630, 18, 4, '#78848a', '#a0a9aa');
    roundedRect(42, 95, 82, 190, 5, '#26343d', '#71808a');
    for (let i = 0; i < 4; i++) {
      roundedRect(55, 112 + i * 39, 55, 22, 3, i === 2 ? '#9b8159' : '#3d535e');
      ctx.fillStyle = '#a6b4b4'; ctx.fillRect(61, 119 + i * 39, 8, 3);
    }
    roundedRect(835, 115, 82, 150, 5, '#293943', '#71808a');
    ctx.fillStyle = '#b58f5b';
    ctx.fillRect(852, 139, 47, 3);
    ctx.fillStyle = '#82958f';
    ctx.fillRect(852, 155, 47, 3);

    // Floor
    const floor = ctx.createLinearGradient(0, 450, 0, H);
    floor.addColorStop(0, '#46535a'); floor.addColorStop(1, '#202b32');
    ctx.fillStyle = floor; ctx.fillRect(0, 453, W, 87);
    ctx.strokeStyle = '#647078'; ctx.lineWidth = 2;
    for (let x = 0; x <= W; x += 120) {
      ctx.beginPath(); ctx.moveTo(x, 454); ctx.lineTo(x - 35, H); ctx.stroke();
    }
    ctx.strokeStyle = '#87918e'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 454); ctx.lineTo(W, 454); ctx.stroke();

    // Warm work light
    const light = ctx.createRadialGradient(480, 405, 10, 480, 405, 260);
    light.addColorStop(0, 'rgba(202,169,112,.13)');
    light.addColorStop(1, 'rgba(202,169,112,0)');
    ctx.fillStyle = light; ctx.fillRect(180, 270, 600, 270);
  }

  function drawRobot(time) {
    const x = robot.x, y = floorY;
    const moving = Math.abs(robot.step) > 0;
    const bob = moving ? Math.sin(time * .014) * 3 : Math.sin(time * .002) * 1.5;
    const legSwing = moving ? Math.sin(time * .014) * 7 : 0;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(robot.facing, 1);

    // Ground shadow
    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.beginPath(); ctx.ellipse(0, 0, 34, 8, 0, 0, Math.PI * 2); ctx.fill();

    // Legs
    roundedRect(-20, -48 + legSwing, 14, 39, 5, '#687b80', '#263940');
    roundedRect(6, -48 - legSwing, 14, 39, 5, '#687b80', '#263940');
    roundedRect(-24, -14 + legSwing, 22, 12, 4, '#b08d5e', '#263940');
    roundedRect(3, -14 - legSwing, 22, 12, 4, '#b08d5e', '#263940');

    // Body
    roundedRect(-29, -111, 58, 65, 12, '#9ba9a6', '#34464d');
    roundedRect(-20, -99, 40, 31, 6, '#647b7c');
    ctx.fillStyle = '#d5b16f';
    ctx.fillRect(-4, -91, 8, 4);
    ctx.fillStyle = '#34464d';
    ctx.fillRect(-4, -79, 8, 3);

    // Arms
    roundedRect(-42, -104, 13, 43, 6, '#788b8b', '#34464d');
    roundedRect(29, -104, 13, 43, 6, '#788b8b', '#34464d');
    ctx.fillStyle = '#bd9b68';
    ctx.fillRect(-43, -67, 14, 6); ctx.fillRect(29, -67, 14, 6);

    // Head
    roundedRect(-28, -151, 56, 43, 10, '#c0c5b8', '#34464d');
    roundedRect(-20, -141, 40, 20, 6, '#293b43');
    ctx.fillStyle = '#d8b778';
    ctx.fillRect(-11, -134, 6, 5); ctx.fillRect(6, -134, 6, 5);
    ctx.strokeStyle = '#64777a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, -151); ctx.lineTo(0, -160); ctx.stroke();
    ctx.fillStyle = '#c49c60'; ctx.beginPath(); ctx.arc(0, -163, 4, 0, Math.PI * 2); ctx.fill();

    // Small chest status light
    ctx.fillStyle = '#9bb99c'; ctx.beginPath(); ctx.arc(0, -58, 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function update(dt) {
    const left = keys.has('a') || keys.has('arrowleft');
    const right = keys.has('d') || keys.has('arrowright');
    let direction = 0;
    if (left) direction -= 1;
    if (right) direction += 1;
    robot.x += direction * 190 * dt;
    robot.x = Math.max(70, Math.min(W - 70, robot.x));
    if (direction) robot.facing = direction;
    robot.step = direction;
  }

  function frame(time) {
    const dt = Math.min((time - lastTime) / 1000 || 0, .04);
    lastTime = time;
    update(dt);
    ctx.clearRect(0, 0, W, H);
    drawRoom();
    drawRobot(time);
    requestAnimationFrame(frame);
  }

  document.getElementById('loading').classList.add('hidden');
  requestAnimationFrame(frame);
})();
