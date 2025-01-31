/**
 * Data processing and visualization utilities
 */

// Statistical calculations
export const calculateMean = (values) => {
  if (!values || values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

export const calculateStandardDeviation = (values) => {
  if (!values || values.length < 2) return 0;
  const mean = calculateMean(values);
  const squareDiffs = values.map(value => Math.pow(value - mean, 2));
  return Math.sqrt(calculateMean(squareDiffs));
};

export const calculatePercentile = (value, dataset) => {
  if (!dataset || dataset.length === 0) return 0;
  const sortedData = [...dataset].sort((a, b) => a - b);
  const index = sortedData.findIndex(item => item >= value);
  return (index / sortedData.length) * 100;
};

// Data transformation functions
export const normalizeScores = (scores) => {
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  return scores.map(score => (score - min) / (max - min) * 100);
};

export const calculateMovingAverage = (data, windowSize = 3) => {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const window = data.slice(Math.max(0, i - windowSize + 1), i + 1);
    result.push(calculateMean(window));
  }
  return result;
};

export const groupByTopic = (submissions) => {
  const topics = {};
  submissions.forEach(sub => {
    if (sub.quiz && sub.quiz.topic) {
      const topic = sub.quiz.topic;
      if (!topics[topic]) {
        topics[topic] = [];
      }
      topics[topic].push(sub);
    }
  });
  return topics;
};

// Visualization data preparation
export const prepareTimeSeriesData = (submissions, metric = 'accuracy') => {
  return submissions
    .sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at))
    .map(sub => ({
      date: new Date(sub.submitted_at),
      value: metric === 'accuracy' 
        ? (sub.correct_answers / sub.total_questions) * 100
        : sub[metric]
    }));
};

export const prepareTopicDistributionData = (submissions) => {
  const topicStats = {};
  submissions.forEach(sub => {
    if (sub.quiz && sub.quiz.topic) {
      const topic = sub.quiz.topic;
      if (!topicStats[topic]) {
        topicStats[topic] = {
          totalQuestions: 0,
          correctAnswers: 0,
          attempts: 0
        };
      }
      topicStats[topic].totalQuestions += sub.total_questions;
      topicStats[topic].correctAnswers += sub.correct_answers;
      topicStats[topic].attempts += 1;
    }
  });

  return Object.entries(topicStats).map(([topic, stats]) => ({
    topic,
    accuracy: (stats.correctAnswers / stats.totalQuestions) * 100,
    attempts: stats.attempts,
    questions: stats.totalQuestions
  }));
};

// Performance analysis helpers
export const analyzeImprovementTrends = (submissions) => {
  const sortedSubs = [...submissions].sort(
    (a, b) => new Date(a.submitted_at) - new Date(b.submitted_at)
  );

  const trends = {
    accuracy: [],
    speed: [],
    topicWise: {}
  };

  sortedSubs.forEach((sub, index) => {
    const accuracy = (sub.correct_answers / sub.total_questions) * 100;
    trends.accuracy.push({
      date: new Date(sub.submitted_at),
      value: accuracy
    });

    trends.speed.push({
      date: new Date(sub.submitted_at),
      value: parseFloat(sub.speed)
    });

    if (sub.quiz && sub.quiz.topic) {
      const topic = sub.quiz.topic;
      if (!trends.topicWise[topic]) {
        trends.topicWise[topic] = [];
      }
      trends.topicWise[topic].push({
        date: new Date(sub.submitted_at),
        accuracy,
        speed: parseFloat(sub.speed)
      });
    }
  });

  // Calculate moving averages
  trends.accuracy = calculateMovingAverage(
    trends.accuracy.map(point => point.value)
  ).map((value, index) => ({
    date: trends.accuracy[index].date,
    value,
    raw: trends.accuracy[index].value
  }));

  return trends;
};

export const identifyWeaknesses = (submissions) => {
  const topicData = prepareTopicDistributionData(submissions);
  const weakAreas = topicData
    .filter(topic => topic.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy);

  return weakAreas.map(area => ({
    topic: area.topic,
    accuracy: area.accuracy,
    attempts: area.attempts,
    questions: area.questions,
    recommendedFocus: area.accuracy < 50 ? 'High' : 'Medium'
  }));
};

// Data validation functions
export const validateSubmissionData = (data) => {
  const requiredFields = [
    'quiz_id',
    'submitted_at',
    'correct_answers',
    'total_questions',
    'speed'
  ];

  const missingFields = requiredFields.filter(field => !data.hasOwnProperty(field));
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  if (data.correct_answers > data.total_questions) {
    throw new Error('Correct answers cannot exceed total questions');
  }

  if (parseFloat(data.speed) <= 0) {
    throw new Error('Speed must be a positive number');
  }

  return true;
};

export const validateHistoricalData = (data) => {
  if (!Array.isArray(data)) {
    throw new Error('Historical data must be an array');
  }

  if (data.length === 0) {
    throw new Error('Historical data array is empty');
  }

  data.forEach((submission, index) => {
    try {
      validateSubmissionData(submission);
    } catch (error) {
      throw new Error(`Invalid submission at index ${index}: ${error.message}`);
    }
  });

  return true;
};

// module.exports = {
//   // Statistical calculations
//   calculateMean,
//   calculateStandardDeviation,
//   calculatePercentile,
  
//   // Data transformation
//   normalizeScores,
//   calculateMovingAverage,
//   groupByTopic,
  
//   // Visualization
//   prepareTimeSeriesData,
//   prepareTopicDistributionData,
  
//   // Analysis
//   analyzeImprovementTrends,
//   identifyWeaknesses,
  
//   // Validation
//   validateSubmissionData,
//   validateHistoricalData
// };