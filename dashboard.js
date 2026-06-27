import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, collection, getDocs, query, deleteDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

const provider = new GoogleAuthProvider();

// UI Elements
const pLoading = document.getElementById('auth-guard');
const pDashboard = document.getElementById('dashboard-content');
const adminList = document.getElementById('admin-list');
const delegadoList = document.getElementById('delegado-list');
const listaTareas = document.getElementById('lista-tareas');
const listaRecursos = document.getElementById('lista-recursos');

const SUPER_ADMIN_EMAIL = "xrodrice@gmail.com";
let currentUser = null;

// Auth State Listener
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const adminDoc = await getDoc(doc(db, "config", "admins"));
        if (adminDoc.exists() && adminDoc.data().emails && adminDoc.data().emails.includes(user.email)) {
            // Autorizado
            pLoading.classList.add('hidden');
            pDashboard.classList.remove('hidden');

            if (user.email !== SUPER_ADMIN_EMAIL) {
                document.getElementById('seccion-gestor-admins')?.classList.add('hidden');
            } else {
                document.getElementById('seccion-gestor-admins')?.classList.remove('hidden');
            }

            // Inicializar Data
            cargarListaAdmins();
            cargarListaDelegados();
            cargarTareas();
            cargarRecursos();

            // Es Admin: Mostrar dashboard en navbar
            document.getElementById('nav-item-dashboard')?.classList.remove('hidden');
            document.getElementById('nav-mobile-dashboard')?.classList.remove('hidden');
        } else {
            // Denegado
            pLoading.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-5xl text-red-500 mb-4"></i><h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Acceso Denegado</h2><p class="text-gray-600 dark:text-gray-400">Esta página es exclusiva para la mesa directiva del CDE.</p>';
        }
    } else {
        // No hay usuario
        pLoading.innerHTML = '<i class="fa-solid fa-user-lock text-5xl text-gray-400 mb-4"></i><h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Iniciá Sesión</h2><p class="text-gray-600 dark:text-gray-400">Debés iniciar sesión con tu cuenta de administrador.</p>';
    }
});

// ==========================================
// 1. GESTOR DE MIEMBROS (ADMINS Y DELEGADOS)
// ==========================================

function cargarListaAdmins() {
    const docRef = doc(db, "config", "admins");
    onSnapshot(docRef, (docSnap) => {
        adminList.innerHTML = '';
        if (docSnap.exists() && docSnap.data().emails) {
            const emails = docSnap.data().emails;
            if (emails.length === 0) {
                adminList.innerHTML = '<li class="text-sm text-gray-500 italic">No hay admins registrados.</li>';
                return;
            }

            emails.forEach(email => {
                const li = document.createElement('li');
                li.className = "flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-200 dark:border-gray-600";
                const isSuperAdmin = email === SUPER_ADMIN_EMAIL;
                const badge = isSuperAdmin ? '<span class="ml-2 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded border border-yellow-300">Secretario</span>' : '';
                
                const btnDelete = isSuperAdmin ? '<div class="w-8"></div>' : `<button onclick="window.removerAdmin('${email}')" class="text-red-400 hover:text-red-600 transition-colors w-8 h-8 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center"><i class="fa-solid fa-trash-can"></i></button>`;

                let nombre = docSnap.data().nombres?.[email] || docSnap.data()[`nombres.${email}`] || 'Sin nombre registrado';

                li.innerHTML = `
                    <div class="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200">
                        <i class="fa-regular fa-envelope mr-3 text-gray-400"></i> 
                        <div>
                            <span class="block">${nombre} ${badge}</span>
                            <span class="text-xs text-gray-500 dark:text-gray-400 font-normal">${email}</span>
                        </div>
                    </div>
                    ${btnDelete}
                `;
                adminList.appendChild(li);
            });
        }
    });
}

document.getElementById('form-add-admin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputEmail = document.getElementById('new-admin-email');
    const inputName = document.getElementById('new-admin-name');
    const email = inputEmail.value.trim().toLowerCase();
    const nombre = inputName.value.trim();

    if (email && nombre) {
        const btn = e.target.querySelector('button');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        try {
            await setDoc(doc(db, "config", "admins"), {
                emails: arrayUnion(email),
                [`nombres.${email}`]: nombre
            }, { merge: true });
            inputEmail.value = '';
            inputName.value = '';
        } catch (error) {
            console.error(error);
            alert("Error al agregar admin.");
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-plus"></i>';
        }
    }
});

