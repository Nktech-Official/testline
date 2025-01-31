# Testline Quiz Analysis System

A Node.js application that analyzes quiz performance and predicts NEET ranks based on historical data. The system fetches quiz data from APIs, generates performance insights, and provides rank predictions using a probabilistic model.

## Video
https://github.com/user-attachments/assets/1dd4a18e-6f4d-4124-ae0e-ff1452ce0ac9

note:- for logic and explanation see [Explanation](./explanation.md)

## Setup
1. Prerequisit NodeJs version 18+ , GIT
2. clone the repo and open the project directory
```
git clone https://github.com/nktech-official/testline && cd testline
```
3. Install dependencies using NPM
```
npm install
```
4. start the server 
```
npm start
```
5. visit the homepagee
```
http://localhost:3000
```


## Data Sources

The system fetches data from three API endpoints:
1. Current Quiz Data: https://jsonkeeper.com/b/LLQT
2. Submission Data: https://api.jsonserve.com/rJvd7g
3. Historical Data: https://api.jsonserve.com/XgAgFJ

## Features

- Performance analysis by topic and overall metrics
- Rank prediction using historical data correlation
- Weak areas identification and recommendations
- College admission possibility mapping
- Trend analysis for accuracy and speed

## Data Processing Pipeline

The system processes three main data sources:

1. **Current Quiz Data** 
   - Question details
   - Topics and difficulty levels
   - Correct answers and solutions

2. **Submission Data** 
   - Score and accuracy metrics
   - Speed and duration
   - Response mapping
   - Mistakes and corrections

3. **Historical Data** 
   - Past performance records
   - Topic-wise progress
   - Rank history
   - Improvement patterns

## Analysis Methodology

### Performance Analysis
- Calculates topic-wise performance metrics
- Tracks accuracy and speed trends
- Identifies weak areas based on:
  - Average accuracy < 70%
  - Mistake rate > 30%
- Monitors improvement in mistake correction

### Rank Prediction Algorithm
The rank prediction uses a weighted scoring system:
- Accuracy Weight: 40%
- Speed Weight: 30%
- Consistency Weight: 30%

Factors considered:
1. Current performance metrics
2. Historical score distribution
3. Topic mastery levels
4. Improvement trends

The algorithm calculates:
- Weighted performance score
- Consistency factor using standard deviation
- Confidence intervals for predictions
- College admission possibilities

## API Endpoints

### 1. Performance Analysis
```
GET /api/quiz/analysis
```

Returns detailed performance metrics including:
- Current performance stats
- Topic-wise analysis
- Weak areas identification
- Performance trends

Example Response:
```json
{
  "currentPerformance": {
    "accuracy": 80,
    "speed": 100,
    "mistakesImprovement": 0.75
  },
  "topicPerformance": {
    "Human Physiology": {
      "averageAccuracy": 85.5,
      "averageSpeed": 95,
      "mistakeRate": 0.15
    }
  },
  "weakAreas": [
    {
      "topic": "Body Fluids and Circulation",
      "averageAccuracy": 65.5,
      "mistakeRate": 0.35
    }
  ]
}
```

### 2. Rank Prediction
```
GET /api/quiz/rank-prediction
```

Provides rank predictions with confidence intervals:
- Predicted rank range
- College admission possibilities
- Performance metrics

Example Response:
```json
{
  "predictedRank": 2500,
  "confidenceInterval": {
    "lower": 2300,
    "upper": 2700
  },
  "collegePossibilities": [
    "Good Medical Colleges - High Chance"
  ],
  "metrics": {
    "weightedScore": 75.5,
    "consistency": 0.85,
    "averageScore": 82.3
  }
}
```

### 3. Comprehensive Insights
```
GET /api/quiz/insights
```

Combines analysis and predictions with recommendations:
- Performance analysis
- Rank predictions
- Improvement recommendations
- Next steps

Example Response:
```json
{
  "performance": {
    "currentPerformance": {},
    "topicPerformance": {},
    "weakAreas": []
  },
  "rankPrediction": {
    "predictedRank": 2500,
    "confidenceInterval": {},
    "collegePossibilities": []
  },
  "recommendations": {
    "weakAreas": [],
    "improvementAreas": [
      {
        "topic": "Body Fluids and Circulation",
        "recommendation": "Focus on improving Body Fluids and Circulation with current accuracy of 65.5%"
      }
    ],
    "nextSteps": [
      "Practice weak topics more frequently",
      "Focus on accuracy over speed initially",
      "Review mistakes after each quiz attempt"
    ]
  }
}
```

## Implementation Details

### Data Processing
1. Loads data from JSON files
2. Validates and normalizes input
3. Calculates performance metrics
4. Generates insights and predictions

### Statistical Analysis
- Standard deviation calculation for consistency
- Weighted scoring system
- Confidence interval computation
- Performance trend analysis

### Error Handling
- Input validation
- Data consistency checks
- Graceful error responses
- Fallback mechanisms

## Usage

1. Start the server:
```bash
node src/server.js
```

2. Access endpoints at `http://localhost:3000/api/quiz/*`

3. Process responses for your application needs
