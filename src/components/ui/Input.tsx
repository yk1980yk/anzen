'use client';

import React from 'react';
import './ui.css';

export default function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: any;
  onChange: (e: any) => void;
  type?: string;
}) {
  return (
    <div className="ui-input-wrapper">
      <label className="ui-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="ui-input"
      />
    </div>
  );
}
