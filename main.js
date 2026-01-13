function scrollingModule() {
  // Create fresh instance
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
}

function initPricing() {
  const splide = new Splide(".PricingSection---grid", {
    perPage: 3,
    gap: "40px",
    wheel: false,
    drag: false,
    breakpoints: {
      1030: {
        perPage: 2,
      },
      660: {
        perPage: 1,
      },
    },
    padding: {
      left: "0rem", // Remove padding from the start
      right: "0.1rem", // Keep padding at the end
    },
    arrows: false,
    pagination: false,
  });

  splide.mount();

  document
    .getElementById("pricing-b-arrow-left")
    .addEventListener("click", () => {
      splide.go("<");
    });

  document
    .getElementById("pricing-b-arrow-right")
    .addEventListener("click", () => {
      splide.go(">");
    });
}

function sideBarModule() {
  const burgerBtn = document.getElementById('burgerBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const menuLinks = document.querySelectorAll('.menu-link');

  function toggleMenu() {
    burgerBtn.classList.toggle('active');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
  }

  function closeMenu() {
    burgerBtn.classList.remove('active');
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  burgerBtn.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);

  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      closeMenu();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
      closeMenu();
    }
  });

}

function stickyNav() {
  const sentinel = document.getElementById('sentinel');

  // Create an Intersection Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // When sentinel is NOT intersecting (out of view), add sticky class
      if (!entry.isIntersecting) {
        document.body.classList.add('sticky');
      } else {
        document.body.classList.remove('sticky');
      }
    });
  }, {
    threshold: 0, // Trigger as soon as any part enters/leaves viewport
    rootMargin: '0px' // No margin adjustment
  });

  // Start observing the sentinel element
  observer.observe(sentinel);

}

function initTestimonials() {
  const splide = new Splide("#testimonial-slider", {
    perPage: 4,
    gap: "50px",
    arrows: false,
    loop: true,
    autoplay: true,
    start: 2,
    height: 'auto', // Automatically fits the content height
    autoHeight: true,
    perMove: 1,
    padding: {
      right: '10%',
      left: '10%'  // Optional: add right padding for symmetry
    },
    breakpoints: {
      1536: {
        gap: "30px",
      },
      1030: {
        perPage: 2,
      },
      660: {
        perPage: 1,
      },
    },
    pagination: true,
  });
  splide.mount();
}

function initPricingListSlider() {
  const priceBoxes = document.querySelectorAll(".PriceBox");
  priceBoxes.forEach((box) => {
    const boxPrev = box.querySelector(".price-items-arrow-left");
    const boxNext = box.querySelector(".price-items-arrow-right");
    const priceSlider = box.querySelector(".PricingSection---lists");
    if (!priceSlider) {
      console.error("PriceSlider not found");
      return;
    }
    const splide = new Splide(priceSlider, {
      perPage: 1,
      gap: 0,
      wheel: false,
      arrows: false,
      pagination: false,
    });

    splide.mount();

    boxPrev.addEventListener("click", () => {
      splide.go("<");
    });
    boxNext.addEventListener("click", () => {
      splide.go(">");
    });
  });
}

// Menu highlight functionality
class MenuHighlighter {
  constructor(menuSelector = '.menu-highlight-link', options = {}) {
    this.links = document.querySelectorAll(menuSelector);
    this.sections = [];
    this.activeSectionId = null;

    // Options with defaults
    this.options = {
      offset: options.offset || 100, // Distance from top to trigger highlight
      throttle: options.throttle || 100, // Throttle scroll events (ms)
      ...options
    };

    this.init();
  }

  init() {
    // Build a map of sections with all links pointing to them
    const sectionMap = new Map();

    this.links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const id = href.substring(1);

        if (!sectionMap.has(id)) {
          const section = document.getElementById(id);
          if (section) {
            sectionMap.set(id, {
              id,
              element: section,
              links: []
            });
          }
        }

        // Add this link to the section's links array
        if (sectionMap.has(id)) {
          sectionMap.get(id).links.push(link);
        }
      }
    });

    // Convert map to array for easier iteration
    this.sections = Array.from(sectionMap.values());

    // Set up scroll listener with throttling
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) return;

      scrollTimeout = setTimeout(() => {
        this.onScroll();
        scrollTimeout = null;
      }, this.options.throttle);
    });

    // Initial check
    this.onScroll();
  }

  onScroll() {
    const scrollPos = window.scrollY + this.options.offset;
    let currentSection = null;

    // Find which section is currently in view
    this.sections.forEach(section => {
      const rect = section.element.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const sectionBottom = sectionTop + rect.height;

      if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
        currentSection = section;
      }
    });

    // If no section is in view, check if we're near the top
    if (!currentSection && this.sections.length > 0) {
      const firstSection = this.sections[0];
      if (scrollPos < firstSection.element.getBoundingClientRect().top + window.scrollY) {
        currentSection = firstSection;
      }
    }

    // Update active links if section changed
    if (currentSection && currentSection.id !== this.activeSectionId) {
      this.setActiveSection(currentSection);
    } else if (!currentSection && this.activeSectionId) {
      this.removeActiveClass();
    }
  }

  setActiveSection(section) {
    // Remove active class from all links
    this.links.forEach(link => link.classList.remove('active'));

    // Add active class to all links pointing to this section
    section.links.forEach(link => link.classList.add('active'));

    this.activeSectionId = section.id;
  }

  removeActiveClass() {
    this.links.forEach(link => link.classList.remove('active'));
    this.activeSectionId = null;
  }
}


function modifyTestimonials() {

  const testimonialText = document.querySelectorAll('.TestimonialCard--text');
  const expandButton = document.createElement("div");
  expandButton.classList.add("advx-expand-button");
  expandButton.innerText = "Read More";

  testimonialText.forEach(function (text) {
    if (text.scrollHeight <= 220) {
      return;
    }
    text.style.maxHeight = '220px';
    text.classList.add('advx-truncated-text');
    const currentButton = expandButton.cloneNode(true);
    text.appendChild(currentButton);
    currentButton.addEventListener('click', function () {
      text.classList.toggle('active');
    });
  });
}


document.addEventListener("DOMContentLoaded", () => {
  initPricing();
  initPricingListSlider();
  initTestimonials();
  sideBarModule();
  stickyNav();
  setTimeout(() => {
    modifyTestimonials();
  }, 500);

  new MenuHighlighter('.menu-highlight-link', {
    offset: 100,
    throttle: 100
  });
});
