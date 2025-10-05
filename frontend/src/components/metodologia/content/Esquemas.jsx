import React, { useState } from 'react';

const EsquemaNode = ({ node, level = 0, onNodeClick }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels

  const colors = [
    'bg-purple-100 text-purple-800 border-purple-300',
    'bg-blue-100 text-blue-800 border-blue-300',
    'bg-green-100 text-green-800 border-green-300',
    'bg-yellow-100 text-yellow-800 border-yellow-300',
    'bg-pink-100 text-pink-800 border-pink-300',
    'bg-indigo-100 text-indigo-800 border-indigo-300'
  ];

  const colorClass = colors[level % colors.length];
  const hasChildren = node.children && node.children.length > 0;
  const indent = level * 24;

  return (
    <div className="mb-2" style={{ marginLeft: `${indent}px` }}>
      <div 
        className={`
          schema-node p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
          ${colorClass}
          hover:shadow-md
        `}
        onClick={() => {
          if (hasChildren) {
            setIsExpanded(!isExpanded);
          }
          if (onNodeClick) {
            onNodeClick(node);
          }
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {hasChildren && (
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${
                  isExpanded ? 'transform rotate-90' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            <span className="font-medium">{node.title || node.name || 'Nodo sin título'}</span>
          </div>
          
          {node.type && (
            <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded-full">
              {node.type}
            </span>
          )}
        </div>
        
        {node.description && (
          <p className="mt-2 text-sm opacity-80">
            {node.description}
          </p>
        )}
        
        {node.points && node.points.length > 0 && (
          <ul className="mt-2 text-sm space-y-1">
            {node.points.slice(0, isExpanded ? node.points.length : 2).map((point, idx) => (
              <li key={idx} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{point}</span>
              </li>
            ))}
            {!isExpanded && node.points.length > 2 && (
              <li className="text-xs opacity-60">
                +{node.points.length - 2} elementos más...
              </li>
            )}
          </ul>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div className="mt-2">
          {node.children.map((child, idx) => (
            <EsquemaNode 
              key={idx} 
              node={child} 
              level={level + 1} 
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const EsquemaVisualizer = ({ esquema }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState('tree'); // tree, mindmap, outline

  let schemaData;
  try {
    schemaData = typeof esquema.content === 'string' 
      ? JSON.parse(esquema.content) 
      : esquema.content;
  } catch (error) {
    console.error('Error parsing schema content:', error);
    schemaData = { title: 'Error', description: 'No se pudo procesar el esquema' };
  }

  const renderTreeView = () => {
    if (!schemaData) return null;

    // If it's a flat structure, convert to tree
    const rootNode = schemaData.root || schemaData.main || schemaData;
    
    return (
      <div className="space-y-4">
        <EsquemaNode 
          node={rootNode} 
          onNodeClick={setSelectedNode}
        />
      </div>
    );
  };

  const renderOutlineView = () => {
    const flattenNode = (node, level = 0) => {
      const items = [{...node, level}];
      if (node.children) {
        node.children.forEach(child => {
          items.push(...flattenNode(child, level + 1));
        });
      }
      return items;
    };

    const rootNode = schemaData.root || schemaData.main || schemaData;
    const flatNodes = flattenNode(rootNode);

    return (
      <div className="bg-white border rounded-lg overflow-hidden">
        {flatNodes.map((node, idx) => {
          const indent = node.level * 20;
          return (
            <div 
              key={idx} 
              className="border-b last:border-b-0 p-3 hover:bg-gray-50 cursor-pointer"
              style={{ paddingLeft: `${16 + indent}px` }}
              onClick={() => setSelectedNode(node)}
            >
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-800">
                  {'  '.repeat(node.level)}{node.level > 0 && '└ '}{node.title || node.name}
                </span>
              </div>
              {node.description && (
                <p className="text-sm text-gray-600 mt-1" style={{ paddingLeft: `${node.level * 20}px` }}>
                  {node.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMindmapView = () => {
    const rootNode = schemaData.root || schemaData.main || schemaData;
    
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 min-h-96">
        <div className="text-center">
          {/* Central node */}
          <div className="inline-block bg-purple-600 text-white px-6 py-4 rounded-xl shadow-lg mb-8">
            <h3 className="font-bold text-lg">
              {rootNode.title || rootNode.name || 'Concepto Central'}
            </h3>
            {rootNode.description && (
              <p className="text-purple-100 text-sm mt-1">
                {rootNode.description}
              </p>
            )}
          </div>
          
          {/* Connected nodes */}
          {rootNode.children && rootNode.children.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
              {rootNode.children.map((child, idx) => (
                <div key={idx} className="relative">
                  {/* Connection line */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 w-px h-8 bg-purple-300"></div>
                  
                  {/* Child node */}
                  <div 
                    className="bg-white border-2 border-purple-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedNode(child)}
                  >
                    <h4 className="font-semibold text-gray-800 text-sm">
                      {child.title || child.name}
                    </h4>
                    {child.description && (
                      <p className="text-xs text-gray-600 mt-1">
                        {child.description}
                      </p>
                    )}
                    {child.children && (
                      <div className="mt-2 text-xs text-purple-600">
                        +{child.children.length} subtemas
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with view controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            {esquema.title || 'Esquema Generado'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Visualización interactiva del contenido
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('tree')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              viewMode === 'tree'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Árbol
          </button>
          <button
            onClick={() => setViewMode('mindmap')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              viewMode === 'mindmap'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mapa Mental
          </button>
          <button
            onClick={() => setViewMode('outline')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              viewMode === 'outline'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Esquema
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main visualization */}
        <div className="lg:col-span-2">
          {viewMode === 'tree' && renderTreeView()}
          {viewMode === 'mindmap' && renderMindmapView()}
          {viewMode === 'outline' && renderOutlineView()}
        </div>
        
        {/* Side panel - Selected node details */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-6">
            {selectedNode ? (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">
                  Detalles del nodo
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Título:</span>
                    <p className="text-gray-800">{selectedNode.title || selectedNode.name || 'Sin título'}</p>
                  </div>
                  
                  {selectedNode.description && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Descripción:</span>
                      <p className="text-gray-800">{selectedNode.description}</p>
                    </div>
                  )}
                  
                  {selectedNode.points && selectedNode.points.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Puntos clave:</span>
                      <ul className="mt-2 space-y-1">
                        {selectedNode.points.map((point, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start">
                            <span className="mr-2 text-purple-600">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedNode.children && selectedNode.children.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Subnodos:</span>
                      <p className="text-gray-800">{selectedNode.children.length} elementos</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">Selecciona un nodo para ver sus detalles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Esquemas = ({ esquemas }) => {
  const [selectedEsquema, setSelectedEsquema] = useState(0);

  if (!esquemas || esquemas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          No hay esquemas disponibles
        </h3>
        <p className="text-gray-600">
          Los esquemas se generarán automáticamente cuando n8n procese el documento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Esquema selector if multiple */}
      {esquemas.length > 1 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {esquemas.map((esquema, index) => (
            <button
              key={esquema.id || index}
              onClick={() => setSelectedEsquema(index)}
              className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedEsquema === index
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {esquema.title || `Esquema ${index + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Selected esquema */}
      <EsquemaVisualizer esquema={esquemas[selectedEsquema]} />
    </div>
  );
};

export default Esquemas;