window.removerAdmin = async (email) => {
    if (confirm(`¿Estás seguro de quitarle el permiso a ${email}?`)) {
        try {
            await updateDoc(doc(db, "config", "admins"), { emails: arrayRemove(email) });
        } catch (error) { console.error(error); }
    }
};

function cargarListaDelegados() {
    const docRef = doc(db, "config", "delegados");
    onSnapshot(docRef, (docSnap) => {
        delegadoList.innerHTML = '';
        if (docSnap.exists() && docSnap.data().emails) {
            const emails = docSnap.data().emails;
            if (emails.length === 0) {
                delegadoList.innerHTML = '<li class="text-sm text-gray-500 italic">No hay delegados registrados.</li>';
                return;
            }

            emails.forEach(email => {
                const li = document.createElement('li');
                li.className = "flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-200 dark:border-gray-600";
                
                let nombre = docSnap.data().nombres?.[email] || docSnap.data()[`nombres.${email}`] || 'Sin nombre';
                let curso = docSnap.data().cursos?.[email] || docSnap.data()[`cursos.${email}`] || 'Sin curso';
                let telefono = docSnap.data().telefonos?.[email] || docSnap.data()[`telefonos.${email}`] || '';

                let cleanPhone = telefono.replace(/\D/g, '');
                if (cleanPhone.length > 0 && !cleanPhone.startsWith('54')) cleanPhone = '549' + cleanPhone;
                
                const btnWhatsapp = cleanPhone ? `<a href="https://wa.me/${cleanPhone}" target="_blank" class="text-green-500 hover:bg-green-50 w-8 h-8 rounded-full flex items-center justify-center mr-2"><i class="fa-brands fa-whatsapp text-lg"></i></a>` : '';
                const btnDelete = `<button onclick="window.removerDelegado('${email}')" class="text-red-400 hover:bg-red-50 w-8 h-8 rounded-full flex items-center justify-center"><i class="fa-solid fa-trash-can"></i></button>`;

                li.innerHTML = `
                    <div class="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 flex-grow">
                        <i class="fa-regular fa-user mr-3 text-gray-400 text-lg"></i>
                        <div>
                            <span class="block">${nombre} <span class="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">${curso}</span></span>
                            <span class="text-xs text-gray-500 font-normal block">${email}</span>
                            ${telefono ? `<span class="text-xs text-green-600 block"><i class="fa-solid fa-phone text-[10px] mr-1"></i>${telefono}</span>` : ''}
                        </div>
                    </div>
                    <div class="flex items-center">${btnWhatsapp}${btnDelete}</div>
                `;
                delegadoList.appendChild(li);
            });
        }
    });
}

document.getElementById('form-add-delegado').addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputEmail = document.getElementById('new-delegado-email');
    const inputName = document.getElementById('new-delegado-name');
    const inputCurso = document.getElementById('new-delegado-curso');
    const inputTelefono = document.getElementById('new-delegado-telefono');
    
    if (inputEmail.value && inputName.value && inputCurso.value) {
        const btn = e.target.querySelector('button');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
        try {
            await setDoc(doc(db, "config", "delegados"), {
                emails: arrayUnion(inputEmail.value.trim().toLowerCase()),
                [`nombres.${inputEmail.value.trim().toLowerCase()}`]: inputName.value.trim(),
                [`cursos.${inputEmail.value.trim().toLowerCase()}`]: inputCurso.value.trim(),
                [`telefonos.${inputEmail.value.trim().toLowerCase()}`]: inputTelefono.value.trim()
            }, { merge: true });
            inputEmail.value = ''; inputName.value = ''; inputCurso.value = ''; inputTelefono.value = '';
        } catch (error) { console.error(error); } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-plus mr-1"></i> Registrar Delegado';
        }
    }
});

