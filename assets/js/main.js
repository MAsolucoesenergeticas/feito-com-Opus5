/* ==========================================================================
   M&A SOLUÇÕES ENERGÉTICAS · main.js
   Índice
   1. Configuração
   2. Botões de WhatsApp
   3. Menu mobile
   4. FAQ (acordeão)
   5. Página atual no menu
   6. Chat proativo (expandir / minimizar)
   7. Mapa sob demanda
   8. Inicialização
   ========================================================================== */

(function () {
  'use strict';

  /* ======================================================================
     1. CONFIGURAÇÃO
     ====================================================================== */
  var CONFIG = {
    telefone: '5545998067998',
    mensagemBase: 'Olá! Vim pelo site da M&A Soluções Energéticas e gostaria de um orçamento de energia solar.',
    iconeWa: '<svg class="ico-wa" aria-hidden="true" focusable="false"><use href="#i-wa"></use></svg>',
    chat: {
      pergunta: 'Oi! Tudo bem? 😊 Vi que você está pesquisando energia solar. Quer que eu calcule quanto você economizaria por mês?',
      atrasoAbertura: 2600,
      duracaoDigitando: 1700
    }
  };

  /* Monta o link do WhatsApp com o contexto do botão clicado */
  function montarLinkWa(contexto) {
    var texto = CONFIG.mensagemBase;
    if (contexto) texto += ' (Origem: ' + contexto + ')';
    return 'https://wa.me/' + CONFIG.telefone + '?text=' + encodeURIComponent(texto);
  }

  /* ======================================================================
     2. BOTÕES DE WHATSAPP
     ====================================================================== */
  function iniciarBotoesWhatsApp() {
    var botoes = document.querySelectorAll('.js-wa');

    Array.prototype.forEach.call(botoes, function (btn) {
      var ctx = btn.getAttribute('data-wa-ctx') || '';

      btn.setAttribute('href', montarLinkWa(ctx));
      btn.setAttribute('target', '_blank');
      btn.setAttribute('rel', 'noopener noreferrer');

      /* Injeta o ícone SVG antes do texto, se ainda não houver */
      if (!btn.querySelector('.ico-wa')) {
        btn.insertAdjacentHTML('afterbegin', CONFIG.iconeWa);
      }
    });
  }

  /* ======================================================================
     3. MENU MOBILE
     ====================================================================== */
  function iniciarMenuMobile() {
    var burger  = document.getElementById('burger');
    var menu    = document.getElementById('menu');
    var overlay = document.getElementById('overlay');

    if (!burger || !menu) return;

    function abrir() {
      menu.classList.add('is-open');
      if (overlay) overlay.classList.add('is-on');
      burger.classList.add('is-x');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Fechar menu');
      document.body.style.overflow = 'hidden';
    }

    function fechar() {
      menu.classList.remove('is-open');
      if (overlay) overlay.classList.remove('is-on');
      burger.classList.remove('is-x');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Abrir menu');
      document.body.style.overflow = '';
    }

    function alternar() {
      if (menu.classList.contains('is-open')) {
        fechar();
      } else {
        abrir();
      }
    }

    burger.addEventListener('click', alternar);
    if (overlay) overlay.addEventListener('click', fechar);

    /* Fecha ao clicar em qualquer link do menu */
    Array.prototype.forEach.call(menu.querySelectorAll('a'), function (link) {
      link.addEventListener('click', fechar);
    });

    /* Fecha com a tecla ESC */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) fechar();
    });

    /* Garante estado limpo ao voltar para desktop */
    window.addEventListener('resize', function () {
      if (window.innerWidth > 980 && menu.classList.contains('is-open')) fechar();
    });
  }

  /* ======================================================================
     4. FAQ (ACORDEÃO)
     ====================================================================== */
  function iniciarFaq() {
    var perguntas = document.querySelectorAll('.faq-q');
    if (!perguntas.length) return;

    Array.prototype.forEach.call(perguntas, function (btn) {
      btn.addEventListener('click', function () {
        var aberta = btn.getAttribute('aria-expanded') === 'true';

        /* Fecha todas as outras */
        Array.prototype.forEach.call(perguntas, function (outra) {
          if (outra !== btn) {
            outra.setAttribute('aria-expanded', 'false');
            outra.classList.remove('is-open');
            var resp = outra.nextElementSibling;
            if (resp) resp.classList.remove('is-open');
          }
        });

        /* Alterna a clicada */
        btn.setAttribute('aria-expanded', aberta ? 'false' : 'true');
        btn.classList.toggle('is-open', !aberta);

        var resposta = btn.nextElementSibling;
        if (resposta) resposta.classList.toggle('is-open', !aberta);
      });
    });
  }

  /* ======================================================================
     5. PÁGINA ATUAL NO MENU
     ====================================================================== */
  function marcarPaginaAtual() {
    var atual = window.location.pathname.split('/').pop() || 'index.html';

    Array.prototype.forEach.call(document.querySelectorAll('.menu a'), function (link) {
      var href = link.getAttribute('href') || '';
      if (href.indexOf('#') === 0 || href.indexOf('tel:') === 0) return;

      if (href.split('/').pop() === atual) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ======================================================================
     6. CHAT PROATIVO (EXPANDIR / MINIMIZAR)
     ====================================================================== */
  function iniciarChatProativo() {
    var box = document.getElementById('chatProativo');
    if (!box) return;

    var mini   = box.querySelector('.chat-mini');
    var btnMin = box.querySelector('.chat-x');
    var typing = box.querySelector('.chat-typing');
    var msg    = box.querySelector('.chat-msg');
    var texto  = box.querySelector('.chat-texto');
    var hora   = box.querySelector('.chat-time');
    var cta    = box.querySelector('.chat-body .btn-wa');

    var animado = false;

    /* Fallback do avatar: se a imagem falhar, mostra as iniciais "AP" */
    Array.prototype.forEach.call(box.querySelectorAll('.chat-avatar img'), function (img) {
      img.addEventListener('error', function () {
        var pai = img.parentNode;
        pai.innerHTML = '<span class="chat-ini">AP</span>';
        pai.classList.add('sem-foto');
      });
    });

    function agora() {
      var d = new Date();
      return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    }

    function animarMensagem() {
      if (animado) return;
      animado = true;

      typing.style.display = 'flex';
      msg.style.display = 'none';
      if (cta) cta.style.display = 'none';

      setTimeout(function () {
        typing.style.display = 'none';
        texto.textContent = CONFIG.chat.pergunta;
        hora.textContent = agora();
        msg.style.display = 'block';
        if (cta) cta.style.display = 'inline-flex';
      }, CONFIG.chat.duracaoDigitando);
    }

    function expandir() {
      box.classList.remove('is-min');
      box.classList.add('is-on');
      sessionStorage.setItem('maChat', 'aberto');
      animarMensagem();
    }

    function minimizar() {
      box.classList.add('is-on', 'is-min');
      sessionStorage.setItem('maChat', 'min');
    }

    if (mini)   mini.addEventListener('click', expandir);
    if (btnMin) btnMin.addEventListener('click', minimizar);

    /* Minimiza com ESC quando estiver expandido */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && box.classList.contains('is-on') && !box.classList.contains('is-min')) {
        minimizar();
      }
    });

    /* Estado inicial conforme a sessão */
    if (sessionStorage.getItem('maChat') === 'min') {
      minimizar();
    } else {
      setTimeout(expandir, CONFIG.chat.atrasoAbertura);
    }
  }

  /* ======================================================================
     7. MAPA SOB DEMANDA (reduz ~800 KB de terceiros no carregamento)
     ====================================================================== */
  function iniciarMapaSobDemanda() {
    var box = document.getElementById('mapBox');
    if (!box) return;

    var carregado = false;

    function carregar() {
      if (carregado) return;
      carregado = true;

      var frame = document.createElement('iframe');
      frame.src = box.dataset.src;
      frame.title = 'Localização da M&A Soluções Energéticas em Cascavel, Paraná';
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      frame.setAttribute('allowfullscreen', '');

      box.innerHTML = '';
      box.appendChild(frame);
      box.classList.remove('map-lazy');
      box.classList.add('is-loaded');
      box.removeAttribute('role');
      box.removeAttribute('tabindex');
      box.removeAttribute('aria-label');
    }

    box.addEventListener('click', carregar);
    box.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        carregar();
      }
    });
  }

  /* ======================================================================
     8. INICIALIZAÇÃO
     ====================================================================== */
  function init() {
    iniciarBotoesWhatsApp();
    iniciarMenuMobile();
    iniciarFaq();
    marcarPaginaAtual();
    iniciarChatProativo();
    iniciarMapaSobDemanda();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
