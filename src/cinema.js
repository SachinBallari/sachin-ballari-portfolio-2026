// Scroll is the playhead. Section geometry is measured only after layout changes.
const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));
const ease = (value) => value * value * (3 - 2 * value);

export function setupCinema() {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 900px), (pointer: coarse)');
  const tracks = [...document.querySelectorAll('.hero, .creative-intro-art, .work, .about, .tools, .experience, .testimonials, .contact, .playground')]
    .map(element => ({ element, top: 0, height: 0 }));
  let frame = 0;
  let measureNeeded = true;
  let playhead = scrollY;
  let lastTime = 0;
  let disposed = false;

  const measure = () => {
    // These section wrappers never receive transforms from this layer.
    tracks.forEach(track => {
      const rect = track.element.getBoundingClientRect();
      track.top = rect.top + scrollY;
      track.height = rect.height;
    });
    measureNeeded = false;
  };
  const render = (time) => {
    frame = 0;
    if (disposed) return;
    if (measureNeeded) measure();
    root.classList.toggle('cinema-enabled', !reduce.matches);
    if (reduce.matches) return;
    const elapsed = Math.min(50, time - (lastTime || time - 16));
    lastTime = time;
    playhead += (scrollY - playhead) * (1 - Math.exp(-elapsed / 65));
    if (Math.abs(scrollY - playhead) < 0.15) playhead = scrollY;
    const strength = mobile.matches ? 0.35 : 1;

    tracks.forEach(({ element, top, height }) => {
      const screenTop = top - playhead;
      const enter = ease(clamp((innerHeight * 0.96 - screenTop) / (innerHeight * 0.58)));
      const travel = clamp((playhead + innerHeight / 2 - top) / Math.max(height, innerHeight));
      // Full readability through the middle of each scene; motion at the edges.
      const edge = (1 - enter) * strength;
      element.style.setProperty('--film-enter', enter.toFixed(4));
      element.style.setProperty('--film-y', `${(edge * 42).toFixed(2)}px`);
      element.style.setProperty('--film-angle', `${(edge * 4).toFixed(3)}deg`);
      element.style.setProperty('--film-scale', (1 - edge * 0.035).toFixed(4));
      element.style.setProperty('--film-drift', `${((travel - 0.5) * 12 * strength).toFixed(2)}px`);
      element.style.setProperty('--film-zoom', (1 + edge * 0.045).toFixed(4));

      if (element.matches('.creative-intro-art')) {
        const start = top - Math.min(innerHeight * 0.94, height * 0.92);
        const finish = top - Math.min(innerHeight * 0.32, height * 0.24);
        const progress = clamp((playhead - start) / Math.max(1, finish - start));
        const left = 1 - ease(clamp(progress / 0.82));
        const center = 1 - ease(clamp((progress - 0.08) / 0.84));
        const right = 1 - ease(clamp((progress - 0.16) / 0.84));
        element.style.setProperty('--slice-left', `${(-left * 27 * strength).toFixed(3)}%`);
        element.style.setProperty('--slice-center', `${(center * 35 * strength).toFixed(3)}%`);
        element.style.setProperty('--slice-right', `${(right * 27 * strength).toFixed(3)}%`);
        element.style.setProperty('--slice-rotation', `${(left * 5 * strength).toFixed(3)}deg`);
      }
    });
    root.style.setProperty('--film-background-y', `${(-clamp(playhead / Math.max(1, root.scrollHeight - innerHeight)) * 42 * strength).toFixed(2)}px`);
    if (playhead !== scrollY) frame = requestAnimationFrame(render);
  };
  const schedule = () => { if (!frame && !disposed) frame = requestAnimationFrame(render); };
  const refresh = () => { measureNeeded = true; schedule(); };
  const resize = new ResizeObserver(refresh);
  tracks.forEach(({ element }) => resize.observe(element));
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', refresh, { passive: true });
  reduce.addEventListener('change', refresh);
  mobile.addEventListener('change', refresh);
  document.fonts.ready.then(() => { if (!disposed) refresh(); });
  schedule();

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    resize.disconnect();
    removeEventListener('scroll', schedule);
    removeEventListener('resize', refresh);
    reduce.removeEventListener('change', refresh);
    mobile.removeEventListener('change', refresh);
    root.classList.remove('cinema-enabled');
    tracks.forEach(({ element }) => [...element.style].filter(name => name.startsWith('--film-') || name.startsWith('--slice-')).forEach(name => element.style.removeProperty(name)));
    root.style.removeProperty('--film-background-y');
  };
}
