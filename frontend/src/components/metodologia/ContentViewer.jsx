import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FlashCards from './content/FlashCards';
import Esquemas from './content/Esquemas';
import Resumenes from './content/Resumenes';
import PreguntasTest from './content/PreguntasTest';
import CasosPracticos from './content/CasosPracticos';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContentViewer = ({ document }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('resumen');

  useEffect(() => {
    if (document) {
      fetchContent(document.id);
    }
  }, [document]);

  const fetchContent = async (documentId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/metodologia/${documentId}/content`);
      setContent(response.data);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: 'resumen',
      name: 'Resumen',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      count: content?.resumenes?.length || 0
    },
    {
      id: 'basicos',
      name: 'Conceptos Básicos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      count: content?.conceptos_basicos?.length || 0
    },
    {
      id: 'flashcards',
      name: 'Flashcards',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      count: content?.flashcards?.length || 0
    },
    {
      id: 'esquemas',
      name: 'Esquemas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      count: content?.esquemas?.length || 0
    },
    {
      id: 'test',
      name: 'Test',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      count: content?.preguntas_test?.length || 0
    },
    {
      id: 'testdos',
      name: 'Test Dos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      count: content?.test_dos?.length || 0
    },
    {
      id: 'casos',
      name: 'Casos Prácticos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      count: content?.casos_practicos?.length || 0
    }
  ];

  if (!document) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Selecciona un documento
        </h3>
        <p className="text-gray-600">
          Elige un documento de la lista de la izquierda para ver el contenido generado por IA
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="animate-pulse space-y-6">
          <div className="flex space-x-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-lg flex-1"></div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    if (!content) return null;

    switch (activeTab) {
      case 'resumen':
        return <Resumenes resumenes={content.resumenes} />;
      case 'flashcards':
        return <FlashCards flashcards={content.flashcards} />;
      case 'esquemas':
        return <Esquemas esquemas={content.esquemas} />;
      case 'preguntas':
        return <PreguntasTest preguntas={content.preguntas_test} />;
      case 'casos':
        return <CasosPracticos casos={content.casos_practicos} />;
      default:
        return <div>Contenido no encontrado</div>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">{document.filename}</h2>
        <p className="text-purple-100">
          Contenido generado automáticamente con inteligencia artificial
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap
                  ${isActive
                    ? 'border-purple-500 text-purple-600 bg-purple-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                  }
                `}
              >
                {tab.icon}
                <span>{tab.name}</span>
                {tab.count > 0 && (
                  <span className={`
                    px-2 py-1 text-xs rounded-full font-semibold
                    ${isActive ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}
                  `}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ContentViewer;