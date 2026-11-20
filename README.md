# Hub de Marketing · gustavolara

Site estático do Hub de Marketing (portal do cliente e painel), publicado pelo GitHub Pages em https://gustavolara.com.br/clientes.

- `index.html`: portal do cliente
- `admin.html`: painel
- `diagnostico.html`: diagnóstico de vendas (gargalo, devolutiva e proposta)
- `devolutiva.html`: página que o cliente abre com o diagnóstico e a proposta (os dados vão no próprio link)
- `catalogo.js`: serviços, o que cada um inclui e preços (usado pelo diagnóstico e pela devolutiva)
- `diagnostico.webmanifest`, `sw-diagnostico.js`, `app-*.png`: atalho do diagnóstico como app no celular
- `visual-site.css`: visual igual ao site gustavolara.com.br (carregado por último)
- `leads_site.sql`: pedidos do site entram no CRM
- `pagar.html`, `proposta.html`, `orcamento.html`, `plano-midia.html`, `relatorio.html`: páginas públicas
- `config.js`: endereço do Supabase e a chave pública (anon). Ela é pública por natureza; quem protege os dados são as regras do banco.

Para atualizar: troque os arquivos e faça commit na branch `main`. O GitHub Pages publica sozinho em 1 ou 2 minutos.
