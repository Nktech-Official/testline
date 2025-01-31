// const express = require('express');
import express from 'express'
import QuizAnalyzer from '../services/QuizAnalyzer';
import RankPredictor from '../services/RankPredictor';
import { loadQuizData } from '../utils/dataLoader';

export const router = express.Router();

// GET /api/quiz/analysis
router.get('/analysis', async (req, res) => {
  try {
    const { currentQuiz, submission, history } = await loadQuizData();
    const analyzer = new QuizAnalyzer(currentQuiz, submission, history);
    const analysis = analyzer.generateAnalysis();
    res.json(analysis);
  } catch (error) {
    res.status(500).json({
      error: 'Analysis Generation Failed',
      message: error.message
    });
  }
});

// GET /api/quiz/rank-prediction
router.get('/rank-prediction', async (req, res) => {
  try {
    const { currentQuiz, submission, history } = await loadQuizData();
    const analyzer = new QuizAnalyzer(currentQuiz, submission, history);
    const predictor = new RankPredictor(history);
    
    const performance = analyzer.generateAnalysis();
    const prediction = predictor.predictRank(performance);
    
    res.json(prediction);
  } catch (error) {
    res.status(500).json({
      error: 'Rank Prediction Failed',
      message: error.message
    });
  }
});

// GET /api/quiz/insights
router.get('/insights', async (req, res) => {
  try {
    const { currentQuiz, submission, history } = await loadQuizData();
    const analyzer = new QuizAnalyzer(currentQuiz, submission, history);
    const insights = analyzer.generateInsights();
    res.json(insights);
  } catch (error) {
    res.status(500).json({
      error: 'Insights Generation Failed',
      message: error.message
    });
  }
});

