import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

const root = createRoot(document.getElementById('root')!);
async function start() {
  try {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
      quiet: true,
      serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
    });
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch {
    root.render(
      <main className="startup-error">
        <h1>Let’s try that again.</h1>
        <p>
          The demo couldn’t start. Open it over HTTPS or localhost, and make sure service workers
          are enabled in your browser.
        </p>
        <button className="primary-button" onClick={() => window.location.reload()}>
          Reload workspace
        </button>
      </main>,
    );
  }
}
void start();
