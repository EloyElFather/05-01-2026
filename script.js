// CONFIG: Cambia esta fecha objetivo (en UTC) al valor deseado
const TARGET_ISO = '2026-01-05T10:00:00Z'; // <-- ajusta aquí
const TIMEZONE = 'Europe/Madrid'; // para petición a la API de tiempo
const CLUES = [
	'Empieza por preparar ropa cómoda para la montaña.',
  	'No olvides el cargador del móvil y una chaqueta.',
  	'Hay una cena incluida por la noche (sorpresa).'
];
const VOUCHER_URL = 'https://example.com/voucher-protegido.pdf'; // cambia al enlace real (Drive/Dropbox)

// DOM
const targetStrEl = document.getElementById('targetStr');
const statusEl = document.getElementById('status');
const beforeEl = document.getElementById('before');
const afterEl = document.getElementById('after');
const errorEl = document.getElementById('error');
const errMsgEl = document.getElementById('errMsg');
const cluesList = document.getElementById('cluesList');
const cluesCount = document.getElementById('cluesCount');
const voucherLink = document.getElementById('voucherLink');

// Mostrar fecha objetivo en local
targetStrEl.textContent = new Date(TARGET_ISO).toLocaleString();

// Rellena pistas inicialmente (puedes controlar cuántas mostrar según la diferencia)
function showClues(n){
    cluesList.innerHTML = '';
    for(let i=0;i<Math.min(n,CLUES.length);i++){
        const li = document.createElement('li');
        li.textContent = CLUES[i];
        cluesList.appendChild(li);
    }
    cluesCount.textContent = Math.min(n,CLUES.length);
}

async function fetchServerTime(){
  const tz = encodeURIComponent(TIMEZONE);
  const endpoints = [
    `https://worldtimeapi.org/api/timezone/${tz}`,
    `https://timeapi.io/api/Time/current/zone?timeZone=${tz}`
  ];
  for(const url of endpoints){
    try{
    	const res = await fetch(url,{cache:'no-store'});
		if(!res.ok) throw new Error('No OK');
		const j = await res.json();
		if(j.utc_datetime) return new Date(j.utc_datetime);
		if(j.dateTime) return new Date(j.dateTime);
    }catch(e){
      // intenta siguiente
    }
  }
  // fallback a hora local (menos seguro)
  return new Date();
}

(async function main(){
	try{
		const serverDate = await fetchServerTime();
		//statusEl.textContent = 'Hora del servidor: ' + serverDate.toLocaleString();
		const target = new Date(TARGET_ISO);
		const secondsDiff = Math.round((target - serverDate)/1000);

		// Mostrar número de pistas según lo cerca que estemos
		if(secondsDiff <= 0){
			// revelar
			beforeEl.classList.add('hidden');
			afterEl.classList.remove('hidden');
			voucherLink.href = VOUCHER_URL;
			showClues(CLUES.length);
		} else {
			const minutes = Math.floor(secondsDiff/60);
			statusEl.textContent = `Faltan ${minutes} minutos (${secondsDiff} s) para la primera pista...`;
			// si queda menos de 48h, muestra 1 pista; si menos 12h muestra 2; si menos 1h muestra todas
			if(secondsDiff <= 3600) showClues(CLUES.length);
			else if(secondsDiff <= 12*3600) showClues(2);
			else if(secondsDiff <= 48*3600) showClues(1);
			else showClues(0);
		}
	}catch(err){
		beforeEl.classList.add('hidden');
		errorEl.classList.remove('hidden');
		errMsgEl.textContent = 'No se ha podido comprobar la hora remota. Revisa la conexión o utiliza método serverless.';
	}
})();