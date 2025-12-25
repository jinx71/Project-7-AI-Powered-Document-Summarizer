import { useCallback, useRef, useState } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { DOC_TYPES } from '../types';
import type { DocType } from '../types';

interface UploadZoneProps {
  onSubmit: (file: File, docType: DocType) => void;
  loading: boolean;
}

export default function UploadZone({ onSubmit, loading }: UploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocType>('auto');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptFile = useCallback((candidate: File | undefined) => {
    if (!candidate) return;
    if (!candidate.name.toLowerCase().endsWith('.pdf')) return;
    setFile(candidate);
  }, []);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    acceptFile(event.dataTransfer.files[0]);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    acceptFile(event.target.files?.[0]);
  };

  return (
    <section className='border border-ink-900/15 bg-white'>
      <div
        role='button'
        tabIndex={0}
        aria-label='Upload a PDF document'
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`cursor-pointer border-b border-dashed border-ink-900/20 p-10 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-600 ${
          dragging ? 'bg-ink-400/10' : 'bg-paper/60'
        }`}
      >
        <input
          ref={inputRef}
          type='file'
          accept='application/pdf'
          className='hidden'
          onChange={handleChange}
        />
        {file ? (
          <div className='space-y-1'>
            <p className='font-mono text-sm text-ink-800'>{file.name}</p>
            <p className='font-mono text-xs text-ink-900/50'>
              {(file.size / 1024 / 1024).toFixed(2)} MB · click to replace
            </p>
          </div>
        ) : (
          <div className='space-y-1'>
            <p className='font-display font-semibold text-ink-900'>
              Drop a PDF here or click to browse
            </p>
            <p className='font-mono text-xs text-ink-900/50'>
              SOP · validation protocol · audit report · manual — up to 20 MB
            </p>
          </div>
        )}
      </div>

      <div className='flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between'>
        <label className='block'>
          <span className='mb-1 block font-mono text-xs uppercase tracking-wider text-ink-900/60'>
            Document type
          </span>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocType)}
            className='border border-ink-900/20 bg-white px-3 py-2 font-mono text-sm text-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-600'
          >
            {DOC_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === 'auto' ? 'Detect automatically' : type}
              </option>
            ))}
          </select>
        </label>

        <button
          type='button'
          disabled={!file || loading}
          onClick={() => file && onSubmit(file, docType)}
          className='bg-ink-800 px-8 py-3 font-display text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-ink-900 disabled:cursor-not-allowed disabled:opacity-40'
        >
          {loading ? 'Analysing…' : 'Summarise document'}
        </button>
      </div>
    </section>
  );
}
