import React from 'react';

const rows = [
  ['Study', 'Detect state, offer presence, start one small task'],
  ['ACG', 'Use the same support engine with a character companion skin'],
  ['Pet', 'Use the same support engine for routine and check-in moments'],
];

export default function SameEngineTable() {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white/70 p-5 shadow-sm">
      <p className="mb-3 text-center text-xs font-black uppercase tracking-widest text-gray-400">
        Same engine, different companion surfaces
      </p>
      <div className="overflow-hidden rounded-2xl border border-gray-100">
        {rows.map(([scenario, behavior], index) => (
          <div
            key={scenario}
            className={`grid grid-cols-[90px_1fr] gap-3 px-4 py-3 text-sm ${
              index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
            }`}
          >
            <span className="font-bold text-gray-700">{scenario}</span>
            <span className="text-gray-600">{behavior}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
