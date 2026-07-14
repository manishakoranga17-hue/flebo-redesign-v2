/* ============================================================
   Flebo — shared Login/Signup popup modal (brand carousel + form)
   Drop-in: <script src="login-modal.js" defer></script>
   Intercepts any link to login.html and opens this popup instead.
   login.html stays as a no-JS fallback.
   ============================================================ */
(function () {
  'use strict';
  if (window.__fleboLoginModal) return;        // idempotent
  window.__fleboLoginModal = true;

  /* ---------- styles (scoped with .lm- prefix, shared tokens w/ fallbacks) ---------- */
  var css = '\
  #lmOverlay{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;\
    padding:20px;background:rgba(6,9,18,.66);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);}\
  #lmOverlay.is-open{display:flex;animation:lmFade .18s ease;}\
  @keyframes lmFade{from{opacity:0}to{opacity:1}}\
  .lm-card{position:relative;width:100%;max-width:900px;max-height:92vh;display:grid;grid-template-columns:1.05fr 1fr;\
    background:#fff;border-radius:22px;overflow:hidden;border:1px solid rgba(255,255,255,.16);\
    box-shadow:0 30px 90px rgba(0,0,0,.55),0 0 0 1px rgba(0,0,0,.2);\
    font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--text-primary,#0B1530);\
    animation:lmPop .2s cubic-bezier(.2,.8,.3,1);}\
  @keyframes lmPop{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}\
  .lm-close{position:absolute;top:14px;right:14px;z-index:3;width:34px;height:34px;border:0;border-radius:50%;\
    background:var(--bg-soft,#F7F8FB);color:var(--text-muted,#6B7592);font-size:16px;cursor:pointer;\
    display:inline-flex;align-items:center;justify-content:center;transition:background .15s,color .15s;}\
  .lm-close:hover{background:#ECEFF6;color:var(--text-primary,#0B1530);}\
  /* ----- LEFT: brand carousel ----- */\
  .lm-left{position:relative;background:#1F2A5F url("b-hero3.jpeg") center/cover no-repeat;color:#fff;\
    display:flex;flex-direction:column;padding:32px 36px;overflow:hidden;}\
  .lm-left::before{content:"";position:absolute;inset:0;pointer-events:none;\
    background:radial-gradient(circle at 80% 110%,rgba(211,53,53,.35) 0%,transparent 55%),\
    linear-gradient(180deg,rgba(11,21,48,.65) 0%,rgba(15,22,60,.80) 100%);}\
  .lm-left-inner{position:relative;z-index:1;display:flex;flex-direction:column;height:100%;}\
  .lm-brand{display:inline-flex;align-items:center;gap:12px;margin-bottom:auto;}\
  .lm-brand img{height:38px;width:auto;filter:brightness(0) invert(1);}\
  .lm-brand-rating{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.15);\
    border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:4px 10px;font-size:12px;font-weight:700;}\
  .lm-brand-rating i{color:#F6B100;font-size:11px;}\
  .lm-carousel{position:relative;margin:36px 0 28px;min-height:248px;}\
  .lm-slide{position:absolute;inset:0;opacity:0;transform:translateY(12px);transition:opacity .5s ease,transform .5s ease;pointer-events:none;}\
  .lm-slide.is-active{opacity:1;transform:none;pointer-events:auto;position:relative;}\
  .lm-slide-eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:800;\
    color:rgba(255,255,255,.78);letter-spacing:.14em;text-transform:uppercase;margin-bottom:14px;}\
  .lm-slide-eyebrow .dot{width:6px;height:6px;border-radius:50%;background:#21C669;}\
  .lm-slide-icon{width:50px;height:50px;border-radius:14px;background:rgba(255,255,255,.14);\
    border:1px solid rgba(255,255,255,.25);display:inline-flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:18px;}\
  .lm-slide-title{font-family:"Instrument Serif",serif;font-size:34px;font-weight:400;letter-spacing:-.01em;line-height:1.06;margin-bottom:12px;}\
  .lm-slide-sub{font-size:15px;color:rgba(255,255,255,.85);line-height:1.5;margin-bottom:22px;}\
  .lm-slide-stats{display:flex;gap:24px;flex-wrap:wrap;}\
  .lm-slide-stat-num{font-family:"Plus Jakarta Sans",sans-serif;font-size:22px;font-weight:800;color:#fff;letter-spacing:-.01em;line-height:1;}\
  .lm-slide-stat-key{font-size:11px;color:rgba(255,255,255,.7);margin-top:5px;}\
  .lm-carousel-controls{margin-top:auto;display:flex;align-items:center;gap:16px;}\
  .lm-dot-row{display:inline-flex;gap:8px;}\
  .lm-dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.25);border:0;padding:0;cursor:pointer;transition:background .2s,width .25s;}\
  .lm-dot.is-active{background:#fff;width:22px;border-radius:999px;}\
  .lm-arrow{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);\
    color:#fff;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;transition:background .2s;}\
  .lm-arrow:hover{background:rgba(255,255,255,.22);}\
  .lm-arrow.is-prev{margin-left:auto;}\
  /* ----- RIGHT: form ----- */\
  .lm-right{position:relative;background:#fff;padding:38px 36px 30px;overflow-y:auto;max-height:92vh;}\
  .lm-help{font-size:13px;color:var(--text-muted,#6B7592);margin-bottom:18px;}\
  .lm-help a{color:var(--accent,#D33535);font-weight:700;}\
  .lm-eyebrow{font-size:13px;font-weight:800;color:var(--accent,#D33535);letter-spacing:.12em;text-transform:uppercase;}\
  .lm-title{font-family:"Instrument Serif",serif;font-size:30px;font-weight:400;color:var(--text-primary,#0B1530);line-height:1.12;letter-spacing:-.01em;margin:6px 0 6px;}\
  .lm-sub{font-size:15px;color:var(--text-muted,#6B7592);margin-bottom:24px;line-height:1.45;}\
  .lm-phone-row{display:flex;align-items:center;border:1.5px solid var(--border-mid,#C5CCDB);border-radius:var(--radius-md,12px);overflow:hidden;transition:border-color .15s,box-shadow .15s;}\
  .lm-phone-row:focus-within{border-color:var(--primary,#1B2A5B);box-shadow:0 0 0 4px rgba(27,42,91,.08);}\
  .lm-country{display:inline-flex;align-items:center;gap:8px;padding:0 14px;align-self:stretch;border-right:1.5px solid var(--border-soft,#E5E9F3);background:var(--bg-soft,#F7F8FB);font-size:15px;font-weight:700;}\
  .lm-flag{width:22px;height:16px;border-radius:3px;overflow:hidden;display:inline-block;flex-shrink:0;position:relative;background:linear-gradient(180deg,#FF9933 33%,#FFF 33%,#FFF 66%,#138808 66%);}\
  .lm-flag::after{content:"";position:absolute;left:50%;top:50%;width:4px;height:4px;margin:-2px 0 0 -2px;border-radius:50%;background:#000080;}\
  .lm-phone-input{flex:1;min-width:0;height:54px;padding:0 16px;border:0;outline:0;font:inherit;font-size:16px;font-weight:600;color:var(--text-primary,#0B1530);letter-spacing:.04em;background:#fff;}\
  .lm-phone-input::placeholder{color:var(--text-muted,#6B7592);font-weight:500;letter-spacing:.02em;}\
  .lm-error{display:none;align-items:center;gap:6px;font-size:13px;color:var(--accent,#D33535);margin-top:8px;}\
  .lm-error.is-show{display:inline-flex;}\
  .lm-cta{width:100%;height:54px;background:var(--accent,#D33535);color:#fff;border:0;border-radius:999px;font:inherit;font-size:16px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:10px;margin-top:20px;transition:background .2s,transform .15s;box-shadow:0 6px 20px rgba(211,53,53,.25);}\
  .lm-cta:hover:not(:disabled){background:var(--accent-dark,#B82E2E);transform:translateY(-1px);}\
  .lm-cta:disabled{background:#E5A7A7;cursor:not-allowed;box-shadow:none;}\
  .lm-divider{display:flex;align-items:center;gap:14px;font-size:12px;font-weight:700;color:var(--text-muted,#6B7592);letter-spacing:.06em;text-transform:uppercase;margin:24px 0 16px;}\
  .lm-divider::before,.lm-divider::after{content:"";flex:1;height:1px;background:var(--border-soft,#E5E9F3);}\
  .lm-social{display:grid;grid-template-columns:1fr 1fr;gap:10px;}\
  .lm-social-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;height:46px;border:1.5px solid var(--border-mid,#C5CCDB);border-radius:var(--radius-md,12px);background:#fff;font:inherit;font-size:14px;font-weight:700;color:var(--text-primary,#0B1530);cursor:pointer;transition:border-color .15s,background .15s;}\
  .lm-social-btn:hover{border-color:var(--primary,#1B2A5B);background:var(--bg-soft,#F7F8FB);}\
  .lm-social-btn i{font-size:17px;}\
  .lm-social-btn[data-prov="google"] i{color:#4285F4;}\
  .lm-terms{font-size:12px;color:var(--text-muted,#6B7592);text-align:center;margin-top:20px;line-height:1.5;}\
  .lm-terms a{color:var(--primary,#1B2A5B);font-weight:700;}\
  .lm-step{display:none;}\
  .lm-step.is-active{display:block;}\
  .lm-otp-phone{display:flex;align-items:center;gap:10px;background:var(--bg-soft,#F7F8FB);border-radius:var(--radius-md,12px);padding:11px 14px;font-size:14px;margin-bottom:18px;}\
  .lm-otp-phone b{font-weight:700;font-family:"Plus Jakarta Sans",sans-serif;letter-spacing:.04em;}\
  .lm-otp-change{margin-left:auto;background:0;border:0;color:var(--accent,#D33535);font:inherit;font-size:13px;font-weight:700;cursor:pointer;}\
  .lm-otp-change:hover{text-decoration:underline;}\
  .lm-otp-boxes{display:flex;gap:10px;margin-bottom:18px;}\
  .lm-otp-box{flex:1 1 0;min-width:0;height:58px;border:1.5px solid var(--border-mid,#C5CCDB);border-radius:var(--radius-md,12px);background:#fff;font:inherit;font-size:22px;font-weight:800;text-align:center;color:var(--text-primary,#0B1530);outline:0;font-family:"Plus Jakarta Sans",sans-serif;transition:border-color .15s,box-shadow .15s;}\
  .lm-otp-box:focus{border-color:var(--primary,#1B2A5B);box-shadow:0 0 0 4px rgba(27,42,91,.08);}\
  .lm-otp-box.is-filled{border-color:var(--green,#1B8A5A);}\
  .lm-otp-box.is-error{border-color:var(--accent,#D33535);animation:lmShake .4s;}\
  @keyframes lmShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}\
  .lm-resend{display:flex;align-items:center;justify-content:space-between;font-size:14px;}\
  .lm-resend-key{color:var(--text-muted,#6B7592);}\
  .lm-resend-cta{background:0;border:0;color:var(--accent,#D33535);font:inherit;font-size:14px;font-weight:700;cursor:pointer;}\
  .lm-resend-cta:disabled{color:var(--text-muted,#6B7592);cursor:not-allowed;}\
  .lm-resend-timer{font-family:"Plus Jakarta Sans",sans-serif;font-weight:700;color:var(--primary,#1B2A5B);}\
  body.lm-locked{overflow:hidden;}\
  /* ----- logged-in profile dropdown ----- */\
  .lm-authed{cursor:pointer;}\
  .lm-wallet{display:inline-flex;align-items:center;gap:8px;font:inherit;font-size:12.5px;font-weight:800;color:#fff;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.17);border-radius:12px;padding:3px 18px 3px 5px;margin-right:12px;cursor:pointer;line-height:1;white-space:nowrap;vertical-align:middle;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);transition:background .16s ease,border-color .16s ease;}\
  .lm-wallet:hover{background:rgba(255,255,255,.18);border-color:rgba(255,255,255,.32);}\
  .lm-wallet-coin{width:17px;height:17px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;background:radial-gradient(circle at 34% 30%,#FFF3C4 0%,#FFD75E 40%,#EFAE2C 72%,#D28F19 100%);border:1px solid #BE820E;box-shadow:0 1px 3px rgba(150,100,15,.55),inset 0 1px 1.5px rgba(255,255,255,.75),inset 0 -1.5px 1.5px rgba(140,90,10,.5);color:#8A5A0A;font-size:9px;font-weight:900;text-shadow:0 1px 0 rgba(255,255,255,.4);}\
  .lm-wallet-lbl{color:rgba(255,255,255,.72);font-weight:600;}\
  .lm-wallet b{color:#fff;font-weight:800;letter-spacing:.01em;}\
  @media (max-width:560px){.lm-wallet{margin-right:8px;padding:3px 14px 3px 5px;gap:6px;}.lm-wallet-lbl{display:none;}}\
  .lm-menu{position:fixed;z-index:10001;min-width:238px;max-width:290px;background:#fff;border:1px solid var(--border-soft,#E5E9F3);\
    border-radius:14px;box-shadow:0 18px 50px rgba(11,21,48,.22);padding:6px;display:none;\
    font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}\
  .lm-menu.is-open{display:block;animation:lmPop .16s ease;}\
  .lm-menu-head{display:flex;align-items:center;gap:10px;padding:10px 10px 12px;margin-bottom:4px;border-bottom:1px solid var(--border-soft,#E5E9F3);}\
  .lm-menu-avatar{width:38px;height:38px;border-radius:50%;background:var(--primary,#1B2A5B);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}\
  .lm-menu-name{font-size:14px;font-weight:700;color:var(--text-primary,#0B1530);line-height:1.2;}\
  .lm-menu-phone{font-size:12px;color:var(--text-muted,#6B7592);margin-top:1px;}\
  .lm-menu-item{display:flex;align-items:center;gap:12px;width:100%;padding:10px 10px;border:0;background:0;border-radius:9px;\
    font:inherit;font-size:14px;font-weight:600;color:var(--text-primary,#0B1530);cursor:pointer;text-align:left;}\
  .lm-menu-item:hover{background:var(--bg-soft,#F7F8FB);}\
  .lm-menu-item i{width:18px;text-align:center;font-size:14px;color:var(--text-muted,#6B7592);}\
  .lm-menu-sep{height:1px;background:var(--border-soft,#E5E9F3);margin:6px 4px;}\
  .lm-menu-item.is-logout,.lm-menu-item.is-logout i{color:var(--accent,#D33535);}\
  /* ----- mobile nav drawer (hamburger) ----- */\
  .main-nav.lmnav-open{display:flex !important;position:absolute;top:100%;left:0;right:0;flex-direction:column;align-items:stretch;\
    background:#fff;border-top:1px solid var(--border-soft,#E5E9F3);box-shadow:0 18px 36px rgba(11,21,48,.16);padding:8px;z-index:250;max-height:74vh;overflow-y:auto;}\
  .main-nav.lmnav-open .main-nav-list{flex-direction:column;width:100%;gap:2px;}\
  .main-nav.lmnav-open .main-nav-list li{width:100%;}\
  .main-nav.lmnav-open .main-nav-link{width:100%;padding:13px 14px;border-radius:10px;font-size:15px;}\
  .main-nav.lmnav-open .main-nav-link::before{content:none !important;}\
  .main-nav.lmnav-open .main-nav-link:hover{background:var(--bg-soft,#F7F8FB);}\
  .hamburger-btn.lmnav-active{background:var(--primary,#1B2A5B);color:#fff;}\
  /* account items injected into the mobile drawer (logged in) */\
  .lmnav-acct{display:none;}\
  .main-nav.lmnav-open .lmnav-acct{display:block;width:100%;}\
  .main-nav.lmnav-open .lmnav-acct-head{padding:12px 14px 4px;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--text-muted,#6B7592);}\
  .main-nav.lmnav-open .lmnav-acct-sep{height:1px;background:var(--border-soft,#E5E9F3);margin:8px 6px;padding:0;}\
  .main-nav.lmnav-open .lmnav-acct .main-nav-link.is-logout,.main-nav.lmnav-open .lmnav-acct .main-nav-link.is-logout i{color:var(--accent,#D33535);}\
  @media (max-width:820px){.lm-card{grid-template-columns:1fr;max-width:440px;}.lm-left{display:none;}.lm-right{max-height:92vh;}}\
  @media (max-width:520px){.lm-right{padding:32px 20px 24px;}.lm-title{font-size:26px;}.lm-social{grid-template-columns:1fr;}}';

  var styleEl = document.createElement('style');
  styleEl.id = 'lmStyles';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ---------- markup ---------- */
  var overlay = document.createElement('div');
  overlay.id = 'lmOverlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = '\
  <div class="lm-card" role="document">\
    <button class="lm-close" id="lmClose" aria-label="Close login">✕</button>\
    <div class="lm-left">\
      <div class="lm-left-inner">\
        <div class="lm-brand">\
          <img src="flebo-logo.svg" alt="Flebo.in">\
          <span class="lm-brand-rating"><i class="fas fa-star"></i><span>4.9 · 33,434 reviews</span></span>\
        </div>\
        <div class="lm-carousel" id="lmCarousel">\
          <div class="lm-slide is-active">\
            <span class="lm-slide-eyebrow"><span class="dot"></span><span>Any test, any lab</span></span>\
            <span class="lm-slide-icon"><i class="fas fa-flask-vial"></i></span>\
            <h3 class="lm-slide-title">Find any test across 200+ trusted labs.</h3>\
            <p class="lm-slide-sub">Compare prices, ratings and distance side by side. Pick what’s best for you — pathology, radiology, packages, the works.</p>\
            <div class="lm-slide-stats">\
              <div><div class="lm-slide-stat-num">200+</div><div class="lm-slide-stat-key">Partner labs</div></div>\
              <div><div class="lm-slide-stat-num">5,000+</div><div class="lm-slide-stat-key">Tests &amp; packages</div></div>\
              <div><div class="lm-slide-stat-num">42</div><div class="lm-slide-stat-key">Cities</div></div>\
            </div>\
          </div>\
          <div class="lm-slide">\
            <span class="lm-slide-eyebrow"><span class="dot"></span><span>Home collection</span></span>\
            <span class="lm-slide-icon"><i class="fas fa-house-medical"></i></span>\
            <h3 class="lm-slide-title">A certified phlebotomist at your doorstep.</h3>\
            <p class="lm-slide-sub">Pick a slot from 6 AM to 9 PM — free home collection, sealed tamper-proof boxes, and real-time technician tracking.</p>\
            <div class="lm-slide-stats">\
              <div><div class="lm-slide-stat-num">FREE</div><div class="lm-slide-stat-key">Home collection</div></div>\
              <div><div class="lm-slide-stat-num">6 AM</div><div class="lm-slide-stat-key">Earliest slot</div></div>\
              <div><div class="lm-slide-stat-num">5 min</div><div class="lm-slide-stat-key">Avg. collection</div></div>\
            </div>\
          </div>\
          <div class="lm-slide">\
            <span class="lm-slide-eyebrow"><span class="dot"></span><span>Fast reports</span></span>\
            <span class="lm-slide-icon"><i class="fas fa-folder-open"></i></span>\
            <h3 class="lm-slide-title">Reports in your dashboard within 18 hours.</h3>\
            <p class="lm-slide-sub">Get digital reports on email, WhatsApp, and the app. Share with family, track trends over time, and unlock AI-powered insights.</p>\
            <div class="lm-slide-stats">\
              <div><div class="lm-slide-stat-num">18 hrs</div><div class="lm-slide-stat-key">Avg. turnaround</div></div>\
              <div><div class="lm-slide-stat-num">∞</div><div class="lm-slide-stat-key">Storage</div></div>\
              <div><div class="lm-slide-stat-num">AI</div><div class="lm-slide-stat-key">Free analysis</div></div>\
            </div>\
          </div>\
          <div class="lm-slide">\
            <span class="lm-slide-eyebrow"><span class="dot"></span><span>Real savings</span></span>\
            <span class="lm-slide-icon"><i class="fas fa-piggy-bank"></i></span>\
            <h3 class="lm-slide-title">50% cashback on every booking, every time.</h3>\
            <p class="lm-slide-sub">Cashback credits to your Flebo wallet after every report. Stack with coupons up to 20% off and free home collection — savings designed to compound.</p>\
            <div class="lm-slide-stats">\
              <div><div class="lm-slide-stat-num">50%</div><div class="lm-slide-stat-key">Cashback</div></div>\
              <div><div class="lm-slide-stat-num">₹500</div><div class="lm-slide-stat-key">Avg. saving</div></div>\
              <div><div class="lm-slide-stat-num">4.9 ★</div><div class="lm-slide-stat-key">User rating</div></div>\
            </div>\
          </div>\
        </div>\
        <div class="lm-carousel-controls">\
          <button class="lm-arrow is-prev" id="lmPrev" aria-label="Previous slide"><i class="fas fa-arrow-left"></i></button>\
          <div class="lm-dot-row" id="lmDotRow"></div>\
          <button class="lm-arrow" id="lmNext" aria-label="Next slide"><i class="fas fa-arrow-right"></i></button>\
        </div>\
      </div>\
    </div>\
    <div class="lm-right">\
      <p class="lm-help">Need help? <a href="tel:01244550000">0124-4550000</a></p>\
      <section class="lm-step is-active" id="lmPhoneStep">\
        <div class="lm-eyebrow">Login or Sign up</div>\
        <h2 class="lm-title">Welcome to Flebo.</h2>\
        <p class="lm-sub">Enter your mobile number — we’ll send a 6-digit OTP to verify.</p>\
        <div class="lm-phone-row">\
          <span class="lm-country"><span class="lm-flag" aria-hidden="true"></span><span>+91</span></span>\
          <input id="lmPhone" class="lm-phone-input" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="98765 43210" maxlength="16" aria-label="Mobile number">\
        </div>\
        <div class="lm-error" id="lmPhoneError"><i class="fas fa-circle-exclamation"></i><span>Please enter a valid 10-digit mobile number.</span></div>\
        <button class="lm-cta" id="lmSend" disabled><span>Send OTP</span><i class="fas fa-arrow-right"></i></button>\
        <div class="lm-divider">or continue with</div>\
        <div class="lm-social">\
          <button class="lm-social-btn" data-prov="google"><i class="fab fa-google"></i> Google</button>\
          <button class="lm-social-btn" data-prov="apple"><i class="fab fa-apple"></i> Apple</button>\
        </div>\
        <p class="lm-terms">By continuing, you agree to Flebo’s <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</p>\
      </section>\
      <section class="lm-step" id="lmOtpStep">\
        <div class="lm-eyebrow">OTP verification</div>\
        <h2 class="lm-title">Enter the 6-digit code.</h2>\
        <p class="lm-sub">We’ve sent a one-time code to your number. It’s valid for 10 minutes.</p>\
        <div class="lm-otp-phone">\
          <i class="fas fa-mobile-screen" style="color:var(--text-muted,#6B7592)"></i>\
          <span>OTP sent to <b id="lmOtpPhone">+91 98765 43210</b></span>\
          <button class="lm-otp-change" id="lmChange">Change</button>\
        </div>\
        <div class="lm-otp-boxes" id="lmOtpBoxes">\
          <input class="lm-otp-box" type="tel" inputmode="numeric" maxlength="1" aria-label="OTP digit 1">\
          <input class="lm-otp-box" type="tel" inputmode="numeric" maxlength="1" aria-label="OTP digit 2">\
          <input class="lm-otp-box" type="tel" inputmode="numeric" maxlength="1" aria-label="OTP digit 3">\
          <input class="lm-otp-box" type="tel" inputmode="numeric" maxlength="1" aria-label="OTP digit 4">\
          <input class="lm-otp-box" type="tel" inputmode="numeric" maxlength="1" aria-label="OTP digit 5">\
          <input class="lm-otp-box" type="tel" inputmode="numeric" maxlength="1" aria-label="OTP digit 6">\
        </div>\
        <div class="lm-error" id="lmOtpError"><i class="fas fa-circle-exclamation"></i><span>Please enter the complete 6-digit code.</span></div>\
        <button class="lm-cta" id="lmVerify" disabled><span>Verify &amp; continue</span><i class="fas fa-circle-check"></i></button>\
        <div class="lm-resend" style="margin-top:18px">\
          <span class="lm-resend-key">Didn’t receive the code?</span>\
          <button class="lm-resend-cta" id="lmResend" disabled><span id="lmResendLabel">Resend in <span class="lm-resend-timer">0:30</span></span></button>\
        </div>\
      </section>\
    </div>\
  </div>';
  document.body.appendChild(overlay);

  /* ---------- refs ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var phoneStep = $('lmPhoneStep'), otpStep = $('lmOtpStep');
  var phoneInput = $('lmPhone'), sendBtn = $('lmSend'), phoneError = $('lmPhoneError');
  var otpBoxes = overlay.querySelectorAll('.lm-otp-box');
  var verifyBtn = $('lmVerify'), otpError = $('lmOtpError');
  var resendBtn = $('lmResend'), resendLabel = $('lmResendLabel');
  var resendInterval, lastTrigger = null;

  /* ---------- helpers ---------- */
  function normalizePhone(raw) {
    var d = (raw || '').replace(/\D/g, '');
    if (d.length > 10 && d.indexOf('91') === 0) d = d.slice(2);
    d = d.replace(/^0+/, '');
    return d.slice(0, 10);
  }
  function formatPhone(d) { return d.length > 5 ? d.slice(0, 5) + ' ' + d.slice(5) : d; }
  function getDigits() { return normalizePhone(phoneInput.value); }
  function fullDisplay() { return '+91 ' + formatPhone(getDigits()); }
  function showError(el) { el.classList.add('is-show'); }
  function hideError(el) { el.classList.remove('is-show'); }

  /* ---------- carousel ---------- */
  var slides = overlay.querySelectorAll('.lm-slide');
  var dotRow = $('lmDotRow');
  var cIdx = 0, autoTimer = null;
  slides.forEach(function (_, i) {
    var d = document.createElement('button');
    d.className = 'lm-dot' + (i === 0 ? ' is-active' : '');
    d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    d.addEventListener('click', function () { goSlide(i, true); });
    dotRow.appendChild(d);
  });
  function goSlide(n, user) {
    cIdx = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) { s.classList.toggle('is-active', i === cIdx); });
    dotRow.querySelectorAll('.lm-dot').forEach(function (d, i) { d.classList.toggle('is-active', i === cIdx); });
    if (user) restartAuto();
  }
  function startAuto() { clearInterval(autoTimer); autoTimer = setInterval(function () { goSlide(cIdx + 1); }, 5000); }
  function restartAuto() { startAuto(); }
  function stopAuto() { clearInterval(autoTimer); autoTimer = null; }
  $('lmPrev').addEventListener('click', function () { goSlide(cIdx - 1, true); });
  $('lmNext').addEventListener('click', function () { goSlide(cIdx + 1, true); });

  /* ---------- open / close ---------- */
  function open(trigger) {
    lastTrigger = trigger || null;
    resetToPhone();
    overlay.classList.add('is-open');
    document.body.classList.add('lm-locked');
    startAuto();
    setTimeout(function () { phoneInput.focus(); }, 60);
  }
  function close() {
    overlay.classList.remove('is-open');
    document.body.classList.remove('lm-locked');
    clearInterval(resendInterval);
    stopAuto();
  }
  function resetToPhone() {
    phoneStep.classList.add('is-active');
    otpStep.classList.remove('is-active');
    hideError(phoneError); hideError(otpError);
    sendBtn.disabled = getDigits().length !== 10;
    otpBoxes.forEach(function (b) { b.value = ''; b.classList.remove('is-filled', 'is-error'); });
    verifyBtn.disabled = true;
  }

  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  $('lmClose').addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
  });
  document.addEventListener('visibilitychange', function () {
    if (!overlay.classList.contains('is-open')) return;
    if (document.hidden) stopAuto(); else startAuto();
  });

  /* ---------- phone step ---------- */
  function handlePhoneInput() {
    var d = getDigits();
    phoneInput.value = formatPhone(d);
    sendBtn.disabled = d.length !== 10;
    hideError(phoneError);
  }
  phoneInput.addEventListener('input', handlePhoneInput);
  phoneInput.addEventListener('change', handlePhoneInput); // catches autofill
  phoneInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !sendBtn.disabled) sendOtp();
  });
  sendBtn.addEventListener('click', sendOtp);

  function sendOtp() {
    if (getDigits().length !== 10) { showError(phoneError); return; }
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending OTP…';
    setTimeout(function () {
      $('lmOtpPhone').textContent = fullDisplay();
      phoneStep.classList.remove('is-active');
      otpStep.classList.add('is-active');
      sendBtn.innerHTML = '<span>Send OTP</span><i class="fas fa-arrow-right"></i>';
      sendBtn.disabled = false;
      startResend();
      otpBoxes[0].focus();
    }, 600);
  }

  /* ---------- otp step ---------- */
  otpBoxes.forEach(function (box, i) {
    box.addEventListener('input', function (e) {
      var v = e.target.value.replace(/\D/g, '').slice(0, 1);
      e.target.value = v;
      box.classList.toggle('is-filled', !!v);
      box.classList.remove('is-error');
      hideError(otpError);
      if (v && i < otpBoxes.length - 1) otpBoxes[i + 1].focus();
      syncVerify();
    });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && !box.value && i > 0) {
        otpBoxes[i - 1].focus(); otpBoxes[i - 1].value = ''; otpBoxes[i - 1].classList.remove('is-filled');
        syncVerify();
      } else if (e.key === 'ArrowLeft' && i > 0) otpBoxes[i - 1].focus();
      else if (e.key === 'ArrowRight' && i < otpBoxes.length - 1) otpBoxes[i + 1].focus();
      else if (e.key === 'Enter' && !verifyBtn.disabled) verifyOtp();
    });
    box.addEventListener('paste', function (e) {
      var text = (e.clipboardData || window.clipboardData).getData('text');
      var digits = text.replace(/\D/g, '').slice(0, otpBoxes.length);
      if (!digits) return;
      e.preventDefault();
      digits.split('').forEach(function (d, di) {
        if (otpBoxes[di]) { otpBoxes[di].value = d; otpBoxes[di].classList.add('is-filled'); }
      });
      otpBoxes[Math.min(digits.length, otpBoxes.length) - 1].focus();
      syncVerify();
    });
  });
  function syncVerify() {
    verifyBtn.disabled = !Array.prototype.every.call(otpBoxes, function (b) { return b.value.length === 1; });
  }
  verifyBtn.addEventListener('click', verifyOtp);

  function verifyOtp() {
    var code = Array.prototype.map.call(otpBoxes, function (b) { return b.value; }).join('');
    if (!/^\d{6}$/.test(code)) {
      otpBoxes.forEach(function (b) { b.classList.add('is-error'); });
      showError(otpError); return;
    }
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying…';
    setTimeout(function () {
      verifyBtn.innerHTML = '<i class="fas fa-circle-check"></i> Logged in';
      verifyBtn.style.background = 'var(--green,#1B8A5A)';
      verifyBtn.style.boxShadow = '0 6px 20px rgba(27,138,90,.3)';
      try {
        localStorage.setItem('flebo:loggedIn', '1');
        localStorage.setItem('flebo:phone', getDigits());
      } catch (e) {}
      reflectLoggedIn();
      setTimeout(close, 750);
    }, 700);
  }

  $('lmChange').addEventListener('click', function () {
    otpStep.classList.remove('is-active');
    phoneStep.classList.add('is-active');
    clearInterval(resendInterval);
    otpBoxes.forEach(function (b) { b.value = ''; b.classList.remove('is-filled', 'is-error'); });
    hideError(otpError); hideError(phoneError);
    sendBtn.disabled = getDigits().length !== 10;
    phoneInput.focus();
  });

  function startResend() {
    var s = 30;
    resendBtn.disabled = true;
    resendLabel.innerHTML = 'Resend in <span class="lm-resend-timer">0:' + String(s).padStart(2, '0') + '</span>';
    clearInterval(resendInterval);
    resendInterval = setInterval(function () {
      s--;
      if (s <= 0) { clearInterval(resendInterval); resendBtn.disabled = false; resendLabel.textContent = 'Resend code'; }
      else resendLabel.innerHTML = 'Resend in <span class="lm-resend-timer">0:' + String(s).padStart(2, '0') + '</span>';
    }, 1000);
  }
  resendBtn.addEventListener('click', function () { if (!resendBtn.disabled) startResend(); });

  overlay.querySelectorAll('.lm-social-btn').forEach(function (b) {
    b.addEventListener('click', function () { /* placeholder — social sign-in */ });
  });

  /* ---------- logged-in profile dropdown ---------- */
  var MENU_ITEMS = [
    { label: 'View Reports', icon: 'fa-file-lines', href: 'reports.html' },
    { label: 'My Bookings', icon: 'fa-calendar-check', href: 'bookings.html' },
    { label: 'Health Trend Graph', icon: 'fa-chart-line', href: 'health-trends.html' },
    { label: 'BMI Calculator', icon: 'fa-calculator', href: 'bmi.html' },
    { label: 'Referral & Earning', icon: 'fa-gift', href: 'referral.html' },
    { label: 'Address Book', icon: 'fa-address-book', href: 'address-book.html' },
    { label: 'My Profiles', icon: 'fa-id-card', href: 'profiles.html' },
    { label: 'My Wallet', icon: 'fa-wallet', href: 'wallet.html' }
  ];
  var menu = document.createElement('div');
  menu.id = 'lmMenu';
  menu.className = 'lm-menu';
  menu.setAttribute('role', 'menu');
  menu.innerHTML =
    '<div class="lm-menu-head"><span class="lm-menu-avatar"><i class="fas fa-user"></i></span>' +
    '<div><div class="lm-menu-name">My account</div><div class="lm-menu-phone" id="lmMenuPhone"></div></div></div>' +
    MENU_ITEMS.map(function (m) {
      return '<button class="lm-menu-item" role="menuitem"' + (m.href ? ' data-href="' + m.href + '"' : '') + '><i class="fas ' + m.icon + '"></i> ' + m.label + '</button>';
    }).join('') +
    '<div class="lm-menu-sep"></div>' +
    '<button class="lm-menu-item is-logout" role="menuitem" data-action="logout"><i class="fas fa-right-from-bracket"></i> Logout</button>';
  document.body.appendChild(menu);
  var menuOpen = false;

  function isLoggedIn() { try { return localStorage.getItem('flebo:loggedIn') === '1'; } catch (e) { return false; } }
  function loginTriggers() { return document.querySelectorAll('.top-bar-login, a[href$="login.html"], a[href*="login.html?"], [data-login-trigger]'); }

  function walletBalance() {
    try { return localStorage.getItem('flebo:wallet') || '250'; } catch (e) { return '250'; }
  }

  // Mirror the profile-dropdown items into the mobile hamburger drawer when logged in
  function syncNavAccount() {
    var list = document.querySelector('.main-nav .main-nav-list');
    if (!list) return;
    Array.prototype.slice.call(list.querySelectorAll('.lmnav-acct')).forEach(function (el) { el.remove(); });
    if (!isLoggedIn()) return;
    var html = '<li class="lmnav-acct lmnav-acct-sep" aria-hidden="true"></li>' +
      '<li class="lmnav-acct lmnav-acct-head">My account</li>' +
      MENU_ITEMS.map(function (m) {
        return '<li class="lmnav-acct"><a class="main-nav-link" href="' + m.href + '"><i class="fas ' + m.icon + '"></i><span>' + m.label + '</span></a></li>';
      }).join('') +
      '<li class="lmnav-acct"><a class="main-nav-link is-logout" href="#" data-action="logout"><i class="fas fa-right-from-bracket"></i><span>Logout</span></a></li>';
    list.insertAdjacentHTML('beforeend', html);
  }

  function reflectLoggedIn() {
    var on = isLoggedIn(), phone;
    try { phone = localStorage.getItem('flebo:phone'); } catch (e) {}
    loginTriggers().forEach(function (t) {
      var span = t.querySelector('span'), ic = t.querySelector('i');
      if (on && phone) {
        t.classList.add('lm-authed');
        if (span) span.textContent = '+91 ' + formatPhone(phone);
        if (ic) ic.className = 'fas fa-circle-user';
      } else {
        t.classList.remove('lm-authed');
        if (span) span.textContent = 'Login / Signup';
        if (ic) ic.className = 'fas fa-user';
      }
      // Wallet pill shown next to the user name once logged in
      if (t.parentNode) {
        var wallet = t.parentNode.querySelector('.lm-wallet');
        if (on && phone) {
          if (!wallet) {
            wallet = document.createElement('button');
            wallet.type = 'button';
            wallet.className = 'lm-wallet';
            wallet.addEventListener('click', function (ev) { ev.preventDefault(); ev.stopPropagation(); location.href = 'wallet.html'; });
            t.parentNode.insertBefore(wallet, t);
          }
          wallet.innerHTML = '<span class="lm-wallet-coin" aria-hidden="true">₹</span> <span class="lm-wallet-lbl">Wallet</span> <b>₹' + walletBalance() + '</b>';
          wallet.setAttribute('aria-label', 'Wallet balance ₹' + walletBalance());
          wallet.style.display = '';
        } else if (wallet) {
          wallet.style.display = 'none';
        }
      }
    });
    syncNavAccount();
  }

  function openMenu(trigger) {
    var phone; try { phone = localStorage.getItem('flebo:phone'); } catch (e) {}
    document.getElementById('lmMenuPhone').textContent = phone ? '+91 ' + formatPhone(phone) : '';
    var r = trigger.getBoundingClientRect();
    menu.style.top = (r.bottom + 8) + 'px';
    menu.style.left = 'auto';
    menu.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
    menu.classList.add('is-open');
    menuOpen = true;
  }
  function closeMenu() { menu.classList.remove('is-open'); menuOpen = false; }

  function logout() {
    try { localStorage.removeItem('flebo:loggedIn'); localStorage.removeItem('flebo:phone'); } catch (e) {}
    reflectLoggedIn();
  }

  menu.addEventListener('click', function (e) {
    var item = e.target.closest('.lm-menu-item');
    if (!item) return;
    if (item.getAttribute('data-action') === 'logout') { logout(); closeMenu(); return; }
    var href = item.getAttribute('data-href');
    closeMenu();
    if (href) location.href = href;
  });

  /* ---------- intercept login / profile triggers ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('a[href$="login.html"], a[href*="login.html?"], [data-login-trigger]');
    if (t) {
      e.preventDefault();
      if (isLoggedIn()) { menuOpen ? closeMenu() : openMenu(t); }
      else open(t);
      return;
    }
    if (menuOpen && !e.target.closest('#lmMenu')) closeMenu();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) closeMenu(); });
  window.addEventListener('scroll', function () { if (menuOpen) closeMenu(); }, true);
  window.addEventListener('resize', function () { if (menuOpen) closeMenu(); });

  /* ---------- mobile nav: make the hamburger open the main nav ---------- */
  // Skip the home page, which ships its own sidebar menu.
  var ham = document.querySelector('.hamburger-btn');
  var siteNav = document.querySelector('.main-nav');
  if (ham && siteNav && !document.getElementById('sidebarOverlay')) {
    function closeNav() { siteNav.classList.remove('lmnav-open'); ham.classList.remove('lmnav-active'); ham.setAttribute('aria-expanded', 'false'); }
    ham.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var open = siteNav.classList.toggle('lmnav-open');
      ham.classList.toggle('lmnav-active', open);
      ham.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      // Logout from the account items injected into the drawer
      var lo = e.target.closest('.main-nav .lmnav-acct a[data-action="logout"]');
      if (lo) { e.preventDefault(); logout(); closeNav(); return; }
      if (siteNav.classList.contains('lmnav-open') && !e.target.closest('.main-nav') && !e.target.closest('.hamburger-btn')) closeNav();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
    window.addEventListener('resize', closeNav);
  }

  reflectLoggedIn();
})();
