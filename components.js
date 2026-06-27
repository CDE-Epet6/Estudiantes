const headerHTML = `
    <header class="bg-[#1d4ed8] text-white shadow-xl sticky top-0 z-50">
        <div class="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
            <div class="flex items-center space-x-4">
                <a href="index.html" class="flex-shrink-0 flex items-center">
                    <img src="logosinfondo.avif" alt="Logo Centro de Estudiantes (Lista Azul)" class="h-12 w-auto drop-shadow-sm">
                </a>
            </div>
            
            <!-- Menú Escritorio -->
            <nav class="hidden md:flex space-x-6 text-sm font-semibold">
                <a href="index.html" class="nav-link hover:text-blue-200 transition-colors" data-page="index.html">Inicio</a>
                <a href="propuestas.html" class="nav-link hover:text-blue-200 transition-colors" data-page="propuestas.html">Propuestas</a>
                <a href="buzon.html" class="nav-link hover:text-blue-200 transition-colors" data-page="buzon.html">Sugerencias</a>
                <a href="votacion.html" class="nav-link hover:text-blue-200 transition-colors" data-page="votacion.html">Votaciones</a>
                <a id="nav-item-delegados" href="delegados.html" class="nav-link hidden hover:text-blue-200 transition-colors" data-page="delegados.html">Delegados</a>
                <a id="nav-item-admin" href="admin.html" class="nav-link hidden hover:text-yellow-300 transition-colors text-yellow-100" data-page="admin.html"><i class="fa-solid fa-gear mr-1"></i> Administración</a>
            </nav>

            <div class="flex items-center gap-3 md:gap-4">
                <a href="https://www.instagram.com/cde.epet6.listaazul/" target="_blank" aria-label="Instagram Lista Azul"
                    class="hidden md:block hover:text-blue-200 transition-colors transform hover:scale-110 duration-200">
                    <i class="fa-brands fa-instagram text-3xl"></i>
                </a>
                <div id="user-menu" class="flex items-center">
                    <!-- Se inyecta botón de Google o foto de perfil -->
                </div>
                <!-- Botón Menú Móvil (Hamburguesa) -->
                <button id="mobile-menu-btn" class="md:hidden text-white focus:outline-none" aria-label="Abrir menú">
                    <i class="fa-solid fa-bars text-2xl"></i>
                </button>
            </div>
        </div>

        <!-- Menú Móvil Desplegable -->
        <div id="mobile-menu" class="hidden md:hidden bg-blue-800 flex flex-col space-y-2 px-4 py-4 text-sm font-semibold absolute w-full shadow-xl">
            <a href="index.html" class="nav-link text-white hover:text-blue-200 py-2 border-b border-blue-700" data-page="index.html">Inicio</a>
            <a href="propuestas.html" class="nav-link text-white hover:text-blue-200 py-2 border-b border-blue-700" data-page="propuestas.html">Propuestas</a>
            <a href="buzon.html" class="nav-link text-white hover:text-blue-200 py-2 border-b border-blue-700" data-page="buzon.html">Sugerencias</a>
            <a href="votacion.html" class="nav-link text-white hover:text-blue-200 py-2 border-b border-blue-700" data-page="votacion.html">Votaciones</a>
            <a id="nav-mobile-delegados" href="delegados.html" class="nav-link hidden text-white hover:text-blue-200 py-2 border-b border-blue-700" data-page="delegados.html">Delegados</a>
            <a id="nav-mobile-admin" href="admin.html" class="nav-link hidden text-yellow-200 py-2 border-b border-blue-700" data-page="admin.html">Admin</a>
            <div class="pt-2">
                <a href="https://www.instagram.com/cde.epet6.listaazul/" target="_blank" aria-label="Instagram Lista Azul" class="text-white hover:text-blue-200 flex items-center gap-2 py-2">
                    <i class="fa-brands fa-instagram text-xl"></i> Instagram
                </a>
            </div>
        </div>
    </header>
`;

const footerHTML = `
    <footer class="bg-gray-900 text-gray-300 pt-12 pb-6 mt-12 border-t-4 border-blue-600">
        <div class="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
                <h4 class="mb-4">
                    <img src="logosinfondo.avif" alt="Logo Centro de Estudiantes (Lista Azul)" class="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity">
                </h4>
                <p class="text-sm text-gray-400">Trabajando todos los días para hacer de la EPET 6 un lugar mejor para
                    todos los estudiantes.</p>
            </div>
            <div>
                <h4 class="text-white font-bold text-lg mb-4">Contacto Rápido</h4>
                <ul class="space-y-2 text-sm">
                    <li>
                        <a href="https://www.instagram.com/cde.epet6.listaazul/" target="_blank"
                            class="hover:text-white transition-colors flex items-center">
                            <i class="fa-brands fa-instagram w-6"></i> @cde.epet6.listaazul
                        </a>
                    </li>
                </ul>
            </div>
            <div>
                <h4 class="text-white font-bold text-lg mb-4">Enlaces Útiles</h4>
                <ul class="space-y-2 text-sm">
                    <li><a href="propuestas.html" class="hover:text-white transition-colors">Nuestras Propuestas</a></li>
                    <li><a href="buzon.html" class="hover:text-white transition-colors">Dejar una Sugerencia</a></li>
                    <li><a href="votacion.html" class="hover:text-white transition-colors">Votar Ideas</a></li>
                </ul>
            </div>
        </div>
        <div class="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p>&copy; 2026 Centro de Estudiantes EPET N°6 - Neuquén.</p>
            <p class="mt-2 md:mt-0 flex items-center gap-2">Diseñado por estudiantes para estudiantes. <a href="admin.html" class="hover:text-gray-300 transition-colors ml-1" title="Acceso Administrativo"><i class="fa-solid fa-lock text-gray-700 hover:text-gray-400"></i></a></p>
        </div>
    </footer>
`;

