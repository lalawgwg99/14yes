import React, { Component, ErrorInfo, ReactNode } from 'react';
import { UI_STRINGS } from '../../lib/constants';
import { Language } from '../../lib/types';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  private getLang(): Language {
    try {
      const stored = localStorage.getItem('nexus-lang');
      if (stored === 'en' || stored === 'zh-TW') return stored;
    } catch {}
    return navigator.language.startsWith('zh') ? 'zh-TW' : 'en';
  }

  render() {
    if (this.state.hasError) {
      const lang = this.getLang();
      const t = UI_STRINGS[lang];
      return (
        <div className="min-h-screen flex items-center justify-center bg-paper px-4">
          <div className="max-w-lg text-center space-y-6">
            <div className="text-6xl">⚠</div>
            <h1 className="text-2xl serif-tc font-bold text-ink">{t.errorBoundaryTitle}</h1>
            <p className="serif-tc text-gray-600 leading-relaxed">
              {this.state.error?.message || t.errorBoundaryDesc}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="editorial-btn px-8 py-3 text-xs font-bold tracking-[0.25em]"
            >
              {t.errorReload}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
