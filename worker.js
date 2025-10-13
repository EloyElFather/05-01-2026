addEventListener('fetch', event => {
  event.respondWith(handle(event.request));
});

const TARGET = Date.parse('2025-10-25T10:00:00Z');

async function handle(req){
  const now = Date.now();
  if(now >= TARGET){
    const afterHtml = `<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Regalo — abierto</title></head><body><h1>¡Feliz cumpleaños!</h1><p>Tu sorpresa: Noche en Andorra. <a href='/voucher-protegido.pdf'>Voucher</a></p></body></html>`;
    return new Response(afterHtml, { headers: { 'Content-Type':'text/html; charset=utf-8' } });
  } else {
    const beforeHtml = `<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Regalo — pronto</title></head><body><h1>Pronto podrás abrir tu regalo</h1><p>Vuelve el día ${new Date(TARGET).toLocaleString()}</p></body></html>`;
    return new Response(beforeHtml, { headers: { 'Content-Type':'text/html; charset=utf-8' } });
  }
}