window.removerDelegado = async (email) => {
    if (confirm(`¿Quitar acceso a ${email}?`)) {
        try { await updateDoc(doc(db, "config", "delegados"), { emails: arrayRemove(email) }); } catch (error) {}
    }
};

// ==========================================
// 2. TAREAS Y REPOSITORIO
// ==========================================

async function cargarTareas() {
    onSnapshot(collection(db, "tareas_centro"), (qs) => {
        listaTareas.innerHTML = '';
        if(qs.empty) {
            listaTareas.innerHTML = '<p class="text-sm text-gray-500 italic text-center py-4">No hay tareas pendientes.</p>';
            return;
        }
        let tareas = [];
        qs.forEach(d => tareas.push({ id: d.id, ...d.data() }));
        tareas.sort((a,b) => (a.completada === b.completada) ? b.timestamp - a.timestamp : (a.completada ? 1 : -1)).forEach(tarea => {
            const statusColor = tarea.completada ? 'border-gray-200 dark:border-gray-600 opacity-60' : 'border-green-200 border-l-4 border-l-green-500';
            const iconColor = tarea.completada ? 'text-green-500' : 'text-gray-300 hover:text-green-500';
            const icon = tarea.completada ? 'fa-square-check' : 'fa-square';
            const textColor = tarea.completada ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200 font-medium';
            listaTareas.innerHTML += `
                <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border ${statusColor}">
                    <button onclick="window.toggleTarea('${tarea.id}', ${!tarea.completada})" class="${iconColor} transition-colors">
                        <i class="fa-regular ${icon} text-xl"></i>
                    </button>
                    <p class="flex-1 text-sm ${textColor} break-words">${tarea.texto}</p>
                    <button onclick="window.borrarTarea('${tarea.id}')" class="text-gray-400 hover:text-red-500 transition-colors p-1"><i class="fa-solid fa-trash text-sm"></i></button>
                </div>
            `;
        });
    });
}

document.getElementById('form-tarea').addEventListener('submit', async (e) => {
    e.preventDefault();
    const texto = document.getElementById('tarea-texto').value.trim();
    if (texto) {
        try {
            await addDoc(collection(db, "tareas_centro"), { texto, completada: false, timestamp: Date.now() });
            document.getElementById('tarea-texto').value = '';
        } catch(e) {}
    }
});
window.toggleTarea = async (id, status) => { try { await updateDoc(doc(db, "tareas_centro", id), { completada: status }); } catch(e){} };
window.borrarTarea = async (id) => { if(confirm("¿Eliminar tarea?")) try { await deleteDoc(doc(db, "tareas_centro", id)); } catch(e){} };

async function cargarRecursos() {
    onSnapshot(collection(db, "recursos_centro"), (qs) => {
        listaRecursos.innerHTML = '';
        if(qs.empty) {
            listaRecursos.innerHTML = '<p class="text-sm text-gray-500 italic text-center py-4">No hay enlaces guardados.</p>';
            return;
        }
        let recs = [];
        qs.forEach(d => recs.push({ id: d.id, ...d.data() }));
        recs.sort((a,b) => b.timestamp - a.timestamp).forEach(r => {
            listaRecursos.innerHTML += `
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div class="flex-1 min-w-0 pr-4">
                        <h4 class="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">${r.titulo}</h4>
                        <a href="${r.url}" target="_blank" class="text-xs text-blue-500 hover:underline truncate block">${r.url}</a>
                    </div>
                    <button onclick="window.borrarRecurso('${r.id}')" class="text-gray-400 hover:text-red-500 p-1"><i class="fa-solid fa-trash text-sm"></i></button>
                </div>
            `;
        });
    });
}

document.getElementById('form-recurso').addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('recurso-titulo').value.trim();
    const url = document.getElementById('recurso-url').value.trim();
    if (titulo && url) {
        try {
            await addDoc(collection(db, "recursos_centro"), { titulo, url, timestamp: Date.now() });
            document.getElementById('form-recurso').reset();
        } catch(e) {}
    }
});
window.borrarRecurso = async (id) => { if(confirm("¿Eliminar enlace?")) try { await deleteDoc(doc(db, "recursos_centro", id)); } catch(e){} };

// ==========================================
// 3. ARCHIVO HISTÓRICO
// ==========================================

