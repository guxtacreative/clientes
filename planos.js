/* Hub de Marketing · Planos de serviço (assessoria, gestão de redes).
   Itens comuns a todos os planos; em cada plano o item tem quantidade, incluso ou não incluso.
   Página pública em planos.html e texto pronto para o WhatsApp. */
(function(){
  const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const N=v=>Number(v)||0;
  const r2=v=>Math.round((N(v)+Number.EPSILON)*100)/100;
  const brl=v=>N(v).toLocaleString("pt-BR",{style:"currency",currency:"BRL",minimumFractionDigits:N(v)%1?2:0});
  const num=v=>N(v).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
  const parseNum=s=>{s=String(s??"").trim().replace(/[^\d,.-]/g,"");if(!s)return 0;if(s.includes(","))s=s.replace(/\./g,"").replace(",",".");const n=parseFloat(s);return isFinite(n)?n:0};
  const ic=p=>`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const I={mais:ic('<path d="M12 5v14M5 12h14"/>'),copia:ic('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>'),
    cima:ic('<path d="m18 15-6-6-6 6"/>'),baixo:ic('<path d="m6 9 6 6 6-6"/>'),lixo:ic('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>')};
  const tem=v=>v===true||(typeof v==="string"&&v.trim()!==""&&v.trim()!=="0");
  const TIPOS=[["mensal","Planos mensais","Plano mensal"],["adicional","Serviços adicionais","Serviço adicional"],["projeto","Projetos avulsos","Projeto avulso"]];
  const precoTxt=p=>p.preco_ate&&N(p.preco_ate)>N(p.preco)?`${brl(p.preco)} a ${brl(p.preco_ate)}`:N(p.preco)?(p.a_partir?"a partir de ":"")+brl(p.preco)+(p.periodo&&p.tipo!=="projeto"?"/"+p.periodo:""):"Sob orçamento";
  const listaTxt=v=>(Array.isArray(v)?v:[]).join("\n");

  function criar(el,sb,ctx){
    let planos=[], itens=[], ed=null, mostraItens=false, mostraTextos=false, clientes=[], emp=null, servs=[], temServ=false, mostraCalc=false;
    const toast=ctx.toast||(m=>console.log(m)), falha=ctx.falha||((a,e)=>toast("Não deu para "+a+"."));
    const link=p=>new URL("planos.html"+(p?"?p="+p.id:""),location.href).href;
    const textoWa=p=>{const v=p.valores||{};
      const linhas=(p.tipo||"mensal")==="mensal"?itens.filter(it=>v[it.id]!==undefined&&v[it.id]!==null&&v[it.id]!=="").map(it=>{const x=v[it.id];return `${tem(x)?"✅":"❌"} ${typeof x==="string"&&x.trim()?x.trim()+" ":""}${it.nome}`}):(p.lista||[]).map(x=>"✅ "+x);
      const preco=(p.tipo||"mensal")==="mensal"?`${p.a_partir?"a partir de ":""}${brl(p.preco)}/${p.periodo||"mês"}`:precoTxt(p);
      return [`*${p.nome}* · ${preco}`+(p.descricao?`\n_${p.descricao}_`:""),linhas.join("\n"),p.nao_inclui?"Não inclui: "+p.nao_inclui:"",p.obs||"",`Detalhes: ${link(p)}`].filter(Boolean).join("\n\n")};
    const doPlano=p=>clientes.filter(c=>c.ativo!==false&&String(c.plano_nome||"").trim().toLowerCase()===String(p.nome).trim().toLowerCase());
    const textoTodos=()=>`Estes são os nossos planos de assessoria de marketing e gestão de redes sociais:\n\n${planos.filter(p=>p.ativo).map(p=>textoWa(p).replace(/\n\nDetalhes: .*$/,"")).join("\n\n— — —\n\n")}\n\nCompare os planos aqui: ${link()}`;

    async function carregar(){
      el.innerHTML=`<div class="empty">Carregando os planos…</div>`;
      const [a,b,c,d,g]=await Promise.all([sb.from("planos").select("*").order("ordem").order("preco"),sb.from("planos_itens").select("*").order("ordem").order("nome"),
        sb.from("clientes").select("id,nome,plano_nome,ativo"),sb.from("empresa").select("id,planos_titulo,planos_texto,planos_fluxo,planos_regras,vitrine_cases,vitrine_faq").eq("id",1),Promise.resolve({error:true})]);
      if(a.error||b.error){el.innerHTML=`<div class="empty">Rode o arquivo 23 do banco no Supabase para criar os planos.</div>`;return}
      planos=a.data||[];itens=b.data||[];clientes=c.data||[];emp=d.error?null:((d.data||[])[0]||null);temServ=!g.error;servs=g.data||[];render();
    }
    function cardHTML(p){const v=p.valores||{};const its=itens.filter(it=>v[it.id]!==undefined&&v[it.id]!==null&&v[it.id]!=="");
      return `<article class="pl-card${p.destaque?" destaque":""}${p.ativo?"":" off"}">
        ${p.destaque?`<span class="pl-selo">Mais escolhido</span>`:""}
        <div class="pl-h"><div><b class="pl-nome">${esc(p.nome)}</b>${p.ativo?"":` <span class="status prod">Escondido</span>`}<small>${esc(p.descricao)}</small></div><b class="pl-preco">${brl(p.preco)}<small>/${esc(p.periodo||"mês")}</small></b></div>
        ${(p.tipo||"mensal")!=="mensal"?`<p class="pl-tp">${esc(precoTxt(p))}</p><ul class="pl-itens">${(p.lista||[]).map(x=>`<li class="sim"><span aria-hidden="true">✓</span>${esc(x)}</li>`).join("")}</ul>`:""}
        ${(p.tipo||"mensal")==="mensal"?(()=>{const cs=doPlano(p);return `<p class="pl-mrr">${cs.length?`<b>${cs.length} ${cs.length===1?"cliente":"clientes"}</b> · ${brl(cs.length*N(p.preco))}/mês`:"Nenhum cliente neste plano ainda"}</p>`})():""}
        ${(p.tipo||"mensal")==="mensal"?`<ul class="pl-itens">${its.map(it=>{const x=v[it.id];return `<li class="${tem(x)?"sim":"nao"}"><span aria-hidden="true">${tem(x)?"✓":"✕"}</span>${typeof x==="string"&&x.trim()?`<b>${esc(x.trim())}</b> `:""}${esc(it.nome)}</li>`}).join("")||`<li class="nao">Nenhum item marcado ainda. Clique em Editar.</li>`}</ul>`:""}
        <div class="orc-st-bts"><button type="button" class="btn small" data-pl="editar" data-id="${p.id}">Editar</button>
          <button type="button" class="btn small ghost" data-pl="copiar" data-id="${p.id}">${I.copia} Copiar texto</button>
          <a class="btn small ghost" href="https://wa.me/?text=${encodeURIComponent(textoWa(p))}" target="_blank" rel="noopener">Enviar no WhatsApp</a>
          <button type="button" class="btn small ghost" data-pl="link" data-id="${p.id}">Copiar link</button></div></article>`}
    function render(){
      el.innerHTML=`<section class="card tk-head">
          <div class="head"><div><span class="eyebrow">Só você vê</span><h2>Vitrine do site</h2><p class="note" style="margin:4px 0 0">A página pública de marketing e vendas para o varejo: posicionamento, serviços, cases e perguntas frequentes. Os valores você calcula na Calculadora do menu. Planos fechados são opcionais.</p></div>
            <button class="btn primary" data-pl="novo">${I.mais} Novo plano</button></div>
          <div class="orc-st-bts"><a class="btn small ghost" href="${esc(link())}" target="_blank" rel="noopener">Ver a página pública</a>
            <button type="button" class="btn small ghost" data-pl="link-todos">Copiar link</button>
            ${planos.some(p=>p.ativo)?`<a class="btn small ghost" href="https://wa.me/?text=${encodeURIComponent(textoTodos())}" target="_blank" rel="noopener">Enviar todos no WhatsApp</a>`:""}
            <button type="button" class="btn small ghost" data-pl="itens" aria-expanded="${mostraItens}">Itens dos planos (${itens.length})</button>
            ${emp?`<button type="button" class="btn small ghost" data-pl="textos" aria-expanded="${mostraTextos}">Textos da página</button>`:""}
            ${temServ?`<button type="button" class="btn small ghost" data-pl="calc" aria-expanded="${mostraCalc}">Calculadora (${servs.filter(x=>x.ativo).length} serviços)</button>`:""}</div>
          ${mostraCalc&&temServ?calcHTML():""}${mostraItens?itensHTML():""}${mostraTextos&&emp?textosHTML():""}
        </section>
        ${planos.length?TIPOS.map(([k,t])=>{const ps=planos.filter(p=>(p.tipo||"mensal")===k);if(!ps.length)return "";
            const mrr=k==="mensal"?ps.filter(p=>p.ativo).reduce((a,p)=>a+doPlano(p).length*N(p.preco),0):0;
            return `<div class="pl-grupo"><h3>${t}${k==="mensal"&&mrr?` <small>${brl(mrr)}/mês em contratos ativos</small>`:""}</h3><div class="pl-grade">${ps.map(cardHTML).join("")}</div></div>`}).join(""):`<div class="empty">Nenhum plano ainda. Clique em Novo plano.</div>`}
        <dialog class="tk-dlg" id="pl-dlg"></dialog>`;
    }
    function textosHTML(){const fl=Array.isArray(emp.planos_fluxo)?emp.planos_fluxo:[], rg=Array.isArray(emp.planos_regras)?emp.planos_regras:[];
      return `<form class="orc-fs pl-textos" id="pl-textos"><fieldset class="orc-fs"><legend>Textos da página dos planos</legend>
        <div><label class="label" for="pt-t">Título (posicionamento)</label><input type="text" id="pt-t" maxlength="140" value="${esc(emp.planos_titulo||"")}"></div>
        <div><label class="label" for="pt-x">Texto abaixo do título</label><textarea id="pt-x" rows="2" maxlength="400">${esc(emp.planos_texto||"")}</textarea></div>
        <div><label class="label" for="pt-f">Como funciona (uma etapa por linha: Nome | explicação)</label><textarea id="pt-f" rows="7">${esc(fl.map(x=>x[0]+(x[1]?" | "+x[1]:"")).join("\n"))}</textarea></div>
        <div><label class="label" for="pt-r">Condições comerciais (uma por linha)</label><textarea id="pt-r" rows="7">${esc(rg.join("\n"))}</textarea></div>
        <div><label class="label" for="pt-c">Cases (um por linha: Nome | segmento | o que foi feito)</label><textarea id="pt-c" rows="4">${esc((Array.isArray(emp.vitrine_cases)?emp.vitrine_cases:[]).map(x=>x.join(" | ")).join("\n"))}</textarea></div>
        <div><label class="label" for="pt-q">Perguntas frequentes (uma por linha: Pergunta | resposta)</label><textarea id="pt-q" rows="7">${esc((Array.isArray(emp.vitrine_faq)?emp.vitrine_faq:[]).map(x=>x.join(" | ")).join("\n"))}</textarea></div>
        <div class="actions"><button type="submit" class="btn small primary">Salvar textos</button></div></fieldset></form>`}
    const faixaTxt=f=>(Array.isArray(f)?f:[]).map(x=>`${x.qtd}=${num(x.preco)}`).join("; ");
    const faixaLer=t=>String(t||"").split(";").map(x=>{const [q,p]=x.split("=");return {qtd:parseInt(q,10),preco:r2(parseNum(p))}}).filter(x=>x.qtd>0&&x.preco>0).sort((a,b)=>a.qtd-b.qtd);
    function calcHTML(){const lin=s=>`<tr data-sv="${s.id}"${s.ativo?"":' class="off"'}>
        <td><input type="text" data-c="nome" value="${esc(s.nome)}" aria-label="Nome do serviço" maxlength="80"><input type="text" data-c="descricao" value="${esc(s.descricao)}" aria-label="Descrição" maxlength="200" class="sv-desc"></td>
        <td><select data-c="modo" aria-label="Cobrança"><option value="mensal"${s.modo==="mensal"?" selected":""}>Mensal</option><option value="projeto"${s.modo==="projeto"?" selected":""}>Projeto</option></select></td>
        <td><input type="text" inputmode="decimal" data-c="preco" value="${num(s.preco)}" aria-label="Preço por unidade"></td>
        <td><input type="text" data-c="unidade" value="${esc(s.unidade)}" aria-label="Unidade" placeholder="post" maxlength="20"></td>
        <td><input type="number" min="1" max="99" data-c="qtd_min" value="${s.qtd_min}" aria-label="Quantidade mínima"></td>
        <td><input type="number" min="1" max="99" data-c="qtd_max" value="${s.qtd_max}" aria-label="Quantidade máxima"></td>
        <td><input type="text" data-c="faixas" value="${esc(faixaTxt(s.faixas))}" aria-label="Preço por quantidade" placeholder="4=125,00"></td>
        <td><label class="check"><input type="checkbox" data-c="a_partir" ${s.a_partir?"checked":""}> a partir de</label><label class="check"><input type="checkbox" data-c="ativo" ${s.ativo?"checked":""}> ativo</label></td>
        <td><button type="button" class="tk-x" data-pl="sv-apagar" data-id="${s.id}" aria-label="Apagar ${esc(s.nome)}">${I.lixo}</button></td></tr>`;
      return `<fieldset class="orc-fs"><legend>Calculadora de orçamento do site</legend>
        <p class="note" style="margin:0">O visitante escolhe os serviços e as quantidades e só vê o valor depois de deixar nome e WhatsApp. <b>Preço</b> é por unidade. Em <b>Preço por quantidade</b> você dá desconto por volume: <code>4=125,00</code> quer dizer “a partir de 4, cada um sai por R$ 125”. Máximo 1 = não pergunta quantidade. Cada mudança é salva na hora.</p>
        <div class="sv-tab-w"><table class="sv-tab"><thead><tr><th>Serviço e descrição</th><th>Cobrança</th><th>Preço (R$)</th><th>Unidade</th><th>Mín.</th><th>Máx.</th><th>Preço por quantidade</th><th>Opções</th><th></th></tr></thead><tbody>${servs.map(lin).join("")||`<tr><td colspan="9">Nenhum serviço ainda.</td></tr>`}</tbody></table></div>
        <div class="orc-st-bts"><button type="button" class="btn small" data-pl="sv-novo">${I.mais} Novo serviço</button>
          ${emp?`<label class="sv-desc-l">Desconto no plano de 3 meses (%) <input type="text" inputmode="decimal" data-emp="calc_desc_3m" value="${num(emp.calc_desc_3m)}"></label><label class="sv-desc-l">6 meses (%) <input type="text" inputmode="decimal" data-emp="calc_desc_6m" value="${num(emp.calc_desc_6m)}"></label>`:""}</div></fieldset>`}
    function itensHTML(){return `<fieldset class="orc-fs"><legend>Itens dos planos</legend>
      <p class="note" style="margin:0">São as linhas que aparecem em todos os planos (artes, vídeos, captação…). Em cada plano você diz a quantidade, se está incluso ou se não está.</p>
      <ul class="pl-it-lista">${itens.map((it,k)=>`<li><input type="text" value="${esc(it.nome)}" data-it-nome="${it.id}" aria-label="Nome do item">
        <button type="button" class="tk-x" data-pl="it-cima" data-id="${it.id}" ${k===0?"disabled":""} aria-label="Subir">${I.cima}</button>
        <button type="button" class="tk-x" data-pl="it-baixo" data-id="${it.id}" ${k===itens.length-1?"disabled":""} aria-label="Descer">${I.baixo}</button>
        <button type="button" class="tk-x" data-pl="it-apagar" data-id="${it.id}" aria-label="Apagar item">${I.lixo}</button></li>`).join("")}</ul>
      <form class="pl-it-novo" id="pl-it-novo"><input type="text" id="pl-it-n" placeholder="Novo item (ex.: Gestão de comentários)" maxlength="80"><button type="submit" class="btn small">${I.mais} Adicionar</button></form></fieldset>`}
    function formHTML(p){const novo=!p.id, v=p.valores||{};
      const estado=x=>x===undefined||x===null||x===""?"":x===true?"sim":x===false?"nao":"qtd";
      const tp=p.tipo||"mensal";
      return `<form method="dialog" class="tk-form" id="pl-form" data-tipo="${tp}">
        <div class="head"><h2>${novo?"Novo plano":"Editar plano"}</h2><button type="button" class="tk-x" data-pl="fechar" aria-label="Fechar">✕</button></div>
        <div><span class="label">Tipo</span><div class="seg pl-tipo" role="radiogroup" aria-label="Tipo">${TIPOS.map(([k,,t])=>`<label><input type="radio" name="pf-tipo" value="${k}" ${tp===k?"checked":""}> ${t}</label>`).join("")}</div></div>
        <div class="grid2">
          <div><label class="label" for="pf-n">Nome</label><input type="text" id="pf-n" required maxlength="60" value="${esc(p.nome||"")}" placeholder="Ex.: Essencial"></div>
          <div class="pl-preco-in"><div><label class="label" for="pf-p">Preço (R$)</label><input type="text" id="pf-p" inputmode="decimal" value="${p.preco!=null?num(p.preco):""}" placeholder="0,00"></div>
            <div><label class="label" for="pf-per">por</label><input type="text" id="pf-per" value="${esc(p.periodo||"mês")}" list="pl-pers"><datalist id="pl-pers"><option value="mês"><option value="trimestre"><option value="ano"><option value="projeto"></datalist></div></div>
        </div>
        <div class="grid2"><div class="pl-so-proj"><label class="label" for="pf-ate">Até (R$) — para faixa de preço</label><input type="text" id="pf-ate" inputmode="decimal" value="${p.preco_ate!=null?num(p.preco_ate):""}" placeholder="Ex.: 3.000,00"></div>
          <label class="check" style="align-self:end"><input type="checkbox" id="pf-ap" ${p.a_partir?"checked":""}> Mostrar “a partir de”</label></div>
        <p class="note pl-so-adic" style="margin:0">Preço zero aparece como “Sob orçamento”.</p>
        <div><label class="label" for="pf-d">Frase curta</label><input type="text" id="pf-d" maxlength="140" value="${esc(p.descricao||"")}" placeholder="Ex.: Para quem está começando a postar com frequência"></div>
        <div class="pl-so-lista"><label class="label" for="pf-l">O que está incluso (um item por linha)</label><textarea id="pf-l" rows="6" placeholder="Briefing e diagnóstico&#10;Criação da identidade visual">${esc(listaTxt(p.lista))}</textarea></div>
        <fieldset class="orc-fs pl-so-mensal"><legend>O que tem no plano</legend>
          <div class="pl-ed-it">${itens.map(it=>{const x=v[it.id], e=estado(x);return `<div class="pl-ed-row" data-it="${it.id}"><span class="pl-ed-nome">${esc(it.nome)}</span>
            <select data-est aria-label="${esc(it.nome)}"><option value="" ${e===""?"selected":""}>Não mostrar</option><option value="qtd" ${e==="qtd"?"selected":""}>Quantidade</option><option value="sim" ${e==="sim"?"selected":""}>✓ Incluso</option><option value="nao" ${e==="nao"?"selected":""}>✕ Não incluso</option></select>
            <input type="text" data-qtd value="${e==="qtd"?esc(x):""}" placeholder="Ex.: 12 por mês" ${e==="qtd"?"":"hidden"} aria-label="Quantidade de ${esc(it.nome)}"></div>`}).join("")||`<p class="note">Cadastre os itens primeiro em “Itens dos planos”.</p>`}</div></fieldset>
        <div><label class="label" for="pf-ni">Não inclui</label><input type="text" id="pf-ni" maxlength="240" value="${esc(p.nao_inclui||"")}" placeholder="Ex.: Gravação de vídeos, gestão de anúncios"></div>
        <div><label class="label" for="pf-o">Observação (aparece no fim do plano)</label><input type="text" id="pf-o" maxlength="200" value="${esc(p.obs||"")}" placeholder="Ex.: Fidelidade de 3 meses. Verba de anúncios à parte."></div>
        <label class="check"><input type="checkbox" id="pf-dest" ${p.destaque?"checked":""}> Destacar como “Mais escolhido”</label>
        <label class="check"><input type="checkbox" id="pf-at" ${p.ativo!==false?"checked":""}> Mostrar na página dos planos</label>
        <div class="actions"><button type="submit" class="btn primary">${novo?"Criar plano":"Salvar"}</button><button type="button" class="btn ghost" data-pl="fechar">Cancelar</button>
          ${novo?"":`<button type="button" class="btn small ghost" data-pl="duplicar">Duplicar</button><button type="button" class="btn danger small" data-pl="apagar" style="margin-left:auto">Apagar</button>`}</div></form>`}
    const dlg=()=>el.querySelector("#pl-dlg");
    function abrir(p){ed=JSON.parse(JSON.stringify(p));const d=dlg();d.innerHTML=formHTML(ed);if(typeof d.showModal==="function")d.showModal();else d.setAttribute("open","")}
    function fechar(){const d=dlg();if(!d)return;if(d.open&&typeof d.close==="function")d.close();d.removeAttribute("open");ed=null}
    async function copiar(t,msg){try{await navigator.clipboard.writeText(t)}catch(_){}toast(msg)}
    async function moverItem(id,dir){const k=itens.findIndex(x=>x.id===id),j=k+dir;if(k<0||j<0||j>=itens.length)return;[itens[k],itens[j]]=[itens[j],itens[k]];
      itens.forEach((x,i)=>x.ordem=i+1);render();await Promise.all(itens.map(x=>sb.from("planos_itens").update({ordem:x.ordem}).eq("id",x.id)))}

    el.addEventListener("click",async e=>{
      const b=e.target.closest("[data-pl]");if(!b)return;const a=b.dataset.pl, id=b.dataset.id, p=planos.find(x=>x.id===id);
      if(a==="novo")return abrir({ativo:true,periodo:"mês",valores:{},tipo:"mensal",lista:[]});
      if(a==="editar"&&p)return abrir(p);
      if(a==="fechar")return fechar();
      if(a==="copiar"&&p)return copiar(textoWa(p),"Texto copiado. Cole no WhatsApp.");
      if(a==="link"&&p)return copiar(link(p),"Link do plano copiado.");
      if(a==="link-todos")return copiar(link(),"Link da página dos planos copiado.");
      if(a==="itens"){mostraItens=!mostraItens;render();return}
      if(a==="textos"){mostraTextos=!mostraTextos;render();return}
      if(a==="calc"){mostraCalc=!mostraCalc;render();return}
      if(a==="sv-novo"){const {data,error}=await sb.from("servicos").insert({nome:"Novo serviço",modo:"mensal",preco:0,ordem:(servs.reduce((m,x)=>Math.max(m,N(x.ordem)),0))+1,ativo:false}).select().single();
        if(error)return falha("criar o serviço",error);servs.push(data);render();const i=el.querySelector(`tr[data-sv="${data.id}"] [data-c="nome"]`);if(i){i.focus();i.select()}return}
      if(a==="sv-apagar"){const sv=servs.find(x=>x.id===b.dataset.id);if(!sv||!confirm(`Apagar "${sv.nome}" da calculadora?`))return;
        const {error}=await sb.from("servicos").delete().eq("id",sv.id);if(error)return falha("apagar o serviço",error);servs=servs.filter(x=>x.id!==sv.id);render();toast("Serviço apagado.");return}
      if(a==="it-cima")return moverItem(id,-1);
      if(a==="it-baixo")return moverItem(id,1);
      if(a==="it-apagar"){if(b.dataset.confirm!=="1"){b.dataset.confirm="1";toast("Clique de novo para apagar o item de todos os planos.");return}
        const {error}=await sb.from("planos_itens").delete().eq("id",id);if(error)return falha("apagar o item",error);itens=itens.filter(x=>x.id!==id);render();return}
      if(a==="duplicar"&&ed){const c=JSON.parse(JSON.stringify(ed));delete c.id;c.nome=c.nome+" (cópia)";c.destaque=false;fechar();abrir(c);return}
      if(a==="apagar"&&ed){if(b.dataset.confirm!=="1"){b.dataset.confirm="1";b.textContent="Clique de novo para apagar";return}
        const {error}=await sb.from("planos").delete().eq("id",ed.id);if(error)return falha("apagar o plano",error);planos=planos.filter(x=>x.id!==ed.id);fechar();render();toast("Plano apagado.");return}
    });
    el.addEventListener("change",async e=>{const t=e.target;
      if(t.dataset.emp&&emp){const v=Math.min(90,Math.max(0,r2(parseNum(t.value))));const {error}=await sb.from("empresa").update({[t.dataset.emp]:v}).eq("id",1);if(error)return falha("salvar o desconto",error);emp[t.dataset.emp]=v;t.value=num(v);toast("Desconto salvo.");return}
      if(t.dataset.c&&t.closest("tr[data-sv]")){const tr=t.closest("tr[data-sv]"), sv=servs.find(x=>x.id===tr.dataset.sv), c=t.dataset.c;if(!sv)return;
        let v=t.type==="checkbox"?t.checked:t.value.trim();
        if(c==="preco")v=r2(parseNum(v));if(c==="qtd_min"||c==="qtd_max")v=Math.min(99,Math.max(1,parseInt(v,10)||1));if(c==="faixas")v=faixaLer(v);
        if(c==="nome"&&!v){t.value=sv.nome;return}
        const campos={[c]:v};if(c==="qtd_min"&&v>sv.qtd_max)campos.qtd_max=v;if(c==="qtd_max"&&v<sv.qtd_min)campos.qtd_min=v;
        const {error}=await sb.from("servicos").update(campos).eq("id",sv.id);if(error)return falha("salvar o serviço",error);Object.assign(sv,campos);
        if(c==="preco")t.value=num(v);if(c==="faixas")t.value=faixaTxt(v);if(c==="ativo")tr.classList.toggle("off",!v);
        if(campos.qtd_max!==undefined)tr.querySelector('[data-c="qtd_max"]').value=sv.qtd_max;if(campos.qtd_min!==undefined)tr.querySelector('[data-c="qtd_min"]').value=sv.qtd_min;
        toast("Salvo.");return}
      if(t.name==="pf-tipo"){const f=t.closest("form");f.dataset.tipo=t.value;const per=f.querySelector("#pf-per");if(t.value==="projeto"&&per.value==="mês")per.value="projeto";return}
      if(t.matches("[data-est]")){const q=t.closest(".pl-ed-row").querySelector("[data-qtd]");q.hidden=t.value!=="qtd";if(!q.hidden)q.focus();return}
      if(t.dataset.itNome){const nome=t.value.trim();if(!nome){render();return}const {error}=await sb.from("planos_itens").update({nome}).eq("id",t.dataset.itNome);
        if(error)return falha("renomear o item",error);const it=itens.find(x=>x.id===t.dataset.itNome);if(it)it.nome=nome;toast("Item renomeado.");return}});
    el.addEventListener("submit",async e=>{e.preventDefault();
      if(e.target.id==="pl-it-novo"){const i=el.querySelector("#pl-it-n"),nome=i.value.trim();if(!nome)return;
        const {data,error}=await sb.from("planos_itens").insert({nome,ordem:itens.length+1}).select().single();if(error)return falha("criar o item",error);itens.push(data);render();
        const n=el.querySelector("#pl-it-n");n&&n.focus();return}
      if(e.target.id==="pl-textos"){const v=s=>el.querySelector(s).value;
        const campos={planos_titulo:v("#pt-t").trim(),planos_texto:v("#pt-x").trim(),
          planos_fluxo:v("#pt-f").split("\n").map(x=>x.trim()).filter(Boolean).map(x=>{const [a,...b]=x.split("|");return [a.trim(),b.join("|").trim()]}),
          planos_regras:v("#pt-r").split("\n").map(x=>x.trim()).filter(Boolean),
          vitrine_cases:v("#pt-c").split("\n").map(x=>x.trim()).filter(Boolean).map(x=>{const p=x.split("|").map(y=>y.trim());return [p[0]||"",p[1]||"",p.slice(2).join(" | ")]}),
          vitrine_faq:v("#pt-q").split("\n").map(x=>x.trim()).filter(Boolean).map(x=>{const [a,...b]=x.split("|");return [a.trim(),b.join("|").trim()]})};
        const {error}=await sb.from("empresa").update(campos).eq("id",1);if(error)return falha("salvar os textos",error);Object.assign(emp,campos);toast("Textos da página salvos.");return}
      if(e.target.id==="pl-form"){const v=s=>el.querySelector(s).value.trim();const nome=v("#pf-n");if(!nome){toast("Dê um nome ao plano.");return}
        const valores={};el.querySelectorAll(".pl-ed-row").forEach(r=>{const est=r.querySelector("[data-est]").value, q=r.querySelector("[data-qtd]").value.trim();
          if(est==="sim")valores[r.dataset.it]=true;else if(est==="nao")valores[r.dataset.it]=false;else if(est==="qtd"&&q)valores[r.dataset.it]=q});
        const tipo=(el.querySelector('input[name="pf-tipo"]:checked')||{}).value||"mensal", ate=r2(parseNum(v("#pf-ate")));
        const campos={tipo,a_partir:el.querySelector("#pf-ap").checked,preco_ate:ate>0?ate:null,nao_inclui:v("#pf-ni"),
          lista:el.querySelector("#pf-l").value.split("\n").map(x=>x.trim()).filter(Boolean),nome,descricao:v("#pf-d"),preco:Math.max(0,r2(parseNum(v("#pf-p")))),periodo:v("#pf-per")||"mês",obs:v("#pf-o"),destaque:el.querySelector("#pf-dest").checked,ativo:el.querySelector("#pf-at").checked,valores,atualizado_em:new Date().toISOString()};
        if(!ed.id)campos.ordem=planos.length+1;
        const q=ed.id?sb.from("planos").update(campos).eq("id",ed.id):sb.from("planos").insert(campos);
        const {data,error}=await q.select().single();if(error)return falha("salvar o plano",error);
        const i=planos.findIndex(x=>x.id===data.id);if(i>=0)planos[i]=data;else planos.push(data);const novo=!ed.id;fechar();render();toast(novo?"Plano criado.":"Plano salvo.");return}
    });
    carregar();
    return {carregar};
  }
  window.GlaraPlanos={criar};
})();
