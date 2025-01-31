// API endpoints
const API_BASE_URL = '/api/quiz';

// Chart configurations
const chartConfig = {
    topicChart: {
        type: 'bar',
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Topic-wise Performance'
                }
            }
        }
    },
    trendChart: {
        type: 'line',
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Performance Trends'
                }
            }
        }
    }
};

// Fetch data from APIs
async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch ${endpoint}:`, error);
        throw error;
    }
}

// Update performance metrics
function updatePerformanceMetrics(data) {
    document.getElementById('accuracyValue').textContent = `${data.currentPerformance.accuracy}%`;
    document.getElementById('speedValue').textContent = data.currentPerformance.speed;
    // document.getElementById('scoreValue').textContent = data.currentPerformance.score;
    document.getElementById('improvementValue').textContent = 
        `${(data.currentPerformance.mistakesImprovement * 100).toFixed(1)}%`;
}

// Create topic performance chart
function createTopicChart(data) {
    const ctx = document.getElementById('topicChart').getContext('2d');
    const topics = Object.keys(data.topicPerformance);
    const accuracies = topics.map(topic => data.topicPerformance[topic].averageAccuracy);

    new Chart(ctx, {
        ...chartConfig.topicChart,
        data: {
            labels: topics,
            datasets: [{
                label: 'Accuracy (%)',
                data: accuracies,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        }
    });
}

// Create trend chart
function createTrendChart(data) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    const trends = data.trends.accuracy;
    const speed = data.trends.speed;
    
    new Chart(ctx, {
        ...chartConfig.trendChart,
        data: {
            labels: trends.map(t => new Date(t.date).toLocaleDateString()),
            datasets: [
                {
                label: 'Accuracy Trend',
                data: trends.map(t => t.accuracy),
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1
            },
                {
                label: 'Speed Trend',
                data: speed.map(t => t.speed),
                borderColor: 'rgb(229, 51, 41)',
                tension: 0.2
            },
            ]
        }
    });
}

// Update rank prediction
function updateRankPrediction(data) {
    document.getElementById('predictedRank').textContent = `#${data.predictedRank}`;
    document.getElementById('confidenceInterval').textContent = 
        `${data.confidenceInterval.lower} - ${data.confidenceInterval.upper}`;
    
    const collegeList = document.getElementById('collegePossibilities');
    collegeList.innerHTML = data.collegePossibilities
        .map(college => `<li>${college}</li>`)
        .join('');
}

// Update insights
function updateInsights(data) {
    const weakAreasList = document.getElementById('weakAreasList');
    weakAreasList.innerHTML = data.recommendations.weakAreas
        .map(area => `<li>${area.topic} (${area.averageAccuracy.toFixed(1)}% accuracy)</li>`)
        .join('');

    const recommendationsList = document.getElementById('recommendationsList');
    recommendationsList.innerHTML = data.recommendations.improvementAreas
        .map(area => `<li>${area.recommendation}</li>`)
        .join('');
}

// Initialize dashboard
async function initializeDashboard() {
    try {
        // Fetch all data
        const [analysis, prediction, insights] = await Promise.all([
            fetchData('analysis'),
            fetchData('rank-prediction'),
            fetchData('insights')
        ]);

        // Update dashboard components
        updatePerformanceMetrics(analysis);
        createTopicChart(analysis);
        createTrendChart(analysis);
        updateRankPrediction(prediction);
        updateInsights(insights);

    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        // Show error message to user
        document.querySelector('.container').innerHTML = `
            <div class="error-message">
                <h2>Failed to load dashboard</h2>
                <p>Please try refreshing the page. If the problem persists, contact support.</p>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
}

// Start the dashboard when the page loads
document.addEventListener('DOMContentLoaded', initializeDashboard);