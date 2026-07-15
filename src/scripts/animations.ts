import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

if (import.meta.env.DEV) {
  // debug handle for driving animations in hidden tabs (rAF suspended)
  (window as unknown as Record<string, unknown>).__wevolGsap = { gsap, ScrollTrigger };
}

let lenis: Lenis | null = null;

function initSmoothScroll() {
  lenis = new Lenis({ anchors: true });
  // keep ScrollTrigger in sync with Lenis and drive Lenis from GSAP's ticker
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis!.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  // exposed so the inline loader failsafe (Layout.astro) can release the scroll
  // lock if it ever has to dismiss the loader itself
  (window as unknown as Record<string, unknown>).__wvLenis = lenis;
  return lenis;
}

const EASE = 'power4.out';

function revealTargets(): {
  words: HTMLElement[];
  lines: HTMLElement[];
  images: HTMLElement[];
} {
  return {
    words: gsap.utils.toArray<HTMLElement>('[data-reveal="words"]'),
    lines: gsap.utils.toArray<HTMLElement>('[data-reveal="lines"]'),
    images: gsap.utils.toArray<HTMLElement>('[data-reveal-img]'),
  };
}

/**
 * Masked slide-in from the bottom without fade. Headings that embed inline
 * images (e.g. the WEVOL logo inside a title) can't be split by SplitText,
 * so they slide in as a single masked block instead.
 */
function maskedBlockReveal(el: HTMLElement): gsap.core.Tween {
  const wrap = document.createElement('div');
  wrap.style.overflow = 'clip';
  el.parentNode?.insertBefore(wrap, el);
  wrap.appendChild(el);
  return gsap.from(el, {
    yPercent: 110,
    duration: 0.9,
    ease: EASE,
    scrollTrigger: { trigger: wrap, start: 'top 85%', once: true },
    // release the mask afterwards so descenders (ç, j, g…) aren't clipped
    onComplete: () => (wrap.style.overflow = 'visible'),
  });
}

/**
 * Scroll-triggered reveals (titles, paragraphs, images). Called *after* the
 * entry loader finishes, so the hero's in-view elements animate in as the
 * page's entrance rather than firing under the loader.
 */
function initReveals() {
  const { words, lines, images } = revealTargets();

  document.fonts.ready.then(() => {
    // Titles: slide-in from bottom, masked underneath, split by word
    words.forEach((el) => {
      if (el.querySelector('img')) {
        maskedBlockReveal(el);
        return;
      }
      SplitText.create(el, {
        type: 'words',
        mask: 'words',
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.words, {
            yPercent: 110,
            duration: 0.9,
            ease: EASE,
            stagger: 0.05,
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            // restore the original markup afterwards: the overflow-clip masks
            // would keep clipping descenders (ç, j, g…) on tight line-heights
            onComplete: () => self.revert(),
          });
        },
      });
    });

    // Paragraphs: same masked slide-in, split by line
    lines.forEach((el) => {
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 110,
            duration: 0.8,
            ease: EASE,
            stagger: 0.08,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            onComplete: () => self.revert(),
          });
        },
      });
    });

    // Images: subtle zoom 105% → 100% with fade
    images.forEach((img) => {
      gsap.fromTo(
        img,
        { opacity: 0, scale: 1.05 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: { trigger: img, start: 'top 90%', once: true },
          // GSAP bakes responsive CSS translates into the inline transform in px;
          // clearing it lets breakpoint-specific transforms apply again after resize
          onComplete: () => gsap.set(img, { clearProps: 'transform' }),
        }
      );
    });

    ScrollTrigger.refresh();
  });
}

function showImagesStatic() {
  gsap.utils.toArray<HTMLElement>('[data-reveal-img]').forEach((img) => (img.style.opacity = '1'));
}

/**
 * Resolves once the *visible* hero video can play (readyState ≥ 3). Resolves
 * immediately if it's already buffered (cache), and also on `error` so a failed
 * video never traps the loader. The 5s cap lives in playLoader().
 */
function heroVideoReady(): Promise<void> {
  return new Promise((resolve) => {
    const desktop = window.matchMedia('(min-width: 768px)').matches;
    const video = document.querySelector<HTMLVideoElement>(
      `video[data-hero-video="${desktop ? 'desktop' : 'mobile'}"]`
    );
    if (!video || video.readyState >= 3) return resolve();
    const done = () => {
      video.removeEventListener('canplay', done);
      video.removeEventListener('error', done);
      resolve();
    };
    video.addEventListener('canplay', done, { once: true });
    video.addEventListener('error', done, { once: true });
  });
}

function lockScroll() {
  lenis?.stop();
  document.documentElement.style.overflow = 'hidden';
}
function unlockScroll() {
  lenis?.start();
  document.documentElement.style.overflow = '';
}

