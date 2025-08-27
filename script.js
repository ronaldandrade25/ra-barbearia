// ===== ESTE ARQUIVO USA ES MODULES =====
// No HTML: <script type="module" src="./script.js"></script>

// ===== MENU MOBILE TOGGLE =====
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle?.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = menuToggle.querySelector('i');
    if (navLinks.classList.contains('active')) { icon.classList.remove('bx-menu'); icon.classList.add('bx-x'); }
    else { icon.classList.remove('bx-x'); icon.classList.add('bx-menu'); }
});

// ===== SMOOTH SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        navLinks?.classList.remove('active');
        const icon = menuToggle?.querySelector('i');
        if (icon) { icon.classList.remove('bx-x'); icon.classList.add('bx-menu'); }

        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            const headerOffset = 80;
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    });
});

// ===== ANIMAÇÃO ON SCROLL =====
const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -100px 0px" };
const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "0";
            entry.target.style.transform = "translateY(30px)";
            setTimeout(() => {
                entry.target.style.transition = "all 0.6s ease";
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }, 100);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);
document.querySelectorAll('.service-card, .testimonial-card, .whatsapp-button').forEach(el => observer.observe(el));

// ===== HEADER SCROLL EFFECT =====
let lastScroll = 0;
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    header.style.boxShadow = currentScroll > 50 ? '0 2px 20px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.1)';
    header.style.transform = (currentScroll > lastScroll && currentScroll > 100) ? 'translateY(-100%)' : 'translateY(0)';
    lastScroll = currentScroll;
});

// ===== PULSAR BOTÃO WHATSAPP =====
setInterval(() => {
    const whatsappFloat = document.querySelector('.whatsapp-float');
    if (!whatsappFloat) return;
    whatsappFloat.style.animation = 'pulse 1s';
    setTimeout(() => { whatsappFloat.style.animation = ''; }, 1000);
}, 4000);

// ===== ADICIONAR ANIMAÇÕES CSS DINAMICAMENTE =====
const style = document.createElement('style');
style.innerHTML = `
  @keyframes pulse {
    0% { transform: scale(1); box-shadow: 0 5px 20px rgba(0,0,0,0.2); }
    50% { transform: scale(1.1); box-shadow: 0 8px 30px rgba(37,211,102,0.4); }
    100% { transform: scale(1); box-shadow: 0 5px 20px rgba(0,0,0,0.2); }
  }
  option[disabled].reservado { background:#eee; color:#888; }
`;
document.head.appendChild(style);

// ===== MODAL / AGENDAMENTO =====
const modal = document.getElementById("modal");
const closeBtn = document.querySelector(".close");
const confirmarBtn = document.getElementById("confirmarBtn");
const dataInput = document.getElementById("data");
const horaSelect = document.getElementById("hora");

// Vários botões abrem o mesmo modal, com contexto
const openBtns = document.querySelectorAll(".openModalBtn");

// Contexto atual do agendamento
let ctx = { profissional: null, wa: null, colecao: null };

openBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        ctx.profissional = btn.dataset.pro || "Profissional";
        ctx.wa = btn.dataset.wa || "5581999999999";
        ctx.colecao = btn.dataset.col || "reservas";

        if (!modal) return;
        modal.style.display = "flex";

        // Data mínima = hoje
        const hoje = new Date();
        const y = hoje.getFullYear();
        const m = String(hoje.getMonth() + 1).padStart(2, "0");
        const d = String(hoje.getDate()).padStart(2, "0");
        if (dataInput) dataInput.min = `${y}-${m}-${d}`;

        // Limpa seleção anterior e desmarca indisponíveis
        if (dataInput) dataInput.value = "";
        if (horaSelect) horaSelect.value = "";
        resetSelectVisual();

        // Título do modal
        const h2 = modal.querySelector("h2");
        if (h2) h2.textContent = `Escolha seu horário com ${ctx.profissional}`;
    });
});

closeBtn?.addEventListener("click", () => { if (modal) modal.style.display = "none"; });
window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

// ===== FIREBASE (CDN modular) =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    // use initializeFirestore para configurar transporte
    initializeFirestore,
    doc, getDoc, setDoc, serverTimestamp,
    collection, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Cole aqui o CONFIG do seu projeto (App Web registrado no Console)
