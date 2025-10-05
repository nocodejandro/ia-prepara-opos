import React, { useState } from 'react';

const ConceptoCard = ({ concepto, index, isExpanded, onToggle }) => {
  const getImportanceColor = (level) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getImportanceText = (level) => {
    switch (level) {
      case 'high':
        return 'Alta Importancia';
      case 'low':
        return 'Baja Importancia';
      default:
        return 'Importancia Media';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {concepto.title || `Concepto ${index + 1}`}
            </h3>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 text-sm rounded-full font-medium ${getImportanceColor(concepto.importance_level)}`}>
                {getImportanceText(concepto.importance_level)}
              </span>
              {concepto.category && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium">
                  {concepto.category}
                </span>
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
        {/* Definition */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Definición
          </h4>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed">
              {concepto.definition}
            </p>
          </div>
        </div>

        {/* Examples */}
        {isExpanded && concepto.examples && concepto.examples.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ejemplos
            </h4>
            <div className="grid gap-3">
              {concepto.examples.map((ejemplo, exampleIndex) => (
                <div key={exampleIndex} className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {exampleIndex + 1}
                    </div>
                    <p className="text-gray-700 flex-1">{ejemplo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Study Actions */}
        {isExpanded && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Concepto para estudiar y memorizar
              </span>
              
              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Entendido</span>
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L3.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span>Repasar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      {!isExpanded && (
        <div className="bg-gray-50 px-6 py-4 border-t">
          <button
            onClick={() => onToggle(index)}
            className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors"
          >
            <span>Ver detalles y ejemplos</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

const ConceptosBasicos = ({ conceptos }) => {
  const [expandedConceptos, setExpandedConceptos] = useState(new Set([0])); // First concept expanded by default
  const [filterImportance, setFilterImportance] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedConceptos);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedConceptos(newExpanded);
  };

  const expandAll = () => {
    setExpandedConceptos(new Set(conceptos.map((_, index) => index)));
  };

  const collapseAll = () => {
    setExpandedConceptos(new Set());
  };

  // Filter concepts
  const filteredConceptos = conceptos ? conceptos.filter(concepto => {
    const matchesImportance = filterImportance === 'all' || concepto.importance_level === filterImportance;
    const matchesSearch = !searchTerm || 
      concepto.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concepto.definition.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesImportance && matchesSearch;
  }) : [];

  if (!conceptos || conceptos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          No hay conceptos básicos disponibles
        </h3>
        <p className="text-gray-600">
          Los conceptos básicos se generarán automáticamente cuando n8n procese el documento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Conceptos Básicos
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {filteredConceptos.length} concepto{filteredConceptos.length !== 1 ? 's' : ''} 
            {filteredConceptos.length !== conceptos.length && ` de ${conceptos.length} total`}
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar conceptos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm w-full sm:w-64"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Importance filter */}
          <select
            value={filterImportance}
            onChange={(e) => setFilterImportance(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="all">Todas las importancias</option>
            <option value="high">Alta importancia</option>
            <option value="medium">Importancia media</option>
            <option value="low">Baja importancia</option>
          </select>
          
          {/* Expand/Collapse buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={expandAll}
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
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
      </div>

      {/* Conceptos */}
      <div className="space-y-6">
        {filteredConceptos.map((concepto, index) => {
          const originalIndex = conceptos.indexOf(concepto);
          return (
            <ConceptoCard
              key={concepto.id || originalIndex}
              concepto={concepto}
              index={originalIndex}
              isExpanded={expandedConceptos.has(originalIndex)}
              onToggle={toggleExpanded}
            />
          );
        })}
      </div>
      
      {filteredConceptos.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No se encontraron conceptos
          </h3>
          <p className="text-gray-600">
            Prueba con otros términos de búsqueda o filtros.
          </p>
        </div>
      )}
    </div>
  );
};

export default ConceptosBasicos;