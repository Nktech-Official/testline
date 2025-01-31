export class QuizAnalyzer {
  constructor(currentQuiz, submission, history) {
    this.currentQuiz = currentQuiz;
    this.submission = submission;
    this.history = history;
  }

  /**
   * Generates comprehensive analysis of quiz performance
   * @returns {Object} Analysis results
   */
  generateAnalysis() {
    return {
      performance: this.analyzePerformance(),
      insights: {
        improvementAreas: this.identifyImprovementAreas(),
        performanceTrend: this.analyzePerformanceTrend(),
        topicWiseAnalysis: this.analyzeTopicWisePerformance()
      }
    };
  }

  /**
   * Analyzes current quiz performance
   * @returns {Object} Performance metrics
   */
  analyzePerformance() {
    const { score, accuracy, speed } = this.submission;
    const weakTopics = this.identifyWeakTopics();
    const strongTopics = this.identifyStrongTopics();

    return {
      score,
      accuracy,
      speed,
      weakTopics,
      strongTopics
    };
  }

  /**
   * Identifies topics needing improvement
   * @returns {Array} List of topics
   */
  identifyImprovementAreas() {
    const topicPerformance = this.calculateTopicPerformance();
    return Object.entries(topicPerformance)
      .filter(([_, performance]) => performance.accuracy < 0.7)
      .map(([topic]) => topic);
  }

  /**
   * Analyzes performance trends from historical data
   * @returns {Object} Performance trends
   */
  analyzePerformanceTrend() {
    return {
      scoreProgression: this.history.map(quiz => quiz.score),
      accuracyTrend: this.history.map(quiz => quiz.accuracy),
      speedTrend: this.history.map(quiz => quiz.speed)
    };
  }

  /**
   * Analyzes performance by topic
   * @returns {Object} Topic-wise analysis
   */
  analyzeTopicWisePerformance() {
    const topicPerformance = this.calculateTopicPerformance();
    const result = {};

    for (const [topic, performance] of Object.entries(topicPerformance)) {
      result[topic] = {
        accuracy: performance.accuracy,
        improvement: this.calculateTopicImprovement(topic),
        status: this.determineTopicStatus(performance.accuracy)
      };
    }

    return result;
  }

  /**
   * Calculates performance metrics for each topic
   * @returns {Object} Topic performance metrics
   */
  calculateTopicPerformance() {
    const topicStats = {};

    // Group questions by topic
    this.currentQuiz.questions.forEach(question => {
      if (!topicStats[question.topic]) {
        topicStats[question.topic] = {
          total: 0,
          correct: 0
        };
      }

      topicStats[question.topic].total++;
      if (this.isCorrectAnswer(question.id)) {
        topicStats[question.topic].correct++;
      }
    });

    // Calculate accuracy for each topic
    const result = {};
    for (const [topic, stats] of Object.entries(topicStats)) {
      result[topic] = {
        accuracy: stats.correct / stats.total,
        totalQuestions: stats.total,
        correctAnswers: stats.correct
      };
    }

    return result;
  }

  /**
   * Checks if a question was answered correctly
   * @param {string} questionId Question identifier
   * @returns {boolean} Whether answer was correct
   */
  isCorrectAnswer(questionId) {
    const question = this.currentQuiz.questions.find(q => q.id === questionId);
    const userAnswer = this.submission.answers[questionId];
    return question && userAnswer === question.correctOption;
  }

  /**
   * Identifies topics with low performance
   * @returns {Array} List of weak topics
   */
  identifyWeakTopics() {
    const topicPerformance = this.calculateTopicPerformance();
    return Object.entries(topicPerformance)
      .filter(([_, performance]) => performance.accuracy < 0.6)
      .map(([topic]) => topic);
  }

  /**
   * Identifies topics with high performance
   * @returns {Array} List of strong topics
   */
  identifyStrongTopics() {
    const topicPerformance = this.calculateTopicPerformance();
    return Object.entries(topicPerformance)
      .filter(([_, performance]) => performance.accuracy > 0.8)
      .map(([topic]) => topic);
  }

  /**
   * Calculates improvement in topic performance
   * @param {string} topic Topic to analyze
   * @returns {number} Improvement rate
   */
  calculateTopicImprovement(topic) {
    const recentQuizzes = this.history.slice(-3);
    const topicScores = recentQuizzes.map(quiz => {
      const topicQuestions = quiz.questions.filter(q => q.topic === topic);
      const correct = topicQuestions.filter(q => this.isCorrectAnswer(q.id)).length;
      return correct / topicQuestions.length;
    });

    if (topicScores.length < 2) return 0;
    return topicScores[topicScores.length - 1] - topicScores[0];
  }

  /**
   * Determines topic mastery status
   * @param {number} accuracy Topic accuracy
   * @returns {string} Status label
   */
  determineTopicStatus(accuracy) {
    if (accuracy >= 0.8) return 'Mastered';
    if (accuracy >= 0.6) return 'Improving';
    return 'Needs Focus';
  }

  /**
   * Generates detailed performance insights
   * @returns {Object} Comprehensive insights
   */
  generateInsights() {
    const analysis = this.generateAnalysis();
    const trends = this.analyzePerformanceTrend();

    return {
      overallPerformance: {
        averageScore: this.calculateAverageScore(),
        averageAccuracy: this.calculateAverageAccuracy(),
        improvementRate: this.calculateImprovementRate(),
        consistencyScore: this.calculateConsistencyScore()
      },
      topicWiseAnalysis: this.generateTopicWiseInsights(),
      weakAreas: {
        topics: analysis.performance.weakTopics,
        conceptualGaps: this.identifyConceptualGaps(),
        recommendedActions: this.generateRecommendations()
      },
      trends
    };
  }

  /**
   * Calculates average score from recent quizzes
   * @returns {number} Average score
   */
  calculateAverageScore() {
    const scores = this.history.map(quiz => quiz.score);
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  /**
   * Calculates average accuracy from recent quizzes
   * @returns {number} Average accuracy
   */
  calculateAverageAccuracy() {
    const accuracies = this.history.map(quiz => quiz.accuracy);
    return accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
  }

  /**
   * Calculates improvement rate
   * @returns {number} Improvement rate
   */
  calculateImprovementRate() {
    const scores = this.history.map(quiz => quiz.score);
    if (scores.length < 2) return 0;
    return (scores[scores.length - 1] - scores[0]) / scores[0];
  }

  /**
   * Calculates performance consistency
   * @returns {number} Consistency score
   */
  calculateConsistencyScore() {
    const scores = this.history.map(quiz => quiz.score);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    return 1 - Math.sqrt(variance) / mean;
  }

  /**
   * Generates detailed topic-wise insights
   * @returns {Array} Topic insights
   */
  generateTopicWiseInsights() {
    const topicPerformance = this.calculateTopicPerformance();
    return Object.entries(topicPerformance).map(([topic, performance]) => ({
      topic,
      accuracy: performance.accuracy,
      improvement: this.calculateTopicImprovement(topic),
      recommendedFocus: performance.accuracy < 0.7
    }));
  }

  /**
   * Identifies conceptual gaps from weak areas
   * @returns {Array} List of conceptual gaps
   */
  identifyConceptualGaps() {
    const weakTopics = this.identifyWeakTopics();
    return weakTopics.map(topic => ({
      topic,
      conceptualAreas: this.findRelatedConcepts(topic)
    }));
  }

  /**
   * Finds related concepts for a topic
   * @param {string} topic Topic to analyze
   * @returns {Array} Related concepts
   */
  findRelatedConcepts(topic) {
    // Implementation would depend on concept mapping data
    return [`Core concepts in ${topic}`, `Fundamental principles of ${topic}`];
  }

  /**
   * Generates study recommendations
   * @returns {Array} List of recommendations
   */
  generateRecommendations() {
    const weakTopics = this.identifyWeakTopics();
    return weakTopics.map(topic => ({
      topic,
      action: `Focus on strengthening fundamentals in ${topic}`
    }));
  }
}

