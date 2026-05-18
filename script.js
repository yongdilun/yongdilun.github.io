(function () {
  const motionQuery = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };
  const prefersReducedMotion = () => motionQuery.matches;

  const typedEl = document.getElementById("typed");
  if (typedEl) {
    typedEl.textContent = "clean, scalable web apps.";
  }

  const navbar = document.getElementById("navbar");
  if (navbar) {
    let ticking = false;

    const updateNavSurface = () => {
      navbar.classList.toggle("is-scrolled", window.scrollY > 24);
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(updateNavSurface);
          ticking = true;
        }
      },
      { passive: true }
    );

    updateNavSurface();
  }

  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.getElementById("primary-navigation");

  const setMobileNav = (open) => {
    if (!navToggle || !navLinks) return;

    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    navLinks.classList.toggle("is-open", open);
  };

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      setMobileNav(!isOpen);
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMobileNav(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMobileNav(false);
      }
    });
  }

  const sectionLinks = [...document.querySelectorAll(".nav-links a[href^='#']")];
  const sections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const setActiveLink = (activeId) => {
    sectionLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${activeId}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const getScrollOffset = () => {
    const isDesktop = window.matchMedia("(min-width: 1121px)").matches;
    return isDesktop ? 0 : (navbar?.offsetHeight || 0) + 12;
  };

  const scrollToSection = (target) => {
    const top = target.getBoundingClientRect().top + window.pageYOffset - getScrollOffset();
    window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  document.querySelectorAll("a[href^='#']").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();

      scrollToSection(target);
      history.pushState(null, "", href);
      setActiveLink(target.id);
      setMobileNav(false);
    });
  });

  const updateActiveLink = () => {
    if (!sections.length) return;

    const marker = Math.min(window.innerHeight * 0.36, 360);
    let activeId = sections[0].id;

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= marker) {
        activeId = section.id;
      }
    });

    setActiveLink(activeId);
  };

  if (sections.length) {
    let activeTicking = false;

    window.addEventListener(
      "scroll",
      () => {
        if (!activeTicking) {
          window.requestAnimationFrame(() => {
            updateActiveLink();
            activeTicking = false;
          });
          activeTicking = true;
        }
      },
      { passive: true }
    );

    window.addEventListener("resize", updateActiveLink);
    updateActiveLink();
  }

  const revealSelector = [
    "#hero .hero-content",
    "#hero .hero-visual",
    "#about > .section-inner > .section-tag",
    "#about > .section-inner > .section-title",
    "#about .about-text",
    "#about .skills-grid",
    "#projects > .section-inner > .section-tag",
    "#projects > .section-inner > .section-title",
    "#projects .project-card",
    "#contact > .section-inner > .section-tag",
    "#contact > .section-inner > .section-title",
    "#contact .section-sub",
    "#contact .contact-card",
  ].join(",");

  const revealItems = [...document.querySelectorAll(revealSelector)];

  const showRevealItem = (item) => {
    item.classList.add("is-visible");
  };

  if (revealItems.length) {
    if ("IntersectionObserver" in window && !prefersReducedMotion()) {
      revealItems.forEach((item, index) => {
        item.classList.add("reveal-item", "reveal-ready");

        if (item.matches(".hero-content, .about-text")) {
          item.classList.add("reveal-left");
        }

        if (item.matches(".hero-visual, .skills-grid")) {
          item.classList.add("reveal-right");
        }

        item.style.setProperty("--reveal-delay", `${Math.min(index % 3, 2) * 70}ms`);
      });

      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              showRevealItem(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.08,
          rootMargin: "0px 0px 8% 0px",
        }
      );

      revealItems.forEach((item) => revealObserver.observe(item));

      if (motionQuery.addEventListener) {
        motionQuery.addEventListener("change", (event) => {
          if (event.matches) {
            revealItems.forEach(showRevealItem);
          }
        });
      }
    } else {
      revealItems.forEach((item) => {
        item.classList.add("reveal-item", "is-visible");
      });
    }
  }

  const carouselState = {};

  function syncDots(id, idx) {
    const wrap = document.getElementById(id);
    if (!wrap) return;

    wrap.querySelectorAll(".carousel-dot").forEach((dot, dotIndex) => {
      const active = dotIndex === idx;
      dot.classList.toggle("active", active);
      if (active) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  }

  function goToSlide(id, idx) {
    const wrap = document.getElementById(id);
    if (!wrap) return;

    const slides = wrap.querySelectorAll(".carousel-slide");
    const track = wrap.querySelector(".carousel-track");
    if (!slides.length || !track) return;

    const nextIndex = (idx + slides.length) % slides.length;
    carouselState[id] = nextIndex;
    track.style.transform = `translateX(-${nextIndex * 100}%)`;
    slides.forEach((slide, index) => {
      slide.setAttribute("aria-hidden", index === nextIndex ? "false" : "true");
    });
    syncDots(id, nextIndex);
  }

  function moveCarousel(id, dir) {
    const wrap = document.getElementById(id);
    if (!wrap) return;

    const slides = wrap.querySelectorAll(".carousel-slide");
    if (!slides.length) return;

    const current = carouselState[id] || 0;
    goToSlide(id, current + dir);
  }

  function initCarousel(id) {
    const wrap = document.getElementById(id);
    if (!wrap) return;

    const slides = wrap.querySelectorAll(".carousel-slide");
    const dotsContainer = document.getElementById(`dots-${id}`);
    if (!slides.length || !dotsContainer) return;

    carouselState[id] = 0;
    wrap.setAttribute("tabindex", "0");
    wrap.setAttribute("role", "region");
    wrap.setAttribute("aria-roledescription", "carousel");
    dotsContainer.innerHTML = "";

    slides.forEach((slide, index) => {
      slide.setAttribute("aria-hidden", index === 0 ? "false" : "true");

      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `carousel-dot${index === 0 ? " active" : ""}`;
      dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
      if (index === 0) {
        dot.setAttribute("aria-current", "true");
      }
      dot.addEventListener("click", () => goToSlide(id, index));
      dotsContainer.appendChild(dot);
    });

    wrap.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveCarousel(id, -1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveCarousel(id, 1);
      }

      if (event.key === "Home") {
        event.preventDefault();
        goToSlide(id, 0);
      }

      if (event.key === "End") {
        event.preventDefault();
        goToSlide(id, slides.length - 1);
      }
    });
  }

  document.querySelectorAll(".image-carousel").forEach((carousel) => {
    initCarousel(carousel.id);
  });

  window.goToSlide = goToSlide;
  window.moveCarousel = moveCarousel;
})();
