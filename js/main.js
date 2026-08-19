// Safari detection for CSS fallbacks (enables body.is-safari)
(function () {
  const ua = navigator.userAgent;
  const isSafari = ua.includes("Safari") && 
                   !ua.includes("Chrome") && 
                   !ua.includes("CriOS") && 
                   !ua.includes("Edg");

  if (isSafari) {
    document.body.classList.add('is-safari');
    console.log("Safari detected – fallback enabled");
  }
})();

// ============================================================
// Motion system — GSAP + ScrollTrigger
// Each section gets a treatment suited to its role rather than
// one blanket effect: sequenced timelines where elements relate
// to each other (hero, work heading, contact), staggered list
// reveals for repeated items (skills, education, experience,
// project cards), and a touch of parallax depth in the hero.
// Pattern reference: SKILL.md (gsap-scrolltrigger).
// ============================================================
(function () {
  if (typeof gsap === "undefined") return;
  if (typeof ScrollTrigger !== "undefined" && gsap.registerPlugin) {
    gsap.registerPlugin(ScrollTrigger);
  }

  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  // Project images + hero video finish loading after ScrollTrigger's first
  // measurement pass, which shifts page height and can throw off trigger
  // positions further down the page (the contact section especially, being
  // last). Re-measure once everything has actually loaded.
  if (typeof ScrollTrigger !== "undefined") {
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  // ---- Hero: headline leads, hint follows; gentle scroll parallax ----
  gsap.timeline({ defaults: { ease: "power2.out" } })
    .from(".landingHeadline", { y: 18, opacity: 0, duration: 1.1 })
    .from(".landingCenterHint", { y: 18, opacity: 0, duration: 1.1 }, "-=0.5");

  if (typeof ScrollTrigger !== "undefined") {
    // Headline drifts slightly slower than the scroll.
    gsap.to(".landingHeadline", {
      yPercent: -10,
      ease: "none",
      scrollTrigger: { trigger: ".landingSection", start: "top top", end: "bottom top", scrub: true }
    });
  }

  if (typeof ScrollTrigger === "undefined") return;

  // ---- Work: heading + subtitle sequenced, cards reveal individually ----
  gsap.timeline({
    scrollTrigger: { trigger: ".workTitleContainer", start: "top 85%", toggleActions: "play none none reverse" }
  })
    .from(".workSectionTitle", { y: 22, opacity: 0, duration: 0.7, ease: "power2.out" })
    .from(".workSectionSubtitle", { y: 14, opacity: 0, duration: 0.55, ease: "power2.out" }, "-=0.35");

  // Desktop-with-motion: pin the work section and scrub the project track
  // sideways so cards pass one at a time; everyone else (mobile, or
  // prefers-reduced-motion on any screen size) gets the plain vertical
  // list from the base CSS, with each card revealing as it scrolls into
  // view. The query here must match the CSS media query in style.css
  // exactly, since that's what switches the layout these rely on.
  let workMM = gsap.matchMedia();
  workMM.add(
    { isGallery: "(min-width: 901px) and (prefers-reduced-motion: no-preference)" },
    (context) => {
      const track = document.querySelector(".projectShowcase");
      const cards = gsap.utils.toArray('[class^="projectCard"]');
      if (!track || !cards.length) return;

      if (context.conditions.isGallery) {
        // Scroll the track its full scrollWidth (not scrollWidth minus
        // viewport width) so the last card actually exits past the left
        // edge before the section unpins, rather than stopping the moment
        // it's merely fully visible. Combined with the large left padding
        // on .projectShowcase (cards start off-screen right), this gives a
        // full off-right-in, off-left-out journey with room to scroll.
        const getDistance = () => track.scrollWidth;

        const galleryTween = gsap.to(track, {
          x: () => -getDistance(),
          ease: "none",
          scrollTrigger: {
            trigger: ".workSection",
            start: "top top",
            end: () => "+=" + getDistance(),
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });

        // The title starts big and centered — filling what would
        // otherwise be an empty-looking section before any card has
        // scrolled into view — then eases back down to its normal size
        // and position over the first ~22% of the gallery scroll, timed
        // to settle right around when the first card arrives. Scrubbed
        // off the same trigger/distance as the horizontal scroll above,
        // not a separate independent animation.
        const titleIntro = gsap.from(".workTitleContainer", {
          scale: 1.5,
          y: "24vh",
          transformOrigin: "center center",
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".workSection",
            start: "top top",
            end: () => "+=" + getDistance() * 0.22,
            scrub: 1
          }
        });

        // Each card fades in as it slides into view from the right and
        // fades out as it exits to the left — driven by the same scroll
        // progress as the horizontal scrub above.
        const fades = cards.map((card) =>
          gsap.timeline({
            scrollTrigger: {
              trigger: card,
              containerAnimation: galleryTween,
              start: "left 95%",
              end: "right 5%",
              scrub: true
            }
          })
            .fromTo(card, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.out" })
            .to(card, { opacity: 1, duration: 0.4 })
            .to(card, { opacity: 0, duration: 0.3, ease: "power1.in" })
        );

        return () => {
          galleryTween.kill();
          titleIntro.kill();
          fades.forEach((tl) => tl.kill());
        };
      }

      // Stacked list: fade each card in as it enters the viewport and back
      // out as it leaves — in either scroll direction, not just on reverse.
      const fades = cards.map((card) =>
        gsap.timeline({
          scrollTrigger: { trigger: card, start: "top 95%", end: "bottom 5%", scrub: true }
        })
          .fromTo(card, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.3, ease: "power1.out" })
          .to(card, { opacity: 1, y: 0, duration: 0.4 })
          .to(card, { opacity: 0, y: -26, duration: 0.3, ease: "power1.in" })
      );
      return () => fades.forEach((tl) => tl.kill());
    }
  );

  // Skills/Education/Experience section is a flat black background (see
  // style.css) — no scroll-scrubbed color transition into it anymore; the
  // FAFAFA-to-black interpolation passed through a visible gray midpoint
  // that didn't look good, so it's just a hard cut now.

  // ---- Skills / Education / Experience: heading then its own list ----
  function revealHeading(sel) {
    gsap.from(sel, {
      y: 20,
      opacity: 0,
      duration: 0.7,
      ease: "power2.out",
      scrollTrigger: { trigger: sel, start: "top 85%", toggleActions: "play none none reverse" }
    });
  }
  function revealList(containerSel, itemSel) {
    const container = document.querySelector(containerSel);
    if (!container) return;
    gsap.from(gsap.utils.toArray(itemSel), {
      y: 16,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.05,
      scrollTrigger: { trigger: container, start: "top 85%", toggleActions: "play none none reverse" }
    });
  }

  revealHeading(".skillsAndExpertiseTitle p");
  revealList(".skills", ".skill");

  revealHeading(".educationTitle p");
  revealList(".educations", ".education");

  revealHeading(".workExperienceTitle p");
  revealList(".experiences", ".experience");

  // Contact section (title, "Hire Me now" button, contact info row) is left
  // unanimated on purpose — it's the last section on the page, and a
  // scroll-triggered reveal there risked getting stuck invisible if
  // ScrollTrigger's position measurement went stale after images loaded.
})();

// ============================================================
// UI Interactions — hover polish
// Pointer-driven, not scroll-driven. gsap.quickTo() reuses a single
// tween per property instead of creating a new one on every mousemove
// (gsap-performance: "frequently updated properties").
// Skipped on touch devices (no real hover) and prefers-reduced-motion.
//
// Magnetic-pull on the buttons and the project card tilt/zoom were both
// tried and scrapped per feedback — revisit button/card interaction
// separately later.
// ============================================================
(function () {
  if (typeof gsap === "undefined") return;

  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasFineHover = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (prefersReduced || !hasFineHover) return;

  // ---- "View project" links: arrow launches forward + up with a playful
  // overshoot, text lifts slightly alongside it. A paused timeline played
  // forward/reversed on hover, rather than separate tweens per property,
  // so both pieces stay perfectly in sync going in either direction.
  gsap.utils.toArray(".projectLink").forEach((link) => {
    const icon = link.querySelector(".projectLinkIcon");
    const tl = gsap.timeline({ paused: true, defaults: { duration: 0.45, ease: "back.out(1.7)" } });

    tl.to(link, { scale: 1.04 }, 0);
    if (icon) tl.to(icon, { x: 6, y: -3, rotation: 16, scale: 1.2 }, 0);

    link.style.transformOrigin = "left center";
    link.addEventListener("mouseenter", () => tl.play());
    link.addEventListener("mouseleave", () => tl.reverse());
  });
})();

let isSlidLeft = false;

// Toggle the navOverlay when ballButton is clicked
document.getElementById('ballButton').addEventListener('click', function() {
    if (!isSlidLeft) {
        gsap.to('#navOverlay', {
            x: '0%',
            duration: 0.5
        });
        gsap.to("#ballButton", {
            backgroundColor: "var(--font)",
            border: "2px solid var(--highlightCol)"
        });
        gsap.to(".navLogo a",{
            duration: 0.5,
            color: "var(--font)"
        })
    } else {
        gsap.to('#navOverlay', {
            x: '100%', 
            duration: 0.5
        });
        gsap.to("#ballButton", {
            backgroundColor: "var(--highlightCol)",
            border: "2px solid var(--font)"
        });
        gsap.to(".navLogo a",{
            duration: 0.5,
            color: "var(--backGrountCol)"
        })
    }
    isSlidLeft = !isSlidLeft;
});

// Reset navOverlay when a menu item link is clicked
document.querySelectorAll('.menuItem a').forEach(link => {
    link.addEventListener('click', function() {
        gsap.to('#navOverlay', {
            x: '100%', 
            duration: 0.5
        });
        gsap.to("#ballButton", {
            backgroundColor: "var(--highlightCol)",
            border: "2px solid var(--font)"
        });
        gsap.to(".navLogo a",{
            duration: 0.5,
            color: "var(--backGrountCol)"
        });
        isSlidLeft = false;
    });
});

// Hover effect for ballButton
const ballButton = document.getElementById('ballButton');

// Note: x/y are intentionally left out here — the magnetic-pull interaction
// (see "UI Interactions" above) owns those on this element.
ballButton.addEventListener('mouseenter', () => {
    gsap.to(ballButton, {
        backgroundColor: "var(--font)",
        borderColor: "var(--highlightCol)",
        border: "4px solid var(--highlightCol)",
        width: 28,
        height: 28,
        duration: 0.2,
        ease: "power1.inOut"
    });
});

ballButton.addEventListener('mouseleave', () => {
    gsap.to(ballButton, {
        backgroundColor: isSlidLeft ? "var(--font)" : "var(--highlightCol)",
        border: isSlidLeft ? "2px solid var(--highlightCol)" : "2px solid var(--font)",
        width: 20,
        height: 20,
        duration: 0.2,
        ease: "power1.inOut"
    });
});


let mm = gsap.matchMedia();
mm.add(" (max-width: 450px)", () =>{
    gsap.to("#aboutImg3",{
        transform: "scale(.8) translateY(-1vh)",
        scrollTrigger:{
            trigger: "#aboutImg3",
            scrub:3,
            start: "top 35%",
            end: "top 30%",
        }
    })
    
    gsap.to("#aboutImg2",{
        transform: "translate(22vw, 3vh) rotate(11deg) scale(.8)",
        scrollTrigger:{
            trigger: "#aboutImg2",
            scrub:3,
            start: "top 35%",
            end: "top 30%",
        }
    })
    gsap.to("#aboutImg1",{
        transform: "translate(-22vw, -2vh) rotate(-11deg) scale(.8)",
        scrollTrigger:{
            trigger: "#aboutImg1",
            scrub:3,
            start: "top 35%",
            end: "top 30%",
        }
    })
}) 

mm.add("(min-width: 451px)", () => {
    gsap.to("#aboutImg3",{
        transform: "scale(0.9)",
        transform: "translateY(10vh)",
        scrollTrigger:{
            trigger: "#aboutImg3",
            scrub:3,
            start: "top 68%",
            end: "top 40%",
            // markers: true
        }
    })
    
    gsap.to("#aboutImg2",{
        transform: "translate(18vw, 20vh) rotate(11deg) scale(0.9)",
        scrollTrigger:{
            trigger: "#aboutImg2",
            scrub:3,
            start: "top 64%",
            end: "top 40%",
            // markers: true
        }
    })
    gsap.to("#aboutImg1",{
        transform: "translate(-18vw, 5vh) rotate(-11deg) scale(0.9)",
        scrollTrigger:{
            trigger: "#aboutImg1",
            scrub:3,
            start: "top 60%",
            end: "top 40%",
            // markers: true
        }
    })
    gsap.from(".aboutTitle2Wrapper", {
        // opacity: 0,
        transform: "translateY(40vh)",
        scrollTrigger:{
            trigger: ".aboutTitle2Wrapper",
            scroller: "body",
            scrub:3,
            start: "top 100%",
            end: "top 90%",
            // markers: true,
            stagger: 1,
        }
    })
})

// larg text animation

gsap.set(".split", { opacity: 1 });

document.fonts.ready.then(() => {
  let containers = gsap.utils.toArray(".largeTextWrapper");

  containers.forEach((container) => {
    let text = container.querySelector(".split");
    let animation;

    SplitText.create(text, {
      type: "words,lines",
      mask: "lines",
      linesClass: "line",
      autoSplit: true,
      onSplit: (instance) => {
        console.log("split")
        return gsap.from(instance.lines, {
          yPercent: 120,
          stagger: 0.1,
          scrollTrigger: {
            trigger: container,
            // markers: true,
            scrub: true,
            start: "clamp(top center)",
            end: "clamp(bottom center)"
          }
        });
      }
    });
  });
});


gsap.set(".largeTextWrapper.p", { opacity: 1 });

document.fonts.ready.then(() => {
  let containers = gsap.utils.toArray(".largeText");

  containers.forEach((container) => {
    let text = container.querySelector("..largeTextWrapper.p");
    let animation;

    SplitText.create(text, {
      type: "words,lines",
      mask: "lines",
      linesClass: "line",
      autoSplit: true,
      onSplit: (instance) => {
        console.log("largeText")
        return gsap.from(instance.lines, {
          yPercent: 120,
          stagger: 0.1,
          scrollTrigger: {
            trigger: container,
            markers: false,
            scrub: true,
            start: "clamp(top center)",
            end: "clamp(bottom center)"
          }
        });
      }
    });
  });
});







// Hover effect for hireButton
const hireButton = document.getElementById('hireButton');

// Note: x/y are intentionally left out here — the magnetic-pull interaction
// (see "UI Interactions" above) owns those on this element.
hireButton.addEventListener('mouseenter', () => {
    gsap.to(hireButton, {
        backgroundColor: "var(--font)",
        borderColor: "var(--highlightCol)",
        color: isSlidLeft ? "var(--font)": "var(--highlightCol)",
        border: "4px solid var(--font)",
        width: '15vw',
        height: '15vw',
        duration: 0.2,
        ease: "power1.inOut"
    });
});

hireButton.addEventListener('mouseleave', () => {
    gsap.to(hireButton, {
        backgroundColor: isSlidLeft ? "var(--font)" : "var(--highlightCol)",
        color: isSlidLeft ? "var(--highlightCol)": "var(--font)",
        border: isSlidLeft ? "2px var(--font) solid" : "2px var(--font) solid",
        width: '15vw',
        height: '15vw',
        duration: 0.2,
        ease: "power1.inOut"
    });
});
