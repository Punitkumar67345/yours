import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// GLOBAL STYLES
// ============================================================
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  #root {
    max-width: 100% !important;
    width: 100vw !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden;
  }

  :root {
    --rose:  #e11d48;
    --rose2: #be123c;
    --blush: #fda4af;
    --cream: #fef6ee;
    --ink:   #1a0a0f;
    --muted: #7d5a62;
    --gold:  #c8973a;
    --ivory: #fff8f0;
    --paper: #fdf4ec;
  }

  html { scroll-behavior: smooth; overflow-x: hidden; }
  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--cream);
    color: var(--ink);
    overflow-x: hidden;
    width: 100%;
    cursor: none;
  }

  /* ---- CURSOR — flower only ---- */
  .cursor-flower {
    position: fixed; pointer-events: none; z-index: 99999;
    font-size: 22px; top: 0; left: 0;
    transform: translate(-50%, -50%);
    filter: drop-shadow(0 0 5px rgba(255,100,150,0.8));
    will-change: left, top;
    transition: left 0.05s linear, top 0.05s linear;
  }

  /* Trail fades slowly over 1.5s */
  .cursor-trail {
    position: fixed; pointer-events: none; z-index: 99997;
    top: 0; left: 0;
    transform: translate(-50%, -50%);
    animation: trailFade 1.5s ease forwards;
    will-change: transform, opacity;
  }
  @keyframes trailFade {
    0%   { opacity: 0.9; transform: translate(-50%, -55%) scale(1.2); }
    40%  { opacity: 0.7; transform: translate(-50%, -70%) scale(1.0); }
    100% { opacity: 0;   transform: translate(-50%, -95%) scale(0.4); }
  }

  /* ---- SCROLLBAR ---- */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--cream); }
  ::-webkit-scrollbar-thumb { background: var(--blush); border-radius: 2px; }

  /* ---- NAV ---- */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 900;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 6%; background: transparent;
    transition: background 0.4s, backdrop-filter 0.4s, padding 0.3s, box-shadow 0.3s;
  }
  .nav.scrolled {
    background: rgba(254,246,238,0.92);
    backdrop-filter: blur(24px);
    padding: 14px 6%;
    box-shadow: 0 2px 24px rgba(225,29,72,0.06);
  }
  .nav-brand {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px; font-weight: 600; letter-spacing: 0.04em;
    color: var(--rose); cursor: pointer;
    display: flex; align-items: center; gap: 8px;
  }
  .nav-brand-heart { animation: heartbeat 2s ease infinite; display: inline-block; }
  @keyframes heartbeat { 0%,100%{transform:scale(1)} 50%{transform:scale(1.3)} }
  .nav-links { display: flex; gap: 6px; }
  .nav-link {
    font-size: 13px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase;
    padding: 8px 16px; border: none; background: none; color: var(--muted); cursor: pointer;
    border-radius: 40px; transition: all 0.25s;
    white-space: nowrap;
  }
  .nav-link:hover, .nav-link.active { color: var(--rose); background: rgba(225,29,72,0.1); }

  /* ---- HERO ---- */
  .hero {
    min-height: 100vh; width: 100%;
    display: flex; align-items: center; justify-content: center;
    gap: 40px; position: relative; background: var(--cream); overflow: hidden;
  }
  .hero-bg-mesh {
    position: absolute; inset: -100px;
    background:
      radial-gradient(ellipse 60% 50% at 85% 20%, rgba(225,29,72,0.07) 0%, transparent 70%),
      radial-gradient(ellipse 50% 60% at 10% 80%, rgba(200,151,58,0.05) 0%, transparent 70%);
    filter: blur(60px); pointer-events: none;
  }
  .hero-left {
    flex: 1; max-width: 600px;
    display: flex; flex-direction: column; justify-content: center;
    padding: 120px 20px 80px 4%; position: relative; z-index: 2;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 10px;
    font-size: 11px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--rose); margin-bottom: 28px;
    opacity: 0; animation: fadeUp 0.7s 0.3s ease forwards;
  }
  .eyebrow-line { width: 32px; height: 1px; background: var(--rose); }
  .hero-h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(52px,7vw,96px); line-height: 0.97; font-weight: 900;
    color: var(--ink); margin-bottom: 32px;
    opacity: 0; animation: fadeUp 0.9s 0.5s ease forwards;
  }
  .hero-h1 em { font-style: italic; color: var(--rose); position: relative; display: inline-block; }
  .hero-h1 em::after {
    content: ''; position: absolute; bottom: -4px; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--rose), var(--blush)); border-radius: 2px;
    transform: scaleX(0); transform-origin: left;
    animation: lineReveal 0.7s 1.4s ease forwards;
  }
  @keyframes lineReveal { to { transform: scaleX(1); } }
  .hero-p {
    font-size: 17px; line-height: 1.75; color: var(--muted); max-width: 420px;
    margin-bottom: 44px; opacity: 0; animation: fadeUp 0.8s 0.7s ease forwards;
  }
  .hero-btns {
    display: flex; gap: 14px; margin-bottom: 60px; flex-wrap: wrap;
    opacity: 0; animation: fadeUp 0.8s 0.9s ease forwards;
  }
  .btn-rose {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 15px 32px; border-radius: 50px;
    background: var(--rose); color: #fff;
    font-size: 14px; font-weight: 500; border: none; cursor: pointer;
    transition: all 0.3s; box-shadow: 0 4px 24px rgba(225,29,72,0.3);
    white-space: nowrap;
  }
  .btn-rose:hover { background: var(--rose2); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(225,29,72,0.4); }
  .btn-ghost {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 14px 32px; border-radius: 50px;
    background: transparent; color: var(--rose);
    font-size: 14px; font-weight: 500;
    border: 1.5px solid rgba(225,29,72,0.3); cursor: pointer; transition: all 0.3s;
    white-space: nowrap;
  }
  .btn-ghost:hover { background: rgba(225,29,72,0.06); border-color: var(--rose); transform: translateY(-2px); }
  .hero-stats {
    display: flex; gap: 36px; flex-wrap: wrap;
    opacity: 0; animation: fadeUp 0.8s 1.1s ease forwards;
  }
  .stat-n { font-family: 'Cormorant Garamond', serif; font-size: 40px; font-weight: 600; line-height: 1; color: var(--ink); }
  .stat-l { font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-top: 4px; }

  .hero-right {
    flex: 1; max-width: 500px;
    display: flex; align-items: center; justify-content: center;
    padding: 120px 4% 80px 20px; position: relative; z-index: 2;
  }
  .card-stack { position: relative; width: 360px; height: 460px; }
  .stack-card {
    position: absolute; width: 300px; border-radius: 20px; padding: 32px;
    cursor: pointer; box-shadow: 0 20px 60px rgba(26,10,15,0.12); overflow: hidden; opacity: 0;
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }
  .sc-0 { background:#fff8fb; transform:rotate(-8deg) translate(-20px,30px); animation:cardIn 0.7s 1.0s cubic-bezier(0.34,1.56,0.64,1) forwards; z-index:1; }
  .sc-1 { background:#fffbf0; transform:rotate(3deg)  translate(30px,10px);  animation:cardIn 0.7s 1.2s cubic-bezier(0.34,1.56,0.64,1) forwards; z-index:2; }
  .sc-2 { background:#fff8fb; transform:rotate(-1deg) translate(0,0);        animation:cardIn 0.7s 1.4s cubic-bezier(0.34,1.56,0.64,1) forwards; z-index:3; }
  @keyframes cardIn { from{opacity:0} to{opacity:1} }
  .sc-0:hover { transform:rotate(-14deg) translate(-40px,40px) scale(1.04); z-index:10; }
  .sc-1:hover { transform:rotate(7deg)   translate(50px,10px)  scale(1.04); z-index:10; }
  .sc-2:hover { transform:rotate(-1deg)  translate(0,-12px)    scale(1.04); z-index:10; }
  .sc-emoji-wrap { width:52px;height:52px;border-radius:16px;background:rgba(225,29,72,0.08);display:flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:20px; }
  .sc-chip { display:inline-block;font-size:10px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;padding:4px 10px;border-radius:20px;background:rgba(225,29,72,0.08);color:var(--rose);margin-bottom:10px; }
  .sc-title { font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:600;color:var(--ink);line-height:1.2;margin-bottom:6px; }
  .sc-sub { font-size:13px;color:var(--muted);line-height:1.5; }
  .sc-cta { font-size:12px;color:var(--rose);margin-top:20px;font-weight:500; }
  .float-hearts { position:absolute;inset:0;pointer-events:none; }
  .fh { position:absolute;font-size:24px;animation:floatHeart 4s ease-in-out infinite; }
  .fh-0{top:-20px;right:20px;animation-delay:0s}
  .fh-1{bottom:20px;right:-20px;animation-delay:1.5s}
  .fh-2{top:50%;left:-30px;animation-delay:0.8s}
  @keyframes floatHeart{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-14px) rotate(8deg)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  .scroll-hint {
    position:absolute;bottom:30px;left:50%;transform:translateX(-50%);
    display:flex;flex-direction:column;align-items:center;gap:8px;
    font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);
    opacity:0;animation:fadeUp 0.8s 1.8s ease forwards;
  }
  .scroll-line { width:1px;height:40px;background:linear-gradient(to bottom,var(--rose),transparent);animation:scrollLine 1.5s ease-in-out infinite; }
  @keyframes scrollLine{0%,100%{transform:scaleY(1);opacity:1}50%{transform:scaleY(0.5);opacity:0.4}}

  /* ============================
     TIMELINE — BEAUTIFUL CARDS
     ============================ */
  .tl-page { padding: 100px 5% 80px; width:100%; background:var(--ivory); position:relative; overflow:hidden; }
  .tl-page::before {
    content:''; position:absolute; inset:0;
    background:radial-gradient(ellipse 60% 40% at 50% 0%,rgba(225,29,72,0.04) 0%,transparent 70%);
    pointer-events:none;
  }
  .tl-head { text-align:center; margin-bottom:64px; }
  .tl-eyebrow {
    font-size:11px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;
    color:var(--rose);margin-bottom:16px;
    display:flex;align-items:center;justify-content:center;gap:12px;
  }
  .tl-eyebrow::before,.tl-eyebrow::after{content:'';flex:0 0 40px;height:1px;background:var(--blush)}
  .tl-h2 { font-family:'Playfair Display',serif;font-size:clamp(38px,5vw,68px);font-weight:900;color:var(--ink);margin-bottom:16px;line-height:1.05; }
  .tl-h2 span { color:var(--rose);font-style:italic; }
  .tl-head-p { font-size:16px;color:var(--muted);max-width:400px;margin:0 auto; }

  .tl-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
    max-width: 1200px;
    margin: 0 auto;
  }

  /* Clean, beautiful card design */
  .tl-card {
    background: #ffffff;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    opacity: 0;
    transform: translateY(28px) scale(0.97);
    transition: opacity 0.55s ease, transform 0.55s ease, box-shadow 0.35s, border-color 0.3s;
    border-radius: 20px;
    padding: 30px 26px 26px;
    border: 1.5px solid rgba(225,29,72,0.07);
    box-shadow: 0 4px 20px rgba(26,10,15,0.05), 0 1px 4px rgba(26,10,15,0.03);
  }
  .tl-card.vis {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  /* Top color accent bar */
  .tl-card::before {
    content:'';
    position: absolute;
    left: 0; top: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--color, #e11d48), rgba(253,164,175,0.6));
    border-radius: 20px 20px 0 0;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s ease;
  }
  /* Soft background glow on hover */
  .tl-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(225,29,72,0.04), transparent 70%);
    opacity: 0;
    transition: opacity 0.4s;
    pointer-events: none;
    border-radius: 20px;
  }
  .tl-card:hover {
    transform: translateY(-8px) scale(1.01);
    box-shadow: 0 24px 56px rgba(225,29,72,0.11), 0 4px 12px rgba(26,10,15,0.05);
    border-color: rgba(225,29,72,0.18);
  }
  .tl-card:hover::before { transform: scaleX(1); }
  .tl-card:hover::after  { opacity: 1; }

  .tl-top { display:flex;align-items:center;justify-content:space-between;margin-bottom:18px; }
  .tl-emoji-box {
    width:48px;height:48px;border-radius:14px;
    display:flex;align-items:center;justify-content:center;
    font-size:24px;
    border:1.5px solid rgba(225,29,72,0.1);
  }
  .tl-badge { font-size:11px;font-weight:500;letter-spacing:0.06em;padding:4px 11px;border-radius:20px; }
  .tl-date  { font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);margin-bottom:7px; }
  .tl-title { font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:600;color:var(--ink);line-height:1.2;margin-bottom:6px; }
  .tl-sub   { font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:20px; }
  .tl-foot  { display:flex;align-items:center;gap:6px;flex-wrap:wrap; }
  .tl-tag   { font-size:11px;padding:3px 10px;border-radius:20px;background:rgba(26,10,15,0.04);color:var(--muted); }
  .tl-cta   { margin-left:auto;font-size:12px;color:var(--rose);font-weight:500;flex-shrink:0; }

  /* ---- MODAL ---- */
  .modal-bd {
    position:fixed;inset:0;z-index:9000;
    background:rgba(26,10,15,0.55);backdrop-filter:blur(8px);
    display:flex;align-items:center;justify-content:center;padding:20px;
    animation:modalFadeIn 0.3s ease;
  }
  @keyframes modalFadeIn{from{opacity:0}to{opacity:1}}
  .modal-box {
    background:var(--paper);border-radius:28px;
    width:100%;max-width:520px;max-height:90vh;overflow-y:auto;
    position:relative;
    animation:modalSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1);
    box-shadow:0 40px 120px rgba(26,10,15,0.25);
  }
  @keyframes modalSlideUp{from{opacity:0;transform:translateY(40px) scale(0.92)}to{opacity:1;transform:none}}
  .modal-hd { padding:40px 40px 28px;border-radius:28px 28px 0 0;position:relative;overflow:hidden; }
  .modal-hd::after { content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.3) 0%,transparent 60%); }
  .modal-x {
    position:absolute;top:20px;right:20px;z-index:10;
    width:36px;height:36px;border-radius:50%;border:none;
    background:rgba(26,10,15,0.08);color:var(--muted);
    font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;
    transition:all 0.2s;
  }
  .modal-x:hover{background:rgba(26,10,15,0.14)}
  .modal-emoji-wrap {
    width:64px;height:64px;border-radius:18px;
    background:rgba(255,255,255,0.7);display:flex;align-items:center;justify-content:center;
    font-size:34px;margin-bottom:16px;position:relative;z-index:1;
    box-shadow:0 4px 20px rgba(26,10,15,0.08);
    border:2px solid rgba(225,29,72,0.12);
  }
  .modal-chip { display:inline-block;font-size:11px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;padding:4px 12px;border-radius:20px;background:rgba(255,255,255,0.6);margin-bottom:10px;position:relative;z-index:1; }
  .modal-title    { font-family:'Playfair Display',serif;font-size:32px;font-weight:900;color:var(--ink);line-height:1.1;margin-bottom:6px;position:relative;z-index:1; }
  .modal-subtitle { font-size:15px;color:var(--muted);position:relative;z-index:1; }
  .modal-body     { padding:32px 40px 40px; }
  .modal-desc     { font-size:15px;line-height:1.85;color:#4a2a36;margin-bottom:28px; }
  .modal-tags     { display:flex;gap:8px;flex-wrap:wrap;margin-bottom:28px; }
  .modal-tag      { font-size:12px;padding:5px 14px;border-radius:20px;font-weight:500; }
  .modal-prog-track { height:3px;background:rgba(26,10,15,0.06);border-radius:2px;margin-bottom:24px; }
  .modal-prog       { height:100%;border-radius:2px;transition:width 0.4s ease; }
  .modal-nav  { display:flex;align-items:center;justify-content:space-between; }
  .modal-nav-btn {
    padding:10px 24px;border-radius:40px;border:none;
    font-size:13px;font-weight:500;cursor:pointer;
    background:rgba(26,10,15,0.05);color:var(--muted);transition:all 0.2s;
    font-family:'DM Sans',sans-serif;
  }
  .modal-nav-btn:hover{background:rgba(225,29,72,0.08);color:var(--rose)}
  .modal-nav-btn.next{color:#fff;box-shadow:0 4px 16px rgba(225,29,72,0.25)}
  .modal-nav-btn.next:hover{transform:translateY(-2px)}
  .modal-dots { display:flex;gap:6px; }
  .mdot    { width:6px;height:6px;border-radius:50%;background:rgba(26,10,15,0.1);transition:all 0.3s;cursor:pointer; }
  .mdot.on { width:18px;border-radius:3px; }

  /* ---- BURST ---- */
  .burst{position:absolute;top:40px;right:100px;pointer-events:none;z-index:20}
  .bh{position:absolute;font-size:18px;animation:burst 0.9s ease forwards}
  @keyframes burst{0%{opacity:1;transform:translate(0,0) scale(0)}60%{opacity:1}100%{opacity:0;transform:translate(var(--bx,20px),var(--by,-40px)) scale(1)}}
  .bh-0{--bx:-30px;--by:-50px;animation-delay:0s}
  .bh-1{--bx:30px; --by:-60px;animation-delay:0.05s}
  .bh-2{--bx:0px;  --by:-70px;animation-delay:0.1s}
  .bh-3{--bx:-50px;--by:-30px;animation-delay:0.15s}
  .bh-4{--bx:50px; --by:-30px;animation-delay:0.2s}
  .bh-5{--bx:20px; --by:-55px;animation-delay:0.08s}

  /* ---- LETTER PAGE ---- */
  .letter-page {
    min-height:100vh;width:100%;background:var(--ink);
    display:flex;align-items:center;justify-content:center;
    padding:120px 4%;position:relative;overflow:hidden;
  }
  .letter-bg {
    position:absolute;inset:0;pointer-events:none;
    background:
      radial-gradient(ellipse 60% 50% at 30% 30%,rgba(225,29,72,0.12) 0%,transparent 70%),
      radial-gradient(ellipse 50% 50% at 75% 70%,rgba(200,151,58,0.08) 0%,transparent 70%);
  }
  .letter-stars{position:absolute;inset:0;pointer-events:none;overflow:hidden}
  .star{position:absolute;width:2px;height:2px;border-radius:50%;background:rgba(255,255,255,0.4);animation:twinkle var(--d) ease-in-out infinite}
  @keyframes twinkle{0%,100%{opacity:0.2}50%{opacity:1}}
  .letter-content{max-width:640px;width:100%;position:relative;z-index:2;text-align:center}
  .letter-seal {
    width:80px;height:80px;border-radius:50%;
    background:linear-gradient(135deg,var(--rose),var(--rose2));
    display:flex;align-items:center;justify-content:center;
    font-size:36px;margin:0 auto 32px;
    box-shadow:0 8px 40px rgba(225,29,72,0.4);
    animation:sealPulse 3s ease infinite;
  }
  @keyframes sealPulse{0%,100%{box-shadow:0 8px 40px rgba(225,29,72,0.4)}50%{box-shadow:0 8px 60px rgba(225,29,72,0.6),0 0 0 12px rgba(225,29,72,0.08)}}
  .letter-h2 {
    font-family:'Cormorant Garamond',serif;
    font-size:clamp(34px,5vw,58px);font-weight:300;font-style:italic;
    color:#fff;margin-bottom:40px;letter-spacing:0.02em;
  }
  .letter-peek{position:relative}
  .letter-peek-content{filter:blur(7px);pointer-events:none;user-select:none;transition:filter 0.9s ease}
  .letter-peek-content.revealed{filter:none;pointer-events:auto;user-select:auto}
  .letter-reveal-overlay {
    position:absolute;inset:0;display:flex;flex-direction:column;
    align-items:center;justify-content:center;gap:16px;
    cursor:pointer;z-index:10;transition:opacity 0.4s ease;
  }
  .letter-reveal-overlay.hidden{opacity:0;pointer-events:none}
  .envelope-bounce{font-size:48px;animation:envBounce 1.5s ease infinite;display:block;margin-bottom:4px}
  @keyframes envBounce{0%,100%{transform:scale(1) rotate(-5deg)}50%{transform:scale(1.15) rotate(5deg)}}
  .reveal-btn {
    background:linear-gradient(135deg,var(--rose),#ff6b9d);
    color:#fff;border:none;border-radius:50px;padding:16px 36px;
    font-size:15px;font-weight:500;cursor:pointer;
    box-shadow:0 8px 32px rgba(225,29,72,0.5);
    animation:btnPulse 2s ease infinite;
    display:flex;align-items:center;gap:12px;
    font-family:'DM Sans',sans-serif;letter-spacing:0.03em;
  }
  @keyframes btnPulse{0%,100%{box-shadow:0 8px 32px rgba(225,29,72,0.4),0 0 0 0 rgba(225,29,72,0.2)}50%{box-shadow:0 8px 40px rgba(225,29,72,0.6),0 0 0 12px rgba(225,29,72,0)}}
  .reveal-hint{font-size:13px;color:rgba(255,255,255,0.65);letter-spacing:0.1em;text-transform:uppercase}
  @keyframes cardReveal{0%{opacity:0;transform:scale(0.8) rotateY(-20deg)}60%{transform:scale(1.04) rotateY(3deg)}100%{opacity:1;transform:scale(1) rotateY(0deg)}}
  .card-revealed{animation:cardReveal 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards}
  .confetti-piece{position:fixed;pointer-events:none;z-index:99990;animation:confettiFall linear forwards}
  @keyframes confettiFall{0%{opacity:1;transform:translateY(-20px) rotate(0deg) scale(1)}100%{opacity:0;transform:translateY(100vh) rotate(720deg) scale(0.5)}}
  .letter-card {
    background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
    border-radius:24px;padding:48px;text-align:left;
    backdrop-filter:blur(10px);position:relative;overflow:hidden;
  }
  .letter-card::before {
    content:'"';font-family:'Cormorant Garamond',serif;
    font-size:140px;line-height:1;color:rgba(225,29,72,0.15);
    position:absolute;top:-10px;left:20px;pointer-events:none;
  }
  .letter-para{font-size:16px;line-height:1.9;color:rgba(255,255,255,0.75);margin-bottom:20px;position:relative;z-index:1}
  .letter-para:last-of-type{margin-bottom:0}
  .letter-sign{font-family:'Cormorant Garamond',serif;font-size:22px;font-style:italic;color:var(--blush);margin-top:32px;text-align:right}
  .letter-dates{display:flex;align-items:center;justify-content:center;gap:20px;margin-top:40px;flex-wrap:wrap}
  .letter-date-pill{font-size:12px;font-weight:500;letter-spacing:0.1em;padding:8px 18px;border-radius:40px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6)}
  .letter-dots{display:flex;gap:6px;align-items:center}
  .ldot{width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,0.2);animation:ldotPulse 2s ease infinite}
  @keyframes ldotPulse{0%,100%{opacity:0.2}50%{opacity:1}}

  /* ---- MUSIC PLAYER ---- */
  .music-bar {
    position:fixed;bottom:24px;right:24px;z-index:8000;
    background:rgba(254,246,238,0.95);backdrop-filter:blur(20px);
    border-radius:50px;padding:12px 20px;
    display:flex;align-items:center;gap:14px;
    box-shadow:0 8px 40px rgba(225,29,72,0.2);
    border:1px solid rgba(225,29,72,0.15);
  }
  .music-btn {
    width:36px;height:36px;border-radius:50%;border:none;
    background:var(--rose);color:#fff;font-size:14px;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 16px rgba(225,29,72,0.4);transition:all 0.2s;flex-shrink:0;
  }
  .music-btn:hover{transform:scale(1.1);background:var(--rose2)}
  .music-title{font-size:12px;font-weight:500;color:var(--ink);letter-spacing:0.02em}
  .music-sub{font-size:10px;color:var(--muted);letter-spacing:0.06em;text-transform:uppercase}
  .music-waves{display:flex;align-items:flex-end;gap:2px;height:18px}
  .mwave{width:3px;border-radius:2px;background:var(--rose);animation:waveBar 0.8s ease-in-out infinite}
  .mwave:nth-child(1){height:75%}
  .mwave:nth-child(2){animation-delay:0.15s;height:60%}
  .mwave:nth-child(3){animation-delay:0.3s;height:90%}
  .mwave:nth-child(4){animation-delay:0.15s;height:50%}
  @keyframes waveBar{0%,100%{transform:scaleY(0.4)}50%{transform:scaleY(1)}}
  .music-waves.paused .mwave{animation-play-state:paused;transform:scaleY(0.4)}

  /* ---- PARTICLES ---- */
  .particle-bg{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
  .particle{position:absolute;bottom:-40px;animation:riseParticle linear infinite;user-select:none;opacity:0.4}
  @keyframes riseParticle{0%{transform:translateY(0) rotate(0deg);opacity:0.4}80%{opacity:0.25}100%{transform:translateY(-110vh) rotate(360deg);opacity:0}}

  /* ---- RESPONSIVE — MOBILE FIRST ---- */
  @media(max-width:900px){
    .hero{ flex-direction:column; padding-top:0; }
    .hero-right{ display:none; }
    .hero-left{
      max-width:100%;
      padding:110px 6% 60px;
      align-items:center;
      text-align:center;
    }
    .hero-p{ text-align:center; max-width:100%; }
    .hero-btns{ justify-content:center; }
    .hero-stats{ justify-content:center; }
    .tl-grid{ grid-template-columns:1fr 1fr; gap:18px; }
  }

  @media(max-width:600px){
    .nav { padding: 14px 5%; }
    .nav-brand { font-size: 17px; }
    .nav-link { font-size: 11px; padding: 6px 10px; letter-spacing:0.04em; }
    .tl-grid{ grid-template-columns:1fr; gap:16px; }
    .tl-page{ padding:80px 5% 60px; }
    .hero-left{ padding:100px 5% 50px; }
    .hero-h1{ font-size:clamp(42px,12vw,64px); }
    .hero-btns{ flex-direction:column; align-items:center; gap:10px; }
    .btn-rose, .btn-ghost{ width:100%; max-width:300px; justify-content:center; }
    .hero-stats{ gap:24px; }
    .stat-n{ font-size:32px; }
    .modal-hd{ padding:24px 20px 18px; }
    .modal-body{ padding:20px; }
    .modal-title{ font-size:26px; }
    .letter-card{ padding:28px 20px; }
    .letter-page{ padding:80px 5%; }
    .music-bar{ right:12px; bottom:12px; padding:10px 14px; gap:10px; }
    .music-title{ font-size:11px; }
    .tl-card{ padding:24px 20px 20px; }
    .tl-title{ font-size:21px; }
  }
`;

// ============================================================
// DATA — Hinglish (Hindi + English mix)
// ============================================================
const STORIES = [
  {
    id:0, emoji:"💬", date:"20 June 2022", shortDate:"Jun '22",
    title:"Pehli Baat", subtitle:"Ek Hello ne everything change kar diya",
    desc:"Ek simple 'Hello' ne sab badal diya. Usi raat notes share hue, baatein hui — and ek naya connection shuru hua, without even realizing it. Who knew ki ek message se poori life change ho jaayegi?",
    tags:["Telegram","Notes","First Meet"],
    color:"#e11d48", light:"#fff1f2", accent:"#fce7f3",
  },
  {
    id:1, emoji:"🌼", date:"Wahi Garmiyan", shortDate:"Summer '22",
    title:"Dost Se Yaari", subtitle:"Bina naam ka rishta",
    desc:"Pehle friends bane, phir best friends. Roz ki baatein, inside jokes — har cheez mein naya rang tha. The bond was building — without any label, bas dil se dil tak.",
    tags:["Friendship","Daily Talks","Study Notes"],
    color:"#d97706", light:"#fffbeb", accent:"#fef3c7",
  },
  {
    id:2, emoji:"💓", date:"11 July 2022", shortDate:"Jul '22",
    title:"Pehla I Love You", subtitle:"Joke mein bola, dil sachcha tha",
    desc:"It was a joke — but the heart was completely serious. Those three words changed everything. Bahaana joke ka tha, par ehsaas sachcha tha — and she understood immediately.",
    tags:["11 July","Three Words","Dil Ki Baat"],
    color:"#dc2626", light:"#fff1f2", accent:"#fce7f3",
  },
  {
    id:3, emoji:"🎀", date:"Birthday Party", shortDate:"Bday",
    title:"Ek Khaas Pal", subtitle:"Birthday wala, unforgettable moment",
    desc:"Party toh just a reason tha. We were there, that moment existed — ek chhota sa, pyaara sa pal that still feels like yesterday. Dil mein hamesha ke liye reh gaya.",
    tags:["Birthday","Special Moment","Yaadgar"],
    color:"#7c3aed", light:"#faf5ff", accent:"#ede9fe",
  },
  {
    id:4, emoji:"✨", date:"10 Sept 2022", shortDate:"Sep '22",
    title:"Woh Sundar Pal", subtitle:"Small moment, very deep feeling",
    desc:"That moment — small but incredibly deep. The heart felt something that words can't capture. Sirf woh aankhein, woh ek pal — and the world seemed to pause. 😊",
    tags:["September","Special Lamha","Yaadein"],
    color:"#0891b2", light:"#ecfeff", accent:"#cffafe",
  },
  {
    id:5, emoji:"🌹", date:"24 Sept 2022", shortDate:"Sep '22",
    title:"I Love You Too", subtitle:"Ruka hua dil dhadka",
    desc:"The waiting heart finally beat. She said — 'I love you too.' And that night, the whole world felt beautiful. Teen lafzon ne do dilon ko ek kar diya — forever ke liye.",
    tags:["24 Sept","Both Hearts","Forever Starts"],
    color:"#be123c", light:"#fff1f2", accent:"#ffe4e6",
  },
  {
    id:6, emoji:"🧸", date:"2022 – 2023", shortDate:"Ek Saal",
    title:"Roz Ki Baatein", subtitle:"Waqt guzra, pyaar nahi",
    desc:"Har din ek naya feeling, har raat a new conversation. One year, two years... time passed but love never did. Baatein kabhi end nahi huin — roz naye rang, roz naya magic.",
    tags:["Daily Connection","Long Talks","Love Grows"],
    color:"#059669", light:"#ecfdf5", accent:"#d1fae5",
  },
  {
    id:7, emoji:"🌙", date:"March 2023+", shortDate:"2023+",
    title:"Door Par Bhi Saath", subtitle:"Distance mein bhi pyaar",
    desc:"12th ke baad paths diverged — but hearts didn't. Distance ne test kiya, par yeh pyaar stayed strong. Har roz ek message, har roz ek yaad — doori ne pyaar ko aur deeper kar diya.",
    tags:["Long Distance","Close at Heart","Dil Saath Raha"],
    color:"#1d4ed8", light:"#eff6ff", accent:"#dbeafe",
  },
  {
    id:8, emoji:"💖", date:"2026 — Aaj", shortDate:"Aaj Bhi",
    title:"Abhi Bhi, Hamesha", subtitle:"Yeh kahani khatam nahi",
    desc:"Years passed, conversations grew, love deepened. This story is not over yet — yeh toh hamesha ke liye hai. Tum aur main — bas itna enough hai. Always. Aur jo aage hai woh aur bhi beautiful hoga.",
    tags:["4+ Years","Forever Wala","2026 & Beyond"],
    color:"#e11d48", light:"#fff1f2", accent:"#fce7f3",
  },
];

const STACK_CARDS = [
  { emoji:"💬", date:"Jun 2022", title:"Pehli Baat",    sub:"Ek Hello ne sab badal diya" },
  { emoji:"✨", date:"Sep 2022", title:"Ek Khaas Pal",  sub:"Small moment, very deep feeling" },
  { emoji:"💖", date:"2026",     title:"Hamesha",        sub:"This story never ends" },
];

const PARTICLES = Array.from({ length:24 }, (_,i) => ({
  id:i,
  emoji:["🌸","💖","🧸","💌","🌼","💕","✨","🎀","🌷","⭐","💝","🌺"][i%12],
  left:`${(i*5.2+2)%95}%`,
  dur:`${10+(i%7)}s`,
  delay:`${(i*0.7)%12}s`,
  size:12+(i%4)*4,
}));

const STARS = Array.from({ length:60 }, (_,i) => ({
  id:i, top:`${(i*13.7)%100}%`, left:`${(i*17.3)%100}%`,
  dur:`${2+(i%4)}s`, delay:`${(i*0.3)%4}s`,
}));

const TRAIL_EMOJIS = ["💕","✨","🌸","💖","💗","🌷","🎀","🌼","💝","⭐","🌺","💫","🍀","🌈"];

// ============================================================
// HOOKS
// ============================================================
function useInView(threshold=0.15){
  const ref=useRef(null);
  const [vis,setVis]=useState(false);
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{
      if(e.isIntersecting){setVis(true);obs.disconnect();}
    },{threshold});
    if(ref.current)obs.observe(ref.current);
    return()=>obs.disconnect();
  },[threshold]);
  return[ref,vis];
}

// ============================================================
// CURSOR — flower only, trail fades slowly over 1.5s
// ============================================================
function Cursor(){
  const flowerRef=useRef(null);
  const lastTrail=useRef(0);

  useEffect(()=>{
    if(window.matchMedia("(pointer: coarse)").matches) return;
    let cx=window.innerWidth/2, cy=window.innerHeight/2;

    const move=(e)=>{
      cx=e.clientX; cy=e.clientY;
      if(flowerRef.current){
        flowerRef.current.style.left=cx+"px";
        flowerRef.current.style.top=cy+"px";
      }
      const now=Date.now();
      if(now-lastTrail.current>60){
        lastTrail.current=now;
        spawn(cx,cy);
        // Occasional extra trails for sparkle effect
        if(Math.random()>0.4) setTimeout(()=>spawn(cx+Math.random()*18-9, cy+Math.random()*18-9), 40);
        if(Math.random()>0.6) setTimeout(()=>spawn(cx+Math.random()*24-12, cy+Math.random()*24-12), 90);
      }
    };

    function spawn(x,y){
      const el=document.createElement("div");
      el.className="cursor-trail";
      el.textContent=TRAIL_EMOJIS[Math.floor(Math.random()*TRAIL_EMOJIS.length)];
      el.style.left=x+"px";
      el.style.top=y+"px";
      el.style.fontSize=(9+Math.random()*12)+"px";
      document.body.appendChild(el);
      // Remove after animation completes (1.5s)
      setTimeout(()=>el.remove(), 1500);
    }

    window.addEventListener("mousemove",move,{passive:true});
    return()=>window.removeEventListener("mousemove",move);
  },[]);

  return <div className="cursor-flower" ref={flowerRef}>🌸</div>;
}

// ============================================================
// MUSIC PLAYER
// ============================================================
function MusicPlayer(){
  const [playing,setPlaying]=useState(false);
  const audioRef=useRef(null);
  const toggle=()=>{
    if(!audioRef.current) return;
    if(playing){ audioRef.current.pause(); }
    else { audioRef.current.play().catch(()=>{}); }
    setPlaying(p=>!p);
  };
  return(
    <>
      <audio controls autoPlay loop>
  <source src={`${import.meta.env.BASE_URL}music.mp3`} type="audio/mpeg" />
</audio>
      <div className="music-bar">
        <button className="music-btn" onClick={toggle}>{playing?"⏸":"▶"}</button>
        <div>
          <div className="music-title">Tum Hi Ho 💕</div>
          <div className="music-sub">Pratiksha ❤️</div>
        </div>
        <div className={`music-waves${playing?"":" paused"}`}>
          <div className="mwave"/><div className="mwave"/><div className="mwave"/><div className="mwave"/>
        </div>
      </div>
    </>
  );
}

// ============================================================
// CONFETTI
// ============================================================
function spawnConfetti(){
  const emojis=["💖","💕","🌸","✨","💗","🌷","🎀","🌼","💝","⭐","💫","🌺"];
  for(let i=0;i<45;i++){
    setTimeout(()=>{
      const el=document.createElement("div");
      el.className="confetti-piece";
      el.textContent=emojis[Math.floor(Math.random()*emojis.length)];
      el.style.left=Math.random()*100+"vw";
      el.style.top="0px";
      el.style.fontSize=(14+Math.random()*18)+"px";
      el.style.animationDuration=(1.5+Math.random()*2)+"s";
      el.style.animationDelay=Math.random()*0.5+"s";
      document.body.appendChild(el);
      setTimeout(()=>el.remove(),3500);
    },i*22);
  }
}

// ============================================================
// NAV
// ============================================================
function Nav({go,active}){
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{
    const h=()=>setScrolled(window.scrollY>30);
    window.addEventListener("scroll",h,{passive:true});
    return()=>window.removeEventListener("scroll",h);
  },[]);
  return(
    <nav className={`nav ${scrolled?"scrolled":""}`}>
      <div className="nav-brand" onClick={()=>go("hero")}>
        <span className="nav-brand-heart">💕</span> Apni Story
      </div>
      <div className="nav-links">
        {[["hero","Home"],["timeline","Our Moments"],["letter","letter"]].map(([id,label])=>(
          <button key={id} className={`nav-link ${active===id?"active":""}`} onClick={()=>go(id)}>{label}</button>
        ))}
      </div>
    </nav>
  );
}

// ============================================================
// HERO
// ============================================================
function HeroPage({go}){
  return(
    <section className="hero" id="hero">
      <div className="hero-bg-mesh"/>
      <div className="hero-left">
        <div className="hero-eyebrow">
          <span className="eyebrow-line"/> 20 June 2022 → Hamesha <span className="eyebrow-line"/>
        </div>
        <h1 className="hero-h1">
          All You<br/>Need Is<br/><em>Love.</em>
        </h1>
        <p className="hero-p">
          Ek simple "Hello" se shuru hua tha — and aaj yahan hain hum,
          itne saalon baad bhi, dil se dil tak. 💕
        </p>
        <div className="hero-btns">
          <button className="btn-rose" onClick={()=>go("timeline")}>Apni Yaadein ❤️ →</button>
          <button className="btn-ghost" onClick={()=>go("letter")}>💌 Letter For You</button>
        </div>
        <div className="hero-stats">
          {[["5+","Saal Saath"],["∞","Yaadein"],["2 𖹭","Apka — Mera"]].map(([n,l],i)=>(
            <div key={i}>
              <div className="stat-n">{n}</div>
              <div className="stat-l">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-right">
        <div className="card-stack">
          {STACK_CARDS.map((c,i)=>(
            <div key={i} className={`stack-card sc-${i}`} onClick={()=>go("timeline")}>
              <div className="sc-emoji-wrap">{c.emoji}</div>
              <div className="sc-chip">{c.date}</div>
              <div className="sc-title">{c.title}</div>
              <div className="sc-sub">{c.sub}</div>
              <div className="sc-cta">Dekho →</div>
            </div>
          ))}
          <div className="float-hearts">
            <span className="fh fh-0">💕</span>
            <span className="fh fh-1">🌸</span>
            <span className="fh fh-2">✨</span>
          </div>
        </div>
      </div>

      <div className="scroll-hint">
        <div className="scroll-line"/>
        <span>Scroll karo</span>
      </div>
    </section>
  );
}

// ============================================================
// TIMELINE CARD — clean beautiful shape
// ============================================================
function TlCard({story,onClick,index}){
  const [ref,vis]=useInView(0.10);
  return(
    <div
      ref={ref}
      className={`tl-card ${vis?"vis":""}`}
      style={{
        "--color":story.color,
        transitionDelay:vis?`${(index%3)*0.08}s`:"0s",
      }}
      onClick={()=>onClick(story.id)}
    >
      <div className="tl-top">
        <div className="tl-emoji-box" style={{background:story.light,borderColor:`${story.color}22`}}>
          {story.emoji}
        </div>
        <span className="tl-badge" style={{background:story.light,color:story.color}}>
          {story.shortDate}
        </span>
      </div>
      <div className="tl-date">{story.date}</div>
      <h3 className="tl-title">{story.title}</h3>
      <p className="tl-sub">{story.subtitle}</p>
      <div className="tl-foot">
        {story.tags.slice(0,2).map((t,i)=><span key={i} className="tl-tag">{t}</span>)}
        <span className="tl-cta">Open →</span>
      </div>
    </div>
  );
}

// ============================================================
// MODAL
// ============================================================
function Modal({story,onClose,onPrev,onNext,current,total}){
  const [burst,setBurst]=useState(true);
  useEffect(()=>{
    setBurst(true);
    const t=setTimeout(()=>setBurst(false),1000);
    return()=>clearTimeout(t);
  },[story.id]);
  useEffect(()=>{
    const fn=(e)=>{
      if(e.key==="Escape")onClose();
      if(e.key==="ArrowRight")onNext();
      if(e.key==="ArrowLeft")onPrev();
    };
    window.addEventListener("keydown",fn);
    return()=>window.removeEventListener("keydown",fn);
  },[onClose,onNext,onPrev]);

  return(
    <div className="modal-bd" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box">
        {burst&&(
          <div className="burst">
            {["💖","💕","🌸","✨","💗","🌷"].map((h,i)=>(
              <span key={i} className={`bh bh-${i}`}>{h}</span>
            ))}
          </div>
        )}
        <div className="modal-hd" style={{background:story.light}}>
          <button className="modal-x" onClick={onClose}>✕</button>
          <div className="modal-emoji-wrap">{story.emoji}</div>
          <div className="modal-chip" style={{color:story.color}}>{story.date}</div>
          <h2 className="modal-title">{story.title}</h2>
          <p className="modal-subtitle">{story.subtitle}</p>
        </div>
        <div className="modal-body">
          <p className="modal-desc">{story.desc}</p>
          <div className="modal-tags">
            {story.tags.map((t,i)=>(
              <span key={i} className="modal-tag" style={{background:story.accent,color:story.color}}>{t}</span>
            ))}
          </div>
          <div className="modal-prog-track">
            <div className="modal-prog" style={{width:`${((current+1)/total)*100}%`,background:story.color}}/>
          </div>
          <div className="modal-nav">
            <button className="modal-nav-btn" onClick={onPrev}>←Piche</button>
            <div className="modal-dots">
              {Array.from({length:total}).map((_,i)=>(
                <div key={i} className={`mdot ${i===current?"on":""}`}
                  style={i===current?{background:story.color}:{}}
                />
              ))}
            </div>
            <button className="modal-nav-btn next" style={{background:story.color}} onClick={onNext}>Aage→</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TIMELINE PAGE
// ============================================================
function TimelinePage(){
  const [open,setOpen]=useState(null);
  const [hRef,hVis]=useInView(0.1);
  return(
    <section className="tl-page" id="timeline">
      <div
        className="tl-head"
        ref={hRef}
        style={{opacity:hVis?1:0,transform:hVis?"none":"translateY(20px)",transition:"all 0.7s ease"}}
      >
        <div className="tl-eyebrow">💖 Hamari Khaas Yaade</div>
        <h2 className="tl-h2">Har Lamha, <span>Hamesha</span></h2>
        <p className="tl-head-p">Kisi bhi card par click karo — ek poora pal khul jaayega ✨</p>
      </div>
      <div className="tl-grid">
        {STORIES.map((s,i)=><TlCard key={s.id} story={s} index={i} onClick={setOpen}/>)}
      </div>
      {open!==null&&(
        <Modal
          story={STORIES[open]} current={open} total={STORIES.length}
          onClose={()=>setOpen(null)}
          onPrev={()=>setOpen((open-1+STORIES.length)%STORIES.length)}
          onNext={()=>setOpen((open+1)%STORIES.length)}
        />
      )}
    </section>
  );
}

// ============================================================
// LETTER PAGE — Surprise Reveal
// ============================================================
function LetterPage(){
  const [ref,vis]=useInView(0.1);
  const [revealed,setRevealed]=useState(false);

  const handleReveal=()=>{
    spawnConfetti();
    setRevealed(true);
  };

  const paras=[
    `Ek "Hello" se shuru hua tha yeh safar — and aaj yahan hain hum, itne saalon baad bhi together. Who knew ki uss raat notes maangne se ek poori life change ho jaayegi? 🌸`,
    `Distance came, paths diverged — par dil nahi. Tum door gaye, but this love only grew deeper. Har roz ek message, har roz ek yaad — doori ne pyaar ko aur mazboot kar diya.`,
    `Saal guzre, baatein badhti rahi, dil gehra hota gaya. Yeh kahani abhi end nahi — yeh toh bas more beautiful hoti ja rahi hai, roz. 💖`,
  ];

  return(
    <section className="letter-page" id="letter">
      <div className="letter-bg"/>
      <div className="letter-stars">
        {STARS.map(s=>(
          <div key={s.id} className="star"
            style={{top:s.top,left:s.left,"--d":`${s.dur}s`,animationDelay:s.delay}}
          />
        ))}
      </div>
      <div
        className="letter-content" ref={ref}
        style={{opacity:vis?1:0,transform:vis?"none":"translateY(30px)",transition:"all 0.9s ease"}}
      >
        <div className="letter-seal">💌</div>
        <h2 className="letter-h2">Aapke Liye...</h2>

        <div className="letter-peek">
          <div className={`letter-card letter-peek-content ${revealed?"revealed card-revealed":""}`}>
            {paras.map((p,i)=><p key={i} className="letter-para">{p}</p>)}
            <div className="letter-sign">— Hamesha Apka 🌸</div>
          </div>
          {!revealed&&(
            <div className="letter-reveal-overlay" onClick={handleReveal}>
              <span className="envelope-bounce">💌</span>
              <button className="reveal-btn">
                <span>💌</span> Tap to Open — ek surprise hai
              </button>
              <span className="reveal-hint">Sirf Apke liye likha hai...</span>
            </div>
          )}
        </div>

        <div className="letter-dates">
          <span className="letter-date-pill">🗓️ 20 June 2022</span>
          <div className="letter-dots">
            {[0,1,2,3,4].map(i=>(
              <span key={i} className="ldot" style={{animationDelay:`${i*0.15}s`}}/>
            ))}
          </div>
          <span className="letter-date-pill">✨ 2026 & Beyond</span>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// PARTICLES
// ============================================================
function ParticleBg(){
  return(
    <div className="particle-bg">
      {PARTICLES.map(p=>(
        <span key={p.id} className="particle" style={{
          left:p.left,fontSize:p.size,
          animationDuration:p.dur,animationDelay:p.delay,
        }}>{p.emoji}</span>
      ))}
    </div>
  );
}

// ============================================================
// APP
// ============================================================
export default function App(){
  const [active,setActive]=useState("hero");

  const go=useCallback((id)=>{
    document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
    setActive(id);
  },[]);

  useEffect(()=>{
    const style=document.createElement("style");
    style.textContent=GLOBAL_CSS;
    document.head.appendChild(style);
    return()=>document.head.removeChild(style);
  },[]);

  useEffect(()=>{
    const sections=["hero","timeline","letter"];
    const obs=new IntersectionObserver(
      (entries)=>entries.forEach(e=>{if(e.isIntersecting)setActive(e.target.id);}),
      {threshold:0.4}
    );
    sections.forEach(id=>{const el=document.getElementById(id);if(el)obs.observe(el);});
    return()=>obs.disconnect();
  },[]);

  return(
    <>
      <Cursor/>
      <ParticleBg/>
      <Nav go={go} active={active}/>
      <MusicPlayer/>
      <main>
        <HeroPage go={go}/>
        <TimelinePage/>
        <LetterPage/>
      </main>
    </>
  );
}