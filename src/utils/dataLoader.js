import fetch from 'node-fetch';

const API_ENDPOINTS = {
    currentQuiz: 'https://www.jsonkeeper.com/b/LLQT',
    submission: 'https://api.jsonserve.com/rJvd7g',
    history: 'https://api.jsonserve.com/XgAgFJ'
};

export async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        throw new Error(`Failed to fetch data: ${error.message}`);
    }
}

export async function loadData() {
    try {
        const [currentQuiz, submission, history] = await Promise.all([
            fetchData(API_ENDPOINTS.currentQuiz),
            fetchData(API_ENDPOINTS.submission),
            fetchData(API_ENDPOINTS.history)
        ]);

        return {
            currentQuiz,
            submission,
            history
        };
    } catch (error) {
        throw new Error(`Data loading failed: ${error.message}`);
    }
}

