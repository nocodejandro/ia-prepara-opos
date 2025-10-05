import React, { useState } from 'react';

const PreguntaTestCard = ({ pregunta, index, onAnswer, showResults, userAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswerSelect = (answerIndex) => {
    if (showResults) return; // Prevent changes if results are shown
    
    setSelectedAnswer(answerIndex);
    if (onAnswer) {
      onAnswer(index, answerIndex);
    }
  };

  const getOptionClass = (optionIndex) => {
    const baseClasses = "p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 text-left";
    
    if (!showResults) {
      if (selectedAnswer === optionIndex) {
        return `${baseClasses} border-purple-500 bg-purple-50 text-purple-700`;
      }
      return `${baseClasses} border-gray-200 hover:border-purple-300 hover:bg-purple-50`;
    }
    
    // Show results mode
    if (optionIndex === pregunta.correct_answer) {
      return `${baseClasses} border-green-500 bg-green-50 text-green-700`;
    }
    
    if (selectedAnswer === optionIndex && optionIndex !== pregunta.correct_answer) {
      return `${baseClasses} border-red-500 bg-red-50 text-red-700`;
    }
    
    return `${baseClasses} border-gray-200 bg-gray-50 text-gray-600`;
  };

  const getOptionIcon = (optionIndex) => {
    if (!showResults) {
      return selectedAnswer === optionIndex ? (
        <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      ) : (
        <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
      );
    }
    
    // Show results mode
    if (optionIndex === pregunta.correct_answer) {
      return (
        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    
    if (selectedAnswer === optionIndex && optionIndex !== pregunta.correct_answer) {
      return (
        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    
    return <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const isCorrect = showResults && selectedAnswer === pregunta.correct_answer;
  const isIncorrect = showResults && selectedAnswer !== null && selectedAnswer !== pregunta.correct_answer;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      {/* Question header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-500">
              Pregunta {index + 1}
            </span>
            {pregunta.difficulty && (
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${getDifficultyColor(pregunta.difficulty)}`}>
                {pregunta.difficulty === 'easy' ? 'Fácil' : 
                 pregunta.difficulty === 'hard' ? 'Difícil' : 'Medio'}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-800 leading-relaxed">
            {pregunta.question}
          </h3>
        </div>
        
        {showResults && (
          <div className="ml-4">
            {isCorrect ? (
              <div className="flex items-center space-x-2 text-green-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Correcto</span>
              </div>
            ) : isIncorrect ? (
              <div className="flex items-center space-x-2 text-red-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Incorrecto</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-gray-500">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Sin responder</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {pregunta.options.map((option, optionIndex) => {
          const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D
          
          return (
            <div
              key={optionIndex}
              className={getOptionClass(optionIndex)}
              onClick={() => handleAnswerSelect(optionIndex)}
            >
              <div className="flex items-center space-x-3">
                {getOptionIcon(optionIndex)}
                <div className="flex-1">
                  <span className="font-medium text-gray-700 mr-2">
                    {optionLetter}.
                  </span>
                  <span>{option}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      {pregunta.explanation && showResults && (
        <div className="border-t pt-4">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors mb-3"
          >
            <svg className={`w-4 h-4 transition-transform ${showExplanation ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span>{showExplanation ? 'Ocultar' : 'Ver'} explicación</span>
          </button>
          
          {showExplanation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Explicación:</h4>
                  <p className="text-blue-700 text-sm leading-relaxed">
                    {pregunta.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PreguntasTest = ({ preguntas }) => {
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizMode, setQuizMode] = useState(false);

  if (!preguntas || preguntas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          No hay preguntas test disponibles
        </h3>
        <p className="text-gray-600">
          Las preguntas test se generarán automáticamente cuando n8n procese el documento.
        </p>
      </div>
    );
  }

  const handleAnswer = (questionIndex, answerIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    preguntas.forEach((pregunta, index) => {
      if (userAnswers[index] === pregunta.correct_answer) {
        correct++;
      }
    });
    return {
      correct,
      total: preguntas.length,
      percentage: Math.round((correct / preguntas.length) * 100)
    };
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setShowResults(false);
    setCurrentQuestion(0);
  };

  const nextQuestion = () => {
    if (currentQuestion < preguntas.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const score = showResults ? calculateScore() : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Preguntas Test
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {preguntas.length} pregunta{preguntas.length !== 1 ? 's' : ''} disponible{preguntas.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setQuizMode(!quizMode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              quizMode
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {quizMode ? 'Ver todas' : 'Modo quiz'}
          </button>
          
          {showResults ? (
            <button
              onClick={resetQuiz}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
            >
              Reiniciar
            </button>
          ) : (
            <button
              onClick={() => setShowResults(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Ver resultados
            </button>
          )}
        </div>
      </div>

      {/* Score display */}
      {showResults && score && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
              <span className="text-2xl font-bold text-gray-800">
                {score.percentage}%
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Resultados del Test
            </h3>
            <p className="text-gray-600">
              {score.correct} de {score.total} respuestas correctas
            </p>
            
            <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${score.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Questions */}
      {!quizMode ? (
        /* Show all questions */
        <div className="space-y-6">
          {preguntas.map((pregunta, index) => (
            <PreguntaTestCard
              key={pregunta.id || index}
              pregunta={pregunta}
              index={index}
              onAnswer={handleAnswer}
              showResults={showResults}
              userAnswer={userAnswers[index]}
            />
          ))}
        </div>
      ) : (
        /* Quiz mode - one question at a time */
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Pregunta {currentQuestion + 1} de {preguntas.length}</span>
              <span>{Math.round(((currentQuestion + 1) / preguntas.length) * 100)}% completado</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / preguntas.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Current question */}
          <div className="mb-6">
            <PreguntaTestCard
              pregunta={preguntas[currentQuestion]}
              index={currentQuestion}
              onAnswer={handleAnswer}
              showResults={showResults}
              userAnswer={userAnswers[currentQuestion]}
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Anterior</span>
            </button>

            <span className="text-sm text-gray-500">
              {currentQuestion + 1} / {preguntas.length}
            </span>

            <button
              onClick={nextQuestion}
              disabled={currentQuestion === preguntas.length - 1}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default PreguntasTest;