import { useEffect } from 'react';
import { setupCinema } from './cinema';

const REVEALS = [
  '.hero-grid > div',
  '.assembled-collage',
  '.section-head > *',
  '.featured-index',
  '.featured-preview',
  '.about-image',
  '.about-copy > *',
  '.loop-row',
  '.timeline-item',
  '.playground-intro > *',
  '.gallery-item',
  '.contact > *'
].join(',');

const TILT_TARGETS = '.hero-art, .featured-preview, .about-image, .assembled-collage, .gallery-item';
const MAGNETIC_TARGETS = '.button, .playground-all, .nav a, .text-link';
const DRAG_TARGETS = '.floating-card, .round-stamp';
const TYPE_TARGETS = '.hero-copy, .about-copy > p, .timeline-item > p:last-child, .gallery-intro, .contact > p';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function createSpringPair(onUpdate, stiffness = 0.12, damping = 0.76) {
  let x = 0;
  let y = 0;
  let vx = 0;
  let vy = 0;
  let tx = 0;
  let ty = 0;
  let frame = 0;

  const tick = () => {
    vx = (vx + (tx - x) * stiffness) * damping;
    vy = (vy + (ty - y) * stiffness) * damping;
    x += vx;
    y += vy;
    onUpdate(x, y);
    if (Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(vx) + Math.abs(vy) > 0.02) {
      frame = requestAnimationFrame(tick);
    } else {
      x = tx;
      y = ty;
      onUpdate(x, y);
      frame = 0;
    }
  };

  return {
    set(nextX, nextY, impulseX = 0, impulseY = 0) {
      tx = nextX;
      ty = nextY;
      vx += impulseX;
      vy += impulseY;
      if (!frame) frame = requestAnimationFrame(tick);
    },
    stop() {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}

function canScrollInside(target, deltaY) {
  let node = target instanceof Element ? target : null;
  while (node && node !== document.body) {
    const style = getComputedStyle(node);
    const scrollable = /(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight;
    if (scrollable) {
      const canMoveDown = deltaY > 0 && node.scrollTop + node.clientHeight < node.scrollHeight - 1;
      const canMoveUp = deltaY < 0 && node.scrollTop > 1;
      if (canMoveDown || canMoveUp) return true;
    }
    node = node.parentElement;
  }
  return false;
}

function setupSmoothScroll(enabled) {
  if (!enabled) return () => {};
  let current = window.scrollY;
  let target = current;
  let frame = 0;
  let internalScroll = false;

  const limit = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const tick = () => {
    current += (target - current) * 0.16;
    if (Math.abs(target - current) < 0.35) current = target;
    internalScroll = true;
    window.scrollTo(0, current);
    internalScroll = false;
    if (current !== target) frame = requestAnimationFrame(tick);
    else frame = 0;
  };
  const moveTo = (next) => {
    target = clamp(next, 0, limit());
    if (!frame) frame = requestAnimationFrame(tick);
  };
  const onWheel = (event) => {
    if (matchMedia('(prefers-reduced-motion: reduce), (max-width: 900px), (pointer: coarse)').matches) return;
    if (event.defaultPrevented || event.ctrlKey || canScrollInside(event.target, event.deltaY)) return;
    if (Math.abs(event.deltaY) < 0.01) return;
    if (event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (!frame) current = target = window.scrollY;
    event.preventDefault();
    const multiplier = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? window.innerHeight : 1;
    moveTo(target + event.deltaY * multiplier * 0.9);
  };
  const onNativeScroll = () => {
    if (!internalScroll && !frame) current = target = window.scrollY;
  };
  const interrupt = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    current = target = window.scrollY;
  };
  const onAnchorClick = (event) => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    const destination = document.querySelector(id);
    if (!destination) return;
    event.preventDefault();
    moveTo(window.scrollY + destination.getBoundingClientRect().top);
    history.replaceState(null, '', id);
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('scroll', onNativeScroll, { passive: true });
  window.addEventListener('pointerdown', interrupt, { passive:true });
  window.addEventListener('keydown', interrupt);
  document.addEventListener('click', onAnchorClick);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('scroll', onNativeScroll);
    window.removeEventListener('pointerdown', interrupt);
    window.removeEventListener('keydown', interrupt);
    document.removeEventListener('click', onAnchorClick);
  };
}

export function usePortfolioMotion() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const desktop = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 901px)').matches;
    const compact = window.matchMedia('(max-width: 760px)').matches;
    const cleanups = [];

    document.documentElement.classList.toggle('motion-reduced', reduced);
    document.documentElement.classList.toggle('motion-desktop', desktop && !reduced);

    const revealItems = [...document.querySelectorAll(REVEALS)];
    const observer = reduced ? null : new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: compact ? 0.05 : 0.12, rootMargin: '0px 0px -7%' });

    const entranceFrames = [];
    revealItems.forEach((element, index) => {
      element.classList.add('motion-reveal');
      if (element.matches('.about-image, .featured-index')) element.classList.add('motion-from-left');
      else if (element.matches('.featured-preview, .assembled-collage')) element.classList.add('motion-scale-in');
      else if (element.matches('.gallery-item:nth-child(even)')) element.classList.add('motion-from-right');
      element.style.setProperty('--motion-delay', `${reduced ? 0 : Math.min(index % 5, 4) * (compact ? 35 : 60)}ms`);
      if (reduced) element.classList.add('is-visible');
      else {
        observer.observe(element);
        const rect = element.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < innerHeight) {
          entranceFrames.push(requestAnimationFrame(() => requestAnimationFrame(() => element.classList.add('is-visible'))));
        }
      }
    });
    document.querySelectorAll('.section-head h2, .about-copy h2, .playground-intro h2, .contact h2').forEach((heading) => heading.classList.add('motion-heading'));
    document.querySelector('.hero')?.classList.add('is-visible');
    const creativeSection = document.querySelector('.creative-intro-art');
    const creativeObserver = (reduced || !creativeSection) ? null : new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        creativeObserver.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -18%' });
    if (creativeSection) {
      const creativeRect = creativeSection.getBoundingClientRect();
      if (reduced || creativeRect.top < 0) creativeSection.classList.add('is-visible');
      else {
        creativeSection.classList.remove('is-visible');
        creativeObserver?.observe(creativeSection);
      }
    }
    cleanups.push(() => {
      observer?.disconnect();
      creativeObserver?.disconnect();
      entranceFrames.forEach(cancelAnimationFrame);
    });

    const typingItems = reduced ? [] : [...document.querySelectorAll(TYPE_TARGETS)];
    const typingObserver = reduced ? null : new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-typing');
        typingObserver.unobserve(entry.target);
      });
    }, { threshold: compact ? 0.08 : 0.22, rootMargin: '0px 0px -8%' });
    typingItems.forEach((element) => {
      const text = element.textContent;
      element.classList.add('motion-type');
      element.setAttribute('aria-label', text);
      element.textContent = '';
      const fragment = document.createDocumentFragment();
      let characterIndex = 0;
      text.split(/(\s+)/).forEach((token) => {
        if (/^\s+$/.test(token)) {
          fragment.append(document.createTextNode(token));
          return;
        }
        const word = document.createElement('span');
        word.className = 'motion-word';
        word.setAttribute('aria-hidden', 'true');
        word.style.setProperty('--word-delay', `${characterIndex * 10}ms`);
        word.style.setProperty('--word-duration', `${Math.max(token.length * 22, 70)}ms`);
        word.textContent = token;
        characterIndex += token.length;
        fragment.append(word);
      });
      element.append(fragment);
      typingObserver.observe(element);
    });
    cleanups.push(() => typingObserver?.disconnect());

    const depthItems = [...document.querySelectorAll('.hero-art, .assembled-collage, .featured-preview, .about-image')];
    const playgroundItems = [...document.querySelectorAll('.playground .gallery-item')];
    depthItems.forEach((element, index) => {
      element.classList.add('motion-depth');
      element.style.setProperty('--depth-strength', `${compact ? 2 : 5 + (index % 3) * 2}`);
    });

    let scrollFrame = 0;
    const renderScroll = () => {
      scrollFrame = 0;
      const scrollRange = document.documentElement.scrollHeight - innerHeight;
      document.documentElement.style.setProperty('--scroll-progress', scrollRange > 0 ? `${(scrollY / scrollRange) * 100}%` : '0%');
      document.documentElement.style.setProperty('--shape-scroll', `${scrollY.toFixed(0)}`);
      if (creativeSection && !creativeSection.classList.contains('is-visible') && creativeSection.getBoundingClientRect().top < innerHeight * 0.78) {
        creativeSection.classList.add('is-visible');
        creativeObserver?.unobserve(creativeSection);
      }
      revealItems.forEach((element) => {
        if (!element.classList.contains('is-visible') && element.getBoundingClientRect().top < innerHeight * 0.94) {
          element.classList.add('is-visible');
          observer?.unobserve(element);
        }
      });
      typingItems.forEach((element) => {
        if (!element.classList.contains('is-typing') && element.getBoundingClientRect().top < innerHeight * 0.9) {
          element.classList.add('is-typing');
          typingObserver?.unobserve(element);
        }
      });
      if (!reduced) depthItems.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const offset = clamp((innerHeight / 2 - (rect.top + rect.height / 2)) / innerHeight, -1, 1);
        element.style.setProperty('--depth-shift', `${(offset * Number(element.style.getPropertyValue('--depth-strength'))).toFixed(2)}px`);
      });
      if (!reduced) playgroundItems.forEach((element, index) => {
        const section = element.closest('.playground');
        const rect = section?.getBoundingClientRect();
        if (!rect || rect.bottom < 0 || rect.top > innerHeight) return;
        const progress = clamp((innerHeight - rect.top) / (innerHeight + rect.height), 0, 1) - .5;
        const direction = index % 2 ? -1 : 1;
        element.style.setProperty('--play-parallax', `${(progress * direction * (18 + index * 2)).toFixed(2)}px`);
      });
    };
    const onScroll = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(renderScroll);
    };
    addEventListener('scroll', onScroll, { passive: true });
    renderScroll();
    cleanups.push(() => {
      removeEventListener('scroll', onScroll);
      cancelAnimationFrame(scrollFrame);
    });

    if (desktop && !reduced) {
      cleanups.push(setupSmoothScroll(true));

      const tiltSprings = [];
      document.querySelectorAll(TILT_TARGETS).forEach((element) => {
        element.classList.add('motion-tilt');
        const spring = createSpringPair((x, y) => {
          element.style.setProperty('--tilt-x', `${y.toFixed(3)}deg`);
          element.style.setProperty('--tilt-y', `${x.toFixed(3)}deg`);
          element.style.setProperty('--media-x', `${(x * 1.35).toFixed(2)}px`);
          element.style.setProperty('--media-y', `${(y * -1.35).toFixed(2)}px`);
        }, 0.11, 0.74);
        const enter = () => element.classList.add('is-pointer-active');
        const move = (event) => {
          const rect = element.getBoundingClientRect();
          const x = clamp((event.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5) * 8;
          const y = clamp((event.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5) * -8;
          spring.set(x, y);
        };
        const leave = () => {
          element.classList.remove('is-pointer-active');
          spring.set(0, 0);
        };
        element.addEventListener('pointerenter', enter);
        element.addEventListener('pointermove', move);
        element.addEventListener('pointerleave', leave);
        tiltSprings.push(() => {
          spring.stop();
          element.removeEventListener('pointerenter', enter);
          element.removeEventListener('pointermove', move);
          element.removeEventListener('pointerleave', leave);
        });
      });
      cleanups.push(() => tiltSprings.forEach((cleanup) => cleanup()));

      const magneticSprings = [];
      document.querySelectorAll(MAGNETIC_TARGETS).forEach((element) => {
        element.classList.add('motion-magnetic');
        const spring = createSpringPair((x, y) => {
          element.style.setProperty('--magnetic-x', `${x.toFixed(2)}px`);
          element.style.setProperty('--magnetic-y', `${y.toFixed(2)}px`);
        }, 0.14, 0.72);
        const move = (event) => {
          const rect = element.getBoundingClientRect();
          spring.set(clamp((event.clientX - rect.left - rect.width / 2) * 0.08, -5, 5), clamp((event.clientY - rect.top - rect.height / 2) * 0.1, -4, 4));
        };
        const leave = () => spring.set(0, 0);
        element.addEventListener('pointermove', move);
        element.addEventListener('pointerleave', leave);
        magneticSprings.push(() => {
          spring.stop();
          element.removeEventListener('pointermove', move);
          element.removeEventListener('pointerleave', leave);
        });
      });
      cleanups.push(() => magneticSprings.forEach((cleanup) => cleanup()));

      const dragSprings = [];
      document.querySelectorAll(DRAG_TARGETS).forEach((element) => {
        element.classList.add('motion-draggable');
        let dragging = false;
        let originX = 0;
        let originY = 0;
        let lastX = 0;
        let lastY = 0;
        let lastTime = 0;
        let dragVelocityX = 0;
        let dragVelocityY = 0;
        const spring = createSpringPair((x, y) => {
          element.style.setProperty('--drag-x', `${x.toFixed(2)}px`);
          element.style.setProperty('--drag-y', `${y.toFixed(2)}px`);
          element.style.setProperty('--drag-rotate', `${clamp(x * 0.055, -4, 4).toFixed(2)}deg`);
        }, 0.1, 0.75);
        const down = (event) => {
          if (event.button !== 0) return;
          dragging = true;
          originX = lastX = event.clientX;
          originY = lastY = event.clientY;
          lastTime = performance.now();
          dragVelocityX = 0;
          dragVelocityY = 0;
          element.classList.add('is-dragging');
          element.setPointerCapture(event.pointerId);
          spring.set(0, 0);
        };
        const move = (event) => {
          if (!dragging) return;
          const nextX = clamp(event.clientX - originX, -60, 60);
          const nextY = clamp(event.clientY - originY, -46, 46);
          const now = performance.now();
          const elapsed = Math.max(8, now - lastTime);
          dragVelocityX = clamp((event.clientX - lastX) / elapsed, -1.4, 1.4);
          dragVelocityY = clamp((event.clientY - lastY) / elapsed, -1.4, 1.4);
          lastX = event.clientX;
          lastY = event.clientY;
          lastTime = now;
          spring.set(nextX, nextY);
        };
        const up = (event) => {
          if (!dragging) return;
          dragging = false;
          element.classList.remove('is-dragging');
          if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
          spring.set(0, 0, dragVelocityX * 1.8, dragVelocityY * 1.8);
        };
        element.addEventListener('pointerdown', down);
        element.addEventListener('pointermove', move);
        element.addEventListener('pointerup', up);
        element.addEventListener('pointercancel', up);
        dragSprings.push(() => {
          spring.stop();
          element.removeEventListener('pointerdown', down);
          element.removeEventListener('pointermove', move);
          element.removeEventListener('pointerup', up);
          element.removeEventListener('pointercancel', up);
        });
      });
      cleanups.push(() => dragSprings.forEach((cleanup) => cleanup()));

      const pointerMove = (event) => {
        document.documentElement.style.setProperty('--shape-x', `${((event.clientX / innerWidth) - 0.5).toFixed(3)}`);
        document.documentElement.style.setProperty('--shape-y', `${((event.clientY / innerHeight) - 0.5).toFixed(3)}`);
      };
      addEventListener('pointermove', pointerMove, { passive: true });
      cleanups.push(() => removeEventListener('pointermove', pointerMove));
    }

    let audioContext;
    let audioUnlocked = false;
    const AudioConstructor = window.AudioContext || window.webkitAudioContext;
    const playLinkTone = (event) => {
      if (!(event.target instanceof Element)) return;
      const control = event.target.closest('a, button');
      if (!control || control.contains(event.relatedTarget) || reduced || !audioUnlocked || !AudioConstructor) return;
      audioContext ||= new AudioConstructor();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 520;
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.018, audioContext.currentTime + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.045);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.055);
    };
    const unlockAudio = () => {
      if (!AudioConstructor || reduced) return;
      audioContext ||= new AudioConstructor();
      if (audioContext.state === 'suspended') audioContext.resume();
      audioUnlocked = true;
    };
    document.addEventListener('pointerdown', unlockAudio, { passive: true, once: true });
    document.addEventListener('pointerover', playLinkTone, { passive: true });
    cleanups.push(() => {
      document.removeEventListener('pointerdown', unlockAudio);
      document.removeEventListener('pointerover', playLinkTone);
      audioContext?.close();
    });

    cleanups.push(setupCinema());
    return () => cleanups.reverse().forEach((cleanup) => cleanup());
  }, []);
}
