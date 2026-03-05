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

// ----------------------------
// Landing headline animation
// ----------------------------
// Uses SplitText if available; falls back to a simple fade-up.
// Also adds a subtle parallax on scroll.
(function () {
  const headline = document.querySelector(".landingHeadline");
  if (!headline || typeof gsap === "undefined") return;

  // Register ScrollTrigger if present
  if (typeof ScrollTrigger !== "undefined" && gsap && gsap.registerPlugin) {
    gsap.registerPlugin(ScrollTrigger);
  }

  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Initial reveal (on load)
  if (!prefersReduced) {
    if (typeof SplitText !== "undefined") {
      // Word-by-word build
      document.fonts.ready.then(() => {
        const split = new SplitText(headline, { type: "words" });
        gsap.from(split.words, {
          yPercent: 120,
          opacity: 0,
          stagger: 0.06,
          duration: 1.05,
          ease: "power3.out",
          clearProps: "transform"
        });
      });
    } else {
      // Fallback: simple fade-up
      gsap.from(headline, {
        y: 36,
        opacity: 0,
        duration: 1.0,
        ease: "power3.out"
      });
    }
  }

  // Parallax on scroll (very subtle)
  if (!prefersReduced && typeof ScrollTrigger !== "undefined") {
    gsap.to(headline, {
      yPercent: -12,
      ease: "none",
      scrollTrigger: {
        trigger: ".landingSection",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  }
})();

// ----------------------------
// Skills + Work Experience titles (scroll reveal)
// ----------------------------
(function () {
  if (typeof gsap === "undefined") return;

  // Register ScrollTrigger if present
  if (typeof ScrollTrigger !== "undefined" && gsap && gsap.registerPlugin) {
    gsap.registerPlugin(ScrollTrigger);
  }

  if (typeof ScrollTrigger === "undefined") return;

  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const skillsTitle = document.querySelector(".skillsAndExpertiseTitle p");
  const expTitle = document.querySelector(".workExperienceTitle p");
  const workTitle = document.querySelector(".workTitleContainer");

  // Use the section as a shared trigger so both headings animate nicely when the section enters.
  const triggerEl = document.querySelector(".skillsSection") || skillsTitle || expTitle;

  function splitReveal(el, label) {
    if (!el) return;

    if (typeof SplitText !== "undefined") {
      document.fonts.ready.then(() => {
        const split = new SplitText(el, { type: "words" });
        gsap.from(split.words, {
          yPercent: 120,
          opacity: 0,
          stagger: 0.06,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            end: "top 50%",
            markers: false,
            toggleActions: "play none none reverse"
          }
        });
      });
    } else {
      gsap.from(el, {
        y: 28,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          markers: false,
          toggleActions: "play none none reverse"
        }
      });
    }

    // Subtle parallax drift while scrolling through the skills section
    gsap.to(el, {
      yPercent: -8,
      ease: "none",
      scrollTrigger: {
        trigger: triggerEl,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        markers: false
      }
    });
  }

  splitReveal(skillsTitle, "skillsTitle");
  splitReveal(expTitle, "expTitle");
  splitReveal(workTitle, "workTitle");
})();

// ----------------------------
// Project cards (scroll reveal)
// ----------------------------
(function () {
  if (typeof gsap === "undefined") return;

  if (typeof ScrollTrigger !== "undefined" && gsap && gsap.registerPlugin) {
    gsap.registerPlugin(ScrollTrigger);
  }
  if (typeof ScrollTrigger === "undefined") return;

  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  // Select all project cards (projectCard1, projectCard2, ...)
  const cards = gsap.utils.toArray('[class^="projectCard"]');
  if (!cards.length) return;

  cards.forEach((card) => {
    // Card container reveal
    gsap.from(card, {
      y: 28,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        end: "top 55%",
        markers: false,
        toggleActions: "play none none reverse"
      }
    });

    // Headline word-by-word reveal (if SplitText available)
    const headline = card.querySelector(".projectHeadline");
    if (!headline) return;

    if (typeof SplitText !== "undefined") {
      document.fonts.ready.then(() => {
        const split = new SplitText(headline, { type: "words" });
        gsap.from(split.words, {
          yPercent: 120,
          opacity: 0,
          stagger: 0.05,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 82%",
            end: "top 55%",
            markers: false,
            toggleActions: "play none none reverse"
          }
        });
      });
    } else {
      gsap.from(headline, {
        y: 16,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 82%",
          markers: false,
          toggleActions: "play none none reverse"
        }
      });
    }

    // Optional: subtle parallax drift for the entire card
    gsap.to(card, {
      yPercent: -3,
      ease: "none",
      scrollTrigger: {
        trigger: card,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        markers: false
      }
    });
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

ballButton.addEventListener('mouseenter', () => {
    gsap.to(ballButton, {
        backgroundColor: "var(--font)",
        borderColor: "var(--highlightCol)",
        border: "4px solid var(--highlightCol)",
        width: 28,
        height: 28,
        x: 1,
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
        x: 0,
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

hireButton.addEventListener('mouseenter', () => {
    gsap.to(hireButton, {
        backgroundColor: "var(--font)",
        borderColor: "var(--highlightCol)",
        color: isSlidLeft ? "var(--font)": "var(--highlightCol)",
        border: "4px solid var(--font)",
        width: '15vw',
        height: '15vw',
        x: 1,
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
        x: 0,
        duration: 0.2,
        ease: "power1.inOut"
    });
});