/**
 * Entry loader choreography. The ring (trim-path) always fills gradually over at
 * least FILL seconds — even when the video is cached and ready instantly — then
 * completes to 100% once loading finishes (or the 5s cap is hit), and finally the
 * three marks fade and the black panel slides up to reveal the running video.
 *
 * The ring is driven through a proxy (`prog`) whose onUpdate writes
 * stroke-dashoffset directly: animating the fractional dash value with GSAP
 * itself was unreliable (it jumped near the end instead of filling smoothly).
 */
function playLoader(loader: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const mark = loader.querySelector<SVGElement>('.wv-loader__mark')!;
    const ring = loader.querySelector<SVGCircleElement>('.wv-loader__ring')!;
    const text = loader.querySelector<HTMLElement>('.wv-loader__text')!;
    const FILL = 1.5; // s — the ring never fills faster than this (guaranteed minimum)
    const CAP = 5000; // ms — hard cap if the video never becomes ready

    const prog = { v: 0 }; // 0 → 1, mapped to the ring's dash offset (1 − v)
    const draw = () => (ring.style.strokeDashoffset = String(1 - prog.v));
    draw();

    // fills smoothly toward 90% over FILL seconds (indeterminate — real video
    // byte-progress isn't reliable); completes to 100% when loading finishes.
    const fill = gsap.to(prog, { v: 0.9, duration: FILL, ease: 'power1.inOut', onUpdate: draw });

    const finish = () => {
      gsap.to(prog, {
        v: 1,
        duration: 0.4,
        ease: 'power2.inOut',
        onUpdate: draw,
        onComplete: () => {
          const tl = gsap.timeline({
            onComplete: () => {
              loader.style.display = 'none';
              resolve();
            },
          });
          tl.to([mark, text], { opacity: 0, duration: 0.4, ease: 'power2.out' }).to(
            loader,
            { yPercent: -100, duration: 0.9, ease: 'power4.inOut' },
            '-=0.05'
          );
        },
      });
    };

    const cap = new Promise<void>((r) => window.setTimeout(r, CAP));

    // Wait for the video (or the cap), but never finish before the minimum fill
    // has played out — otherwise a cached video makes the ring pop and vanish.
    Promise.race([heroVideoReady(), cap]).then(() => {
      if (fill.progress() < 1) fill.eventCallback('onComplete', finish);
      else finish();
    });
  });
}

function boot() {
  const loader = document.getElementById('wv-loader');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) {
    // no entrance animation: dismiss the loader and show content statically
    if (loader) loader.style.display = 'none';
    document.documentElement.style.overflow = '';
    showImagesStatic();
    initChips();
    return;
  }

  initSmoothScroll();
  initChips(); // below the fold — safe to set up while the loader plays

  if (!loader) {
    // safety: no loader in the DOM → behave as before
    initReveals();
    return;
  }

  // pin the hero at the top and lock scroll; hide the hero's reveal targets so
  // the slide reveals only the running video (they animate in right after).
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  document.documentElement.classList.add('wv-loading');
  lockScroll();

  playLoader(loader).then(() => {
    document.documentElement.classList.remove('wv-loading');
    initReveals(); // hero is in view now → its titles/paragraphs animate in
    unlockScroll();
  });
}

/**
 * CorpoUnico status chips over the va600 screen.
 * Desktop (≥1280): the 4 chips float with a gentle, desynchronized wiggle.
 * Mobile (<1280): only one chip is shown at a time, cycling through the 4 with
 * a fade-in-from-below. No-JS / reduced-motion fallback: desktop shows all four
 * static, mobile shows the first chip only (via `max-xl:opacity-0` on the rest).
 */
function initChips() {
  const scope = document.querySelector<HTMLElement>('[data-chips-scope]');
  if (!scope) return;
  const chips = gsap.utils.toArray<HTMLElement>('[data-chip]', scope);
  if (!chips.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 1280px)', () => {
    gsap.set(chips, { opacity: 1, y: 0 });
    const tweens = chips.map((chip, i) =>
      gsap.to(chip, {
        y: 10,
        duration: 2.4 + i * 0.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.5,
      })
    );
    return () => tweens.forEach((t) => t.kill());
  });

  mm.add('(max-width: 1279px)', () => {
    gsap.set(chips, { opacity: 0, y: 0 });
    const cycle = gsap.timeline({ repeat: -1 });
    chips.forEach((chip) => {
      cycle
        .fromTo(
          chip,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
        )
        .to(chip, { opacity: 0, y: -12, duration: 0.5, ease: 'power2.in' }, '+=2');
    });
    return () => cycle.kill();
  });
}

boot();