document.getElementById('btn-cargar-archivo').addEventListener('click', async () => {
    const btn = document.getElementById('btn-cargar-archivo');
    const tbody = document.getElementById('tabla-archivo');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Cargando...';
    try {
        const q = query(collection(db, "eventos"));
        const qs = await getDocs(q);
        
        if (qs.empty) {
            tbody.innerHTML = '<tr class="bg-white border-b"><td colspan="4" class="px-6 py-4 text-center italic">No hay actas registradas.</td></tr>';
        } else {
            let eventos = [];
            qs.forEach(d => eventos.push({ id: d.id, ...d.data() }));
            // Sort por timestamp (más recientes primero)
            eventos.sort((a, b) => b.timestamp - a.timestamp);
            
            window.eventosHistoricosMemoria = eventos; // Guardar en memoria para exportar a PDF rápido
            
            tbody.innerHTML = '';
            eventos.forEach(ev => {
                const date = new Date(ev.timestamp);
                const formatOpts = { year: 'numeric', month: 'short', day: 'numeric' };
                const dateStr = ev.fecha ? ev.fecha : date.toLocaleDateString('es-AR', formatOpts);
                
                tbody.innerHTML += `
                    <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">${dateStr}</td>
                        <td class="px-6 py-4">${ev.titulo || 'Sin título'}</td>
                        <td class="px-6 py-4">${ev.lugar || 'Desconocido'}</td>
                        <td class="px-6 py-4 text-right">
                            <button onclick="window.exportarActaHistórica('${ev.id}')" class="font-bold text-blue-600 dark:text-blue-500 hover:underline"><i class="fa-solid fa-file-pdf mr-1"></i> Descargar PDF</button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-red-500">Error al cargar datos.</td></tr>';
    } finally {
        btn.innerHTML = '<i class="fa-solid fa-rotate-right mr-1"></i> Recargar Archivo';
    }
});

// Función para exportar a PDF (reutilizando estilos premium)
window.exportarActaHistórica = (id) => {
    if(!window.eventosHistoricosMemoria) return;
    const evento = window.eventosHistoricosMemoria.find(e => e.id === id);
    if(!evento) return;

    const content = document.getElementById('pdf-historical-content');
    content.innerHTML = `
        <div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.6;">
            
            <!-- HEADER: Membrete Moderno -->
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #1d4ed8; padding-bottom: 20px; margin-bottom: 30px;">
                <div>
                    <h1 style="margin: 0; color: #1d4ed8; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">CENTRO DE ESTUDIANTES</h1>
                    <h2 style="margin: 5px 0 0 0; color: #64748b; font-size: 16px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">EPET N°6 - Archivo Histórico</h2>
                </div>
                <div style="text-align: right; background-color: #f1f5f9; padding: 10px 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <p style="margin: 0; font-size: 12px; color: #475569; font-weight: 600;">ACTA DE REUNIÓN</p>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #0f172a; font-weight: 700;">Ref: #${evento.id.substring(0, 6).toUpperCase()}</p>
                </div>
            </div>

            <!-- TÍTULO DEL EVENTO -->
            <h3 style="font-size: 22px; color: #0f172a; margin: 0 0 25px 0; border-left: 4px solid #1d4ed8; padding-left: 15px;">${evento.titulo || 'Sin título'}</h3>

            <!-- METADATOS: Grid layout -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <div style="display: flex; align-items: center;">
                    <span style="font-weight: 700; color: #334155; width: 60px;">Fecha:</span>
                    <span style="color: #0f172a;">${evento.fecha || 'No especificada'}</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <span style="font-weight: 700; color: #334155; width: 60px;">Hora:</span>
                    <span style="color: #0f172a;">${evento.hora || 'No especificada'}</span>
                </div>
                <div style="display: flex; align-items: center; grid-column: span 2;">
                    <span style="font-weight: 700; color: #334155; width: 60px;">Lugar:</span>
                    <span style="color: #0f172a;">${evento.lugar || 'No especificado'}</span>
                </div>
            </div>

            <!-- CUERPO PRINCIPAL -->
            <div style="margin-bottom: 30px;">
                <h4 style="font-size: 16px; color: #1d4ed8; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 15px; text-transform: uppercase;">1. Temario Inicial</h4>
                <p style="color: #334155; white-space: pre-wrap; margin: 0; background-color: #ffffff; padding: 15px; border-left: 3px solid #e2e8f0; font-size: 14px;">${evento.temario || 'Sin temario registrado'}</p>
            </div>

            <div style="margin-bottom: 30px;">
                <h4 style="font-size: 16px; color: #1d4ed8; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 15px; text-transform: uppercase;">2. Desarrollo y Resoluciones</h4>
                <p style="color: #334155; white-space: pre-wrap; margin: 0; background-color: #ffffff; padding: 15px; border-left: 3px solid #e2e8f0; font-size: 14px;">${evento.acta || 'No se elaboró acta final para esta reunión.'}</p>
            </div>

            <div style="margin-bottom: 40px;">
                <h4 style="font-size: 16px; color: #1d4ed8; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 15px; text-transform: uppercase;">3. Asistentes Registrados</h4>
                <p style="color: #475569; white-space: pre-wrap; margin: 0; font-size: 14px; line-height: 1.8;">${evento.asistentes || 'Sin registro de asistencia'}</p>
            </div>

            <!-- FOOTER: Firmas -->
            <div style="margin-top: 60px; padding-top: 40px; display: flex; justify-content: space-around; text-align: center;">
                <div>
                    <div style="border-bottom: 1px solid #94a3b8; width: 220px; margin: 0 auto 10px auto;"></div>
                    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">Presidencia</p>
                    <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">Centro de Estudiantes</p>
                </div>
                <div>
                    <div style="border-bottom: 1px solid #94a3b8; width: 220px; margin: 0 auto 10px auto;"></div>
                    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">Secretaría</p>
                    <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">Centro de Estudiantes</p>
                </div>
            </div>
            
        </div>
    `;

    const opt = {
        margin: [10, 10, 10, 10],
        filename: `Acta_Historica_${evento.fecha || 'CDE'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(content).save();
};

// ==========================================
// 4. BUZÓN DE SUGERENCIAS
// ==========================================

document.getElementById('btn-cargar-sugerencias').addEventListener('click', async () => {
    const btn = document.getElementById('btn-cargar-sugerencias');
    const status = document.getElementById('sugerencias-status');
    const list = document.getElementById('sugerencias-db-list');
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Cargando...';
    btn.disabled = true;
    status.innerText = 'Consultando DB...';
    
    try {
        let sugerencias = [];
        const propSnap = await getDocs(collection(db, "propuestas"));
        propSnap.forEach(doc => sugerencias.push({ id: doc.id, collection: 'propuestas', ...doc.data() }));
        
        sugerencias.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        list.innerHTML = '';
        if (sugerencias.length === 0) {
            list.innerHTML = '<li class="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded-xl">No hay sugerencias en la base de datos.</li>';
            status.innerText = '0 encontradas';
        } else {
            sugerencias.forEach(sug => {
                const date = sug.timestamp ? new Date(sug.timestamp).toLocaleString('es-AR') : 'Fecha desconocida';
                list.innerHTML += `
                    <li class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600 flex flex-col gap-2">
                        <div class="flex justify-between items-start">
                            <h4 class="font-bold text-gray-800 dark:text-gray-200">${sug.titulo || 'Sin título'}</h4>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">${sug.descripcion || 'Sin contenido'}</p>
                        <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                            <span class="text-xs text-gray-400"><i class="fa-regular fa-calendar mr-1"></i> ${date}</span>
                            ${sug.votos !== undefined ? `<span class="text-xs font-bold text-green-600"><i class="fa-solid fa-thumbs-up mr-1"></i> ${sug.votos} votos</span>` : ''}
                        </div>
                    </li>
                `;
            });
            status.innerText = `${sugerencias.length} encontradas`;
        }
    } catch (error) {
        status.innerText = 'Error al cargar';
        list.innerHTML = '<li class="text-sm text-red-500 italic text-center py-4">Error de permisos.</li>';
    } finally {
        btn.innerHTML = '<i class="fa-solid fa-rotate-right mr-1"></i> Cargar / Actualizar';
        btn.disabled = false;
    }
});
