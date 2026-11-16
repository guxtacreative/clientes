/* Hub de Marketing · Calculadora de proposta (só o administrador vê).
   Você escolhe serviços e quantidades, vê o valor na hora e gera a proposta comercial
   como um orçamento (PDF, link para o cliente assinar e pagar).
   Os preços ficam guardados em empresa.calc_config e podem ser editados aqui. */
(function(){
  const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const N=v=>Number(v)||0;
  const r2=v=>Math.round((N(v)+Number.EPSILON)*100)/100;
  const brl=v=>N(v).toLocaleString("pt-BR",{style:"currency",currency:"BRL",minimumFractionDigits:N(v)%1?2:0});
  const num=v=>N(v).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
  const parseNum=s=>{s=String(s??"").trim().replace(/[^\d,.-]/g,"");if(!s)return 0;if(s.includes(","))s=s.replace(/\./g,"").replace(",",".");const n=parseFloat(s);return isFinite(n)?n:0};

  const PADRAO={
    regras:{parcelas:3,volume_min:12,volume_pct:10,combo_completa:600,combo_essencial:300,desc_3m:5,desc_6m:10},
    etapas:[
      {titulo:"Estratégia e gestão",itens:[
        {id:"estr",tipo:"escolha",nome:"Estratégia e gestão do marketing",desc:"O trabalho de pensar e direcionar: diagnóstico contínuo, planejamento do mês, direção das ações e análise dos resultados de venda.",mensal:true,opcoes:[{v:"nao",nome:"Não",preco:0},{v:"ess",nome:"Essencial: planejamento, 1 reunião e relatório",preco:800,linha:"Estratégia e gestão: planejamento mensal, 1 reunião e relatório"},{v:"comp",nome:"Completa: + concorrentes, vendas e reunião quinzenal",preco:1500,linha:"Estratégia e gestão: planejamento, análise de concorrentes e de vendas, reuniões quinzenais"}]}]},
      {titulo:"Conteúdo para redes sociais",itens:[
        {id:"post",tipo:"qtd",nome:"Posts estáticos",desc:"Artes no padrão da marca.",un:"por mês",preco:70,mensal:true},
        {id:"carr",tipo:"qtd",nome:"Carrosséis",desc:"Conteúdo com várias telas.",un:"por mês",preco:110,mensal:true},
        {id:"story",tipo:"qtd",nome:"Stories",desc:"Artes para stories e destaques.",un:"por mês",preco:25,mensal:true},
        {id:"copy",tipo:"escolha",nome:"Quem escreve os textos?",mensal:true,opcoes:[{v:"cli",nome:"O cliente envia",preco:0},{v:"eu",nome:"Eu escrevo",preco:250,linha:"Redação dos textos"}]},
        {id:"pub",tipo:"escolha",nome:"Publicação",mensal:true,opcoes:[{v:"nao",nome:"O cliente publica",preco:0},{v:"sim",nome:"Eu publico",preco:200,linha:"Publicação e agendamento"}]}]},
      {titulo:"Vídeos",itens:[
        {id:"edit",tipo:"qtd",nome:"Vídeos editados",desc:"O cliente grava, eu edito com cortes, legendas e trilha.",un:"por mês",preco:150,mensal:true},
        {id:"capt",tipo:"qtd",nome:"Captação de vídeo mobile",desc:"Gravação na loja com celular. Cada diária dura até 2h.",un:"diárias/mês",preco:350,mensal:true},
        {id:"foto",tipo:"qtd",nome:"Fotos de produto",desc:"Fotos tratadas para Instagram, site e marketplace.",un:"produtos/mês",preco:20,mensal:true}]},
      {titulo:"Marketplace",itens:[
        {id:"mkt",tipo:"escolha",nome:"Gestão de marketplace",desc:"Anúncios, títulos, precificação, perguntas e reputação.",mensal:true,opcoes:[{v:"nao",nome:"Não",preco:0},{v:"um",nome:"1 marketplace",preco:800},{v:"dois",nome:"2 marketplaces",preco:1300}]},
        {id:"cad",tipo:"qtd",nome:"Novos anúncios cadastrados",desc:"Cadastro completo: fotos, título, descrição e variações.",un:"por mês",preco:15,mensal:true}]},
      {titulo:"Anúncios e Google",itens:[
        {id:"traf",tipo:"escolha",nome:"Tráfego pago",desc:"Gestão de campanhas e relatório mensal. Verba paga direto à plataforma.",mensal:true,opcoes:[{v:"nao",nome:"Não",preco:0},{v:"meta",nome:"Instagram e Facebook",preco:900},{v:"google",nome:"Google",preco:900},{v:"ambos",nome:"Os dois",preco:1500}]},
        {id:"gmn",tipo:"escolha",nome:"Google Meu Negócio",desc:"Perfil no Google Maps e na busca.",opcoes:[{v:"nao",nome:"Não",preco:0},{v:"cfg",nome:"Criar ou otimizar o perfil",preco:350,mensal:false},{v:"ges",nome:"Criar e gerenciar todo mês",preco:250,mensal:true,extra:350}]}]},
      {titulo:"Marca, site e campanhas",itens:[
        {id:"camp",tipo:"qtd",nome:"Campanhas de datas comerciais",desc:"Kit de artes, stories e anúncio para Dia das Mães, Black Friday, Natal...",un:"campanhas",preco:450,mensal:false},
        {id:"ident",tipo:"escolha",nome:"Identidade visual",mensal:false,opcoes:[{v:"nao",nome:"Já tem",preco:0},{v:"logo",nome:"Só ajustar o logo",preco:600},{v:"ess",nome:"Essencial: logo, cores e fontes",preco:1500},{v:"comp",nome:"Completa com manual e papelaria",preco:2800}]},
        {id:"site",tipo:"escolha",nome:"Site e e-commerce",desc:"E-commerce próprio: loja virtual com carrinho, pagamento e frete configurados e os primeiros produtos cadastrados.",mensal:false,opcoes:[{v:"nao",nome:"Não precisa",preco:0},{v:"lp",nome:"Página única",preco:1800},{v:"loja",nome:"E-commerce próprio (loja virtual)",preco:3800},{v:"inst",nome:"Site com até 5 páginas",preco:3200}]},
        {id:"manut",tipo:"escolha",nome:"Manutenção mensal do site ou e-commerce",desc:"Atualizações, segurança, banners, ajustes e suporte. A mensalidade da plataforma e a hospedagem são pagas pelo cliente.",mensal:true,opcoes:[{v:"nao",nome:"Não",preco:0},{v:"site",nome:"Site",preco:150,linha:"Manutenção mensal do site"},{v:"eco",nome:"E-commerce",preco:500,linha:"Manutenção mensal do e-commerce"},{v:"ecop",nome:"E-commerce + cadastro de produtos e promoções",preco:900,linha:"Manutenção do e-commerce com cadastro de produtos e promoções"}]},
        {id:"pdv",tipo:"escolha",nome:"Materiais da loja",desc:"Fachada, sacola, etiqueta e adesivos.",mensal:false,opcoes:[{v:"nao",nome:"Não precisa",preco:0},{v:"sim",nome:"Quer",preco:600,linha:"Materiais da loja (fachada, sacola, etiqueta)"}]},
        {id:"cart",tipo:"escolha",nome:"Cartão de visita",mensal:false,opcoes:[{v:"nao",nome:"Não precisa",preco:0},{v:"sim",nome:"Quer",preco:250,linha:"Cartão de visita"}]},
        {id:"apre",tipo:"escolha",nome:"Apresentação institucional",mensal:false,opcoes:[{v:"nao",nome:"Não precisa",preco:0},{v:"sim",nome:"Quer",preco:690,linha:"Apresentação institucional"}]}]},
      {titulo:"Atendimento e vendas",itens:[
        {id:"zap",tipo:"escolha",nome:"Estruturação do atendimento no WhatsApp",desc:"Perfil comercial, catálogo, mensagens prontas, etiquetas e roteiro de atendimento para vender mais.",mensal:false,opcoes:[{v:"nao",nome:"Não precisa",preco:0},{v:"sim",nome:"Quer",preco:600,linha:"Estruturação do atendimento no WhatsApp"}]},
        {id:"trein",tipo:"qtd",nome:"Treinamento de atendimento",desc:"Sessão com a equipe da loja, presencial ou remota, para atender e fechar venda.",un:"sessões",preco:450,mensal:false}]}]};

  /* preços salvos entram por cima do padrão (a estrutura é sempre a do padrão) */
  function montarCfg(salvo){const c=JSON.parse(JSON.stringify(PADRAO));const p=(salvo&&salvo.precos)||{};
    Object.assign(c.regras,(salvo&&salvo.regras)||{});
    c.etapas.forEach(e=>e.itens.forEach(it=>{if(it.tipo==="qtd"){if(p[it.id]!==undefined)it.preco=N(p[it.id])}
      else it.opcoes.forEach(o=>{const k=it.id+":"+o.v;if(p[k]!==undefined)o.preco=N(p[k]);if(o.extra!==undefined&&p[k+":extra"]!==undefined)o.extra=N(p[k+":extra"])})}));
    return c}
  function precosDe(c){const p={};c.etapas.forEach(e=>e.itens.forEach(it=>{if(it.tipo==="qtd")p[it.id]=it.preco;else it.opcoes.forEach(o=>{if(o.preco||o.extra!==undefined)p[it.id+":"+o.v]=o.preco;if(o.extra!==undefined)p[it.id+":"+o.v+":extra"]=o.extra})}));return p}

  /* S = escolhas; devolve linhas e totais */
  function calcular(c,S){const mens=[],unic=[],R=c.regras;
    c.etapas.forEach(e=>e.itens.forEach(it=>{const v=S[it.id];
      if(it.tipo==="qtd"){if(N(v)>0)(it.mensal?mens:unic).push({nome:it.nome,descricao:it.desc||"",qtd:N(v),preco:it.preco,unidade:it.mensal?"por mês":"un"});return}
      const o=it.opcoes.find(x=>x.v===v);if(!o||!o.preco)return;
      const m=o.mensal!==undefined?o.mensal:it.mensal;
      (m?mens:unic).push({nome:o.linha||(it.nome+": "+o.nome),descricao:it.desc||"",qtd:1,preco:o.preco,unidade:m?"por mês":"un"});
      if(o.extra)unic.push({nome:it.nome+": configuração inicial",descricao:"",qtd:1,preco:o.extra,unidade:"un"})}));
    const soma=a=>r2(a.reduce((t,x)=>t+x.qtd*x.preco,0));
    const dm=[],du=[];const todos=c.etapas.flatMap(e=>e.itens),post=todos.find(x=>x.id==="post"),carr=todos.find(x=>x.id==="carr");
    if(N(S.post)+N(S.carr)>=N(R.volume_min)&&N(R.volume_pct)>0)dm.push([`Desconto por volume (${R.volume_min}+ posts)`,Math.round((N(S.post)*post.preco+N(S.carr)*carr.preco)*N(R.volume_pct)/100)]);
    const temSite=S.site&&S.site!=="nao";
    if(S.ident==="comp"&&temSite&&N(R.combo_completa))du.push(["Combo identidade + site",N(R.combo_completa)]);
    else if(S.ident==="ess"&&temSite&&N(R.combo_essencial))du.push(["Combo identidade + site",N(R.combo_essencial)]);
    const sm=soma(mens),pc=S.fid==="6"?N(R.desc_6m):S.fid==="3"?N(R.desc_3m):0;
    if(sm&&pc)dm.push([`Plano de ${S.fid} meses (−${String(pc).replace(".",",")}%)`,Math.round(sm*pc/100)]);
    const tm=Math.max(0,r2(sm-dm.reduce((t,x)=>t+x[1],0))),tu=Math.max(0,r2(soma(unic)-du.reduce((t,x)=>t+x[1],0)));
    return {mens,unic,dm,du,sm,su:soma(unic),tm,tu}}

  function criar(el,sb,ctx){
    const toast=ctx.toast||(m=>console.log(m)),falha=ctx.falha||((a,e)=>toast("Não deu para "+a+"."));
    const clientes=()=>((ctx.clientes&&ctx.clientes())||[]).filter(c=>c.ativo!==false);
    let cfg=montarCfg(null),podeSalvar=false,editando=false,S={},cab={cliente_id:"",nome:"",loja:"",contato:""};
    const zerar=()=>{S={fid:"3"};cfg.etapas.forEach(e=>e.itens.forEach(it=>{S[it.id]=it.tipo==="qtd"?0:it.opcoes[0].v}))};
    zerar();
    (async()=>{el.innerHTML=`<section class="card"><p class="note">Carregando…</p></section>`;
      const {data,error}=await sb.from("empresa").select("id,calc_config").eq("id",1);
      podeSalvar=!error;cfg=montarCfg(!error&&data&&data[0]?data[0].calc_config:null);zerar();
      if(ctx.contato){const c=ctx.contato;cab.nome=c.nome||"";cab.loja=c.empresa||"";cab.contato=c.telefone||c.email||"";cab.contato_id=c.id||null}
      render()})();

    const itemHTML=it=>it.tipo==="qtd"
      ?`<div class="cp-item"><div class="cp-info"><b>${esc(it.nome)}</b><small>${esc(it.desc||"")} · ${brl(it.preco)} cada</small></div>
          <div class="cp-qty"><button type="button" data-cq="-1" data-id="${it.id}" aria-label="Menos ${esc(it.nome)}">−</button><input type="number" min="0" max="99" inputmode="numeric" data-ci="${it.id}" value="${N(S[it.id])}" aria-label="Quantidade de ${esc(it.nome)}"><button type="button" data-cq="1" data-id="${it.id}" aria-label="Mais ${esc(it.nome)}">+</button><span>${esc(it.un||"")}</span></div></div>`
      :`<div class="cp-bloco"><b>${esc(it.nome)}</b>${it.desc?`<small>${esc(it.desc)}</small>`:""}
          <div class="cp-opts" role="radiogroup" aria-label="${esc(it.nome)}">${it.opcoes.map(o=>`<button type="button" role="radio" aria-checked="${S[it.id]===o.v}" data-co="${it.id}" data-v="${o.v}">${esc(o.nome)}${o.preco?` <span>${brl(o.preco)}${(o.mensal!==undefined?o.mensal:it.mensal)?"/mês":""}${o.extra?` + ${brl(o.extra)}`:""}</span>`:""}</button>`).join("")}</div></div>`;
    function resumoHTML(){const r=calcular(cfg,S),R=cfg.regras,vazio=!r.mens.length&&!r.unic.length;
      const lin=(a,suf)=>a.map(x=>`<li><span>${x.qtd>1?x.qtd+"× ":""}${esc(x.nome)}</span><b>${brl(x.qtd*x.preco)}${suf}</b></li>`).join("");
      const des=(a,suf)=>a.map(x=>`<li class="cp-desc"><span>${esc(x[0])}</span><b>− ${brl(x[1])}${suf}</b></li>`).join("");
      return `<h3>Resumo da proposta</h3>
        ${vazio?`<p class="note">Escolha os serviços para ver o valor.</p>`:`
        ${r.mens.length?`<div class="cp-tot pri"><small>Investimento mensal</small><b>${brl(r.tm)}<span>/mês</span></b><em>${S.fid==="1"?"mês a mês":"plano de "+S.fid+" meses"}</em></div><ul class="cp-lin">${lin(r.mens,"/mês")}${des(r.dm,"/mês")}</ul>`:""}
        ${r.unic.length?`<div class="cp-tot"><small>Projeto único</small><b>${brl(r.tu)}</b><em>em até ${N(R.parcelas)||1}x de ${brl(r2(r.tu/(N(R.parcelas)||1)))}</em></div><ul class="cp-lin">${lin(r.unic,"")}${des(r.du,"")}</ul>`:""}`}
        <div class="cp-acoes"><button type="button" class="btn primary" data-ca="proposta" ${vazio?"disabled":""}>Gerar proposta comercial</button>
          <button type="button" class="btn ghost" data-ca="copiar" ${vazio?"disabled":""}>Copiar resumo para o WhatsApp</button>
          <button type="button" class="btn ghost" data-ca="limpar">Limpar</button></div>`}
    function precosHTML(){const R=cfg.regras;const campo=(k,rot,v)=>`<label class="cp-pr"><span>${esc(rot)}</span><input type="text" inputmode="decimal" data-cp="${k}" value="${num(v)}"></label>`;
      const regra=(k,rot,dec)=>`<label class="cp-pr"><span>${esc(rot)}</span><input type="text" inputmode="decimal" data-cr="${k}" value="${dec?num(R[k]):N(R[k])}"></label>`;
      return `<form class="card cp-precos" id="cp-precos"><div class="head"><div><span class="eyebrow">Só você vê</span><h2>Preços da calculadora</h2><p class="note" style="margin:4px 0 0">Valores em reais. Valem para as próximas propostas; as que já foram geradas não mudam.</p></div></div>
        ${cfg.etapas.map(e=>`<fieldset class="orc-fs"><legend>${esc(e.titulo)}</legend><div class="cp-pr-g">${e.itens.map(it=>it.tipo==="qtd"?campo(it.id,it.nome+" (cada)",it.preco)
          :it.opcoes.filter(o=>o.preco||o.extra!==undefined).map(o=>campo(it.id+":"+o.v,it.nome+": "+o.nome,o.preco)+(o.extra!==undefined?campo(it.id+":"+o.v+":extra",it.nome+": configuração inicial",o.extra):"")).join("")).join("")}</div></fieldset>`).join("")}
        <fieldset class="orc-fs"><legend>Descontos e parcelas</legend><div class="cp-pr-g">${regra("volume_min","Desconto por volume: a partir de quantos posts + carrosséis")}${regra("volume_pct","Desconto por volume (%)",1)}
          ${regra("combo_completa","Combo identidade completa + site (R$)",1)}${regra("combo_essencial","Combo identidade essencial + site (R$)",1)}${regra("desc_3m","Plano de 3 meses (%)",1)}${regra("desc_6m","Plano de 6 meses (%)",1)}${regra("parcelas","Projeto único em até quantas vezes")}</div></fieldset>
        <div class="actions"><button type="submit" class="btn primary">Salvar preços</button><button type="button" class="btn ghost" data-ca="precos">Cancelar</button></div></form>`}
    function render(){
      if(editando){el.innerHTML=precosHTML();return}
      const cl=clientes();
      el.innerHTML=`<section class="card tk-head"><div class="head"><div><span class="eyebrow">Só você vê</span><h2>Calculadora de proposta</h2><p class="note" style="margin:4px 0 0">Monte o pacote do cliente, veja o valor na hora e gere a proposta comercial como um orçamento, com PDF e link para o cliente aceitar.</p></div>
          ${podeSalvar?`<button type="button" class="btn small ghost" data-ca="precos">Editar preços</button>`:""}</div></section>
        <div class="cp-grid"><div class="cp-col">
          <section class="card"><h3 class="cp-h">Para quem é</h3><div class="grid2">
            <div><label class="label" for="cp-cli">Cliente do Hub (opcional)</label><select id="cp-cli"><option value="">Novo contato</option>${cl.map(c=>`<option value="${c.id}"${cab.cliente_id===c.id?" selected":""}>${esc(c.nome)}</option>`).join("")}</select></div>
            <div><label class="label" for="cp-nome">Nome</label><input type="text" id="cp-nome" maxlength="80" value="${esc(cab.nome)}" placeholder="Nome de quem vai receber"></div>
            <div><label class="label" for="cp-loja">Loja</label><input type="text" id="cp-loja" maxlength="120" value="${esc(cab.loja)}" placeholder="Ex.: loja de acessórios, ótica, moda"></div>
            <div><label class="label" for="cp-cont">WhatsApp ou e-mail</label><input type="text" id="cp-cont" maxlength="120" value="${esc(cab.contato)}"></div></div></section>
          ${cfg.etapas.map(e=>`<section class="card"><h3 class="cp-h">${esc(e.titulo)}</h3>${e.itens.map(itemHTML).join("")}</section>`).join("")}
          <section class="card"><h3 class="cp-h">Duração do plano mensal</h3><div class="cp-opts" role="radiogroup" aria-label="Duração do plano">${[["1","Mês a mês"],["3",`3 meses (−${String(cfg.regras.desc_3m).replace(".",",")}%)`],["6",`6 meses (−${String(cfg.regras.desc_6m).replace(".",",")}%)`]].map(([v,t])=>`<button type="button" role="radio" aria-checked="${S.fid===v}" data-co="fid" data-v="${v}">${t}</button>`).join("")}</div>
            <p class="note" style="margin:8px 0 0">Só vale para os serviços mensais.</p></section>
        </div><aside class="card cp-resumo" id="cp-resumo" aria-live="polite">${resumoHTML()}</aside></div>`}
    const atualizar=()=>{const r=el.querySelector("#cp-resumo");if(r)r.innerHTML=resumoHTML()};

    function textoWa(){const r=calcular(cfg,S),R=cfg.regras;let m=`Olá${cab.nome?", "+cab.nome.split(" ")[0]:""}! Segue a proposta${cab.loja?" para "+cab.loja:""}:\n`;
      if(r.mens.length){m+="\n*MENSAL*\n"+r.mens.map(x=>`• ${x.qtd>1?x.qtd+"× ":""}${x.nome}: ${brl(x.qtd*x.preco)}`).join("\n");r.dm.forEach(x=>m+=`\n• ${x[0]}: −${brl(x[1])}`);m+=`\nTotal: ${brl(r.tm)}/mês${S.fid==="1"?"":" (plano de "+S.fid+" meses)"}\n`}
      if(r.unic.length){m+="\n*PROJETO ÚNICO*\n"+r.unic.map(x=>`• ${x.qtd>1?x.qtd+"× ":""}${x.nome}: ${brl(x.qtd*x.preco)}`).join("\n");r.du.forEach(x=>m+=`\n• ${x[0]}: −${brl(x[1])}`);m+=`\nTotal: ${brl(r.tu)} (em até ${N(R.parcelas)||1}x)\n`}
      if(S.traf&&S.traf!=="nao")m+="\nA verba dos anúncios é paga direto à plataforma e não está inclusa.";
      return m.trim()}
    function gerar(){const r=calcular(cfg,S),R=cfg.regras;
      const it=(x,mensal)=>({nome:x.nome,descricao:x.descricao||"",unidade:x.unidade,qtd:x.qtd,custo:0,lucro_tipo:"valor",lucro:x.preco,preco:x.preco,mensal});
      const dz=(x,mensal)=>({nome:x[0],descricao:"",unidade:mensal?"mês":"un",qtd:1,custo:0,lucro_tipo:"valor",lucro:-x[1],preco:-x[1],mensal,desconto:true});
      const itens=[...r.mens.map(x=>it(x,true)),...r.dm.map(x=>dz(x,true)),...r.unic.map(x=>it(x,false)),...r.du.map(x=>dz(x,false))];
      const obs=[r.mens.length?`Investimento mensal: ${brl(r.tm)}/mês${S.fid==="1"?", mês a mês":", em plano de "+S.fid+" meses"}.`:"",
        r.unic.length?`Projeto único: ${brl(r.tu)}, em até ${N(R.parcelas)||1}x de ${brl(r2(r.tu/(N(R.parcelas)||1)))}.`:"",
        r.mens.length&&r.unic.length?"O total desta proposta soma o primeiro mês e o projeto único.":"",
        r.mens.length&&S.fid!=="1"?"Primeiros 90 dias: no 1º mês, diagnóstico da loja, planejamento e organização dos canais; no 2º, conteúdo, campanhas e ações prioritárias no ar; no 3º, análise dos números de venda e ajustes.":"",
        "Site novo, loja virtual, integrações, grandes produções de vídeo e ferramentas de terceiros são orçados à parte quando não constam nesta proposta.",
        S.traf&&S.traf!=="nao"?"A verba dos anúncios é paga direto à plataforma e não está inclusa.":""].filter(Boolean).join("\n");
      if(!cab.nome&&!cab.loja){toast("Escreva o nome ou a loja de quem vai receber.");const i=el.querySelector("#cp-nome");i&&i.focus();return}
      ctx.gerarProposta&&ctx.gerarProposta({nome:cab.nome||cab.loja,empresa:cab.loja,telefone:cab.contato,cliente_id:cab.cliente_id||null,id:cab.contato_id||null,
        interesse:"Proposta de marketing e vendas"+(cab.loja?" · "+cab.loja:""),itens,observacoes:obs,tem_entrega:false,ocultar_valores:true})}

    el.addEventListener("click",async e=>{const q=e.target.closest("[data-cq]");
      if(q){const id=q.dataset.id;S[id]=Math.min(99,Math.max(0,N(S[id])+(+q.dataset.cq)));el.querySelector(`[data-ci="${id}"]`).value=S[id];atualizar();return}
      const o=e.target.closest("[data-co]");
      if(o){S[o.dataset.co]=o.dataset.v;o.parentNode.querySelectorAll("[data-co]").forEach(b=>b.setAttribute("aria-checked",String(b===o)));atualizar();return}
      const a=e.target.closest("[data-ca]");if(!a)return;const k=a.dataset.ca;
      if(k==="precos"){editando=!editando;render();window.scrollTo({top:0});return}
      if(k==="limpar"){zerar();cab={cliente_id:"",nome:"",loja:"",contato:""};render();return}
      if(k==="copiar"){try{await navigator.clipboard.writeText(textoWa());toast("Resumo copiado. É só colar no WhatsApp.")}catch(_){toast("Não deu para copiar. Tente de novo.")}return}
      if(k==="proposta")gerar()});
    el.addEventListener("input",e=>{const t=e.target;
      if(t.dataset.ci){S[t.dataset.ci]=Math.min(99,Math.max(0,parseInt(t.value,10)||0));atualizar();return}
      if(t.id==="cp-nome")cab.nome=t.value.trim();if(t.id==="cp-loja")cab.loja=t.value.trim();if(t.id==="cp-cont")cab.contato=t.value.trim()});
    el.addEventListener("change",e=>{const t=e.target;
      if(t.id==="cp-cli"){cab.cliente_id=t.value;const c=clientes().find(x=>x.id===t.value);if(c){cab.nome=c.responsavel||c.nome;cab.loja=c.nome;cab.contato=c.whatsapp||c.telefone||c.email||"";
        el.querySelector("#cp-nome").value=cab.nome;el.querySelector("#cp-loja").value=cab.loja;el.querySelector("#cp-cont").value=cab.contato}}});
    el.addEventListener("submit",async e=>{e.preventDefault();if(e.target.id!=="cp-precos")return;
      const precos={},regras={};el.querySelectorAll("[data-cp]").forEach(i=>precos[i.dataset.cp]=Math.max(0,r2(parseNum(i.value))));
      el.querySelectorAll("[data-cr]").forEach(i=>regras[i.dataset.cr]=Math.max(0,r2(parseNum(i.value))));
      regras.parcelas=Math.max(1,Math.round(regras.parcelas)||1);regras.volume_min=Math.max(1,Math.round(regras.volume_min)||1);
      ["volume_pct","desc_3m","desc_6m"].forEach(k=>regras[k]=Math.min(90,regras[k]));
      const {error}=await sb.from("empresa").update({calc_config:{precos,regras}}).eq("id",1);if(error)return falha("salvar os preços",error);
      cfg=montarCfg({precos,regras});editando=false;render();toast("Preços salvos.")});
  }
  window.GlaraCalculadora={criar,calcular,montarCfg,PADRAO};
})();
