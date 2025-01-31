export class RankPredictor {
  constructor(historicalData) {
    this.historicalData = historicalData;
    this.confidenceLevel = 0.95; // 95% confidence interval
  }

  /**
   * Predicts NEET rank based on performance
   * @param {Object} performance Current performance metrics
   * @returns {Object} Rank prediction with confidence interval
   */
  predictRank(performance) {
    const normalizedScore = this.normalizeScore(performance);
    const predictedRank = this.calculatePredictedRank(normalizedScore);
    const confidenceInterval = this.calculateConfidenceInterval(predictedRank);
    const potentialColleges = this.getPotentialColleges(predictedRank);

    return {
      predictedRank,
      confidenceInterval,
      normalizedScore,
      potentialColleges,
      accuracy: this.calculatePredictionAccuracy()
    };
  }

  /**
   * Normalizes performance score
   * @param {Object} performance Performance metrics
   * @returns {number} Normalized score
   */
  normalizeScore(performance) {
    const weights = {
      accuracy: 0.4,
      speed: 0.2,
      consistency: 0.2,
      improvement: 0.2
    };

    return (
      performance.accuracy * weights.accuracy +
      performance.speed * weights.speed +
      this.calculateConsistency() * weights.consistency +
      this.calculateImprovement() * weights.improvement
    );
  }

  /**
   * Calculates predicted rank based on normalized score
   * @param {number} normalizedScore Normalized performance score
   * @returns {number} Predicted rank
   */
  calculatePredictedRank(normalizedScore) {
    // Using historical data correlation
    const historicalCorrelation = this.calculateHistoricalCorrelation();
    const baseRank = this.getBaseRank(normalizedScore);
    return Math.round(baseRank * historicalCorrelation);
  }

  /**
   * Calculates confidence interval for prediction
   * @param {number} predictedRank Predicted rank
   * @returns {Object} Confidence interval bounds
   */
  calculateConfidenceInterval(predictedRank) {
    const standardError = this.calculateStandardError();
    const zScore = 1.96; // For 95% confidence level
    const margin = zScore * standardError;

    return {
      lower: Math.max(1, Math.round(predictedRank - margin)),
      upper: Math.round(predictedRank + margin)
    };
  }

  /**
   * Gets potential colleges based on predicted rank
   * @param {number} predictedRank Predicted rank
   * @returns {Array} List of potential colleges
   */
  getPotentialColleges(predictedRank) {
    // College tiers based on historical cutoffs
    const collegeTiers = [
      { maxRank: 1000, name: 'Tier 1 Medical Colleges' },
      { maxRank: 5000, name: 'Tier 2 Medical Colleges' },
      { maxRank: 10000, name: 'Tier 3 Medical Colleges' }
    ];

    return collegeTiers
      .filter(tier => predictedRank <= tier.maxRank)
      .map(tier => ({
        name: tier.name,
        probability: this.calculateCollegeProbability(predictedRank, tier.maxRank),
        cutoffRange: {
          min: tier.maxRank - 1000,
          max: tier.maxRank
        }
      }));
  }

  /**
   * Calculates probability of college admission
   * @param {number} predictedRank Predicted rank
   * @param {number} cutoff College cutoff rank
   * @returns {number} Admission probability
   */
  calculateCollegeProbability(predictedRank, cutoff) {
    const buffer = cutoff * 0.1; // 10% buffer
    if (predictedRank <= cutoff - buffer) return 0.9;
    if (predictedRank <= cutoff) return 0.7;
    return 0.3;
  }

  /**
   * Calculates historical correlation factor
   * @returns {number} Correlation factor
   */
  calculateHistoricalCorrelation() {
    const scores = this.historicalData.map(data => data.score);
    const ranks = this.historicalData.map(data => data.rank);
    
    if (scores.length < 2) return 1;

    // Calculate Pearson correlation coefficient
    const meanScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const meanRank = ranks.reduce((a, b) => a + b, 0) / ranks.length;

    const numerator = scores.reduce((sum, score, i) => 
      sum + (score - meanScore) * (ranks[i] - meanRank), 0);
    const denominator = Math.sqrt(
      scores.reduce((sum, score) => sum + Math.pow(score - meanScore, 2), 0) *
      ranks.reduce((sum, rank) => sum + Math.pow(rank - meanRank, 2), 0)
    );

    return denominator === 0 ? 1 : numerator / denominator;
  }

  /**
   * Calculates standard error of prediction
   * @returns {number} Standard error
   */
  calculateStandardError() {
    const predictions = this.historicalData.map(data => ({
      actual: data.rank,
      predicted: this.calculatePredictedRank(this.normalizeScore(data))
    }));

    const errors = predictions.map(p => Math.abs(p.actual - p.predicted));
    const meanError = errors.reduce((a, b) => a + b, 0) / errors.length;
    const variance = errors.reduce((sum, error) => 
      sum + Math.pow(error - meanError, 2), 0) / errors.length;

    return Math.sqrt(variance);
  }

  /**
   * Calculates performance consistency
   * @returns {number} Consistency score
   */
  calculateConsistency() {
    const scores = this.historicalData.map(data => data.score);
    if (scores.length < 2) return 1;

    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => 
      sum + Math.pow(score - mean, 2), 0) / scores.length;

    return 1 - Math.sqrt(variance) / mean;
  }

  /**
   * Calculates improvement rate
   * @returns {number} Improvement rate
   */
  calculateImprovement() {
    const scores = this.historicalData.map(data => data.score);
    if (scores.length < 2) return 0;

    const firstScore = scores[0];
    const lastScore = scores[scores.length - 1];
    return (lastScore - firstScore) / firstScore;
  }

  /**
   * Gets base rank from normalized score
   * @param {number} normalizedScore Normalized score
   * @returns {number} Base rank
   */
  getBaseRank(normalizedScore) {
    // Example ranking scale (would be calibrated with actual NEET data)
    const maxRank = 50000;
    return Math.round(maxRank * (1 - normalizedScore));
  }

  /**
   * Calculates prediction accuracy
   * @returns {number} Prediction accuracy
   */
  calculatePredictionAccuracy() {
    if (this.historicalData.length < 2) return 0.7; // Default accuracy

    const predictions = this.historicalData.map(data => ({
      actual: data.rank,
      predicted: this.calculatePredictedRank(this.normalizeScore(data))
    }));

    const accuracies = predictions.map(p => {
      const error = Math.abs(p.actual - p.predicted) / p.actual;
      return 1 - error;
    });

    return accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
  }
}

