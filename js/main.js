document.documentElement.classList.add("js");

const body = document.body;
const header = document.querySelector("#siteHeader");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector("#navMenu");
const navLinks = document.querySelectorAll(".nav-menu a");
const revealItems = document.querySelectorAll(".reveal");
const sections = document.querySelectorAll("main section[id]");

function closeMenu() {
  body.classList.remove("nav-open");
  navMenu.classList.remove("is-open");
  navToggle.classList.remove("is-active");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Abrir menú de navegación");
}

function toggleMenu() {
  const isOpen = navMenu.classList.toggle("is-open");
  body.classList.toggle("nav-open", isOpen);
  navToggle.classList.toggle("is-active", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute(
    "aria-label",
    isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"
  );
}

navToggle.addEventListener("click", toggleMenu);

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
    const destination = document.querySelector(link.hash);
    if (destination) {
      destination.setAttribute("tabindex", "-1");
      destination.focus({ preventScroll: true });
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navMenu.classList.contains("is-open")) {
    closeMenu();
    navToggle.focus();
  }
});

const mobileNavigation = window.matchMedia("(max-width: 900px)");
mobileNavigation.addEventListener("change", closeMenu);
document.addEventListener("click", (event) => {
  if (!header.contains(event.target)) closeMenu();
});

function updateHeaderState() {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const activeLink = document.querySelector(`.nav-menu a[href="#${entry.target.id}"]`);

        navLinks.forEach((link) => {
          link.classList.remove("is-active");
          link.removeAttribute("aria-current");
        });

        if (activeLink) {
          activeLink.classList.add("is-active");
          activeLink.setAttribute("aria-current", "location");
        }
      });
    },
    {
      rootMargin: "-38% 0px -52% 0px",
      threshold: 0,
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

// Fotografías actuales del campo y la facultad.
const AUTOPLAY_DELAY = 5500;

const heroSlides = [
  {
    src: "assets/slide-1.jpg",
    width: 1024,
    height: 768,
    alt: "Siluetas de vacas pastando durante un hermoso atardecer anaranjado entre los árboles",
    background: "#07182d",
    position: "center",
    label: "Atardecer en el campo",
  },
  {
    src: "assets/slide-2.jpg",
    width: 1024,
    height: 768,
    alt: "Dos terneros marrones pastando bajo la sombra de unos árboles en un día soleado",
    background: "#0a66c2",
    position: "center",
    label: "Terneros bajo el árbol",
  },
  {
    src: "assets/slide-3.jpg",
    width: 1024,
    height: 768,
    alt: "Un grupo de vacas y caballos bebiendo agua fresca de un canal rodeado de naturaleza",
    background: "#22c55e",
    position: "center",
    label: "Bebedero de animales",
  },
  {
    src: "assets/slide-4.jpg",
    width: 1024,
    height: 768,
    alt: "Primer plano de un pequeño ternero de color claro descansando sentado en la tierra seca",
    background: "#f59e0b",
    position: "center",
    label: "Ternero descansando",
  },
  {
    src: "assets/slide-5.jpg",
    width: 1024,
    height: 767,
    alt: "Edificio institucional o facultad con parqueo y autos bajo un cielo nublado",
    background: "#38bdf8",
    position: "center",
    label: "Instalaciones y facultad",
  },
];

function escapeCarouselText(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return entities[character];
  });
}

