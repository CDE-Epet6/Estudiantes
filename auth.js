import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

const provider = new GoogleAuthProvider();

export const loginWithGoogle = () => {
    signInWithPopup(auth, provider).catch((error) => {
        console.error("Error al iniciar sesión con Google:", error);
        window.Toast.fire({
            icon: 'error',
            title: 'No se pudo iniciar sesión. Asegurate de tener los popups habilitados.'
        });
    });
};

// Hacer global la función para que otros scripts (como votacion.html) puedan usarla
window.loginWithGoogle = loginWithGoogle;

// Exportamos una promesa que se resuelve cuando se verifica la autenticación
// Esto es útil si necesitamos esperar a la autenticación antes de renderizar algo
const updateMobileBottomNav = (user, role) => {
    const dynamicBtn = document.getElementById('mobile-bottom-dynamic');
    if (!dynamicBtn) return;

    if (!user) {
        // Logged out
        dynamicBtn.href = "#";
        dynamicBtn.innerHTML = `
            <i class="fa-solid fa-right-to-bracket text-lg"></i>
            <span class="text-[10px] font-bold">Ingresar</span>
        `;
        dynamicBtn.onclick = (e) => {
            e.preventDefault();
            loginWithGoogle();
        };
        dynamicBtn.classList.remove('text-blue-600');
        dynamicBtn.classList.add('text-gray-400');
    } else if (role === 'admin' || role === 'delegado') {
        // Logged in as delegate/admin -> Show "Delegados" link
        dynamicBtn.href = "delegados.html";
        dynamicBtn.innerHTML = `
            <i class="fa-solid fa-users text-lg"></i>
            <span class="text-[10px] font-bold">Delegados</span>
        `;
        dynamicBtn.onclick = null;
        
        // Highlight active tab
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        if (currentPath === 'delegados.html') {
            dynamicBtn.classList.add('text-blue-600');
            dynamicBtn.classList.remove('text-gray-400');
        } else {
            dynamicBtn.classList.remove('text-blue-600');
            dynamicBtn.classList.add('text-gray-400');
        }
    } else {
        // Logged in as normal user -> Show "Salir"
        dynamicBtn.href = "#";
        const nombre = user.displayName ? user.displayName.split(' ')[0] : 'Alumno';
        const foto = user.photoURL || 'https://ui-avatars.com/api/?name=' + nombre;
        dynamicBtn.innerHTML = `
            <img src="${foto}" alt="Perfil" class="w-5 h-5 rounded-full border border-gray-300 object-cover">
            <span class="text-[10px] font-bold">Salir</span>
        `;
        dynamicBtn.onclick = (e) => {
            e.preventDefault();
            signOut(auth);
        };
        dynamicBtn.classList.remove('text-blue-600');
        dynamicBtn.classList.add('text-gray-400');
    }
};

// Exportamos una promesa que se resuelve cuando se verifica la autenticación
// Esto es útil si necesitamos esperar a la autenticación antes de renderizar algo
export const initAuth = () => {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            const userMenu = document.getElementById('user-menu');

            if (user && !user.isAnonymous) {
                // Poblado del menú de usuario (Logueado)
                const nombre = user.displayName ? user.displayName.split(' ')[0] : 'Alumno';
                const foto = user.photoURL || 'https://ui-avatars.com/api/?name=' + nombre;

                const userHTML = `
                    <div class="flex items-center gap-3">
                        <span class="text-xs font-semibold text-gray-200 hidden md:inline">Hola, ${nombre}</span>
                        <img src="${foto}" alt="Perfil" class="w-8 h-8 rounded-full border border-gray-300">
                        <button id="btn-logout" class="text-xs text-red-300 font-bold hover:text-red-500 ml-2"><i class="fa-solid fa-right-from-bracket"></i> Salir</button>
                    </div>
                `;
                if(userMenu) userMenu.innerHTML = userHTML;
                
                document.querySelectorAll('#btn-logout').forEach(btn => btn.addEventListener('click', () => signOut(auth)));

                // Mostrar instantáneamente basado en caché local
                const cachedRole = localStorage.getItem(`role_${user.email}`);
                if (cachedRole === 'admin') {
                    document.getElementById('nav-item-admin')?.classList.remove('hidden');
                    document.getElementById('nav-mobile-admin')?.classList.remove('hidden');
                    document.getElementById('nav-item-delegados')?.classList.remove('hidden');
                    document.getElementById('nav-mobile-delegados')?.classList.remove('hidden');
                } else if (cachedRole === 'delegado') {
                    document.getElementById('nav-item-delegados')?.classList.remove('hidden');
                    document.getElementById('nav-mobile-delegados')?.classList.remove('hidden');
                }
                updateMobileBottomNav(user, cachedRole);

                try {
                    // Verificación en segundo plano con Firestore
                    const adminDoc = await getDoc(doc(db, "config", "admins"));
                    let isAdmin = false;
                    if (adminDoc.exists() && adminDoc.data().emails && adminDoc.data().emails.includes(user.email)) {
                        isAdmin = true;
                    }

                    if (isAdmin) {
                        localStorage.setItem(`role_${user.email}`, 'admin');
                        document.getElementById('nav-item-admin')?.classList.remove('hidden');
                        document.getElementById('nav-mobile-admin')?.classList.remove('hidden');
                        document.getElementById('nav-item-delegados')?.classList.remove('hidden');
                        document.getElementById('nav-mobile-delegados')?.classList.remove('hidden');
                        updateMobileBottomNav(user, 'admin');
                    } else {
                        const delSnap = await getDoc(doc(db, "config", "delegados"));
                        if (delSnap.exists() && delSnap.data().emails && delSnap.data().emails.includes(user.email)) {
                            localStorage.setItem(`role_${user.email}`, 'delegado');
                            document.getElementById('nav-item-delegados')?.classList.remove('hidden');
                            document.getElementById('nav-mobile-delegados')?.classList.remove('hidden');
                            updateMobileBottomNav(user, 'delegado');
                        } else {
                            localStorage.removeItem(`role_${user.email}`);
                            document.getElementById('nav-item-admin')?.classList.add('hidden');
                            document.getElementById('nav-mobile-admin')?.classList.add('hidden');
                            document.getElementById('nav-item-delegados')?.classList.add('hidden');
                            document.getElementById('nav-mobile-delegados')?.classList.add('hidden');
                            updateMobileBottomNav(user, null);
                        }
                    }
                } catch(e) { 
                    console.error("Error verificando permisos", e); 
                }
            } else {
                // Poblado del menú de usuario (No Logueado)
                const loginHTML = `
                    <button id="btn-login-nav" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-full transition-all">
                        Iniciar Sesión
                    </button>
                `;
                if(userMenu) userMenu.innerHTML = loginHTML;
                
                document.querySelectorAll('#btn-login-nav').forEach(btn => btn.addEventListener('click', loginWithGoogle));

                // Ocultar elementos para no-logueados
                document.getElementById('nav-item-admin')?.classList.add('hidden');
                document.getElementById('nav-mobile-admin')?.classList.add('hidden');
                document.getElementById('nav-item-delegados')?.classList.add('hidden');
                document.getElementById('nav-mobile-delegados')?.classList.add('hidden');
                updateMobileBottomNav(null, null);
            }
            resolve(user);
        });
    });
};

// Auto-iniciar la escucha del estado de autenticación al importar el script
initAuth();

