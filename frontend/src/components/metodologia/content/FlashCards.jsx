import React, { useState } from 'react';

const FlashCard = ({ flashcard, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div 
      className="flashcard cursor-pointer"
      onClick={handleFlip}
    >
      <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* Front of card */}
        <div className="flashcard-front bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm text-purple-600 font-medium">
                Pregunta #{index + 1}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${getDifficultyColor(flashcard.difficulty)}`}>
                {flashcard.difficulty === 'easy' ? 'Fácil' : 
                 flashcard.difficulty === 'hard' ? 'Difícil' : 'Medio'}
              </span>
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-800 text-center font-medium leading-relaxed">
                {flashcard.question}
              </p>
            </div>
            
            <div className="text-center mt-4">
              <div className="inline-flex items-center text-sm text-purple-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Clic para ver respuesta
              </div>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div className="flashcard-back bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm text-green-600 font-medium">
                Respuesta #{index + 1}
              </span>
              {flashcard.category && (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                  {flashcard.category}
                </span>
              )}
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-800 text-center leading-relaxed">
                {flashcard.answer}
              </p>
            </div>
            
            <div className="text-center mt-4">
              <div className="inline-flex items-center text-sm text-green-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Clic para ver pregunta
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FlashCards = ({ flashcards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyMode, setStudyMode] = useState(false);
  const [knownCards, setKnownCards] = useState(new Set());
  const [unknownCards, setUnknownCards] = useState(new Set());

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          No hay flashcards disponibles
        </h3>
        <p className="text-gray-600">
          Las flashcards se generarán automáticamente cuando n8n procese el documento.
        </p>
      </div>
    );
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const markAsKnown = () => {
    setKnownCards(prev => new Set([...prev, currentIndex]));
    setUnknownCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentIndex);
      return newSet;
    });
    handleNext();
  };

  const markAsUnknown = () => {
    setUnknownCards(prev => new Set([...prev, currentIndex]));
    setKnownCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentIndex);
      return newSet;
    });
    handleNext();
  };

  const resetProgress = () => {
    setKnownCards(new Set());
    setUnknownCards(new Set());
    setCurrentIndex(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Flashcards Generadas
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {flashcards.length} tarjetas de estudio disponibles
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setStudyMode(!studyMode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              studyMode
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {studyMode ? 'Salir del modo estudio' : 'Modo estudio'}
          </button>
          
          {studyMode && (
            <button
              onClick={resetProgress}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
            >
              Reiniciar
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      {studyMode && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progreso del estudio</span>
            <span>{knownCards.size + unknownCards.size}/{flashcards.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((knownCards.size + unknownCards.size) / flashcards.length) * 100}%` }}
            ></div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Conocidas: {knownCards.size}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Por repasar: {unknownCards.size}</span>
            </div>
          </div>
        </div>
      )}

      {!studyMode ? (
        /* Grid view */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcards.map((flashcard, index) => (
            <FlashCard key={flashcard.id || index} flashcard={flashcard} index={index} />
          ))}
        </div>
      ) : (
        /* Study mode */
        <div className="max-w-2xl mx-auto">
          {/* Card counter */}
          <div className="text-center mb-4">
            <span className="text-sm text-gray-600">
              Tarjeta {currentIndex + 1} de {flashcards.length}
            </span>
          </div>

          {/* Current flashcard */}
          <div className="mb-6">
            <FlashCard 
              flashcard={flashcards[currentIndex]} 
              index={currentIndex}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handlePrevious}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Anterior</span>
            </button>

            <button
              onClick={markAsUnknown}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>No sé</span>
            </button>

            <button
              onClick={markAsKnown}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Lo sé</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <span>Siguiente</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashCards;