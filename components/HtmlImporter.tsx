'use client';

import { useState, useRef } from 'react';
import { gradeToPoint } from '@/constants/grades';

interface HtmlImporterProps {
  onImportComplete: (gradesMap: Record<string, string>) => void;
  onJsonImport: (file: File) => void;
}

export default function HtmlImporter({ onImportComplete, onJsonImport, }: HtmlImporterProps){
  const [showMenu, setShowMenu] = useState(false); 
  const [showInstructions, setShowInstructions] = useState(false);
  const [deviceTab, setDeviceTab] = useState<'desktop' | 'mobile'>('desktop');
  const [isProcessing, setIsProcessing] = useState(false);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (file.size > 10 * 1024 * 1024) {
      alert('The selected file is too large to import.');
      return;
    }
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const htmlText = event.target?.result as string;
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');

        const gradesMap: Record<string, string> = {};
        const rows = doc.querySelectorAll('tr');

        rows.forEach((row) => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 4) {
            const title = cells[1].textContent?.replace(/\s+/g, ' ').trim().toLowerCase();
            const grade = cells[2].textContent?.trim();

            if (title && grade && Object.prototype.hasOwnProperty.call(gradeToPoint, grade)) {
              gradesMap[title] = grade;
            }
          }
        });

        onImportComplete(gradesMap);
        setShowInstructions(false);
      } catch (error) {
        console.error('Failed to parse HTML:', error);
        alert('Failed to parse the file.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      console.error('Failed to read file:', reader.error);
      alert('Failed to read the file.');
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };
  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    onJsonImport(file);
  };

 return (
    <div className="relative w-full sm:w-auto">
      <button
        onClick={() => setShowMenu((prev) => !prev)}
        className="w-full sm:w-auto min-w-0 px-3 sm:px-4 py-2.5 sm:py-2 bg-fuchsia-600 dark:bg-fuchsia-600 hover:bg-fuchsia-700 dark:hover:bg-fuchsia-700 text-white rounded-md font-semibold flex gap-2 items-center justify-center transition-all duration-200 active:scale-95 touch-manipulation"
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        <span className="text-sm sm:text-base whitespace-nowrap">Import</span>
      </button>

      {/* Hidden JSON File Input */}
      <input
        ref={jsonInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleJsonFileChange}
      />

      {/* Dropdown Menu */}
      {showMenu && (
        <>
        <div
            className="fixed inset-0 z-30"
            onClick={() => setShowMenu(false)}
          />
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-40 overflow-hidden">          <button
            onClick={() => {
              setShowMenu(false);
              setShowInstructions(true);
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-fuchsia-50 dark:hover:bg-slate-700 transition-colors"
          >
            Import LearnOrg HTML
          </button>
          <button
            onClick={() => {
              setShowMenu(false);
              jsonInputRef.current?.click();
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-fuchsia-50 dark:hover:bg-slate-700 transition-colors border-t border-gray-100 dark:border-slate-700"
          >
            Import JSON Backup
          </button>
        </div>
      </>
      )}

      {/* LearnOrg Instructions & Upload Modal */}
      {showInstructions && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-6 bg-black bg-opacity-80 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-cyan-50 dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xl max-w-lg w-full relative text-sm text-gray-700 dark:text-gray-300">
            <h2 className="text-xl sm:text-2xl font-extrabold mb-4 text-fuchsia-600 dark:text-fuchsia-400 text-center">
              Import from LearnOrg
            </h2>

            {/* Desktop/Mobile Toggle */}
            <div className="flex gap-4 mb-4 border-b border-fuchsia-200 dark:border-slate-600 pb-2">
              <button
                onClick={() => setDeviceTab('desktop')}
                className={`font-semibold pb-1 border-b-2 transition-colors ${
                  deviceTab === 'desktop'
                    ? 'text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-600 dark:border-fuchsia-400'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border-transparent'
                }`}
              >
                Desktop
              </button>
              <button
                onClick={() => setDeviceTab('mobile')}
                className={`font-semibold pb-1 border-b-2 transition-colors ${
                  deviceTab === 'mobile'
                    ? 'text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-600 dark:border-fuchsia-400'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border-transparent'
                }`}
              >
                Mobile
              </button>
            </div>

            {/* Instructions Content */}
            <div className="mb-6">
              {deviceTab === 'desktop' ? (
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>
                    Log in to <strong>LearnOrg</strong> on your computer.
                  </li>
                  <li>
                    Navigate to <strong>View My Results</strong>.
                  </li>
                  <li>
                    Press <strong>Ctrl + S</strong> (Windows) or{' '}
                    <strong>Cmd + S</strong> (Mac) to save the webpage.
                  </li>
                  <li>
                    Ensure the format is set to{' '}
                    <strong>&quot;Webpage, HTML Only&quot;</strong>.
                  </li>
                  <li>Upload that saved file using the button below.</li>
                </ol>
              ) : (
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    Log in to <strong>LearnOrg</strong> on your mobile browser.
                  </li>
                  <li>
                    Navigate to <strong>View My Results</strong>.
                  </li>
                  <li>
                    <strong>Android (Chrome):</strong> Tap the 3-dot menu (⋮) at
                    the top right and tap the Download (⬇️) icon.
                  </li>
                  <li>
                    <strong>iOS (Safari):</strong> Tap the Share button, select{' '}
                    <strong>Options</strong>, choose{' '}
                    <strong>Web Archive</strong>, then tap{' '}
                    <strong>Save to Files</strong>.
                  </li>
                  <li>
                    Tap the upload button below and select the saved file from
                    your device.
                  </li>
                </ol>
              )}
            </div>

            {/* Modal Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <label className="flex-1 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg font-semibold text-center cursor-pointer transition-all duration-200 shadow-md active:scale-95">
                {isProcessing ? 'Reading...' : 'Upload LearnOrg File'}
                <input
                  type="file"
                  accept=".html,.htm,.mhtml,.webarchive"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
              <button
                onClick={() => setShowInstructions(false)}
                className="flex-1 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 font-semibold transition-all duration-200 shadow-md active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