// Inyectar componentes
document.addEventListener('DOMContentLoaded', () => {
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        headerContainer.innerHTML = headerHTML;
    }

    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
        footerContainer.innerHTML = footerHTML;
    }

    // Inyectar Menú Inferior Móvil (Estilo App Nativa)
    const mobileBottomNav = document.createElement('div');
    mobileBottomNav.className = "md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 py-2 px-4 flex justify-around items-center z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] transition-all duration-300";
    mobileBottomNav.innerHTML = `
        <a href="index.html" class="mobile-nav-link flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-all duration-200" data-page="index.html">
            <i class="fa-solid fa-house text-lg"></i>
            <span class="text-[10px] font-bold">Inicio</span>
        </a>
        <a href="propuestas.html" class="mobile-nav-link flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-all duration-200" data-page="propuestas.html">
            <i class="fa-solid fa-bullhorn text-lg"></i>
            <span class="text-[10px] font-bold">Propuestas</span>
        </a>
        <a href="buzon.html" class="mobile-nav-link flex flex-col items-center justify-center -mt-6 bg-blue-600 text-white w-12 h-12 rounded-full shadow-lg shadow-blue-500/40 hover:bg-blue-700 transition-all border-4 border-gray-50 dark:border-gray-900 transform active:scale-90" data-page="buzon.html" title="Dejar Sugerencia">
            <i class="fa-solid fa-plus text-xl"></i>
        </a>
        <a href="votacion.html" class="mobile-nav-link flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-all duration-200" data-page="votacion.html">
            <i class="fa-solid fa-check-to-slot text-lg"></i>
            <span class="text-[10px] font-bold">Votar Ideas</span>
        </a>
        <a href="#" id="mobile-bottom-dynamic" class="mobile-nav-link flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-all duration-200" data-page="dynamic">
            <i class="fa-solid fa-right-to-bracket text-lg"></i>
            <span class="text-[10px] font-bold">Ingresar</span>
        </a>
    `;
    document.body.appendChild(mobileBottomNav);

    // Configurar menú hamburguesa
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileMenu.classList.contains('hidden')) {
                icon.classList.replace('fa-xmark', 'fa-bars');
            } else {
                icon.classList.replace('fa-bars', 'fa-xmark');
            }
        });
    }

    // Resaltar página actual
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        if (link.dataset.page === currentPath) {
            if (link.classList.contains('mobile-nav-link')) {
                if (link.getAttribute('href') !== 'buzon.html') {
                    link.classList.remove('text-gray-400');
                    link.classList.add('text-blue-600', 'scale-105');
                } else {
                    link.classList.remove('bg-blue-600');
                    link.classList.add('bg-blue-700', 'scale-105');
                }
            } else {
                // Estilos para desktop
                if (link.parentElement.tagName === 'NAV') {
                    link.classList.add('text-blue-200', 'border-b-2', 'border-blue-200', 'pb-1');
                    link.classList.remove('hover:text-blue-200', 'transition-colors');
                } else {
                    // Estilos para mobile (antiguo menú)
                    link.classList.add('text-blue-200');
                }
            }
        }
    });

    // Inyectar SweetAlert2
    const sweetAlertJS = document.createElement('script');
    sweetAlertJS.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
    document.head.appendChild(sweetAlertJS);

    // Definir Toast Global
    window.Toast = {
        fire: (options) => {
            if (typeof Swal !== 'undefined') {
                const ToastInstance = Swal.mixin({
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    background: '#1e293b',
                    color: '#fff',
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                });
                return ToastInstance.fire(options);
            } else {
                // Fallback
                setTimeout(() => window.Toast.fire(options), 300);
            }
        }
    };

    // Inyectar AOS (Animate On Scroll)
    const aosCSS = document.createElement('link');
    aosCSS.rel = 'stylesheet';
    aosCSS.href = 'https://unpkg.com/aos@2.3.1/dist/aos.css';
    document.head.appendChild(aosCSS);

    const aosJS = document.createElement('script');
    aosJS.src = 'https://unpkg.com/aos@2.3.1/dist/aos.js';
    aosJS.onload = () => {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100,
            easing: 'ease-out-cubic'
        });
    };
    document.head.appendChild(aosJS);

    // Importar auth dinámicamente para asegurar que los elementos del DOM ya existen
    import('./auth.js');
});