const firebaseConfig = {
    apiKey: "AIzaSyD8q8N8l6lG-4YGNDZ6Lfs63yW6IS2lqFc",
    authDomain: "ra-barbearia-a8e60.firebaseapp.com",
    projectId: "ra-barbearia-a8e60",
    storageBucket: "ra-barbearia-a8e60.firebasestorage.app",
    messagingSenderId: "6836920871",
    appId: "1:6836920871:web:2b52193c00af7136436402",
    measurementId: "G-RBBGBQ82W4"
};

const app = initializeApp(firebaseConfig);

// 🔧 Corrige Listen 400 em redes que bloqueiam streaming
const db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    // Se ainda assim a sua rede bloquear, troque para a linha abaixo:
    // experimentalForceLongPolling: true,
    // useFetchStreams: false
});

// ===== HELPERS FIRESTORE =====
const toKey = (ymd, hhmm) => `${ymd}_${hhmm}`;
const normalizeHora = (h) => h.padStart(5, "0");

async function getReservasByDate(colecao, ymd) {
    const q = query(collection(db, colecao), where("data", "==", ymd));
    const snap = await getDocs(q);
    const horasOcupadas = new Set();
    snap.forEach(d => {
        const row = d.data();
        if (row?.hora) horasOcupadas.add(row.hora);
    });
    return horasOcupadas;
}

function resetSelectVisual() {
    if (!horaSelect) return;
    for (const opt of horaSelect.options) {
        if (!opt.value) continue;
        opt.disabled = false;
        opt.classList.remove("reservado");
    }
}

function marcarIndisponiveis(horasOcupadas) {
    if (!horaSelect) return 0;
    let count = 0;
    for (const opt of horaSelect.options) {
        if (!opt.value) continue;
        const ocupado = horasOcupadas.has(opt.value);
        opt.disabled = ocupado;
        opt.classList.toggle("reservado", ocupado);
        if (ocupado) count++;
    }
    if (horaSelect.value && horaSelect.selectedOptions[0]?.disabled) {
        horaSelect.value = "";
    }
    return count;
}

async function carregarIndisponiveis() {
    if (!dataInput?.value || !ctx.colecao) return;
    resetSelectVisual();
    try {
        const horas = await getReservasByDate(ctx.colecao, dataInput.value);
        marcarIndisponiveis(horas);
    } catch (e) {
        console.error("Erro ao carregar horários:", e);
        alert("Não foi possível consultar os horários. Verifique as regras do Firestore e a conexão.");
    }
}

// Atualiza horários quando trocar a data
dataInput?.addEventListener("change", carregarIndisponiveis);

// ===== CONFIRMAR RESERVA =====
confirmarBtn?.addEventListener("click", async () => {
    const data = dataInput?.value;
    const hora = horaSelect?.value;

    if (!data || !hora) {
        alert("Por favor, selecione a data e a hora.");
        return;
    }
    if (!ctx.colecao || !ctx.wa) {
        alert("Contexto do profissional não definido. Feche e reabra o modal.");
        return;
    }

    confirmarBtn.disabled = true;
    const originalText = confirmarBtn.textContent;
    confirmarBtn.textContent = "Reservando...";

    try {
        const hhmm = normalizeHora(hora);
        const ref = doc(db, ctx.colecao, toKey(data, hhmm));

        const snap = await getDoc(ref);  // agora funciona com fallback de transporte
        if (snap.exists()) {
            await carregarIndisponiveis();
            alert("Este horário já foi reservado. Escolha outro, por favor.");
            return;
        }

        await setDoc(ref, {
            data,
            hora: hhmm,
            profissional: ctx.profissional,
            createdAt: serverTimestamp()
        });

        await carregarIndisponiveis();

        const dataBR = new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR');
        const mensagem = `Olá, gostaria de agendar com ${ctx.profissional} para o dia ${dataBR} às ${hhmm}.`;
        const url = `https://wa.me/${ctx.wa}?text=${encodeURIComponent(mensagem)}`;
        window.open(url, "_blank");

    } catch (err) {
        console.error("[RESERVA] ", err?.code, err?.message, err);
        alert("Não foi possível concluir a reserva. Verifique as regras do Firestore e tente novamente.");
    } finally {
        confirmarBtn.disabled = false;
        confirmarBtn.textContent = originalText || "Agendar via WhatsApp";
    }
});