function initJourneyCarousel() {
  const carousel = document.querySelector("[data-journey-carousel]");
  if (!carousel || !heroSlides.length) return;

  const track = carousel.querySelector("[data-carousel-track]");
  const dots = carousel.querySelector("[data-carousel-dots]");
  const previousButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const status = carousel.querySelector("[data-carousel-status]");
  const pauseButton = carousel.querySelector("[data-carousel-pause]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hasMultipleSlides = heroSlides.length > 1;
  let currentSlide = 0;
  let autoplayTimer;
  let userPaused = reducedMotion.matches;
  let pointerInside = false;
  let touchStartX = 0;
  let touchStartY = 0;

  track.innerHTML = heroSlides
    .map((slide, index) => {
      let visual;

      if (slide.src) {
        // Imagen real cargada desde archivo
        visual = `<img
          src="${escapeCarouselText(slide.src)}"
          alt="${escapeCarouselText(slide.alt)}"
          width="${slide.width || 1600}"
          height="${slide.height || 900}"
          loading="${index === 0 ? "eager" : "lazy"}"
          decoding="async"
          ${index === 0 ? 'fetchpriority="high"' : ""}
          style="--slide-position: ${escapeCarouselText(slide.position || "50% 50%")}"
        />`;
      } else {
        // Placeholder temporal con gradiente CSS
        visual = `<div
          class="journey-carousel__slide-bg"
          style="background: ${slide.background || "linear-gradient(135deg, #07182d, #0a66c2)"}"
          role="img"
          aria-label="${escapeCarouselText(slide.alt)}"
        ><span class="journey-carousel__slide-label">${escapeCarouselText(slide.label || "")}</span></div>`;
      }

      return `
        <figure class="journey-carousel__slide" data-carousel-slide aria-hidden="${index !== 0}">
          ${visual}
          <figcaption>${escapeCarouselText(slide.label)}</figcaption>
        </figure>`;
    })
    .join("");

  dots.innerHTML = heroSlides
    .map(
      (_, index) => `
        <button
          type="button"
          aria-current="${index === 0 ? "true" : "false"}"
          aria-controls="journeySlides"
          aria-label="Ver diapositiva ${index + 1}"
          data-carousel-dot="${index}"
          ${hasMultipleSlides ? "" : "disabled"}
        ></button>`
    )
    .join("");

  const slideElements = [...track.querySelectorAll("[data-carousel-slide]")];
  const dotButtons = [...dots.querySelectorAll("[data-carousel-dot]")];

  function updateSlide(nextIndex, announce = false) {
    currentSlide = (nextIndex + heroSlides.length) % heroSlides.length;
    track.style.transform = `translate3d(-${currentSlide * 100}%, 0, 0)`;

    slideElements.forEach((slide, index) => {
      slide.setAttribute("aria-hidden", String(index !== currentSlide));
    });

    dotButtons.forEach((dot, index) => {
      dot.setAttribute("aria-current", String(index === currentSlide));
    });

    if (announce) {
      status.textContent = `Diapositiva ${currentSlide + 1} de ${heroSlides.length}`;
    }
  }

  function stopAutoplay() {
    window.clearInterval(autoplayTimer);
    autoplayTimer = undefined;
  }

  function startAutoplay() {
    stopAutoplay();
    if (!hasMultipleSlides || userPaused || reducedMotion.matches || document.hidden || pointerInside || carousel.contains(document.activeElement)) return;

    autoplayTimer = window.setInterval(() => {
      updateSlide(currentSlide + 1);
    }, AUTOPLAY_DELAY);
  }

  function pauseAfterInteraction() {
    stopAutoplay();
    // A manual choice remains on screen until the visitor resumes playback.
    userPaused = true;
    updatePauseButton();
  }

  function updatePauseButton() {
    pauseButton.setAttribute("aria-pressed", String(userPaused));
    pauseButton.setAttribute("aria-label", userPaused ? "Reanudar reproducción automática" : "Pausar reproducción automática");
    pauseButton.querySelector("[data-pause-icon]").hidden = userPaused;
    pauseButton.querySelector("[data-play-icon]").hidden = !userPaused;
  }

  previousButton.disabled = !hasMultipleSlides;
  nextButton.disabled = !hasMultipleSlides;
  pauseButton.disabled = !hasMultipleSlides || reducedMotion.matches;
  updatePauseButton();
  pauseButton.addEventListener("click", () => {
    userPaused = !userPaused;
    updatePauseButton();
    if (userPaused) stopAutoplay();
    else startAutoplay();
  });

  if (!hasMultipleSlides) {
    carousel.setAttribute("aria-label", "Diapositiva del encabezado");
    return;
  }

  previousButton.addEventListener("click", () => {
    updateSlide(currentSlide - 1, true);
    pauseAfterInteraction();
  });

  nextButton.addEventListener("click", () => {
    updateSlide(currentSlide + 1, true);
    pauseAfterInteraction();
  });

  dotButtons.forEach((dot) => {
    dot.addEventListener("click", () => {
      updateSlide(Number(dot.dataset.carouselDot), true);
      pauseAfterInteraction();
    });
  });

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      updateSlide(currentSlide - 1, true);
      pauseAfterInteraction();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      updateSlide(currentSlide + 1, true);
      pauseAfterInteraction();
    }
  });

  carousel.addEventListener("pointerenter", () => {
    pointerInside = true;
    stopAutoplay();
  });
  carousel.addEventListener("pointerleave", () => {
    pointerInside = false;
    startAutoplay();
  });
  carousel.addEventListener("focusin", stopAutoplay);
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) startAutoplay();
  });

  carousel.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch") return;
    touchStartX = event.clientX;
    touchStartY = event.clientY;
  });

  carousel.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "touch") return;
    const horizontalDistance = event.clientX - touchStartX;
    const verticalDistance = event.clientY - touchStartY;

    if (Math.abs(horizontalDistance) < 48 || Math.abs(horizontalDistance) <= Math.abs(verticalDistance)) return;

    updateSlide(currentSlide + (horizontalDistance < 0 ? 1 : -1), true);
    pauseAfterInteraction();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  const handleMotionChange = () => {
    if (reducedMotion.matches) {
      userPaused = true;
      stopAutoplay();
    } else {
      startAutoplay();
    }
    pauseButton.disabled = !hasMultipleSlides || reducedMotion.matches;
    updatePauseButton();
  };

  if (reducedMotion.addEventListener) {
    reducedMotion.addEventListener("change", handleMotionChange);
  } else {
    reducedMotion.addListener(handleMotionChange);
  }

  startAutoplay();
}

initJourneyCarousel();
