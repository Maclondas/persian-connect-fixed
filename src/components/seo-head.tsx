import React from 'react';

export function SEOMeta({ title = 'Persian Connect' }: { title?: string }) {
  if (typeof document !== 'undefined') {
    document.title = title;
  }
  return null;
}

export default SEOMeta;
