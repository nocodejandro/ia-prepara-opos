import React, { useState } from 'react';

const CasoPracticoCard = ({ caso, index, isExpanded, onToggle }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {caso.title || `Caso Práctico ${index + 1}`}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{caso.questions?.length || 0} preguntas</span>
              </div>
              {caso.key_concepts && caso.key_concepts.length > 0 && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>{caso.key_concepts.length} conceptos clave</span>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => onToggle(index)}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Scenario */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Escenario
          </h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {caso.scenario}
            </p>
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Questions */}
            {caso.questions && caso.questions.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Preguntas a Resolver
                  </h4>
                  
                  {caso.questions.length > 1 && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <span className="text-sm text-gray-600">
                        {currentQuestionIndex + 1} de {caso.questions.length}
                      </span>
                      <button
                        onClick={() => setCurrentQuestionIndex(Math.min(caso.questions.length - 1, currentQuestionIndex + 1))}
                        disabled={currentQuestionIndex === caso.questions.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {currentQuestionIndex + 1}
                    </div>
                    <p className="text-gray-700 flex-1">
                      {caso.questions[currentQuestionIndex]}
                    </p>
                  </div>
                </div>
                
                {caso.questions.length > 1 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {caso.questions.map((_, qIndex) => (
                      <button
                        key={qIndex}
                        onClick={() => setCurrentQuestionIndex(qIndex)}
                        className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                          currentQuestionIndex === qIndex
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {qIndex + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Solution */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800 flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Solución
                </h4>
                
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
                >
                  <span>{showSolution ? 'Ocultar' : 'Mostrar'} solución</span>
                  <svg className={`w-4 h-4 transition-transform ${showSolution ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {showSolution && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {caso.solution}
                  </p>
                </div>
              )}
            </div>

            {/* Key Concepts */}
            {caso.key_concepts && caso.key_concepts.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Conceptos Clave
                </h4>
                <div className="flex flex-wrap gap-2">
                  {caso.key_concepts.map((concept, conceptIndex) => (
                    <span
                      key={conceptIndex}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {!isExpanded && (
        <div className="bg-gray-50 px-6 py-4 border-t">
          <button
            onClick={() => onToggle(index)}
            className="flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
          >
            <span>Ver caso completo</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

const CasosPracticos = ({ casos }) => {
  const [expandedCasos, setExpandedCasos] = useState(new Set([0])); // First case expanded by default

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedCasos);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCasos(newExpanded);
  };

  const expandAll = () => {
    setExpandedCasos(new Set(casos.map((_, index) => index)));
  };

  const collapseAll = () => {
    setExpandedCasos(new Set());
  };

  if (!casos || casos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          No hay casos prácticos disponibles
        </h3>
        <p className="text-gray-600">
          Los casos prácticos se generarán automáticamente cuando n8n procese el documento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Casos Prácticos
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {casos.length} caso{casos.length !== 1 ? 's' : ''} práctico{casos.length !== 1 ? 's' : ''} disponible{casos.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={expandAll}
            className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
          >
            Expandir todos
          </button>
          <button
            onClick={collapseAll}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 transition-colors"
          >
            Contraer todos
          </button>
        </div>
      </div>

      {/* Casos */}
      <div className="space-y-6">
        {casos.map((caso, index) => (
          <CasoPracticoCard
            key={caso.id || index}
            caso={caso}
            index={index}
            isExpanded={expandedCasos.has(index)}
            onToggle={toggleExpanded}
          />
        ))}
      </div>
    </div>
  );
};

export default CasosPracticos;