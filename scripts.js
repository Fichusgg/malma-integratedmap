(function() {
    "use strict";

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.addEventListener('DOMContentLoaded', function() {
        const currentYearSpan = document.getElementById('currentYear');
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }

        handleHeader();
        handleHeroCarousel();
        handleListings();
        handleScrollAnimations();
    });

    function handleHeader() {
        const navToggle = document.querySelector('.nav-toggle');
        const navList = document.getElementById('navList');

        if (navToggle && navList) {
            navToggle.addEventListener('click', () => {
                const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
                navToggle.setAttribute('aria-expanded', !isExpanded);
                navList.classList.toggle('active');
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && navList.classList.contains('active')) {
                    navToggle.setAttribute('aria-expanded', 'false');
                    navList.classList.remove('active');
                    navToggle.focus();
                }
            });

            document.addEventListener('click', (e) => {
                if (navList.classList.contains('active') && !navList.contains(e.target) && !navToggle.contains(e.target)) {
                    navToggle.setAttribute('aria-expanded', 'false');
                    navList.classList.remove('active');
                }
            });
        }
    }

    function handleHeroCarousel() {
        const track = document.querySelector('.hero-image-carousel .carousel-track');
        if (!track) return;

        const slides = Array.from(track.children);
        if (slides.length <= 1) return;

        // --- Seamless Loop Setup ---
        // 1. Clone first and last slides
        const firstClone = slides[0].cloneNode(true);
        const lastClone = slides[slides.length - 1].cloneNode(true);
        
        // 2. Add clones to the track
        track.appendChild(firstClone);
        track.insertBefore(lastClone, slides[0]);

        // 3. Initial setup
        const allSlides = Array.from(track.children);
        let currentIndex = 1; // Start on the real first slide
        let isTransitioning = false;
        const slideInterval = 5000;
        const transitionStyle = `transform 0.8s cubic-bezier(0.35, 0, 0.25, 1)`;

        const setSlidePosition = () => {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
        };

        track.style.transition = 'none'; // Go to initial slide without animation
        setSlidePosition();

        // --- Event Listener for seamless jump ---
        track.addEventListener('transitionend', () => {
            isTransitioning = false;
            if (currentIndex === 0) { // Jumped to the last clone
                track.style.transition = 'none';
                currentIndex = allSlides.length - 2;
                setSlidePosition();
            }
            if (currentIndex === allSlides.length - 1) { // Jumped to the first clone
                track.style.transition = 'none';
                currentIndex = 1;
                setSlidePosition();
            }
        });

        const slide = () => {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex++;
            track.style.transition = transitionStyle;
            setSlidePosition();
        };

        if (!prefersReducedMotion) {
            setInterval(slide, slideInterval);
        }
    }

    function handleListings() {
        const panels = document.querySelectorAll('.listings-container .listing-panel');
        if (panels.length === 0 || window.innerWidth < 768) return;

        panels.forEach(panel => {
            panel.addEventListener('click', () => {
                if (panel.classList.contains('active')) return;
                panels.forEach(p => p.classList.remove('active'));
                panel.classList.add('active');
            });
        });
    }

    function handleScrollAnimations() {
        const animatedItems = document.querySelectorAll('#hero .animated-text');
        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            animatedItems.forEach(item => item.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedItems.forEach(item => observer.observe(item));
    }

})();