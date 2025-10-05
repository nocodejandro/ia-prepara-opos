import React, { useState, useEffect } from 'react';

const TestDosQuestion = ({ pregunta, index, onAnswer, showResults, userAnswer, timeRemaining }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswerSelect = (answer, answerIndex) => {
    if (showResults) return;
    
    setSelectedAnswer(answer);
    if (onAnswer) {
      onAnswer(index, answer, answerIndex);
    }
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'true_false':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'short_answer':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
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

  const isCorrect = showResults && (
    (pregunta.correct_answer && selectedAnswer === pregunta.correct_answer) ||
    (pregunta.correct_index !== undefined && selectedAnswer === pregunta.options[pregunta.correct_index])
  );
  
  const isIncorrect = showResults && selectedAnswer && !isCorrect;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      {/* Question header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {getQuestionTypeIcon(pregunta.question_type)}
              <span className="capitalize">
                {pregunta.question_type === 'multiple_choice' ? 'Opción múltiple' :
                 pregunta.question_type === 'true_false' ? 'Verdadero/Falso' : 'Respuesta corta'}
              </span>
            </div>
            
            {pregunta.difficulty && (
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${getDifficultyColor(pregunta.difficulty)}`}>
                {pregunta.difficulty === 'easy' ? 'Fácil' : 
                 pregunta.difficulty === 'hard' ? 'Difícil' : 'Medio'}
              </span>
            )}
            
            {pregunta.points && (
              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full font-medium">
                {pregunta.points} {pregunta.points === 1 ? 'punto' : 'puntos'}
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-800 leading-relaxed">
            {pregunta.question}
          </h3>
        </div>
        
        {/* Timer */}
        {timeRemaining !== null && (
          <div className="ml-4 flex items-center space-x-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`text-sm font-mono font-semibold ${
              timeRemaining <= 10 ? 'text-red-600' : 'text-orange-600'
            }`}>
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
        
        {/* Results indicator */}
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

      {/* Answer options */}
      <div className="mb-6">
        {pregunta.question_type === 'multiple_choice' && pregunta.options && (
          <div className="space-y-3">
            {pregunta.options.map((option, optionIndex) => {
              const optionLetter = String.fromCharCode(65 + optionIndex);
              const isSelected = selectedAnswer === option;
              const isCorrectOption = showResults && (
                (pregunta.correct_answer && option === pregunta.correct_answer) ||
                (pregunta.correct_index !== undefined && optionIndex === pregunta.correct_index)
              );
              const isWrongSelection = showResults && isSelected && !isCorrectOption;
              
              let optionClass = "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 flex items-center space-x-3";
              
              if (showResults) {
                if (isCorrectOption) {
                  optionClass += " border-green-500 bg-green-50 text-green-700";
                } else if (isWrongSelection) {
                  optionClass += " border-red-500 bg-red-50 text-red-700";
                } else {
                  optionClass += " border-gray-200 bg-gray-50 text-gray-600";
                }
              } else {
                if (isSelected) {
                  optionClass += " border-blue-500 bg-blue-50 text-blue-700";
                } else {
                  optionClass += " border-gray-200 hover:border-blue-300 hover:bg-blue-50";
                }
              }
              
              return (
                <div
                  key={optionIndex}
                  className={optionClass}
                  onClick={() => handleAnswerSelect(option, optionIndex)}
                >
                  <div className="flex-shrink-0">
                    {showResults ? (
                      isCorrectOption ? (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : isWrongSelection ? (
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-500">{optionLetter}</span>
                        </div>
                      )
                    ) : (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isSelected 
                          ? 'bg-blue-500 text-white' 
                          : 'border-2 border-gray-300 text-gray-500'
                      }`}>
                        <span className="text-sm font-medium">{optionLetter}</span>
                      </div>
                    )}
                  </div>
                  <span className="flex-1">{option}</span>
                </div>
              );
            })}
          </div>
        )}
        
        {pregunta.question_type === 'true_false' && (
          <div className="flex space-x-4">
            {['Verdadero', 'Falso'].map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = showResults && option === pregunta.correct_answer;
              const isWrong = showResults && isSelected && !isCorrect;
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option, index)}
                  disabled={showResults}
                  className={`flex-1 p-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                    showResults
                      ? isCorrect
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : isWrong
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                      : isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        )}
        
        {pregunta.question_type === 'short_answer' && (
          <div>
            <textarea
              value={selectedAnswer || ''}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              disabled={showResults}
              placeholder="Escribe tu respuesta aquí..."
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors resize-none h-32"
            />
            {showResults && pregunta.correct_answer && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm font-medium text-green-800">Respuesta esperada:</span>
                <p className="text-green-700 mt-1">{pregunta.correct_answer}</p>
              </div>
            )}
          </div>
        )}
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

const TestDos = ({ preguntas }) => {
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [testMode, setTestMode] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [testStarted, setTestStarted] = useState(false);

  useEffect(() => {
    if (testMode && testStarted && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      setShowResults(true);
      setTestMode(false);
    }
  }, [testMode, testStarted, timeRemaining]);

  if (!preguntas || preguntas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          No hay preguntas Test Dos disponibles
        </h3>
        <p className="text-gray-600">
          Las preguntas Test Dos se generarán automáticamente cuando n8n procese el documento.
        </p>
      </div>
    );
  }

  const handleAnswer = (questionIndex, answer, answerIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: { answer, answerIndex }
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    let totalPoints = 0;
    
    preguntas.forEach((pregunta, index) => {
      const userAnswer = userAnswers[index];
      if (userAnswer) {
        const isCorrect = 
          (pregunta.correct_answer && userAnswer.answer === pregunta.correct_answer) ||
          (pregunta.correct_index !== undefined && userAnswer.answerIndex === pregunta.correct_index);
        
        if (isCorrect) {
          correct++;
          totalPoints += pregunta.points || 1;
        }
      }
    });
    
    return {
      correct,
      total: preguntas.length,
      percentage: Math.round((correct / preguntas.length) * 100),
      points: totalPoints,
      maxPoints: preguntas.reduce((sum, p) => sum + (p.points || 1), 0)
    };
  };

  const startTest = () => {
    const totalTime = preguntas.reduce((sum, p) => sum + (p.time_limit || 60), 0);
    setTimeRemaining(totalTime);
    setTestStarted(true);
    setTestMode(true);
    setUserAnswers({});
    setShowResults(false);
    setCurrentQuestion(0);
  };

  const resetTest = () => {
    setUserAnswers({});
    setShowResults(false);
    setCurrentQuestion(0);
    setTestMode(false);
    setTimeRemaining(null);
    setTestStarted(false);
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
            Test Dos - Evaluación Avanzada
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {preguntas.length} pregunta{preguntas.length !== 1 ? 's' : ''} 
            • {preguntas.reduce((sum, p) => sum + (p.points || 1), 0)} puntos totales
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {!testMode ? (
            <>
              <button
                onClick={startTest}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Iniciar Test Cronometrado
              </button>
              <button
                onClick={() => setShowResults(!showResults)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {showResults ? 'Ocultar Resultados' : 'Ver Resultados'}
              </button>
            </>
          ) : (
            <button
              onClick={resetTest}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Finalizar Test
            </button>
          )}
        </div>
      </div>

      {/* Score display */}
      {showResults && score && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{score.percentage}%</div>
                <div className="text-xs text-gray-600">{score.points}/{score.maxPoints}</div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Resultados del Test Dos
            </h3>
            <p className="text-gray-600">
              {score.correct} de {score.total} respuestas correctas • {score.points} de {score.maxPoints} puntos
            </p>
            
            <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${score.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Questions */}
      {!testMode ? (
        /* Show all questions */
        <div className="space-y-6">
          {preguntas.map((pregunta, index) => (
            <TestDosQuestion
              key={pregunta.id || index}
              pregunta={pregunta}
              index={index}
              onAnswer={handleAnswer}
              showResults={showResults}
              userAnswer={userAnswers[index]?.answer}
              timeRemaining={null}
            />
          ))}
        </div>
      ) : (
        /* Test mode - one question at a time */
        <div className="max-w-4xl mx-auto">
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
            <TestDosQuestion
              pregunta={preguntas[currentQuestion]}
              index={currentQuestion}
              onAnswer={handleAnswer}
              showResults={false}
              userAnswer={userAnswers[currentQuestion]?.answer}
              timeRemaining={timeRemaining}
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Anterior</span>
            </button>

            <span className="text-sm text-gray-500">
              {currentQuestion + 1} / {preguntas.length}
            </span>

            {currentQuestion === preguntas.length - 1 ? (
              <button
                onClick={() => {
                  setShowResults(true);
                  setTestMode(false);
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <span>Finalizar Test</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <span>Siguiente</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestDos;