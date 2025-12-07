    <script>
        let currentSlideIndex = 0;
        const slides = document.querySelector('.carousel-slides');
        const dots = document.querySelectorAll('.dot');
        const totalSlides = 3;
        
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navCenter = document.getElementById('navCenter');
        
        mobileMenuBtn.addEventListener('click', function() {
            navCenter.classList.toggle('active');
            if (navCenter.classList.contains('active')) {
                mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });

        // Fonction pour afficher la diapositive
        function showSlide(index) {
            currentSlideIndex = index;
            // Assurez-vous que l'index reste dans les limites
            if (currentSlideIndex >= totalSlides) {
                currentSlideIndex = 0;
            } else if (currentSlideIndex < 0) {
                currentSlideIndex = totalSlides - 1;
            }

            // Déplace le conteneur des slides
            const offset = -currentSlideIndex * 100 / totalSlides;
            slides.style.transform = `translateX(${offset}%)`;

            // Met à jour les points de navigation
            dots.forEach((dot, i) => {
                dot.classList.remove('active');
                if (i === currentSlideIndex) {
                    dot.classList.add('active');
                }
            });
        }

        // Fonction pour passer à la diapositive suivante (utilisée par l'auto-slide)
        function nextSlide() {
            showSlide(currentSlideIndex + 1);
        }

        // Fonction pour la navigation manuelle (onClick sur les points)
        function currentSlide(index) {
            showSlide(index);
            resetTimer(); // Réinitialise l'auto-slide après une interaction manuelle
        }

        // Auto-slide
        let slideInterval = setInterval(nextSlide, 5000); // Change toutes les 5 secondes

        // Réinitialise le timer après interaction manuelle
        function resetTimer() {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
        }

        // Fermer le menu mobile en cliquant sur un lien
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 900) {
                    navCenter.classList.remove('active');
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        });

        // Initialisation de la première diapositive
        document.addEventListener('DOMContentLoaded', () => {
            showSlide(0);
            
            // Scroll animations
            const fadeElements = document.querySelectorAll('.fade-in');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            fadeElements.forEach(el => observer.observe(el));
        });
    </script>