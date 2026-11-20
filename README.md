# Hub de Marketing · gustavolara

Site estático do Hub de Marketing (portal do cliente e painel), publicado pelo GitHub Pages em https://cliente.guxta.com.br.

- `index.html`: portal do cliente
- `admin.html`: painel
- `diagnostico.html`: diagnóstico de vendas (gargalo, devolutiva e proposta)
- `devolutiva.html`: página que o cliente abre com o diagnóstico e a proposta (os dados vão no próprio link)
- `visual-site.css`: visual igual ao site gustavolara.com.br (carregado por último)
- `leads_site.sql`: pedidos do site entram no CRM
- `pagar.html`, `proposta.html`, `orcamento.html`, `plano-midia.html`, `relatorio.html`: páginas públicas
- `config.js`: endereço do Supabase e a chave pública (anon). Ela é pública por natureza; quem protege os dados são as regras do banco.

Para atualizar: troque os arquivos e faça commit na branch `main`. O GitHub Pages publica sozinho em 1 ou 2 minutos.
