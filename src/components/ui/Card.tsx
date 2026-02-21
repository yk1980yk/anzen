import React from 'react';
import './ui.css';

export default function Card({ children }: { children: React.ReactNode }) {
  return <div className="ui-card">{children}</div>;
}
