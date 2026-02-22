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
    container.style.width = '80px';
    container.style.height = '80px';
    container.style.transition = 'all 0.3s ease';
    document.body.appendChild(container);

    const iframe = document.createElement('iframe');
    iframe.src = `${baseUrl}/widget?apiKey=${apiKey}`;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '50%';
    iframe.style.boxSizing = 'border-box';
    iframe.allow = "camera; microphone; autoplay; encrypted-media; fullscreen";
    container.appendChild(iframe);

    let loaded = false;
    iframe.addEventListener('load', function() {
      loaded = true;
    });
    iframe.addEventListener('error', function() {
      loaded = false;
    });
    setTimeout(function() {
      if (!loaded) {
        // keep iframe; the inner widget handles its own initial UI
      }
    }, 2000);

    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'helpdesk-resize') {
        const { width, height, isOpen } = event.data;
        container.style.width = width;
        container.style.height = height;
        iframe.style.borderRadius = isOpen ? '12px' : '50%';
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

  // no external fallback; initial UI handled by /widget page

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
