// script.js (UPDATED: No runs away + floating hearts + music)
const yesBtn     = document.getElementById("yesBtn");
const noBtn      = document.getElementById("noBtn");
const title      = document.getElementById("title");
const message    = document.getElementById("message");
const hint       = document.getElementById("hint");
const result     = document.getElementById("result");
const flowers    = document.getElementById("flowers");
const copyBtn    = document.getElementById("copyBtn");
const copied     = document.getElementById("copied");
const finalLine  = document.getElementById("finalLine");
const heartsLayer = document.getElementById("heartsLayer");
const buttonsWrap = document.getElementById("buttonsWrap");
const bgMusic    = document.getElementById("bgMusic");

let noCount = 0;
let runawayEnabled = false;
let musicStarted = false;

const pleas = [
  "Alice… it’s Victor. Please, have you forgiven me? 🥺",
  "I’m truly sorry, Alice. I miss you more than you know. 💗",
  "I’ll prove it with actions, not just words. Please forgive me. 💐",
  "Alice, you mean so much to me. Let me make things right. 🌹",
  "Please, my love… forgive me and let me show you I’ve learned. 💞",
  "I’m not proud of what happened, but I’m serious about changing. Can you forgive me? 🌷",
];

const flowerSets = [
  "🌸🌼🌺💐",
  "💐🌷🌸🌼🌺🌹",
  "🌹💐🌷🌸🌼🌺🌻🌹",
  "💐🌹🌷🌸🌼🌺🌻🪻💐🌹",
  "💐🌹🌷🌸🌼🌺🌻🪻🌸🌹💐🌷",
  "💐🌹🌷🌸🌼🌺🌻🪻🌸🌹💐🌷🌺💐"
];

function pop(el){
  el.classList.remove("pop");
  void el.offsetWidth;
  el.classList.add("pop");
}

/* MUSIC: browsers only allow audio after a user gesture */
async function startMusicOnce(){
  if (musicStarted) return;
  musicStarted = true;
  try{
    // Keep volume gentle
    bgMusic.volume = 0.35;
    await bgMusic.play();
  }catch(e){
    // If blocked, we’ll try again on next click
    musicStarted = false;
  }
}

function makeHeart(x, y){
  const heart = document.createElement("div");
  heart.className = "heart";
  const hearts = ["💗","💖","💘","💝","💞","💕"];
  heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];

  // Random drift
  const drift = (Math.random() * 80) - 40; // -40..40
  heart.style.left = `${x}px`;
  heart.style.top  = `${y}px`;
  heart.style.transform = `translateX(${drift}px) translateY(10px) scale(${0.9 + Math.random()*0.4})`;
  heart.style.animationDuration = `${2.2 + Math.random()*1.4}s`;

  heartsLayer.appendChild(heart);
  setTimeout(() => heart.remove(), 3500);
}

function burstHearts(count = 10){
  const rect = buttonsWrap.getBoundingClientRect();
  for (let i=0; i<count; i++){
    const x = rect.left + rect.width/2 + (Math.random()*140 - 70);
    const y = rect.top + rect.height/2 + (Math.random()*60 - 30);
    makeHeart(x, y);
  }
}

function setFlowers(){
  const idx = Math.min(noCount, flowerSets.length - 1);
  flowers.textContent = flowerSets[idx];
  flowers.classList.add("floaty");
  setTimeout(() => flowers.classList.remove("floaty"), 260);
}

function setPlea(){
  const idx = Math.min(noCount, pleas.length - 1);
  title.textContent = noCount === 0 ? "Hey Alice… 🥺" : "Please, Alice… 🥹";
  message.textContent = pleas[idx];

  hint.textContent =
    noCount < 2 ? "Be honest… but please be gentle 😅"
    : noCount < 4 ? "I’m listening. I’m learning. I’m here. 💗"
    : "Just one chance to prove it, Alice. 💐";
}

function growYes(){
  const scale = Math.min(1 + (noCount * 0.14), 2.4);
  yesBtn.style.transform = `scale(${scale})`;
  yesBtn.style.filter = `saturate(${1 + noCount * 0.18}) brightness(${1 + noCount * 0.06})`;
  yesBtn.style.boxShadow = `0 14px 34px rgba(255,61,135,${Math.min(0.26 + noCount * 0.09, 0.8)})`;
  yesBtn.textContent = noCount >= 2 ? "Yes Victor, I forgive you 💖💐" : "Yes 💖";
}

/* NO BUTTON RUNS AWAY */
function enableRunaway(){
  if (runawayEnabled) return;
  runawayEnabled = true;
  noBtn.classList.add("runaway");

  // Place it initially near where it was
  moveNoToRandomSpot();
}

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function moveNoToRandomSpot(){
  const wrap = buttonsWrap.getBoundingClientRect();
  const btn  = noBtn.getBoundingClientRect();

  // Padding so it stays inside the wrapper
  const pad = 8;
  const maxX = wrap.width - btn.width - pad;
  const maxY = wrap.height - btn.height - pad;

  // Random inside wrapper bounds
  const x = clamp(Math.random() * maxX, pad, maxX);
  const y = clamp(Math.random() * maxY, pad, maxY);

  // Convert to wrapper-local coordinates
  noBtn.style.left = `${x}px`;
  noBtn.style.top  = `${y}px`;
}

function runAwayFromPointer(evt){
  if (!runawayEnabled) enableRunaway();

  // If wrapper height is too small, increase it a bit
  // so the No button has space to escape.
  buttonsWrap.style.minHeight = "92px";

  moveNoToRandomSpot();
  pop(noBtn);
  burstHearts(3);
}

/* Events: move away on hover/touch/pointer near it */
noBtn.addEventListener("pointerenter", runAwayFromPointer);
noBtn.addEventListener("pointerdown", (e) => {
  // Prevent accidental clicks: it should flee instead
  e.preventDefault();
  runAwayFromPointer(e);
});

/* Clicking NO (if she somehow catches it) still escalates */
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  noCount += 1;
  pop(noBtn);
  pop(yesBtn);
  setPlea();
  setFlowers();
  growYes();
  burstHearts(6);

  // After 1-2 presses, make it definitely runaway
  if (noCount >= 1) enableRunaway();
});

yesBtn.addEventListener("click", async () => {
  pop(yesBtn);

  await startMusicOnce();   // starts music on Yes
  burstHearts(16);

  result.classList.remove("hidden");

  // Lock buttons
  yesBtn.disabled = true;
  noBtn.disabled = true;
  yesBtn.style.cursor = "default";
  noBtn.style.cursor = "default";
  noBtn.style.opacity = "0.5";

  title.textContent = "Yay!! 🥰";
  message.textContent = "Thank you, Alice. I’ll show you I mean it — every day.";
  hint.textContent = "Send Victor a hug? 🤍 (or a smile screenshot 😄)";
  finalLine.textContent =
    "I promise to do better, listen more, and love you the way you deserve. I’m choosing you—always.";
});

/* If music was blocked, try again on any tap */
document.addEventListener("pointerdown", () => {
  startMusicOnce();
}, { once: false });

copyBtn.addEventListener("click", async () => {
  const text = "Forgiven 💗 But you owe me flowers for real 💐🙂";
  try{
    await navigator.clipboard.writeText(text);
    copied.classList.remove("hidden");
    setTimeout(() => copied.classList.add("hidden"), 1400);
  } catch(e){
    alert(text);
  }
});

/* Start runaway after a couple seconds for fun (optional) */
setTimeout(() => enableRunaway(), 1800);
