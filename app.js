/**
 * PaisaWapas Outclick Deal Gateway & Phone Verification Engine
 * Handles exact deal presentation (Flipkart, Myntra, Amazon, Swiggy),
 * dynamic cashback calculations, phone formatting, OTP verification,
 * and automated redirection to the destination store.
 */

document.addEventListener('DOMContentLoaded', () => {

  // -------------------------------------------------------------
  // Deal Catalog Database
  // -------------------------------------------------------------
  const DEALS_DB = {
    'flipkart-iphone': {
      id: 'flipkart-iphone',
      storeName: 'Flipkart',
      storeLogo: 'assets/flipkart.svg',
      category: 'Smartphones & Electronics',
      title: 'Apple iPhone 15 (128 GB) - Black',
      image: 'assets/deal_iphone.jpg',
      mrp: '₹69,900',
      dealPrice: '₹54,999',
      discount: '21% OFF',
      cashbackAmount: '₹1,650',
      cashbackRate: '(3% Extra)',
      effectivePrice: '₹53,349',
      savings: 'You Save ₹16,551 Total',
      rating: '4.7 / 5',
      reviews: '(18.4K reviews on Flipkart)',
      targetUrl: 'https://www.flipkart.com'
    },
    'myntra-nike': {
      id: 'myntra-nike',
      storeName: 'Myntra',
      storeLogo: 'assets/flipkart.svg', // fallback/store badge
      category: 'Footwear & Fashion',
      title: 'Nike Revolution 6 Men Road Running Shoes',
      image: 'assets/cashback_hero.jpg',
      mrp: '₹7,995',
      dealPrice: '₹4,999',
      discount: '38% OFF',
      cashbackAmount: '₹500',
      cashbackRate: '(10% Extra)',
      effectivePrice: '₹4,499',
      savings: 'You Save ₹3,496 Total',
      rating: '4.6 / 5',
      reviews: '(9.2K reviews on Myntra)',
      targetUrl: 'https://www.myntra.com'
    },
    'amazon-sony': {
      id: 'amazon-sony',
      storeName: 'Amazon',
      storeLogo: 'assets/flipkart.svg',
      category: 'Audio & Premium Tech',
      title: 'Sony WH-1000XM5 ANC Wireless Headphones',
      image: 'assets/cashback_hero.jpg',
      mrp: '₹34,990',
      dealPrice: '₹24,990',
      discount: '29% OFF',
      cashbackAmount: '₹1,250',
      cashbackRate: '(5% Extra)',
      effectivePrice: '₹23,740',
      savings: 'You Save ₹11,250 Total',
      rating: '4.8 / 5',
      reviews: '(24.1K reviews on Amazon)',
      targetUrl: 'https://www.amazon.in'
    },
    'swiggy-food': {
      id: 'swiggy-food',
      storeName: 'Swiggy',
      storeLogo: 'assets/flipkart.svg',
      category: 'Food & Dining',
      title: 'Swiggy Gourmet - Multi-Cuisine Meal Box',
      image: 'assets/cashback_hero.jpg',
      mrp: '₹550',
      dealPrice: '₹399',
      discount: '27% OFF',
      cashbackAmount: '₹60',
      cashbackRate: '(Flat ₹60)',
      effectivePrice: '₹339',
      savings: 'You Save ₹211 Total',
      rating: '4.5 / 5',
      reviews: '(5.8K orders on Swiggy)',
      targetUrl: 'https://www.swiggy.com'
    }
  };

  // -------------------------------------------------------------
  // Application State
  // -------------------------------------------------------------
  const STATE = {
    currentDeal: DEALS_DB['flipkart-iphone'],
    currentStep: 'phone', // 'phone' | 'otp' | 'success'
    phoneNumber: '',
    rawPhone: '',
    mockMode: true,
    mockOtp: '1234',
    resendInterval: null,
    resendSeconds: 30,
    redirectTimer: null,
    apiEndpoints: {
      phone: 'https://api.paisawapas.com/v1/link-phone',
      otp: 'https://api.paisawapas.com/v1/verify-otp'
    }
  };

  // -------------------------------------------------------------
  // DOM Elements
  // -------------------------------------------------------------
  // Banner & Deal Card Elements
  const bannerStoreName = document.getElementById('banner-store-name');
  const bannerCashbackHighlight = document.getElementById('banner-cashback-highlight');
  const dealStoreBadge = document.getElementById('deal-store-badge');
  const dealCategory = document.getElementById('deal-category');
  const dealTitle = document.getElementById('deal-title');
  const dealProductImage = document.getElementById('deal-product-image');
  const dealDiscountBadge = document.getElementById('deal-discount-badge');
  const dealMrp = document.getElementById('deal-mrp');
  const dealPrice = document.getElementById('deal-price');
  const dealCashbackAmount = document.getElementById('deal-cashback-amount');
  const dealCashbackRate = document.getElementById('deal-cashback-rate');
  const dealEffectivePrice = document.getElementById('deal-effective-price');
  const dealSavings = document.getElementById('deal-savings');
  const dealChips = document.querySelectorAll('.deal-chip');
  const dealSelectBtns = document.querySelectorAll('.deal-select-btn');

  // Classic Deal Elements
  const classicStoreName = document.getElementById('classic-store-name');
  const classicCashbackAmount = document.getElementById('classic-cashback-amount');
  const classicDealImg = document.getElementById('classic-deal-img');
  const classicDealTitle = document.getElementById('classic-deal-title');
  const classicDealMrp = document.getElementById('classic-deal-mrp');
  const classicDealPrice = document.getElementById('classic-deal-price');
  const classicDealEffective = document.getElementById('classic-deal-effective');
  const classicDealSavings = document.getElementById('classic-deal-savings');
  const classicFooterCb = document.getElementById('classic-footer-cb');
  const classicFooterStore = document.getElementById('classic-footer-store');
  const classicChips = document.querySelectorAll('.classic-chip');

  // Step 1: Phone Elements
  const formHeading = document.getElementById('form-heading');
  const formSubNote = document.getElementById('form-sub-note');
  const targetCashbackText = document.getElementById('target-cashback-text');
  const submitBtnText = document.getElementById('submit-btn-text');
  const phoneForm = document.getElementById('phone-form');
  const phoneInput = document.getElementById('phone-input');
  const clearBtn = document.getElementById('clear-input-btn');
  const submitBtn = document.getElementById('submit-btn');
  const inputGroup = document.getElementById('input-group');
  const phoneError = document.getElementById('phone-error');
  const pillStep1 = document.getElementById('pill-step-1');
  const pillStep2 = document.getElementById('pill-step-2');

  // Step Views
  const viewPhone = document.getElementById('view-step-phone');
  const viewOtp = document.getElementById('view-step-otp');
  const viewSuccess = document.getElementById('view-step-success');

  // Step 2: OTP Elements
  const otpForm = document.getElementById('otp-form');
  const otpBoxes = Array.from(document.querySelectorAll('.otp-box'));
  const otpInputsContainer = document.getElementById('otp-inputs-container');
  const otpError = document.getElementById('otp-error');
  const verifyOtpBtn = document.getElementById('verify-otp-btn');
  const otpPhonePreview = document.getElementById('otp-phone-preview');
  const otpEditPhone = document.getElementById('otp-edit-phone');
  const otpBackBtn = document.getElementById('otp-back-btn');
  const demoOtpPill = document.getElementById('demo-otp-pill');
  const resendBtn = document.getElementById('resend-btn');
  const resendTimer = document.getElementById('resend-timer');
  const resendTimerLabel = document.getElementById('resend-timer-label');

  // Step 3: Success & Redirection Elements
  const redirectStoreName = document.getElementById('redirect-store-name');
  const btnStoreName = document.getElementById('btn-store-name');
  const successPhoneDisplay = document.getElementById('success-phone-display');
  const successCashbackDisplay = document.getElementById('success-cashback-display');
  const redirectProgress = document.getElementById('redirect-progress');
  const countdownSeconds = document.getElementById('countdown-seconds');
  const proceedStoreLink = document.getElementById('proceed-store-link');
  const resetFlowBtn = document.getElementById('reset-flow-btn');

  // Controls & Drawer Elements
  const headerLayoutBtns = document.querySelectorAll('.layout-btn');
  const panelDrawer = document.getElementById('ui-panel');
  const panelToggle = document.getElementById('panel-toggle');
  const panelClose = document.getElementById('panel-close');
  const presetBtns = document.querySelectorAll('.preset-btn');
  const toggleMockApi = document.getElementById('toggle-mock-api');
  const jumpStepPhone = document.getElementById('jump-step-phone');
  const jumpStepOtp = document.getElementById('jump-step-otp');
  const jumpStepSuccess = document.getElementById('jump-step-success');

  // -------------------------------------------------------------
  // Render Selected Deal Details Across the Entire Page
  // -------------------------------------------------------------
  function renderDeal(deal) {
    STATE.currentDeal = deal;

    // Top Banner
    if (bannerStoreName) bannerStoreName.textContent = deal.storeName;
    if (bannerCashbackHighlight) bannerCashbackHighlight.textContent = `${deal.cashbackAmount} Extra Cashback`;

    // Deal Showcase Card
    if (dealCategory) dealCategory.textContent = deal.category;
    if (dealTitle) dealTitle.textContent = deal.title;
    if (dealProductImage) dealProductImage.src = deal.image;
    if (dealDiscountBadge) dealDiscountBadge.textContent = deal.discount;
    if (dealMrp) dealMrp.textContent = deal.mrp;
    if (dealPrice) dealPrice.textContent = deal.dealPrice;
    if (dealCashbackAmount) dealCashbackAmount.textContent = deal.cashbackAmount;
    if (dealCashbackRate) dealCashbackRate.textContent = deal.cashbackRate;
    if (dealEffectivePrice) dealEffectivePrice.textContent = deal.effectivePrice;
    if (dealSavings) dealSavings.textContent = deal.savings;

    // Right Side Callouts
    if (formHeading) {
      formHeading.textContent = `Claim ${deal.cashbackAmount} Cash 💸`;
    }
    if (targetCashbackText) {
      targetCashbackText.textContent = `${deal.cashbackAmount} ${deal.storeName} Cashback`;
    }
    if (submitBtnText) {
      submitBtnText.textContent = `Unlock ${deal.cashbackAmount} & Go to ${deal.storeName} ⚡`;
    }

    // Update store name inside accordion dropdowns
    document.querySelectorAll('.acc-store-name').forEach(el => {
      el.textContent = deal.storeName;
    });

    // Success Screen Redirection
    if (redirectStoreName) redirectStoreName.textContent = deal.storeName;
    if (btnStoreName) btnStoreName.textContent = deal.storeName;
    if (successCashbackDisplay) successCashbackDisplay.textContent = `${deal.cashbackAmount} Cashback`;
    if (proceedStoreLink) proceedStoreLink.href = deal.targetUrl;

    // Classic Replica Summary Card Elements
    if (classicStoreName) classicStoreName.textContent = deal.storeName;
    if (classicCashbackAmount) classicCashbackAmount.textContent = deal.cashbackAmount;
    if (classicDealImg) classicDealImg.src = deal.image;
    if (classicDealTitle) classicDealTitle.textContent = deal.title;
    if (classicDealMrp) classicDealMrp.textContent = `MRP: ${deal.mrp}`;
    if (classicDealPrice) classicDealPrice.textContent = deal.dealPrice;
    if (classicDealEffective) classicDealEffective.textContent = deal.effectivePrice;
    if (classicDealSavings) classicDealSavings.textContent = `(${deal.savings.replace('Total', '').trim()})`;
    if (classicFooterCb) classicFooterCb.textContent = `${deal.cashbackAmount} Cashback`;
    if (classicFooterStore) classicFooterStore.textContent = deal.storeName;

    // Update active chips in UI
    dealChips.forEach(chip => {
      chip.classList.toggle('active', chip.dataset.dealId === deal.id);
    });
    classicChips.forEach(chip => {
      chip.classList.toggle('active', chip.dataset.dealId === deal.id);
    });
    dealSelectBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.deal === deal.id);
    });
  }

  // Handle URL Query Parameters (e.g. ?store=flipkart&deal=iPhone+15&price=54999&cashback=1650)
  function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const store = params.get('store');
    const dealTitleParam = params.get('deal');
    const priceParam = params.get('price');
    const cbParam = params.get('cashback');
    const mrpParam = params.get('mrp');

    if (store || dealTitleParam || cbParam) {
      const customDeal = {
        id: 'custom-url',
        storeName: store ? store.charAt(0).toUpperCase() + store.slice(1) : 'Flipkart',
        storeLogo: 'assets/flipkart.svg',
        category: 'Partner Store Exclusive Deal',
        title: dealTitleParam || 'Special Cashback Offer',
        image: 'assets/deal_iphone.jpg',
        mrp: mrpParam ? `₹${mrpParam}` : '₹69,900',
        dealPrice: priceParam ? `₹${priceParam}` : '₹54,999',
        discount: 'Verified Deal',
        cashbackAmount: cbParam ? `₹${cbParam}` : '₹1,650',
        cashbackRate: '(Guaranteed Extra)',
        effectivePrice: priceParam && cbParam ? `₹${Number(priceParam) - Number(cbParam)}` : '₹53,349',
        savings: 'Best Online Price Guaranteed',
        rating: '4.8 / 5',
        reviews: '(Verified Partner Offer)',
        targetUrl: store && store.toLowerCase() === 'amazon' ? 'https://www.amazon.in' : 'https://www.flipkart.com'
      };
      renderDeal(customDeal);
      return;
    }

    // Default to Flipkart iPhone 15
    renderDeal(DEALS_DB['flipkart-iphone']);
  }

  checkUrlParams();

  // Deal Switcher Event Listeners
  dealChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const dealId = chip.dataset.dealId;
      if (DEALS_DB[dealId]) renderDeal(DEALS_DB[dealId]);
    });
  });

  classicChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const dealId = chip.dataset.dealId;
      if (DEALS_DB[dealId]) renderDeal(DEALS_DB[dealId]);
    });
  });

  dealSelectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const dealId = btn.dataset.deal;
      if (DEALS_DB[dealId]) renderDeal(DEALS_DB[dealId]);
    });
  });

  // -------------------------------------------------------------
  // Navigation & Step Control
  // -------------------------------------------------------------
  function switchStep(targetStep) {
    STATE.currentStep = targetStep;

    viewPhone.style.display = 'none';
    viewOtp.style.display = 'none';
    viewSuccess.style.display = 'none';

    if (targetStep === 'phone') {
      viewPhone.style.display = 'block';
      if (pillStep1) {
        pillStep1.className = 'progress-step-pill active';
        pillStep2.className = 'progress-step-pill';
      }
      phoneInput.focus();
    } 
    else if (targetStep === 'otp') {
      viewOtp.style.display = 'block';
      if (pillStep1) {
        pillStep1.className = 'progress-step-pill completed';
        pillStep2.className = 'progress-step-pill active';
      }
      const formatted = formatDisplayPhone(STATE.rawPhone);
      otpPhonePreview.textContent = `+91 ${formatted}`;
      clearOtpBoxes();
      startResendCountdown();
      setTimeout(() => {
        if (otpBoxes[0]) otpBoxes[0].focus();
      }, 50);
    } 
    else if (targetStep === 'success') {
      viewSuccess.style.display = 'block';
      if (pillStep1) {
        pillStep1.className = 'progress-step-pill completed';
        pillStep2.className = 'progress-step-pill completed';
      }
      const formatted = formatDisplayPhone(STATE.rawPhone || '9876543210');
      successPhoneDisplay.textContent = `+91 ${formatted}`;
      startAutomatedRedirection();
    }
  }

  // -------------------------------------------------------------
  // Automated Store Redirection Countdown
  // -------------------------------------------------------------
  function startAutomatedRedirection() {
    clearInterval(STATE.redirectTimer);
    let secondsLeft = 3;
    countdownSeconds.textContent = secondsLeft;
    redirectProgress.style.width = '0%';

    // Animate progress fill
    setTimeout(() => {
      redirectProgress.style.transition = 'width 3s linear';
      redirectProgress.style.width = '100%';
    }, 50);

    STATE.redirectTimer = setInterval(() => {
      secondsLeft--;
      if (secondsLeft >= 0) {
        countdownSeconds.textContent = secondsLeft;
      }

      if (secondsLeft <= 0) {
        clearInterval(STATE.redirectTimer);
        // Completed -> In production, window.location.href = STATE.currentDeal.targetUrl
        console.log(`Redirecting to ${STATE.currentDeal.storeName}: ${STATE.currentDeal.targetUrl}`);
      }
    }, 1000);
  }

  // -------------------------------------------------------------
  // STEP 1: Phone Formatting & Validation
  // -------------------------------------------------------------
  function cleanPhoneNumber(value) {
    return value.replace(/\D/g, '').slice(0, 10);
  }

  function formatDisplayPhone(raw) {
    if (raw.length > 5) {
      return `${raw.slice(0, 5)} ${raw.slice(5)}`;
    }
    return raw;
  }

  phoneInput.addEventListener('input', (e) => {
    const raw = cleanPhoneNumber(e.target.value);
    STATE.rawPhone = raw;
    e.target.value = formatDisplayPhone(raw);

    clearBtn.style.display = raw.length > 0 ? 'flex' : 'none';

    if (phoneError.textContent) {
      phoneError.textContent = '';
      inputGroup.classList.remove('shake-error');
    }
  });

  clearBtn.addEventListener('click', () => {
    phoneInput.value = '';
    STATE.rawPhone = '';
    clearBtn.style.display = 'none';
    phoneInput.focus();
    phoneError.textContent = '';
    inputGroup.classList.remove('shake-error');
  });

  function validatePhone(rawNumber) {
    if (!rawNumber) {
      return 'Please enter your mobile phone number.';
    }
    if (rawNumber.length < 10) {
      return `Please enter complete 10-digit number (${10 - rawNumber.length} digits left).`;
    }
    if (!/^[6-9]\d{9}$/.test(rawNumber)) {
      return 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.';
    }
    return null;
  }

  phoneForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const raw = cleanPhoneNumber(phoneInput.value);
    STATE.rawPhone = raw;
    const error = validatePhone(raw);

    if (error) {
      phoneError.textContent = error;
      inputGroup.classList.remove('shake-error');
      void inputGroup.offsetWidth;
      inputGroup.classList.add('shake-error');
      phoneInput.focus();
      return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Simulate OTP dispatch
    setTimeout(() => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      switchStep('otp');
    }, 700);
  });

  // -------------------------------------------------------------
  // STEP 2: OTP Verification
  // -------------------------------------------------------------
  function clearOtpBoxes() {
    otpBoxes.forEach(box => { box.value = ''; });
    otpError.textContent = '';
  }

  function getEnteredOtp() {
    return otpBoxes.map(b => b.value).join('');
  }

  otpBoxes.forEach((box, index) => {
    box.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g, '');
      box.value = val ? val[val.length - 1] : '';
      otpError.textContent = '';

      if (box.value && index < otpBoxes.length - 1) {
        otpBoxes[index + 1].focus();
      }

      if (getEnteredOtp().length === 4) {
        verifyOtpBtn.focus();
        handleVerifyOtp();
      }
    });

    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !box.value && index > 0) {
        otpBoxes[index - 1].focus();
        otpBoxes[index - 1].value = '';
      }
    });

    box.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 4);
      if (pasted) {
        pasted.split('').forEach((d, i) => {
          if (otpBoxes[i]) otpBoxes[i].value = d;
        });
        const last = Math.min(pasted.length, otpBoxes.length) - 1;
        if (last >= 0) otpBoxes[last].focus();
        if (pasted.length === 4) handleVerifyOtp();
      }
    });
  });

  demoOtpPill.addEventListener('click', () => {
    '1234'.split('').forEach((d, i) => {
      if (otpBoxes[i]) otpBoxes[i].value = d;
    });
    otpError.textContent = '';
    handleVerifyOtp();
  });

  function handleVerifyOtp() {
    const code = getEnteredOtp();
    if (code.length < 4) {
      otpError.textContent = 'Please enter complete 4-digit code.';
      shakeElement(otpInputsContainer);
      return;
    }

    verifyOtpBtn.classList.add('loading');
    verifyOtpBtn.disabled = true;

    setTimeout(() => {
      verifyOtpBtn.classList.remove('loading');
      verifyOtpBtn.disabled = false;
      if (code === STATE.mockOtp || code === '0000' || !STATE.mockMode) {
        clearInterval(STATE.resendInterval);
        switchStep('success');
      } else {
        otpError.textContent = 'Invalid code. Use demo code 1234.';
        shakeElement(otpInputsContainer);
        otpBoxes.forEach(b => { b.value = ''; });
        otpBoxes[0].focus();
      }
    }, 750);
  }

  otpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleVerifyOtp();
  });

  otpEditPhone.addEventListener('click', () => switchStep('phone'));
  otpBackBtn.addEventListener('click', () => switchStep('phone'));

  function startResendCountdown() {
    clearInterval(STATE.resendInterval);
    STATE.resendSeconds = 30;
    resendBtn.disabled = true;
    resendTimerLabel.style.display = 'inline';

    function update() {
      const formatted = `00:${STATE.resendSeconds < 10 ? '0' : ''}${STATE.resendSeconds}`;
      resendTimer.textContent = formatted;

      if (STATE.resendSeconds <= 0) {
        clearInterval(STATE.resendInterval);
        resendBtn.disabled = false;
        resendTimerLabel.style.display = 'none';
      }
      STATE.resendSeconds--;
    }

    update();
    STATE.resendInterval = setInterval(update, 1000);
  }

  resendBtn.addEventListener('click', () => {
    resendBtn.disabled = true;
    clearOtpBoxes();
    startResendCountdown();
    otpError.style.color = '#16a34a';
    otpError.textContent = 'New code sent to your mobile!';
    setTimeout(() => {
      otpError.style.color = '';
      otpError.textContent = '';
    }, 3500);
  });

  resetFlowBtn.addEventListener('click', () => {
    clearInterval(STATE.redirectTimer);
    phoneInput.value = '';
    STATE.rawPhone = '';
    clearOtpBoxes();
    switchStep('phone');
  });

  function shakeElement(el) {
    el.classList.remove('shake-error');
    void el.offsetWidth;
    el.classList.add('shake-error');
  }

  // -------------------------------------------------------------
  // Layout Preset Switcher (Web vs Mobile vs Dark)
  // -------------------------------------------------------------
  function setMode(mode) {
    document.body.classList.remove('mode-web', 'mode-mobile', 'mode-dark');
    document.body.classList.add(`mode-${mode}`);

    if (submitBtnText) {
      submitBtnText.textContent = `Unlock ${STATE.currentDeal.cashbackAmount} & Go to ${STATE.currentDeal.storeName} ⚡`;
    }

    headerLayoutBtns.forEach(b => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });
    presetBtns.forEach(b => {
      b.classList.toggle('active', b.dataset.preset === mode);
    });
  }

  // Auto-detect mobile screen on load
  if (window.innerWidth <= 768) {
    setMode('mobile');
  } else {
    setMode('web');
  }

  headerLayoutBtns.forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.preset));
  });

  // Settings Panel Drawer
  if (panelToggle) {
    panelToggle.addEventListener('click', () => panelDrawer.classList.toggle('open'));
    panelClose.addEventListener('click', () => panelDrawer.classList.remove('open'));

    jumpStepPhone.addEventListener('click', () => switchStep('phone'));
    jumpStepOtp.addEventListener('click', () => {
      STATE.rawPhone = STATE.rawPhone || '9876543210';
      switchStep('otp');
    });
    jumpStepSuccess.addEventListener('click', () => {
      STATE.rawPhone = STATE.rawPhone || '9876543210';
      switchStep('success');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panelDrawer) panelDrawer.classList.remove('open');
  });
});
