import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

if (import.meta.env.DEV) {
  // debug handle for driving animations in hidden tabs (rAF suspended)
  (window as unknown as Record<string, unknown>).__wevolGsap = { gsap, ScrollTrigger };
}

function initSmoothScroll() {
  const lenis = new Lenis({ anchors: true });
  // keep ScrollTrigger in sync with Lenis and drive Lenis from GSAP's ticker
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
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

function init() {
  const { words, lines, images } = revealTargets();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    images.forEach((img) => (img.style.opacity = '1'));
    return;
  }

  initSmoothScroll();

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

init();
