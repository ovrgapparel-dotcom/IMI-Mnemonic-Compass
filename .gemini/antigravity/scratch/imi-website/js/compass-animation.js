// HUD Canvas Compass Animation
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('hud-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;

  // Set canvas bounds
  function resizeCanvas() {
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Animation state vars
  let outerRotation = 0;
  let innerRotation = 0;
  let pulseAngle = 0;
  let particles = [];
  const particleCount = 40;

  // Create initial particle field
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 400,
      size: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.2 + 0.05,
      angle: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.5 + 0.1
    });
  }

  // Render loop
  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const maxRadius = Math.min(w, h) * 0.45;

    ctx.clearRect(0, 0, w, h);

    // Save state and translate to center
    ctx.save();
    ctx.translate(cx, cy);

    // 1. Draw polar grids (subtle circular grids)
    ctx.strokeStyle = 'rgba(184, 188, 194, 0.03)';
    ctx.lineWidth = 1;
    for (let r = maxRadius * 0.2; r <= maxRadius; r += maxRadius * 0.2) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Draw moving background particle field
    particles.forEach(p => {
      p.angle += p.speed * 0.02;
      // Moving outward slightly
      const dist = Math.sqrt(p.x * p.x + p.y * p.y);
      if (dist > maxRadius) {
        // Reset near center
        p.x = (Math.random() - 0.5) * 50;
        p.y = (Math.random() - 0.5) * 50;
      } else {
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
      }

      ctx.fillStyle = `rgba(229, 196, 90, ${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Draw Outer Rotating Dial Ring
    ctx.save();
    ctx.rotate(outerRotation);
    ctx.strokeStyle = 'rgba(201, 162, 39, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, maxRadius * 0.85, 0, Math.PI * 2);
    ctx.stroke();

    // Ticks on outer ring
    ctx.strokeStyle = 'rgba(201, 162, 39, 0.25)';
    ctx.lineWidth = 1;
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 18) { // 36 ticks
      ctx.beginPath();
      const x1 = Math.cos(angle) * (maxRadius * 0.82);
      const y1 = Math.sin(angle) * (maxRadius * 0.82);
      const x2 = Math.cos(angle) * (maxRadius * 0.85);
      const y2 = Math.sin(angle) * (maxRadius * 0.85);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Draw Inner Compass Ring with directions
    ctx.save();
    ctx.rotate(-innerRotation); // rotates counter-clockwise
    ctx.strokeStyle = 'rgba(184, 188, 194, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, maxRadius * 0.6, 0, Math.PI * 2);
    ctx.stroke();

    // 8 Cardinal Triangles
    ctx.fillStyle = 'rgba(229, 196, 90, 0.35)';
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -(maxRadius * 0.6));
      ctx.lineTo(-6, -(maxRadius * 0.54));
      ctx.lineTo(6, -(maxRadius * 0.54));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // 5. Draw Gold Pulse Radar Sweep Line
    ctx.save();
    ctx.rotate(pulseAngle);
    
    // Draw sweeping radar gradient pie segment
    const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, maxRadius * 0.85);
    gradient.addColorStop(0, 'rgba(229, 196, 90, 0.08)');
    gradient.addColorStop(1, 'rgba(201, 162, 39, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, maxRadius * 0.85, -Math.PI / 12, 0);
    ctx.closePath();
    ctx.fill();

    // Draw the edge line of sweep
    ctx.strokeStyle = 'rgba(229, 196, 90, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(229, 196, 90, 0.6)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(maxRadius * 0.85, 0);
    ctx.stroke();
    
    ctx.restore();

    // 6. Draw central compass hub
    ctx.shadowBlur = 0; // reset shadow
    ctx.fillStyle = '#080808';
    ctx.strokeStyle = 'rgba(229, 196, 90, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(229, 196, 90, 0.8)';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Increment speeds
    outerRotation += 0.0008;
    innerRotation += 0.0015;
    pulseAngle += 0.006;

    animationFrameId = requestAnimationFrame(draw);
  }

  // Start loop
  draw();
});
