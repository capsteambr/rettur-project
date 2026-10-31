import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';
import { INITIAL_THEME } from './app/services/theme.service';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const app = express();
const commonEngine = new CommonEngine({
  enablePerformanceProfiler: true,
  // Aceitar localhost e o domínio final para evitar erro "URL with hostname is not allowed"
  allowedHosts: ['localhost', 'localhost:4000', 'localhost:7492', 'opencnpj.com', 'www.opencnpj.com']
});

/**
 * API Proxy para esconder a kitana.opencnpj.com do navegador
 */
app.get('/api/cnpj/:cnpj', async (req, res) => {
  try {
    const { cnpj } = req.params;
    const kitanaRes = await fetch(`https://kitana.opencnpj.com/cnpj/${cnpj}`);
    
    // Lê o body como texto primeiro para não quebrar em erros estranhos
    const text = await kitanaRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
    
    res.status(kitanaRes.status).json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno no servidor.', data: null });
  }
});

/**
 * Servir arquivos estáticos customizados (injetados via volume no Docker)
 * Tudo que for colocado na pasta /app/public ficará disponível na raiz do site.
 * Ideal para sitemap.xml, robots.txt customizados, etc.
 */
app.use(express.static(resolve(serverDistFolder, '../../public'), { 
  setHeaders: (res, path) => {
    // Não cachear arquivos muito dinâmicos como sitemaps
    if (path.endsWith('.xml') || path.endsWith('.txt') || path.endsWith('.gz')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
}));

/**
 * Serve static files from /browser
 */
app.get(
  '**',
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html'
  }),
);

/**
 * Previne que o Angular tente renderizar páginas HTML para arquivos estáticos não encontrados
 */
app.get('*.*', (req, res) => {
  res.status(404).send('File not found');
});

/**
 * Handle all other requests by rendering the Angular application.
 */
app.get('**', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  // Detecta se há preferência salva em cookie ou cabeçalho Client-Hints
  let serverTheme: 'light' | 'dark' = 'dark';
  const cookieHeader = headers.cookie || '';
  const matchCookie = cookieHeader.match(/(?:^|; )opencnpj_theme=([^;]*)/);
  if (matchCookie && (matchCookie[1] === 'light' || matchCookie[1] === 'dark')) {
    serverTheme = matchCookie[1] as 'light' | 'dark';
  } else if (headers['sec-ch-prefers-color-scheme'] === 'light') {
    serverTheme = 'light';
  }

  // Permite que o navegador informe a preferência nativa de cor via Client Hints
  res.setHeader('Accept-CH', 'Sec-CH-Prefers-Color-Scheme');
  res.setHeader('Vary', 'Sec-CH-Prefers-Color-Scheme, Cookie');

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [
        { provide: APP_BASE_HREF, useValue: baseUrl },
        { provide: INITIAL_THEME, useValue: serverTheme }
      ],
    })
    .then((html) => {
      // Injeta a classe correspondente no HTML renderizado pelo servidor para eliminar qualquer flash
      if (serverTheme === 'light') {
        html = html.replace('class="no-transitions"', 'class="no-transitions light-theme"');
        html = html.replace('<body', '<body class="light-theme"');
      } else {
        html = html.replace('class="no-transitions"', 'class="no-transitions dark-theme"');
        html = html.replace('<body', '<body class="dark-theme"');
      }
      res.send(html);
    })
    .catch((err) => next(err));
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export default app;
