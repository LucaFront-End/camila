/* ============================================
   XV de Camila — Main Script
   ============================================ */

(function () {
  'use strict';

  /* ── CONFIG ── */
  const EVENT_DATE = new Date('2026-07-17T22:00:00-03:00'); // Viernes 17 Jul 2026, 22 hs (Argentina)
  const YOUTUBE_VIDEO_ID = 'nSDgHBxUbVQ'; // Photograph — Ed Sheeran

  /* ── DOM ELEMENTS ── */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const portalScreen = $('#portal-screen');
  const mainContent = $('#main-content');
  const musicPlayer = $('#music-player');
  const countdownEls = {
    days: $('#countdown-days'),
    hours: $('#countdown-hours'),
    minutes: $('#countdown-minutes'),
    seconds: $('#countdown-seconds'),
  };


  /* ── STATE ── */
  let ytPlayer = null;
  let musicPlaying = false;
  let galleryIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;
  
  /* ============================================
     1. LUXURY LOCK-SCREEN INTERACTIVE WAX SEAL (PRESS & HOLD)
     ============================================ */
  const lockscreenSeal = $('#lockscreen-seal');
  const sealProgressBar = $('#seal-progress-bar');
  
  if (lockscreenSeal && sealProgressBar) {
    let pressTimer = null;
    let isPressing = false;
    let progress = 0;
    const duration = 1400; // Time in ms to unlock (1.4s)
    let startTime = 0;
    let lastVibrateTime = 0;

    const startPress = (e) => {
      e.preventDefault();
      if (portalScreen.classList.contains('hidden')) return;

      isPressing = true;
      lockscreenSeal.classList.add('pressing');
      startTime = performance.now() - (progress / 100 * duration);
      lastVibrateTime = 0;
      
      requestAnimationFrame(updatePressProgress);
    };

    const endPress = () => {
      if (!isPressing) return;
      isPressing = false;
      lockscreenSeal.classList.remove('pressing');
      
      // Smoothly shrink progress back to 0
      requestAnimationFrame(drainProgress);
    };

    function updatePressProgress(timestamp) {
      if (!isPressing) return;

      const elapsed = timestamp - startTime;
      progress = Math.min(100, (elapsed / duration) * 100);

      // 1. Update SVG Progress stroke
      const offset = 283 - (283 * progress) / 100;
      sealProgressBar.style.strokeDashoffset = offset;

      // 2. Haptic Ticking Feedback (Vibrate every 150ms)
      if (timestamp - lastVibrateTime > 150) {
        if (navigator.vibrate) {
          navigator.vibrate(12); // Short click sensation
        }
        lastVibrateTime = timestamp;
        
        // Spawn small sparks near seal boundary while charging
        const rect = lockscreenSeal.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        if (typeof createConfettiBurst === 'function') {
          createConfettiBurst(centerX + (Math.random() - 0.5) * 120, centerY + (Math.random() - 0.5) * 120, 2);
        }
      }

      if (progress < 100) {
        requestAnimationFrame(updatePressProgress);
      } else {
        triggerUnlock();
      }
    }

    function drainProgress() {
      if (isPressing) return; // Stop draining if pressed again

      progress = Math.max(0, progress - 4); // Fast shrink
      const offset = 283 - (283 * progress) / 100;
      sealProgressBar.style.strokeDashoffset = offset;

      if (progress > 0) {
        requestAnimationFrame(drainProgress);
      }
    }

    function triggerUnlock() {
      isPressing = false;
      lockscreenSeal.classList.remove('pressing');
      
      // Haptic confirmation
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 150]);
      }

      // Hide seal and progress ring with scale & fade out
      lockscreenSeal.style.transform = 'scale(2.5)';
      lockscreenSeal.style.opacity = '0';
      sealProgressBar.parentElement.style.opacity = '0';
      sealProgressBar.parentElement.style.transform = 'scale(2.2)';
      sealProgressBar.parentElement.style.transition = 'transform 0.6s ease, opacity 0.6s ease';

      setTimeout(() => {
        enterInvitation();
      }, 300);
    }

    // Touch Listeners
    lockscreenSeal.addEventListener('touchstart', startPress, { passive: false });
    lockscreenSeal.addEventListener('touchend', endPress);
    lockscreenSeal.addEventListener('touchcancel', endPress);

    // Mouse Listeners
    lockscreenSeal.addEventListener('mousedown', startPress);
    window.addEventListener('mouseup', endPress);
    lockscreenSeal.addEventListener('mouseleave', endPress);
    
    // Keyboard Accessibility (Enter or Space key)
    lockscreenSeal.addEventListener('keydown', (e) => {
      if ((e.key === ' ' || e.key === 'Enter') && !isPressing) {
        e.preventDefault();
        startPress(e);
      }
    });
    lockscreenSeal.addEventListener('keyup', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        endPress();
      }
    });
  }

  // Lock Invitation Entrance Transition
  function enterInvitation() {
    if (portalScreen.classList.contains('hidden')) return;
    
    // Add classes to animate and hide
    portalScreen.classList.add('hidden');
    portalScreen.style.transform = 'translateY(-100%)';
    portalScreen.style.opacity = '0';
    
    mainContent.classList.add('visible');
    document.body.style.overflow = '';

    // Scatter fine gold dust confetti across the screen
    createConfettiBurst(window.innerWidth / 2, window.innerHeight / 2, 40);

    // Auto-play ambient music
    setTimeout(() => {
      if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
        ytPlayer.playVideo();
        musicPlaying = true;
        const playerBtn = $('#music-player');
        if (playerBtn) playerBtn.classList.remove('paused');
      }
    }, 600);

    // Scroll reveals
    triggerReveals();
  }

  // Keyboard accessibility
  window.addEventListener('keydown', (e) => {
    if (!portalScreen.classList.contains('hidden')) {
      if (e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        enterInvitation();
      }
    }
  });

  // Lock scroll on portal screen
  document.body.style.overflow = 'hidden';

  /* ============================================
     2. YOUTUBE MUSIC PLAYER (IFrame API)
     ============================================ */
  // Load the YouTube IFrame API
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);

  // This function is called by the YouTube API when ready
  window.onYouTubeIframeAPIReady = function () {
    ytPlayer = new YT.Player('youtube-player', {
      height: '1',
      width: '1',
      videoId: YOUTUBE_VIDEO_ID,
      playerVars: {
        autoplay: 0,
        loop: 1,
        playlist: YOUTUBE_VIDEO_ID,
        controls: 0,
        showinfo: 0,
        modestbranding: 1,
        rel: 0,
        iv_load_policy: 3,
      },
      events: {
        onReady: function () {
          ytPlayer.setVolume(50);
          musicPlayer.classList.add('paused');
        },
        onStateChange: function (event) {
          if (event.data === YT.PlayerState.ENDED) {
            ytPlayer.playVideo();
          }
        },
      },
    });
  };

  // Toggle play/pause
  if (musicPlayer) {
    musicPlayer.addEventListener('click', () => {
      if (!ytPlayer || typeof ytPlayer.getPlayerState !== 'function') return;

      const state = ytPlayer.getPlayerState();
      if (state === YT.PlayerState.PLAYING) {
        ytPlayer.pauseVideo();
        musicPlaying = false;
        musicPlayer.classList.add('paused');
      } else {
        ytPlayer.playVideo();
        musicPlaying = true;
        musicPlayer.classList.remove('paused');
      }
    });
  }

  /* ============================================
     3. COUNTDOWN TIMER & INTERACTIVE HYPE
     ============================================ */
  function updateCountdown() {
    if (!countdownEls.days || !countdownEls.hours || !countdownEls.minutes || !countdownEls.seconds) return;
    
    const now = new Date();
    const diff = EVENT_DATE - now;

    if (diff <= 0) {
      animateNumberUpdate(countdownEls.days, '00');
      animateNumberUpdate(countdownEls.hours, '00');
      animateNumberUpdate(countdownEls.minutes, '00');
      animateNumberUpdate(countdownEls.seconds, '00');
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (num) => String(num).padStart(2, '0');

    animateNumberUpdate(countdownEls.days, pad(days));
    animateNumberUpdate(countdownEls.hours, pad(hours));
    animateNumberUpdate(countdownEls.minutes, pad(minutes));
    animateNumberUpdate(countdownEls.seconds, pad(seconds));
  }

  function animateNumberUpdate(element, newValue) {
    if (!element) return;
    if (element.textContent !== newValue) {
      element.style.transform = 'scale(0.85)';
      element.style.opacity = '0.5';
      setTimeout(() => {
        element.textContent = newValue;
        element.style.transform = 'scale(1)';
        element.style.opacity = '1';
      }, 150);
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Hype Counter Local Storage & Confetti
  let clickCount = parseInt(localStorage.getItem('hype_clicks') || '342'); // Premium seed count
  const hypeCountEl = $('#hype-count');
  if (hypeCountEl) hypeCountEl.textContent = clickCount;

  window.triggerHypeConfetti = function (e) {
    clickCount++;
    localStorage.setItem('hype_clicks', clickCount);
    if (hypeCountEl) hypeCountEl.textContent = clickCount;

    // Confetti from click position or center of button
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    if (e && e.clientX && e.clientY) {
      x = e.clientX;
      y = e.clientY;
    }

    // Burst confetti!
    if (typeof createConfettiBurst === 'function') {
      createConfettiBurst(x, y, 25);
    }
  };


  /* ============================================
     4. SCROLL REVEAL & PROGRESS & TILT EFFECTS
     ============================================ */
  function triggerReveals() {
    const reveals = $$('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
      );

      reveals.forEach((el) => observer.observe(el));
    } else {
      reveals.forEach((el) => el.classList.add('visible'));
    }
  }

  // Scroll Progress Tracker
  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const progress = $('#scroll-progress');
    if (progress) {
      progress.style.width = scrolled + '%';
    }
  }, { passive: true });

  // 3D Tilt Effect on Cards (Desktop Only)
  function initTilt() {
    if (window.innerWidth < 768) return; // Disable on mobile for performance

    const tiltCards = $$('.tilt-card');
    tiltCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        
        // Calculate tilt
        const rotateX = ((yc - y) / yc) * 8;
        const rotateY = ((x - xc) / xc) * 8;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  }

  // Scroll Parallax for Collage Elements (Desktop Only)
  function initParallax() {
    const parallaxEls = $$('.parallax-el');
    if (window.innerWidth < 768) {
      parallaxEls.forEach(el => {
        el.style.transform = '';
      });
      return;
    }

    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-speed')) || 0.1;
        const yPos = -(scrolled * speed);
        el.style.transform = `translateY(${yPos}px)`;
      });
    }, { passive: true });
  }

  // Mobile-first parallax for images (like the editorial arch image)
  function initImageParallax() {
    const parallaxImgs = $$('.parallax-img');
    if (parallaxImgs.length === 0) return;

    let isScrolling = false;
    
    function updateParallax() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      parallaxImgs.forEach((img) => {
        const rect = img.getBoundingClientRect();
        const elementTop = rect.top + scrollTop;
        const viewHeight = window.innerHeight;
        
        if (rect.top < viewHeight && rect.bottom > 0) {
          const relativeScroll = (scrollTop + viewHeight - elementTop) / (viewHeight + rect.height);
          // Smooth scale from 1.04 to 1.14 and small shift
          const scale = 1.04 + (relativeScroll * 0.08);
          const yTranslate = (relativeScroll - 0.5) * -15;
          img.style.transform = `scale(${scale}) translateY(${yTranslate}px)`;
        }
      });
      isScrolling = false;
    }

    window.addEventListener('scroll', () => {
      if (!isScrolling) {
        requestAnimationFrame(updateParallax);
        isScrolling = true;
      }
    }, { passive: true });

    updateParallax();
  }

  // Parallax for giant background typography in Hero (Option 4)
  function initHeroTextParallax() {
    const bgCam = $('#hero-bg-cam');
    const bgIla = $('#hero-bg-ila');
    const invitationSec = $('#invitation');

    if (!bgCam || !bgIla || !invitationSec) return;

    window.addEventListener('scroll', () => {
      const rect = invitationSec.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const scrollFactor = window.pageYOffset || document.documentElement.scrollTop;
        const movement = scrollFactor * 0.18; // Elegant speed multiplier
        bgCam.style.transform = `translateX(${-movement}px)`;
        bgIla.style.transform = `translateX(${movement}px)`;
      }
    }, { passive: true });
  }

  initTilt();
  initParallax();
  initImageParallax();
  initHeroTextParallax();
  window.addEventListener('resize', () => {
    initTilt();
    initParallax();
    initImageParallax();
    initHeroTextParallax();
  });


  /* ============================================
     5. TIMELINE GALLERY SLIDER
     ============================================ */
  const timelineSlides = $$('.timeline-slide');
  const timelineNodes = $$('.timeline-node');
  const timelineHandle = $('#timeline-handle');
  const timelineProgress = $('#timeline-progress');
  const slidesContainer = $('.timeline-slides-container');
  
  let currentTimelineIndex = 0;
  const totalSlides = timelineSlides.length;

  window.setTimelineIndex = function(index) {
    if (index < 0 || index >= totalSlides) return;
    currentTimelineIndex = index;
    updateTimelineUI();
  };

  function updateTimelineUI() {
    // 1. Update slides active state
    timelineSlides.forEach((slide, idx) => {
      if (idx === currentTimelineIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // 2. Update nodes active state
    timelineNodes.forEach((node, idx) => {
      if (idx === currentTimelineIndex) {
        node.classList.add('active');
      } else {
        node.classList.remove('active');
      }
    });

    // 3. Update handle position and progress fill
    if (timelineHandle && timelineProgress && totalSlides > 1) {
      const percentage = (currentTimelineIndex / (totalSlides - 1)) * 100;
      timelineHandle.style.left = `${percentage}%`;
      timelineProgress.style.width = `${percentage}%`;
    }
  }

  // Swipe support on slidesContainer
  if (slidesContainer) {
    slidesContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slidesContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleGallerySwipe();
    }, { passive: true });
  }

  function handleGallerySwipe() {
    const diff = touchStartX - touchEndX;
    const swipeThreshold = 50; // min pixels to swipe
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left -> Next slide
        if (currentTimelineIndex < totalSlides - 1) {
          window.setTimelineIndex(currentTimelineIndex + 1);
        }
      } else {
        // Swipe right -> Prev slide
        if (currentTimelineIndex > 0) {
          window.setTimelineIndex(currentTimelineIndex - 1);
        }
      }
    }
  }

  // Handle Dragging
  if (timelineHandle && totalSlides > 1) {
    let isDragging = false;
    let dragStartX = 0;
    let startLeftPct = 0;
    const axisLine = $('.timeline-axis-line');

    const onDragStart = (e) => {
      isDragging = true;
      timelineHandle.style.transition = 'none'; // disable transitions while dragging
      if (timelineProgress) timelineProgress.style.transition = 'none';
      
      const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
      dragStartX = clientX;
      
      // Calculate current left percentage from style
      const currentLeftStr = timelineHandle.style.left || '0%';
      startLeftPct = parseFloat(currentLeftStr);
      
      document.addEventListener('touchmove', onDragMove, { passive: false });
      document.addEventListener('touchend', onDragEnd);
      document.addEventListener('mousemove', onDragMove);
      document.addEventListener('mouseup', onDragEnd);
    };

    const onDragMove = (e) => {
      if (!isDragging) return;
      e.preventDefault(); // prevent scrolling while dragging
      
      const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - dragStartX;
      const axisWidth = axisLine.getBoundingClientRect().width;
      
      // Convert delta px to percentage
      const deltaPct = (deltaX / axisWidth) * 100;
      let newLeftPct = startLeftPct + deltaPct;
      
      // Clamp between 0% and 100%
      newLeftPct = Math.max(0, Math.min(100, newLeftPct));
      
      timelineHandle.style.left = `${newLeftPct}%`;
      if (timelineProgress) timelineProgress.style.width = `${newLeftPct}%`;
    };

    const onDragEnd = (e) => {
      if (!isDragging) return;
      isDragging = false;
      
      // Re-enable transitions
      timelineHandle.style.transition = '';
      if (timelineProgress) timelineProgress.style.transition = '';
      
      const currentLeftStr = timelineHandle.style.left || '0%';
      const currentLeftPct = parseFloat(currentLeftStr);
      
      // Find the nearest node index
      let nearestIndex = 0;
      let minDistance = 999;
      
      for (let i = 0; i < totalSlides; i++) {
        const nodePct = (i / (totalSlides - 1)) * 100;
        const dist = Math.abs(currentLeftPct - nodePct);
        if (dist < minDistance) {
          minDistance = dist;
          nearestIndex = i;
        }
      }
      
      // Set to nearest index
      window.setTimelineIndex(nearestIndex);
      
      document.removeEventListener('touchmove', onDragMove);
      document.removeEventListener('touchend', onDragEnd);
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
    };

    timelineHandle.addEventListener('touchstart', onDragStart, { passive: false });
    timelineHandle.addEventListener('mousedown', onDragStart);
  }

  // Initialize UI
  updateTimelineUI();

  /* ============================================
     6. COPY ALIAS TO CLIPBOARD
     ============================================ */
  window.copyAlias = function (e) {
    const alias = 'camiicolman.mp';
    const feedback = $('#copy-feedback');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(alias).then(() => showCopyFeedback(feedback));
    } else {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = alias;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showCopyFeedback(feedback);
    }

    // Spray confetti from click coordinates or copyBtn center
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    
    if (e && e.clientX && e.clientY) {
      x = e.clientX;
      y = e.clientY;
    } else {
      const aliasEl = $('#copy-alias');
      if (aliasEl) {
        const rect = aliasEl.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top;
      }
    }
    
    createConfettiBurst(x, y, 20);
  };

  function showCopyFeedback(el) {
    if (!el) return;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 1800);
  }

  /* ============================================
     7. ADD TO CALENDAR
     ============================================ */
  function downloadIcs(title, startDate, endDate, location, description) {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//XV de Camila//NONSGML v1.0//ES',
      'BEGIN:VEVENT',
      'UID:xv-de-camila-20260717',
      'DTSTAMP:20260626T220000',
      'DTSTART:' + startDate,
      'DTEND:' + endDate,
      'SUMMARY:' + title,
      'DESCRIPTION:' + description,
      'LOCATION:' + location,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'camila-xv.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function showCalendarModal(title, startDate, endDate, location, description) {
    let modal = $('#calendar-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'calendar-modal';
      modal.className = 'custom-modal';
      modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <button class="modal-close">&times;</button>
          <h3 class="modal-title">Agendar Evento</h3>
          <p class="modal-subtitle">Selecciona tu calendario</p>
          <div class="modal-buttons">
            <a href="#" class="modal-btn btn-google" id="modal-btn-google">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>
              Google Calendar
            </a>
            <a href="#" class="modal-btn btn-ical" id="modal-btn-ical">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z"/></svg>
              Apple / iCal (.ics)
            </a>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('.modal-overlay').addEventListener('click', closeCalendarModal);
      modal.querySelector('.modal-close').addEventListener('click', closeCalendarModal);
    }

    const googleUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent(title) +
      '&dates=' + startDate + '/' + endDate +
      '&details=' + encodeURIComponent(description) +
      '&location=' + encodeURIComponent(location) +
      '&sf=true&output=xml';

    modal.querySelector('#modal-btn-google').onclick = function (e) {
      e.preventDefault();
      window.open(googleUrl, '_blank');
      closeCalendarModal();
    };

    modal.querySelector('#modal-btn-ical').onclick = function (e) {
      e.preventDefault();
      downloadIcs(title, startDate, endDate, location, description);
      closeCalendarModal();
    };

    setTimeout(() => modal.classList.add('show'), 10);
  }

  function closeCalendarModal() {
    const modal = $('#calendar-modal');
    if (modal) {
      modal.classList.remove('show');
    }
  }

  window.addToCalendar = function () {
    const title = 'XV de Camila 🎉';
    const startDate = '20260717T220000'; // Viernes 17 de Julio
    const endDate = '20260718T050000';   // Sábado 18 de Julio 05:00
    const location = 'Mega Eventos Sur, Av. Rodríguez Peña 1799, Santos Lugares, Buenos Aires';
    const description = '¡Fiesta de XV de Camila! Dress code: Elegante. Evitar Azul, Dorado y Blanco.';

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS) {
      downloadIcs(title, startDate, endDate, location, description);
    } else {
      showCalendarModal(title, startDate, endDate, location, description);
    }
  };

  /* ============================================
     8. RSVP FORM → WhatsApp
     ============================================ */
  const rsvpForm = $('#rsvp-form');
  const rsvpSuccess = $('#rsvp-success');
  const rsvpGuestsContainer = $('#rsvp-guests-container');
  const rsvpGuests = $('#rsvp-guests');
  const rsvpAttendingInput = $('#rsvp-attending');
  const rsvpMessageLabel = $('#rsvp-message-label');
  const rsvpSubmitBtn = $('#rsvp-submit-btn');
  const rsvpSubmitText = $('#rsvp-submit-text');
  
  if (rsvpGuests) {
    rsvpGuests.required = true;
  }

  window.setRsvpAttendance = function(attending) {
    const btnYes = document.getElementById('rsvp-btn-yes');
    const btnNo = document.getElementById('rsvp-btn-no');
    
    if (!btnYes || !btnNo || !rsvpGuestsContainer || !rsvpGuests || !rsvpAttendingInput || !rsvpMessageLabel || !rsvpSubmitText) return;

    if (attending) {
      btnYes.classList.add('active');
      btnNo.classList.remove('active');
      rsvpGuestsContainer.classList.remove('collapsed');
      rsvpGuests.required = true;
      rsvpAttendingInput.value = 'true';
      rsvpMessageLabel.textContent = 'Un mensaje para mí (opcional)';
      rsvpSubmitText.textContent = 'Confirmar asistencia';
    } else {
      btnYes.classList.remove('active');
      btnNo.classList.add('active');
      rsvpGuestsContainer.classList.add('collapsed');
      rsvpGuests.required = false;
      rsvpGuests.value = ''; // Clear selection
      rsvpAttendingInput.value = 'false';
      rsvpMessageLabel.textContent = 'Mensaje para Camila (opcional)';
      rsvpSubmitText.textContent = 'Enviar Saludo';
    }
  };

  window.submitRsvpForm = function(e) {
    e.preventDefault();

    const name = $('#rsvp-name').value.trim();
    const message = $('#rsvp-message').value.trim();
    const attending = rsvpAttendingInput.value === 'true';
    const guests = rsvpGuests.value;

    if (!name) return;
    if (attending && !guests) return;

    // Build WhatsApp message
    let waMessage = '';
    if (attending) {
      waMessage = `🎉 *XV de Camila — Confirmación de Asistencia*\n\n`;
      waMessage += `👤 Nombre: ${name}\n`;
      waMessage += `👥 Asisten: ${guests} persona${guests > 1 ? 's' : ''}\n`;
      if (message) {
        waMessage += `💌 Mensaje: ${message}\n`;
      }
      waMessage += `\n✨ ¡Ahí estaré!`;
      
      // Update success page texts
      $('#rsvp-success-title').textContent = '¡Gracias por confirmar!';
      $('#rsvp-success-msg').textContent = 'Tu asistencia ha sido enviada con éxito 🎉';
    } else {
      waMessage = `💌 *XV de Camila — Saludo y Ausencia*\n\n`;
      waMessage += `👤 Nombre: ${name}\n`;
      if (message) {
        waMessage += `💌 Mensaje: ${message}\n`;
      }
      waMessage += `\nLamentablemente no podré asistir, ¡pero te deseo la mejor noche! ✨`;
      
      // Update success page texts
      $('#rsvp-success-title').textContent = '¡Gracias por tu mensaje!';
      $('#rsvp-success-msg').textContent = 'Tu saludo ha sido enviado con éxito a Camila 💌';
    }

    const phoneNumber = '5491100000000'; // Placeholder phone number
    const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(waMessage)}`;

    // Show success animation
    if (rsvpForm && rsvpSuccess) {
      rsvpForm.style.display = 'none';
      rsvpSuccess.classList.add('show');
      
      // Confetti burst
      const rect = rsvpSuccess.getBoundingClientRect();
      createConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 40);
    }

    // Open WhatsApp after a short delay
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 1200);
  };

  /* ============================================
     9. GOLD LEAF PARTICLES (floating background)
     ============================================ */
  const particlesCanvas = $('#particles-canvas');
  if (particlesCanvas) {
    const ctx = particlesCanvas.getContext('2d');
    let particles = [];
    let animFrameId = null;
    const goldColors = ['#C5A039', '#F3E7BF', '#E5C07B', '#91711B', '#E8D5A3'];

    function resizeParticlesCanvas() {
      particlesCanvas.width = window.innerWidth;
      particlesCanvas.height = window.innerHeight;
    }

    function createParticles(count) {
      particles = [];
      for (let i = 0; i < count; i++) {
        const size = Math.random() * 4 + 2;
        particles.push({
          x: Math.random() * particlesCanvas.width,
          y: Math.random() * particlesCanvas.height,
          width: size * (Math.random() * 1.5 + 1),
          height: size * (Math.random() * 0.6 + 0.4),
          speedY: Math.random() * 0.8 + 0.3,
          speedX: (Math.random() - 0.5) * 0.4,
          opacity: Math.random() * 0.6 + 0.2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.03,
          swaySpeed: Math.random() * 0.02 + 0.005,
          swayAmount: Math.random() * 0.5 + 0.2,
          swayOffset: Math.random() * 100,
          color: goldColors[Math.floor(Math.random() * goldColors.length)]
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

      particles.forEach((p) => {
        ctx.save();
        // Sway calculation
        const sway = Math.sin(Date.now() * p.swaySpeed + p.swayOffset) * p.swayAmount;
        ctx.translate(p.x + sway * 10, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        ctx.beginPath();
        // Draw gold leaf as organic ellipse
        ctx.ellipse(0, 0, p.width, p.height, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Update position and rotation
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.y > particlesCanvas.height + 10) {
          p.y = -10;
          p.x = Math.random() * particlesCanvas.width;
        }
        if (p.x < -20) p.x = particlesCanvas.width + 20;
        if (p.x > particlesCanvas.width + 20) p.x = -20;
      });

      animFrameId = requestAnimationFrame(drawParticles);
    }

    resizeParticlesCanvas();
    createParticles(window.innerWidth < 600 ? 20 : 40);
    drawParticles();

    window.addEventListener('resize', () => {
      resizeParticlesCanvas();
      createParticles(window.innerWidth < 600 ? 20 : 40);
    });
  }

  /* ============================================
     10. PORTAL SCREEN PARTICLES (sparkles)
     ============================================ */
  const portalCanvas = $('#portal-particles');
  if (portalCanvas) {
    const pctx = portalCanvas.getContext('2d');
    let portalParticles = [];
    let portalAnimId = null;

    function resizePortalCanvas() {
      portalCanvas.width = window.innerWidth;
      portalCanvas.height = window.innerHeight;
    }

    function createPortalParticles(count) {
      portalParticles = [];
      for (let i = 0; i < count; i++) {
        portalParticles.push({
          x: Math.random() * portalCanvas.width,
          y: Math.random() * portalCanvas.height,
          size: Math.random() * 2 + 0.5,
          speedY: -Math.random() * 0.8 - 0.2,
          speedX: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          twinkle: Math.random() * 0.02 + 0.005,
          twinkleDir: 1,
        });
      }
    }

    function drawPortalParticles() {
      pctx.clearRect(0, 0, portalCanvas.width, portalCanvas.height);

      portalParticles.forEach((p) => {
        pctx.beginPath();
        // Draw a 4-point star
        const s = p.size;
        pctx.moveTo(p.x, p.y - s * 2);
        pctx.lineTo(p.x + s * 0.5, p.y - s * 0.5);
        pctx.lineTo(p.x + s * 2, p.y);
        pctx.lineTo(p.x + s * 0.5, p.y + s * 0.5);
        pctx.lineTo(p.x, p.y + s * 2);
        pctx.lineTo(p.x - s * 0.5, p.y + s * 0.5);
        pctx.lineTo(p.x - s * 2, p.y);
        pctx.lineTo(p.x - s * 0.5, p.y - s * 0.5);
        pctx.closePath();
        pctx.fillStyle = `rgba(240, 214, 138, ${p.opacity})`;
        pctx.fill();

        // Update
        p.y += p.speedY;
        p.x += p.speedX;
        p.opacity += p.twinkle * p.twinkleDir;
        if (p.opacity <= 0.1 || p.opacity >= 0.9) p.twinkleDir *= -1;

        if (p.y < -10) {
          p.y = portalCanvas.height + 10;
          p.x = Math.random() * portalCanvas.width;
        }
      });

      // Stop if portal is hidden
      if (portalScreen && portalScreen.classList.contains('hidden')) {
        cancelAnimationFrame(portalAnimId);
        return;
      }

      portalAnimId = requestAnimationFrame(drawPortalParticles);
    }

    resizePortalCanvas();
    createPortalParticles(window.innerWidth < 600 ? 30 : 60);
    drawPortalParticles();

    window.addEventListener('resize', () => {
      resizePortalCanvas();
      createPortalParticles(window.innerWidth < 600 ? 30 : 60);
    });
  }

  /* ============================================
     11. CONFETTI BURST HELPER
     ============================================ */
  function createConfettiBurst(x, y, count) {
    const colors = ['#C9A84C', '#D4AF37', '#F0D68A', '#3A5A8C', '#E8D5A3', '#FFFFFF'];

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const color = colors[Math.floor(Math.random() * colors.length)];
      const angle = (Math.PI * 2 * i) / count;
      const velocity = 80 + Math.random() * 120;
      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity;
      const size = 5 + Math.random() * 6;
      const shapes = ['50%', '2px', '0'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];

      piece.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${shape};
        animation: none;
      `;

      document.body.appendChild(piece);

      // Animate with WAAPI for smoother performance
      const animation = piece.animate(
        [
          { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: 1 },
          {
            transform: `translate(${dx}px, ${dy + 200}px) rotate(${360 + Math.random() * 360}deg) scale(0)`,
            opacity: 0,
          },
        ],
        {
          duration: 1200 + Math.random() * 600,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          fill: 'forwards',
        }
      );

      animation.onfinish = () => piece.remove();
    }
  }

  /* ============================================
     12. SMOOTH SCROLL FOR INTERNAL LINKS
     ============================================ */
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      const target = $(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ============================================
     13. GOLD SEAL CLICK / INTERACTION (Confetti Burst)
     ============================================ */
  const floatingSeal = $('#floating-seal');
  if (floatingSeal) {
    const handleSealInteraction = (e) => {
      const rect = floatingSeal.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      // Confetti burst from the seal center
      createConfettiBurst(x, y, 20);
      
      // Feedback scale bounce
      floatingSeal.style.transform = 'scale(0.9) rotate(-10deg)';
      setTimeout(() => {
        floatingSeal.style.transform = '';
      }, 150);
    };

    floatingSeal.addEventListener('click', handleSealInteraction);
    floatingSeal.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSealInteraction(e);
      }
    });
  }

  /* ============================================
     14. BENTO GRID INTERACTIONS (Clock, Accordion, Map)
     ============================================ */
  // 1. Clock hands animation on viewport entry
  const clockHour = $('#clock-hour');
  const clockMinute = $('#clock-minute');
  const bentoClock = $('.bento-clock');
  
  if (clockHour && clockMinute && bentoClock) {
    if ('IntersectionObserver' in window) {
      const clockObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Hour hand to 22hs (10 o'clock): 10 * 30deg = 300deg
            clockHour.style.transform = 'rotate(300deg)';
            // Minute hand to 12 o'clock: 360deg
            clockMinute.style.transform = 'rotate(360deg)';
            clockObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      clockObserver.observe(bentoClock);
    } else {
      // Fallback
      clockHour.style.transform = 'rotate(300deg)';
      clockMinute.style.transform = 'rotate(360deg)';
    }
  }

  // 2. Accordion Venue Detail Toggle
  const venueBtn = $('#bento-venue-btn');
  const venueDetails = $('#bento-venue-details');
  if (venueBtn && venueDetails) {
    const toggleVenue = () => {
      const isExpanded = venueBtn.getAttribute('aria-expanded') === 'true';
      venueBtn.setAttribute('aria-expanded', !isExpanded);
      if (isExpanded) {
        venueDetails.style.maxHeight = '0px';
      } else {
        venueDetails.style.maxHeight = venueDetails.scrollHeight + 'px';
      }
    };

    venueBtn.addEventListener('click', toggleVenue);
    venueBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleVenue();
      }
    });
  }

  // 3. Map overlay toggle to avoid scroll traps on mobile
  const mapOverlay = $('#bento-map-overlay');
  if (mapOverlay) {
    mapOverlay.addEventListener('click', () => {
      mapOverlay.classList.add('active');
    });
  }

  // 4. Dresscode (Simplified to single content)

  // 5. Jukebox Vibe Selector
  window.setVibeOption = function(el) {
    const parent = el.closest('.vibes-options');
    if (!parent) return;
    
    // Deactivate all options
    parent.querySelectorAll('.vibe-option').forEach(opt => {
      opt.classList.remove('active');
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) radio.checked = false;
    });
    
    // Activate clicked option
    el.classList.add('active');
    const radio = el.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  };

  // 6. Jukebox Form Submit
  window.submitSongSuggestion = function(e) {
    e.preventDefault();
    
    const songInput = document.getElementById('music-song');
    const form = document.getElementById('jukebox-form');
    const success = document.getElementById('jukebox-success');
    
    if (!songInput || !form || !success) return;
    
    const songName = songInput.value.trim();
    if (!songName) return;
    
    // Find active vibe
    let vibeVal = "Para bailar";
    const activeVibeOpt = form.querySelector('.vibe-option.active input[type="radio"]');
    if (activeVibeOpt) {
      vibeVal = activeVibeOpt.value;
    }
    
    // Build WhatsApp message
    let waMessage = `🎵 *XV de Camila — Sugerencia de Canción*\n\n`;
    waMessage += `💿 Tema: ${songName}\n`;
    waMessage += `✨ Vibe: ${vibeVal}\n\n`;
    waMessage += `¡Para que explote la pista! 💥`;
    
    const phoneNumber = '5491100000000'; // Placeholder phone number
    const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(waMessage)}`;
    
    // Hide form, show success state
    form.style.display = 'none';
    success.classList.add('show');
    
    // Confetti burst
    const rect = success.getBoundingClientRect();
    createConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 35);
    
    // Open WhatsApp
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 1200);
  };

})();
