"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAverageResponseTimes = exports.responseTimeTracker = exports.requestPerformanceData = void 0;
const requestPerformanceData = {
    good: [],
    average: [],
    tooLong: [],
};
exports.requestPerformanceData = requestPerformanceData;
// Fonction pour calculer le temps moyen d'une catégorie
const calculateAverageTime = (data) => {
    const total = data.reduce((acc, curr) => acc + parseFloat(curr.responseTimeMs), 0);
    return data.length ? (total / data.length).toFixed(2) : '0';
};
const responseTimeTracker = (req, res, next) => {
    const startHrTime = process.hrtime();
    res.on('finish', () => {
        const elapsedHrTime = process.hrtime(startHrTime);
        const elapsedTimeInMs = (elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6).toFixed(2);
        let category;
        if (parseFloat(elapsedTimeInMs) < 10) {
            category = 'good';
        }
        else if (parseFloat(elapsedTimeInMs) < 100) {
            category = 'average';
        }
        else {
            category = 'tooLong';
        }
        const requestData = {
            path: req.path,
            method: req.method,
            status: res.statusCode,
            responseTimeMs: elapsedTimeInMs,
            category,
            timestamp: new Date().toISOString()
        };
        requestPerformanceData[category].push(requestData);
    });
    next();
};
exports.responseTimeTracker = responseTimeTracker;
// Fonction pour afficher le temps de réponse moyen et les données détaillées
const logAverageResponseTimes = () => {
    const goodAverage = calculateAverageTime(requestPerformanceData.good);
    const averageAverage = calculateAverageTime(requestPerformanceData.average);
    const tooLongAverage = calculateAverageTime(requestPerformanceData.tooLong);
    return {
        goodAverage, averageAverage, tooLongAverage
    };
};
exports.logAverageResponseTimes = logAverageResponseTimes;
