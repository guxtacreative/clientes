/* =====================================================================
   Catálogo de serviços · usado pelo diagnóstico (diagnostico.html) e pela
   página do cliente (devolutiva.html). Mudou preço, nome ou o que está
   incluso? Muda só aqui que as duas páginas acompanham.
   n: nome · u: unidade da quantidade · max: quantidade máxima
   m: 1 = todo mês, 0 = feito uma vez · et: etapa que resolve
   why: para que serve (uma linha) · inc: o que está incluso
   p(q): preço para a quantidade q
   ===================================================================== */
window.GL_CAT={
 trafego:{n:"Gestão de anúncios",u:"plataforma",us:"plataformas",max:2,m:1,et:"Movimento",why:"Trazer gente nova todo mês, com relatório",
  inc:["Planejamento das campanhas e dos públicos","Criativos dos anúncios (artes e textos)","Configuração do pixel e do rastreamento de contatos","Acompanhamento e ajustes toda semana","Relatório mensal: quanto custou cada contato e cada venda"],
  qd:"Cada plataforma é um canal de anúncio: Meta (Instagram e Facebook) ou Google.",p:q=>q>=2?1500:900},
 gmnCfg:{n:"Google Meu Negócio: configuração",m:0,et:"Movimento",why:"Aparecer para quem procura na região",
  inc:["Criação ou verificação do perfil da loja","Categorias, horários, endereço e área de atendimento","Fotos, produtos e botão do WhatsApp","Ajustes para aparecer no Google Maps"],p:()=>350},
 gmn:{n:"Google Meu Negócio: gestão",m:1,et:"Movimento",why:"Fotos, posts e avaliações em dia",
  inc:["Posts e fotos novas no perfil todo mês","Resposta às avaliações","Acompanhamento de buscas, ligações e rotas"],p:()=>250},
 mkt:{n:"Gestão de marketplace",u:"marketplace",us:"marketplaces",max:3,m:1,et:"Movimento",why:"Anúncios, fotos, preço e reputação",
  inc:["Cadastro e melhoria dos anúncios (título, fotos e descrição)","Preço e frete competitivos","Reputação, perguntas e avaliações","Campanhas e promoções da própria plataforma"],
  qd:"Cada marketplace é uma loja: Mercado Livre, Shopee ou TikTok Shop.",p:q=>800*q},
 post:{n:"Posts no Instagram",u:"post",us:"posts",max:40,m:1,et:"Vitrine",why:"Instagram com padrão e frequência",
  inc:["Calendário de conteúdo do mês","Criação das artes e das legendas","Aprovação pelo portal antes de publicar","Agendamento e publicação"],
  qd:"Quantidade de posts (artes ou carrosséis) publicados por mês.",p:q=>90*q},
 video:{n:"Reels editados",u:"vídeo",us:"vídeos",max:30,m:1,et:"Vitrine",why:"Vídeo de produto vende mais que arte parada",
  inc:["Roteiro de cada vídeo","Edição com cortes, legenda e trilha","Capa para o perfil","Publicação"],
  qd:"Quantidade de vídeos curtos editados por mês.",p:q=>(q>=4?125:150)*q},
 capt:{n:"Captação na loja",u:"visita",us:"visitas",max:8,m:1,et:"Vitrine",why:"Material real da loja para os vídeos",
  inc:["Visita à loja para gravar produtos, ambiente e equipe","Fotos dos produtos","Material usado nos vídeos e posts do mês"],
  qd:"Quantas vezes por mês eu vou até a loja gravar.",p:q=>350*q},
 identE:{n:"Identidade visual Essencial",m:0,et:"Vitrine",why:"Logo, cores e fontes com padrão",
  inc:["Logo (versões principal e reduzida)","Paleta de cores e fontes","Aplicações básicas para redes sociais"],p:()=>1500},
 identC:{n:"Identidade visual Completa",m:0,et:"Vitrine",why:"Marca com manual e papelaria",
  inc:["Tudo da identidade Essencial","Manual de uso da marca","Papelaria (cartão, timbrado e assinatura de e-mail)","Modelos para redes sociais"],p:()=>2800},
 lp:{n:"Landing page com WhatsApp",m:0,et:"Vitrine",why:"Destino para os anúncios e para o Google",
  inc:["Página única com os produtos e diferenciais da loja","Botão do WhatsApp com mensagem pronta","Funciona bem no celular","Pronta para receber os anúncios, com rastreamento"],p:()=>1800},
 site5:{n:"Site com até 5 páginas",m:0,et:"Vitrine",why:"Site institucional completo",
  inc:["Até 5 páginas (início, sobre, produtos, contato e mais uma)","Botão do WhatsApp e mapa","Funciona bem no celular","Configurado para aparecer no Google"],p:()=>3200},
 ecom:{n:"E-commerce próprio",m:0,et:"Vitrine",why:"Loja virtual com pagamento e frete",
  inc:["Loja virtual com catálogo de produtos","Pagamento online e cálculo de frete","Funciona bem no celular","Treinamento para cadastrar produtos"],p:()=>3800},
 cartao:{n:"Cartão de visita",m:0,et:"Vitrine",why:"Arte pronta para a gráfica",inc:["Arte frente e verso","Arquivo pronto para a gráfica"],p:()=>250},
 apres:{n:"Apresentação institucional",m:0,et:"Vitrine",why:"Até 12 slides para vender",inc:["Até 12 slides com a história, os produtos e os diferenciais","Arquivo para apresentar e enviar em PDF"],p:()=>690},
 zap:{n:"Estruturação do atendimento no WhatsApp",m:0,et:"Atendimento",why:"Mensagens prontas, listas e roteiro",
  inc:["Perfil comercial e catálogo organizados","Mensagens de saudação e de ausência","Respostas rápidas para as perguntas mais comuns","Listas (etiquetas) para acompanhar cada cliente","Roteiro de atendimento, do primeiro oi ao fechamento"],p:()=>600},
 trein:{n:"Treinamento de atendimento",u:"sessão",us:"sessões",max:6,m:0,et:"Atendimento",why:"Equipe atendendo e fechando do mesmo jeito",
  inc:["Treinamento com quem atende na loja e no WhatsApp","Como responder rápido e conduzir a conversa","Como lidar com 'tá caro' e 'vou pensar'","Como chamar de volta quem não fechou"],
  qd:"Quantidade de encontros de treinamento com a equipe.",p:q=>450*q},
 analise:{n:"Análise de vendas e campanhas de recompra",m:1,et:"Volta",why:"Lista ativa e datas fortes planejadas",
  inc:["Análise mensal dos números de venda","Lista de clientes organizada e ativa","Campanhas para datas fortes do comércio","Ações para o cliente comprar de novo e indicar"],p:()=>400}};
window.GL_PGTO={D3:5,D6:10,DV:10};
/* quantidade inicial quando o serviço é adicionado */
window.GL_QTD_PADRAO={post:8,video:4};
