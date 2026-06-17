/* ============================================================
   Flebo — shared Login/Signup popup modal
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
    padding:20px;background:rgba(11,21,48,.55);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);}\
  #lmOverlay.is-open{display:flex;animation:lmFade .18s ease;}\
  @keyframes lmFade{from{opacity:0}to{opacity:1}}\
  .lm-card{position:relative;width:100%;max-width:430px;max-height:92vh;overflow-y:auto;background:#fff;\
    border-radius:20px;padding:34px 32px 28px;box-shadow:0 24px 70px rgba(11,21,48,.32);\
    font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--text-primary,#0B1530);\
    animation:lmPop .2s cubic-bezier(.2,.8,.3,1);}\
  @keyframes lmPop{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}\
  .lm-close{position:absolute;top:14px;right:14px;width:34px;height:34px;border:0;border-radius:50%;\
    background:var(--bg-soft,#F7F8FB);color:var(--text-muted,#6B7592);font-size:16px;cursor:pointer;\
    display:inline-flex;align-items:center;justify-content:center;transition:background .15s,color .15s;}\
  .lm-close:hover{background:#ECEFF6;color:var(--text-primary,#0B1530);}\
  .lm-eyebrow{font-size:13px;font-weight:800;color:var(--accent,#D33535);letter-spacing:.12em;text-transform:uppercase;}\
  .lm-title{font-family:"Instrument Serif",serif;font-size:30px;font-weight:400;color:var(--text-primary,#0B1530);\
    line-height:1.12;letter-spacing:-.01em;margin:6px 0 6px;}\
  .lm-sub{font-size:15px;color:var(--text-muted,#6B7592);margin-bottom:24px;line-height:1.45;}\
  .lm-phone-row{display:flex;align-items:center;border:1.5px solid var(--border-mid,#C5CCDB);border-radius:var(--radius-md,12px);\
    overflow:hidden;transition:border-color .15s,box-shadow .15s;}\
  .lm-phone-row:focus-within{border-color:var(--primary,#1B2A5B);box-shadow:0 0 0 4px rgba(27,42,91,.08);}\
  .lm-country{display:inline-flex;align-items:center;gap:8px;padding:0 14px;align-self:stretch;\
    border-right:1.5px solid var(--border-soft,#E5E9F3);background:var(--bg-soft,#F7F8FB);font-size:15px;font-weight:700;}\
  .lm-flag{width:22px;height:16px;border-radius:3px;overflow:hidden;display:inline-block;flex-shrink:0;position:relative;\
    background:linear-gradient(180deg,#FF9933 33%,#FFF 33%,#FFF 66%,#138808 66%);}\
  .lm-flag::after{content:"";position:absolute;left:50%;top:50%;width:4px;height:4px;margin:-2px 0 0 -2px;border-radius:50%;background:#000080;}\
  .lm-phone-input{flex:1;min-width:0;height:54px;padding:0 16px;border:0;outline:0;font:inherit;font-size:16px;font-weight:600;\
    color:var(--text-primary,#0B1530);letter-spacing:.04em;background:#fff;}\
  .lm-phone-input::placeholder{color:var(--text-muted,#6B7592);font-weight:500;letter-spacing:.02em;}\
  .lm-error{display:none;align-items:center;gap:6px;font-size:13px;color:var(--accent,#D33535);margin-top:8px;}\
  .lm-error.is-show{display:inline-flex;}\
  .lm-cta{width:100%;height:54px;background:var(--accent,#D33535);color:#fff;border:0;border-radius:999px;font:inherit;\
    font-size:16px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:10px;\
    margin-top:20px;transition:background .2s,transform .15s;box-shadow:0 6px 20px rgba(211,53,53,.25);}\
  .lm-cta:hover:not(:disabled){background:var(--accent-dark,#B82E2E);transform:translateY(-1px);}\
  .lm-cta:disabled{background:#E5A7A7;cursor:not-allowed;box-shadow:none;}\
  .lm-divider{display:flex;align-items:center;gap:14px;font-size:12px;font-weight:700;color:var(--text-muted,#6B7592);\
    letter-spacing:.06em;text-transform:uppercase;margin:24px 0 16px;}\
  .lm-divider::before,.lm-divider::after{content:"";flex:1;height:1px;background:var(--border-soft,#E5E9F3);}\
  .lm-social{display:grid;grid-template-columns:1fr 1fr;gap:10px;}\
  .lm-social-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;height:46px;\
    border:1.5px solid var(--border-mid,#C5CCDB);border-radius:var(--radius-md,12px);background:#fff;font:inherit;font-size:14px;\
    font-weight:700;color:var(--text-primary,#0B1530);cursor:pointer;transition:border-color .15s,background .15s;}\
  .lm-social-btn:hover{border-color:var(--primary,#1B2A5B);background:var(--bg-soft,#F7F8FB);}\
  .lm-social-btn i{font-size:17px;}\
  .lm-social-btn[data-prov="google"] i{color:#4285F4;}\
  .lm-terms{font-size:12px;color:var(--text-muted,#6B7592);text-align:center;margin-top:20px;line-height:1.5;}\
  .lm-terms a{color:var(--primary,#1B2A5B);font-weight:700;}\
  .lm-step{display:none;}\
  .lm-step.is-active{display:block;}\
  .lm-otp-phone{display:flex;align-items:center;gap:10px;background:var(--bg-soft,#F7F8FB);border-radius:var(--radius-md,12px);\
    padding:11px 14px;font-size:14px;margin-bottom:18px;}\
  .lm-otp-phone b{font-weight:700;font-family:"Plus Jakarta Sans",sans-serif;letter-spacing:.04em;}\
  .lm-otp-change{margin-left:auto;background:0;border:0;color:var(--accent,#D33535);font:inherit;font-size:13px;font-weight:700;cursor:pointer;}\
  .lm-otp-change:hover{text-decoration:underline;}\
  .lm-otp-boxes{display:flex;gap:10px;margin-bottom:18px;}\
  .lm-otp-box{flex:1 1 0;min-width:0;height:58px;border:1.5px solid var(--border-mid,#C5CCDB);border-radius:var(--radius-md,12px);\
    background:#fff;font:inherit;font-size:22px;font-weight:800;text-align:center;color:var(--text-primary,#0B1530);outline:0;\
    font-family:"Plus Jakarta Sans",sans-serif;transition:border-color .15s,box-shadow .15s;}\
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
  @media (max-width:520px){.lm-card{padding:30px 20px 24px;border-radius:18px;}.lm-title{font-size:26px;}.lm-social{grid-template-columns:1fr;}}';

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

  /* ---------- open / close ---------- */
  function open(trigger) {
    lastTrigger = trigger || null;
    resetToPhone();
    overlay.classList.add('is-open');
    document.body.classList.add('lm-locked');
    setTimeout(function () { phoneInput.focus(); }, 60);
  }
  function close() {
    overlay.classList.remove('is-open');
    document.body.classList.remove('lm-locked');
    clearInterval(resendInterval);
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

  /* ---------- reflect logged-in state on triggers ---------- */
  function reflectLoggedIn() {
    var phone;
    try { phone = localStorage.getItem('flebo:phone'); } catch (e) {}
    if (!phone) return;
    document.querySelectorAll('.top-bar-login span, a[href$="login.html"] span, [data-login-trigger] span').forEach(function (s) {
      s.textContent = '+91 ' + formatPhone(phone);
    });
  }
  try { if (localStorage.getItem('flebo:loggedIn') === '1') reflectLoggedIn(); } catch (e) {}

  /* ---------- intercept login links ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href$="login.html"], a[href*="login.html?"], [data-login-trigger]');
    if (!a) return;
    e.preventDefault();
    open(a);
  });
})();
