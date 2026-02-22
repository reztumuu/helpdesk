(function() {
  const script = document.currentScript || (function(){ const s=document.getElementsByTagName('script'); return s[s.length-1]; })();
  const apiKey = script.getAttribute('data-key');
  const baseUrl = new URL(script.src).origin;

  if (!apiKey) return;

  function bootstrap() {
    if (!document.body) return;
    const container = document.createElement('div');
    container.id = 'helpdesk-container';
    container.style.position = 'fixed';
    container.style.bottom = '50px';
    container.style.right = '20px';
    container.style.zIndex = '999999';
    container.style.width = '60px';
    container.style.height = '60px';
    container.style.transition = 'all 0.3s ease';
    document.body.appendChild(container);

    const iframe = document.createElement('iframe');
    iframe.src = `${baseUrl}/widget?apiKey=${apiKey}`;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '30px';
    iframe.allow = "camera; microphone; autoplay; encrypted-media; fullscreen";
    container.appendChild(iframe);

    let loaded = false;
    iframe.addEventListener('load', function() {
      loaded = true;
    });
    iframe.addEventListener('error', function() {
      loaded = false;
      showFallback(container);
    });
    setTimeout(function() {
      if (!loaded) showFallback(container);
    }, 2000);

    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'helpdesk-resize') {
        const { width, height, isOpen } = event.data;
        container.style.width = width;
        container.style.height = height;
        iframe.style.borderRadius = isOpen ? '12px' : '30px';
        container.style.boxShadow = isOpen ? '0 4px 24px rgba(0,0,0,0.2)' : 'none';
      }
      if (event.data && event.data.type === 'helpdesk-config') {
        const pos = event.data.position;
        const ox = typeof event.data.offsetX === 'number' ? event.data.offsetX : 20;
        const oy = typeof event.data.offsetY === 'number' ? event.data.offsetY : 50;
        container.style.bottom = `${oy}px`;
        if (pos === 'bottom_left' || pos === 'bottom-left') {
          container.style.left = `${ox}px`;
          container.style.right = '';
        } else {
          container.style.right = `${ox}px`;
          container.style.left = '';
        }
      }
    });
  }

  function showFallback(container) {
    while (container.firstChild) container.removeChild(container.firstChild);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.style.display = 'inline-flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.width = '60px';
    btn.style.height = '60px';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.style.borderRadius = '30px';
    btn.style.backgroundColor = '#f59e0b';
    btn.style.color = '#fff';
    btn.style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)';
    btn.style.textDecoration = 'none';
    const img = document.createElement('img');
    img.src = baseUrl + '/messages-square.svg';
    img.alt = 'Widget Icon';
    img.style.width = '28px';
    img.style.height = '28px';
    img.style.pointerEvents = 'none';
    btn.appendChild(img);
    container.appendChild(btn);

    btn.addEventListener('click', function() {
      container.style.width = '380px';
      container.style.height = '520px';
      container.style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)';
      while (container.firstChild) container.removeChild(container.firstChild);
      const iframe = document.createElement('iframe');
      iframe.src = `${baseUrl}/widget?apiKey=${apiKey}`;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '12px';
      iframe.allow = "camera; microphone; autoplay; encrypted-media; fullscreen";
      container.appendChild(iframe);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
