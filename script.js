// CONFIG: Cambia esta fecha objetivo (en UTC) al valor deseado
const TARGET_ISO = '2025-12-25T10:00:00Z'; // <-- ajusta aquí
const TIMEZONE = 'Europe/Madrid'; // para petición a la API de tiempo

// Pistas adaptadas al nuevo regalo: tocadiscos retro + Rituals of Sakura + ropa
const CLUES = [
    'Piensa en tardes de manta, música y velas encendidas.',
    'Hay algo que huele muy bien… y algo que suena todavía mejor.',
    'Parte del regalo es para tu piel, otra parte para tus oídos y otra para que no pases frío.'
];

// DOM
const targetStrEl = document.getElementById('targetStr');
const statusEl = document.getElementById('status');
const beforeEl = document.getElementById('before');
const afterEl = document.getElementById('after');
const cluesList = document.getElementById('cluesList');
const cluesCount = document.getElementById('cluesCount');

// Mostrar fecha objetivo en local
targetStrEl.textContent = new Date(TARGET_ISO).toLocaleString();

/**
 * Muestra hasta n pistas en la lista
 */
function showClues(n) {
    cluesList.innerHTML = '';
    const totalToShow = Math.min(n, CLUES.length);

    for (let i = 0; i < totalToShow; i++) {
        const li = document.createElement('li');
        li.textContent = CLUES[i];
        cluesList.appendChild(li);
    }

    cluesCount.textContent = totalToShow;
}

/**
 * Devuelve un texto bonito con la diferencia de tiempo
 * (días / horas / minutos)
 */
function formatDiff(secondsDiff) {
    const total = Math.max(0, secondsDiff); // por si acaso
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);

    const plural = (value, singular, plural) =>
        value === 1 ? singular : plural;

    if (days > 0) {
        return `Faltan ${days} ${plural(days, 'día', 'días')}, ${hours} ${plural(hours, 'hora', 'horas')} y ${minutes} ${plural(minutes, 'minuto', 'minutos')}.`;
    }

    if (hours > 0) {
        return `Faltan ${hours} ${plural(hours, 'hora', 'horas')} y ${minutes} ${plural(minutes, 'minuto', 'minutos')}.`;
    }

    return `Faltan ${minutes} ${plural(minutes, 'minuto', 'minutos')}.`;
}

/**
 * Intenta obtener la hora del servidor desde varias APIs.
 * Si todas fallan, hace fallback a la hora local del dispositivo.
 */
async function fetchServerTime() {
    const tz = encodeURIComponent(TIMEZONE);
    const endpoints = [
        `https://worldtimeapi.org/api/timezone/${tz}`,
        `https://timeapi.io/api/Time/current/zone?timeZone=${tz}`
    ];

    for (const url of endpoints) {
        try {
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) throw new Error('Respuesta no OK');
            const j = await res.json();
            if (j.utc_datetime) return new Date(j.utc_datetime);
            if (j.dateTime) return new Date(j.dateTime);
        } catch (e) {
            // intenta siguiente endpoint
        }
    }

    // Fallback a hora local (menos seguro, pero no rompe la experiencia)
    statusEl.textContent = 'No he podido comprobar la hora remota, usaré la de tu dispositivo';
    return new Date();
}

(async function main() {
    try {
        const serverDate = await fetchServerTime();
        // Para probar en local con una fecha concreta, descomenta la línea de abajo:
        //const serverDate = new Date('2025-12-24T10:00:00Z');

        const target = new Date(TARGET_ISO);
        const secondsDiff = Math.round((target - serverDate) / 1000);

        if (secondsDiff <= 0) {
            // Ya ha llegado el momento: revelar
            beforeEl.classList.add('hidden');
            afterEl.classList.remove('hidden');
            showClues(CLUES.length);
            statusEl.textContent = '¡Hoy es el día!';
        } else {
            // Aún falta: muestra cuenta atrás formateada + pistas según proximidad
            statusEl.textContent = formatDiff(secondsDiff);

            // Cálculo de días que faltan
            const daysLeft = secondsDiff / 86400;

            // Menos o igual de 1 día → 3 pistas
            // Menos o igual de 3 días → 2 pistas
            // Menos o igual de 5 días → 1 pista
            // Más de 5 días → 0 pistas
            if (daysLeft <= 1) {
                showClues(CLUES.length);
            } else if (daysLeft <= 3) {
                showClues(2);
            } else if (daysLeft <= 5) {
                showClues(1);
            } else {
                showClues(0);
            }
        }
    } catch (err) {
        // Si algo peta muy raro, al menos mostramos un mensaje neutro
        statusEl.textContent = 'Ha ocurrido un error al cargar la página. Inténtalo de nuevo más tarde.';
    }
})();
