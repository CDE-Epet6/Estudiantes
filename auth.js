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
                    } else {
                        const delSnap = await getDoc(doc(db, "config", "delegados"));
                        if (delSnap.exists() && delSnap.data().emails && delSnap.data().emails.includes(user.email)) {
                            localStorage.setItem(`role_${user.email}`, 'delegado');
                            document.getElementById('nav-item-delegados')?.classList.remove('hidden');
                            document.getElementById('nav-mobile-delegados')?.classList.remove('hidden');
                        } else {
                            localStorage.removeItem(`role_${user.email}`);
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
            }
            resolve(user);
        });
    });
};

// Iniciar automáticamente al cargar
initAuth();
