import { useState } from 'react';
import UploadZone from './components/UploadZone';
import SummaryResult from './components/SummaryResult';
import { summarizeDocument } from './api/client';
import type { DocType, SummaryData } from './types';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummaryData | null>(null);

  const handleSubmit = async (file: File, docType: DocType) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await summarizeDocument(file, docType);
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.message);
      }
    } catch {
      setError('Something unexpected went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-paper'>
      <main className='mx-auto max-w-3xl px-4 py-12 sm:px-6'>
        <header className='mb-10'>
          <p className='mb-2 font-mono text-xs uppercase tracking-[0.25em] text-ink-600'>
            DocBrief / 07
          </p>
          <h1 className='font-display text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl'>
            Hours of reading,
            <br />
            distilled in one pass.
          </h1>
          <p className='mt-3 max-w-xl font-body text-ink-900/70'>
            Upload an SOP, validation protocol, or audit report. The model
            extracts the summary, key points, action items, and any compliance
            concerns — structured and ready to act on.
          </p>
        </header>

        <UploadZone onSubmit={handleSubmit} loading={loading} />

        {loading && (
          <div className='mt-6 border border-ink-900/15 bg-white p-6 text-center'>
            <p className='font-mono text-sm text-ink-800'>
              Extracting text and analysing — large documents can take a minute…
            </p>
          </div>
        )}

        {error && (
          <div
            role='alert'
            className='mt-6 border-l-2 border-seal bg-seal/5 p-4 font-body text-sm text-ink-950'
          >
            {error}
          </div>
        )}

        {result && (
          <div className='mt-6'>
            <SummaryResult data={result} />
          </div>
        )}

        <footer className='mt-12 border-t border-ink-900/10 pt-4 font-mono text-xs text-ink-900/40'>
          Project 07 of 12 · React + FastAPI + open-source LLM (Groq) ·{' '}
          <a
            href='https://github.com/jinx71'
            className='underline hover:text-ink-800'
          >
            github.com/jinx71
          </a>
        </footer>
      </main>
    </div>
  );
}
