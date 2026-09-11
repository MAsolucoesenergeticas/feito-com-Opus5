/* ==========================================================================
   M&A SOLUÇÕES ENERGÉTICAS · main.js
   Índice
   1. Configuração
   2. Contexto da página (intenção + cidade)
   3. Botões de WhatsApp
   4. Menu mobile
   5. FAQ (acordeão)
   6. Página atual no menu
   7. Chat proativo (expandir / minimizar)
   8. Mapa sob demanda
   9. Inicialização
   ========================================================================== */

(function () {
  'use strict';

  /* ======================================================================
     1. CONFIGURAÇÃO
     ====================================================================== */
  var CONFIG = {
    telefone: '5545991262160',
    mensagemBase: 'Olá! Vim pelo site da M&A Soluções Energéticas e gostaria de um orçamento de energia solar.',
    iconeWa: '<svg class="ico-wa" aria-hidden="true" focusable="false"><use href="#i-wa"></use></svg>',
    chat: {
      pergunta: 'Oi! Tudo bem? 😊 Vi que você está pesquisando energia solar. Quer que eu calcule quanto você economizaria por mês?',
      ctaPadrao: 'Sim, quero saber!',
      atrasoAbertura: 2600,
      duracaoDigitando: 1700
    }
  };

  /* ======================================================================
     2. CONTEXTO DA PÁGINA (INTENÇÃO + CIDADE)
     ====================================================================== */
  var CIDADES = [
    /* --- 15 cidades do plano de páginas --- */
    'Medianeira', 'Missal', 'São Miguel do Iguaçu', 'Foz do Iguaçu', 'Santa Helena',
    'Marechal Cândido Rondon', 'Entre Rios do Oeste', 'Cascavel', 'Toledo',
    'Nova Santa Rosa', 'Palotina', 'Assis Chateaubriand', 'Corbélia',
    'Cafelândia', 'Braganey',

    /* --- Vizinhas e demais atendidas --- */
    'Anahy', 'Barracão', 'Bela Vista da Caroba', 'Boa Vista da Aparecida',
    'Bom Jesus do Sul', 'Cambé', 'Campo Bonito', 'Campo Mourão', 'Capanema',
    'Capitão Leônidas Marques', 'Catanduvas', 'Céu Azul', 'Chopinzinho',
    'Cianorte', 'Clevelândia', "Diamante d'Oeste", 'Formosa do Oeste',
    'Francisco Alves', 'Francisco Beltrão', 'General Carneiro', 'Goioerê',
    'Goioxim', 'Guaíra', 'Iguatu', 'Iracema do Oeste', 'Itaipulândia',
    "Itapejara d'Oeste", 'Jesuítas', 'Lindoeste', 'Londrina', 'Mamborê',
    'Mandaguaçu', 'Mandaguari', 'Marialva', 'Maripá', 'Mariluz', 'Maringá',
    'Marmeleiro', 'Matelândia', 'Moreira Sales', 'Nova Aurora',
    'Ouro Verde do Oeste', 'Pato Bragado', 'Pato Branco', 'Pérola', 'Planalto',
    'Ponta Grossa', 'Quatro Pontes', 'Ramilândia', 'Realeza',
    'Santa Izabel do Oeste', 'Santa Lúcia', 'Santa Tereza do Oeste',
    'Santa Terezinha de Itaipu', 'São José das Palmeiras', 'São Pedro do Iguaçu',
    'Sarandi', 'Serranópolis do Iguaçu', 'Terra Roxa', 'Três Barras do Paraná',
    'Tupãssi', 'Ubiratã', 'Umuarama', 'Vera Cruz do Oeste'
  ];

  /* Remove acentos e baixa a caixa, para comparação segura */
  function normalizar(txt) {
    return (txt || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /* Regras avaliadas de cima para baixo — a PRIMEIRA que casar vence. */
  var INTENCOES = [
    {
      id: 'rural',
      re: /fazenda|agroneg|produtor rural|propriedade rural|cooperativa|avi[aá]rio|irriga/,
      msg: 'Oi! 😊 Vi que você procura energia solar para o meio rural. Projetos assim costumam entrar em linhas de crédito com juros bem abaixo do mercado. Quer que eu verifique o seu caso?',
      cta: 'Quero saber do crédito rural',
      wa: 'Olá! Tenho interesse em energia solar para propriedade rural{CIDADE_EM}. Gostaria de saber sobre valores e financiamento.'
    },
    {
      id: 'condominio',
      re: /condom[ií]nio/,
      msg: 'Oi! 😊 Energia solar em condomínio zera a conta das áreas comuns e alivia a taxa condominial. Preparo o estudo já formatado para apresentar em assembleia. Quer que eu faça?',
      cta: 'Quero o estudo para assembleia',
      wa: 'Olá! Preciso de um estudo de energia solar para condomínio{CIDADE_EM}, para apresentar em assembleia.'
    },
    {
      id: 'financiamento',
      re: /financiamento|financiar|parcel/,
      msg: 'Oi! 😊 Na maioria dos casos a parcela do financiamento fica próxima — ou até abaixo — do que você já paga de luz hoje. Quer que eu simule com o valor da sua conta?',
      cta: 'Simular a parcela',
      wa: 'Olá! Quero simular o financiamento de um sistema de energia solar{CIDADE_EM}.'
    },
    {
      id: 'preco_empresa',
      re: /(pre[cç]o|custa|custo|or[cç]amento|cota[cç][aã]o|valor).*(empresa|empresarial|comercial|industri|com[eé]rcio)|(empresa|empresarial|comercial|industri|com[eé]rcio).*(pre[cç]o|custa|custo|or[cç]amento|cota[cç][aã]o|valor)/,
      msg: 'Oi! 😊 Para empresa o cálculo muda: além da geração, avaliamos demanda contratada e modalidade tarifária. Me envia a fatura que eu fecho o valor exato?',
      cta: 'Enviar fatura da empresa',
      wa: 'Olá! Quero orçamento de energia solar para minha empresa{CIDADE_EM}. Vou enviar a fatura.'
    },
    {
      id: 'segmento',
      re: /supermercado|mercado|loja|restaurante|f[aá]brica|hotel|pousada|escrit[oó]rio|galp[aã]o|posto de combust|academia|cl[ií]nica|escola|igreja|ind[uú]stri|com[eé]rcio|comercial|empresa|empresarial/,
      msg: 'Oi! 😊 Energia é um dos maiores custos fixos de um negócio — e o único que dá para eliminar de vez. Quer que eu calcule quanto sobraria da sua conta por mês?',
      cta: 'Calcular economia do negócio',
      wa: 'Olá! Tenho interesse em energia solar para meu negócio{CIDADE_EM}. Gostaria de um orçamento.'
    },
    {
      id: 'preco',
      re: /pre[cç]o|custa|custo|or[cç]amento|cota[cç][aã]o|valor/,
      msg: 'Oi! 😊 Vi que você está pesquisando valores. Preço fechado sem ver a fatura é chute — mas com a sua conta em mãos eu fecho o número exato hoje mesmo. Quer que eu calcule?',
      cta: 'Quero o valor exato',
      wa: 'Olá! Quero saber o preço de um sistema de energia solar{CIDADE_EM}. Vou enviar minha conta de luz.'
    },
    {
      id: 'instalacao',
      re: /instala[cç][aã]o|instalar/,
      msg: 'Oi! 😊 A instalação é feita com equipe própria, e a maioria das obras residenciais fica pronta em dois a três dias. Quer que eu veja o prazo para o seu telhado?',
      cta: 'Ver prazo da instalação',
      wa: 'Olá! Quero instalar energia solar{CIDADE_EM}. Gostaria de saber prazo e valores.'
    },
    {
      id: 'equipamento',
      re: /comprar|kit|placa|painel|pain[eé]is|invers/,
      msg: 'Oi! 😊 Comprar kit avulso costuma sair mais caro no fim: sem projeto assinado, a Copel não homologa. Quer que eu monte o sistema completo, já com instalação inclusa?',
      cta: 'Quero o sistema completo',
      wa: 'Olá! Estou pesquisando placas e kit solar{CIDADE_EM}. Quero saber sobre o sistema completo com instalação.'
    },
    {
      id: 'empresa_prestadora',
      re: /empresa de energia|empresa para instalar|empresa instala|empresa fotovolt/,
      msg: 'Oi! 😊 Somos de Medianeira, com equipe própria e engenheiro responsável registrado no CREA. Quer conhecer o processo e receber um orçamento sem compromisso?',
      cta: 'Falar com a equipe',
      wa: 'Olá! Quero conhecer o trabalho da M&A e receber um orçamento de energia solar{CIDADE_EM}.'
    },
    {
      id: 'projeto',
      re: /projeto|homologa/,
      msg: 'Oi! 😊 Nosso projeto vem com ART no CREA e homologação completa na Copel — você não fala com a concessionária em nenhum momento. Quer que eu detalhe o seu?',
      cta: 'Quero meu projeto',
      wa: 'Olá! Preciso de projeto de energia solar{CIDADE_EM} com homologação na Copel.'
    },
    {
      id: 'residencial',
      re: /casa|resid[eê]ncia|residencial|domiciliar|sobrado/,
      msg: 'Oi! 😊 Em casa o retorno costuma vir entre o quarto e o sexto ano, e a conta cai para a taxa mínima. Quer que eu calcule com o seu consumo real?',
      cta: 'Calcular minha economia',
      wa: 'Olá! Quero energia solar na minha casa{CIDADE_EM}. Gostaria do cálculo de economia.'
    }
  ];

  /* Descobre a cidade citada no H1 (prioriza o nome mais longo) */
  function detectarCidade(h1Normalizado) {
    var achada = '';
    CIDADES.forEach(function (cidade) {
      if (h1Normalizado.indexOf(normalizar(cidade)) !== -1 && cidade.length > achada.length) {
        achada = cidade;
      }
    });
    return achada;
  }

  /* Resolve o contexto completo da página */
  function resolverContexto() {
    var h1 = document.querySelector('h1');
    var h1n = normalizar(h1 ? h1.textContent : '');
    var cidade = detectarCidade(h1n);
    var sufixo = cidade ? ' em ' + cidade : '';
    var regra = null;

    for (var i = 0; i < INTENCOES.length; i++) {
      if (INTENCOES[i].re.test(h1n)) {
        regra = INTENCOES[i];
        break;
      }
    }

    /* Nenhuma regra casou (ex.: home) — usa o texto padrão */
    if (!regra) {
      return {
        id: 'padrao',
        cidade: cidade,
        msg: CONFIG.chat.pergunta,
        cta: CONFIG.chat.ctaPadrao,
        wa: CONFIG.mensagemBase
      };
    }

    return {
      id: regra.id,
      cidade: cidade,
      msg: regra.msg.replace('{CIDADE}', cidade || 'sua região'),
      cta: regra.cta,
      wa: regra.wa.replace('{CIDADE_EM}', sufixo)
    };
  }

  var CTX = resolverContexto();

  /* Monta o link do WhatsApp com o contexto da página + do botão clicado */
  function montarLinkWa(origem) {
    var texto = CTX.wa || CONFIG.mensagemBase;
    if (origem) texto += ' (Origem: ' + origem + ')';
    return 'https://wa.me/' + CONFIG.telefone + '?text=' + encodeURIComponent(texto);
  }

  /* ======================================================================
     3. BOTÕES DE WHATSAPP
     ====================================================================== */
  function iniciarBotoesWhatsApp() {
    var botoes = document.querySelectorAll('.js-wa');

    Array.prototype.forEach.call(botoes, function (btn) {
      var origem = btn.getAttribute('data-wa-ctx') || '';

      btn.setAttribute('href', montarLinkWa(origem));
      btn.setAttribute('target', '_blank');
      btn.setAttribute('rel', 'noopener noreferrer');

      if (!btn.querySelector('.ico-wa')) {
        btn.insertAdjacentHTML('afterbegin', CONFIG.iconeWa);
      }
    });
  }

  /* ======================================================================
     4. MENU MOBILE

     a) O <header> tem backdrop-filter, que cria containing block e
        aprisiona o position:fixed do menu. No mobile o menu é
        reparentado para dentro do <body>, sem ancestral algum.
     b) A rolagem do fundo é travada via classe .nav-lock no <html>,
        sem deslocar o body — evita salto de scroll no iOS.
     ====================================================================== */
  function iniciarMenuMobile() {
    var burger  = document.getElementById('burger');
    var menu    = document.getElementById('menu');
    var overlay = document.getElementById('overlay');
    var header  = document.querySelector('header');

    if (!burger || !menu) return;

    /* Marca o lugar original do menu dentro do <nav>, para devolvê-lo
       quando a tela voltar a ser desktop. */
    var slot = document.createComment('menu-slot');
    menu.parentNode.insertBefore(slot, menu);

    var mq = window.matchMedia('(max-width:980px)');

    function estaAberto() {
      return menu.classList.contains('is-open');
    }

    function travarFundo() {
      document.documentElement.classList.add('nav-lock');
      document.body.classList.add('nav-open');
    }

    function soltarFundo() {
      document.documentElement.classList.remove('nav-lock');
      document.body.classList.remove('nav-open');
    }

    function abrir() {
      if (estaAberto()) return;

      menu.classList.add('is-open');
      if (overlay) overlay.classList.add('is-on');
      burger.classList.add('is-x');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Fechar menu');

      travarFundo();

      /* Foco no primeiro link, para navegação por teclado */
      var primeiro = menu.querySelector('a');
      if (primeiro) {
        try { primeiro.focus({ preventScroll: true }); } catch (e) {}
      }
    }

    /* O parâmetro "restaurar" é mantido apenas por compatibilidade:
       como o body não é mais deslocado, a posição nunca é perdida. */
    function fechar(restaurar) {
      if (!estaAberto()) return;

      menu.classList.remove('is-open');
      if (overlay) overlay.classList.remove('is-on');
      burger.classList.remove('is-x');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Abrir menu');

      soltarFundo();
    }

    /* Reparenta o menu conforme a largura da tela */
    function sincronizar() {
      if (mq.matches) {
        if (menu.parentNode !== document.body) document.body.appendChild(menu);
      } else {
        fechar(false);
        if (menu.parentNode === document.body) slot.parentNode.insertBefore(menu, slot);
      }
    }

    /* ---- Botão sanduíche ---- */
    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      if (estaAberto()) fechar(); else abrir();
    });

    /* ---- Fundo escuro ---- */
    if (overlay) {
      overlay.addEventListener('click', function () { fechar(); });
    }

    /* ---- Clique em qualquer ponto fora do menu e fora do burger ---- */
    document.addEventListener('click', function (e) {
      if (!estaAberto()) return;
      if (menu.contains(e.target)) return;
      if (burger.contains(e.target)) return;
      fechar();
    });

    /* ---- Tecla ESC ---- */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && estaAberto()) {
        fechar();
        burger.focus();
      }
    });

    /* ---- Links do menu ---- */
    Array.prototype.forEach.call(menu.querySelectorAll('a'), function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href') || '';

        /* Âncora interna: o JS assume a rolagem */
        if (href.charAt(0) === '#' && href.length > 1) {
          var alvo = null;
          try { alvo = document.querySelector(href); } catch (err) { alvo = null; }

          if (alvo) {
            e.preventDefault();
            fechar(false);

            /* Espera o destravamento antes de calcular a posição */
            requestAnimationFrame(function () {
              var off = header ? header.offsetHeight + 12 : 76;
              var top = alvo.getBoundingClientRect().top + window.pageYOffset - off;
              if (top < 0) top = 0;

              try {
                window.scrollTo({ top: top, behavior: 'smooth' });
              } catch (err) {
                window.scrollTo(0, top);
              }

              if (history.replaceState) history.replaceState(null, '', href);
            });
            return;
          }
        }

        /* Link externo ou para outra página: só fecha */
        fechar(false);
      });
    });

    /* ---- Reage à troca de mobile ↔ desktop ---- */
    sincronizar();
    if (mq.addEventListener) {
      mq.addEventListener('change', sincronizar);
    } else if (mq.addListener) {
      mq.addListener(sincronizar);
    }

    /* Segurança: se a página voltar do cache do navegador travada, destrava. */
    window.addEventListener('pageshow', function () {
      if (!estaAberto()) soltarFundo();
    });
  }

  /* ======================================================================
     5. FAQ (ACORDEÃO)
     ====================================================================== */
  function iniciarFaq() {
    var perguntas = document.querySelectorAll('.faq-q');
    if (!perguntas.length) return;

    Array.prototype.forEach.call(perguntas, function (btn) {
      btn.addEventListener('click', function () {
        var estavaAberta = btn.getAttribute('aria-expanded') === 'true';

        /* Fecha todas as outras */
        Array.prototype.forEach.call(perguntas, function (outra) {
          if (outra !== btn) {
            outra.setAttribute('aria-expanded', 'false');
            outra.classList.remove('is-open');
            var resp = outra.nextElementSibling;
            if (resp) resp.classList.remove('is-open', 'open');
          }
        });

        /* Alterna a clicada */
        btn.setAttribute('aria-expanded', estavaAberta ? 'false' : 'true');
        btn.classList.toggle('is-open', !estavaAberta);

        var resposta = btn.nextElementSibling;
        if (resposta) {
          resposta.classList.toggle('is-open', !estavaAberta);
          resposta.classList.toggle('open', !estavaAberta);
        }
      });
    });
  }

  /* ======================================================================
     6. PÁGINA ATUAL NO MENU
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
     7. CHAT PROATIVO (EXPANDIR / MINIMIZAR)
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

    /* Fallback do avatar: se a imagem falhar, mostra as iniciais "MA" */
    Array.prototype.forEach.call(box.querySelectorAll('.chat-avatar img'), function (img) {
      img.addEventListener('error', function () {
        var pai = img.parentNode;
        pai.innerHTML = '<span class="fallback">MA</span>';
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

      if (typing) typing.style.display = 'flex';
      if (msg) msg.style.display = 'none';
      if (cta) cta.style.display = 'none';

      setTimeout(function () {
        if (typing) typing.style.display = 'none';

        if (texto) texto.textContent = CTX.msg;
        if (hora) hora.textContent = agora();
        if (msg) {
          msg.style.display = 'block';
          msg.classList.add('show');
        }

        /* Aplica o CTA contextual preservando o ícone SVG já injetado */
        if (cta) {
          var svg = cta.querySelector('.ico-wa');
          cta.textContent = CTX.cta;
          if (svg) cta.insertAdjacentElement('afterbegin', svg);
          cta.style.display = 'inline-flex';
        }
      }, CONFIG.chat.duracaoDigitando);
    }

    function expandir() {
      box.classList.remove('is-min');
      box.classList.add('is-on');
      try { sessionStorage.setItem('maChat', 'aberto'); } catch (e) {}
      animarMensagem();
    }

    function minimizar() {
      box.classList.add('is-on', 'is-min');
      try { sessionStorage.setItem('maChat', 'min'); } catch (e) {}
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
    var estado = null;
    try { estado = sessionStorage.getItem('maChat'); } catch (e) {}

    if (estado === 'min') {
      minimizar();
    } else {
      setTimeout(expandir, CONFIG.chat.atrasoAbertura);
    }
  }

  /* ======================================================================
     8. MAPA SOB DEMANDA
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
      frame.title = box.dataset.title || 'Mapa de localização da M&A Soluções Energéticas';
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
     9. INICIALIZAÇÃO
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

  /* Exposto apenas para depuração no console */
  window.MA_CTX = CTX;

})();
