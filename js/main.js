(function() {
    emailjs.init("Qiw6gZb5Wmcnz17qA"); //Changer par la clé de email.js
}) ();

document.addEventListener("DOMContentLoaded", () =>{
    const form = document.getElementById('cc-form');
    const statusmsg = document.getElementById('status_message');

    if (!form) return;

    form.addEventListener('submit', function(event){
        event.preventDefault();

        const serviceID = "service_3gt3lcc";
        const templateID = "template_twv1v9l";

        statusmsg.style.color = "green";
        statusmsg.innerText = "Envoie en cours.....";

        emailjs.sendForm(serviceID, templateID, this).then (()=>{
            statusmsg.style.color = "green";
            statusmsg.innerText = "Message envoyé avec succès";
            form.reset();
        })
            .catch((error)=>{
                statusmsg.style.color = "red";
                statusmsg.innerText = "Echec de l'envoi : " + JSON.stringify(error);
            });
    });

});

//Function pour les griffures

(() => {
    const stage = document.getElementById('stage'), flip = document.getElementById('flip');
    const cv = document.getElementById('fx'), ctx = cv.getContext('2d');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const BLUE = '#1f6bff';
    let W = 0, H = 0;

    function resize() {
        const d = Math.min(devicePixelRatio || 1, 2);
        W = stage.clientWidth; H = stage.clientHeight;
        cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    }
    new ResizeObserver(resize).observe(stage); resize();

    /* ---------- Griffures : 3 traits effilés qui se tracent puis s'estompent ---------- */
    const slashes = [];
    function addSlash(angle) {
        const s = Math.min(W, H), len = s * 0.95;
        const ux = Math.cos(angle), uy = Math.sin(angle), nx = -uy, ny = ux;
        const bend = (Math.random() - .5) * 0.22 * len, now = performance.now();
        [-1, 0, 1].forEach((k, i) => {
            const off = k * s * 0.1 + (Math.random() - .5) * 8, l = len * (k ? 0.82 : 1) * (0.95 + Math.random() * .1);
            const ox = W / 2 + nx * off, oy = H / 2 + ny * off;
            slashes.push({
                x0: ox - ux * l / 2, y0: oy - uy * l / 2, x1: ox + ux * l / 2, y1: oy + uy * l / 2,
                cx: ox + nx * bend, cy: oy + ny * bend, w: 7 + Math.random() * 5, born: now + i * 45
            });
        });
    }
    const bez = (a, b, c, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;

    function drawSlashes(now) {
        ctx.clearRect(0, 0, W, H);
        for (let i = slashes.length - 1; i >= 0; i--) {
            const s = slashes[i], age = now - s.born;
            if (age < 0) continue;
            const fade = age > 260 ? 1 - (age - 260) / 560 : 1;
            if (fade <= 0) { slashes.splice(i, 1); continue; }
            const grow = 1 - Math.pow(1 - Math.min(age / 220, 1), 3);
            const L = [], R = [], N = 30;
            for (let j = 0; j <= N; j++) {
                const t = (j / N) * grow;
                const x = bez(s.x0, s.cx, s.x1, t), y = bez(s.y0, s.cy, s.y1, t);
                const tx = 2 * (1 - t) * (s.cx - s.x0) + 2 * t * (s.x1 - s.cx);
                const ty = 2 * (1 - t) * (s.cy - s.y0) + 2 * t * (s.y1 - s.cy);
                const m = Math.hypot(tx, ty) || 1;
                const wd = s.w * Math.pow(Math.sin(Math.PI * t), 0.7) * Math.min(1, (grow - t) * 10 + 0.15) / 2;
                L.push([x - (ty / m) * wd, y + (tx / m) * wd]);
                R.push([x + (ty / m) * wd, y - (tx / m) * wd]);
            }
            ctx.globalAlpha = fade; ctx.fillStyle = BLUE; ctx.shadowColor = 'rgba(31,107,255,.55)'; ctx.shadowBlur = 14;
            ctx.beginPath(); L.forEach((p, j) => j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
            for (let j = R.length - 1; j >= 0; j--) ctx.lineTo(R[j][0], R[j][1]);
            ctx.closePath(); ctx.fill();
        }
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }

    /* ---------- Rotation sur l'axe X (retournement) avec inertie puis calage ---------- */
    let ang = 0, vel = 0, target = null, settled = true, idleSince = performance.now();
    let dragging = false, px = 0, py = 0, acc = 0, lastSlash = 0;

    stage.addEventListener('pointerdown', e => {
        dragging = true; settled = false; target = null; vel = 0; px = e.clientX; py = e.clientY; acc = 0;
        stage.setPointerCapture(e.pointerId); stage.classList.add('drag');
    });
    stage.addEventListener('pointermove', e => {
        if (!dragging) return;
        const dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY;
        const da = (dy + dx * 0.5) * 0.55;               // glisser dans n'importe quel sens fait tourner
        ang += da; vel = da; acc += Math.hypot(dx, dy);
        const now = performance.now();
        if (acc > 150 && now - lastSlash > 140 && (dx || dy)) {
            addSlash(Math.atan2(dy, dx)); acc = 0; lastSlash = now;   // griffure dans le sens du geste
        }
    });
    const release = () => { dragging = false; stage.classList.remove('drag'); };
    stage.addEventListener('pointerup', release);
    stage.addEventListener('pointercancel', release);

    function frame(now) {
        if (!dragging) {
            if (target === null && !settled) {
                ang += vel; vel *= 0.93;
                if (Math.abs(vel) < 0.6) target = Math.round(ang / 180) * 180 || 0;
            } else if (target !== null) {
                ang += (target - ang) * 0.12;
                if (Math.abs(target - ang) < 0.05) { ang = target; target = null; settled = true; idleSince = now; }
            } else if (!reduce && now - idleSince > 7000) {   // retournement automatique au repos
                target = ang + 180; settled = false; vel = 0; addSlash(-0.9);
            }
        }
        flip.style.transform = `rotateX(${ang}deg)`;
        drawSlashes(now);
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
})();
