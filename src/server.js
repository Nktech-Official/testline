import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import {loadData} from './utils/dataLoader.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Performance Analysis
function analyzePerformance(submission, history) {
    const topicPerformance = {};
    const accuracyTrend = [];
    const speedTrend = [];
    
    // Analyze current submission
    const currentAccuracy = parseFloat(submission.accuracy);
    const currentSpeed = parseFloat(submission.speed);
    const mistakesImprovement = submission.mistakes_corrected / submission.initial_mistake_count;

    // Analyze historical data
    history.forEach(attempt => {
        const topic = attempt.quiz.topic;
        if (!topicPerformance[topic]) {
            topicPerformance[topic] = {
                attempts: 0,
                totalAccuracy: 0,
                averageSpeed: 0,
                mistakeRate: 0
            };
        }

        topicPerformance[topic].attempts++;
        topicPerformance[topic].totalAccuracy += parseFloat(attempt.accuracy);
        topicPerformance[topic].averageSpeed += parseFloat(attempt.speed);
        topicPerformance[topic].mistakeRate += attempt.incorrect_answers / attempt.total_questions;

        accuracyTrend.push({
            date: attempt.submitted_at,
            accuracy: parseFloat(attempt.accuracy),
            topic: topic
        });

        speedTrend.push({
            date: attempt.submitted_at,
            speed: parseFloat(attempt.speed),
            topic: topic
        });
    });

    // Calculate averages and identify weak areas
    const weakAreas = [];
    Object.entries(topicPerformance).forEach(([topic, stats]) => {
        stats.averageAccuracy = stats.totalAccuracy / stats.attempts;
        stats.averageSpeed = stats.averageSpeed / stats.attempts;
        stats.averageMistakeRate = stats.mistakeRate / stats.attempts;

        if (stats.averageAccuracy < 70 || stats.averageMistakeRate > 0.3) {
            weakAreas.push({
                topic,
                averageAccuracy: stats.averageAccuracy,
                mistakeRate: stats.averageMistakeRate
            });
        }
    });

    return {
        currentPerformance: {
            accuracy: currentAccuracy,
            speed: currentSpeed,
            mistakesImprovement
        },
        topicPerformance,
        weakAreas,
        trends: {
            accuracy: accuracyTrend,
            speed: speedTrend
        }
    };
}

// Utility function to calculate standard deviation
function calculateStandardDeviation(values) {
    const n = values.length;
    if (n < 2) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
    return Math.sqrt(variance);
}

// Rank Prediction
function predictRank(submission, history) {
    // Calculate performance metrics
    const currentScore = parseFloat(submission.final_score);
    const accuracyWeight = 0.4;
    const speedWeight = 0.3;
    const consistencyWeight = 0.3;

    // Analyze historical performance
    const historicalScores = history.map(attempt => parseFloat(attempt.final_score));
    const averageScore = historicalScores.reduce((a, b) => a + b, 0) / historicalScores.length;
    const standardDeviation = calculateStandardDeviation(historicalScores);
    const consistency = 1 - (standardDeviation / (averageScore || 1)); // Prevent division by zero

    // Calculate weighted score
    const weightedScore = (
        currentScore * accuracyWeight +
        parseFloat(submission.speed) * speedWeight +
        consistency * consistencyWeight
    );

    // Predict rank range
    const predictedRank = Math.round(2000 * (1 - weightedScore / 100));
    const confidenceInterval = {
        lower: Math.max(1, predictedRank - 200),
        upper: predictedRank + 200
    };

    // Map to college admission possibilities
    const collegePossibilities = [];
    if (predictedRank <= 1000) {
        collegePossibilities.push('Top Medical Colleges - High Chance');
    } else if (predictedRank <= 2000) {
        collegePossibilities.push('Top Medical Colleges - Moderate Chance');
    } else if (predictedRank <= 5000) {
        collegePossibilities.push('Good Medical Colleges - High Chance');
    } else {
        collegePossibilities.push('Moderate Medical Colleges - Moderate Chance');
    }

    return {
        predictedRank,
        confidenceInterval,
        collegePossibilities,
        metrics: {
            weightedScore,
            consistency,
            averageScore
        }
    };
}

// API Routes
app.get('/api/quiz/analysis', async (req, res) => {
    try {
        const { submission, history } = await loadData();
        const analysis = analyzePerformance(submission, history);
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: 'Analysis Failed', message: error.message });
    }
});

app.get('/api/quiz/rank-prediction', async (req, res) => {
    try {
        const { submission, history } = await loadData();
        const prediction = predictRank(submission, history);
        res.json(prediction);
    } catch (error) {
        res.status(500).json({ error: 'Rank Prediction Failed', message: error.message });
    }
});

app.get('/api/quiz/insights', async (req, res) => {
    try {
        const { currentQuiz, submission, history } = await loadData();
        const analysis = analyzePerformance(submission, history);
        const prediction = predictRank(submission, history);

        res.json({
            performance: analysis,
            rankPrediction: prediction,
            recommendations: {
                weakAreas: analysis.weakAreas,
                improvementAreas: analysis.weakAreas.map(area => ({
                    topic: area.topic,
                    recommendation: `Focus on improving ${area.topic} with current accuracy of ${area.averageAccuracy.toFixed(1)}%`
                })),
                nextSteps: [
                    'Practice weak topics more frequently',
                    'Focus on accuracy over speed initially',
                    'Review mistakes after each quiz attempt'
                ]
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Insights Generation Failed', message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// module.exports = app;