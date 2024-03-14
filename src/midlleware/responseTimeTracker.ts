// middleware/responseTimeTracker.ts
import {NextFunction, Request, Response} from 'express';

interface RequestData {
    path: string;
    method: string;
    status: number;
    responseTimeMs: string; // Assurez-vous que cela doit être une chaîne de caractères et non un nombre.
    category: 'good' | 'average' | 'tooLong';
    timestamp: string;
}

const requestPerformanceData: Record<'good' | 'average' | 'tooLong', RequestData[]> = {
    good: [],
    average: [],
    tooLong: [],
};

// Fonction pour calculer le temps moyen d'une catégorie
const calculateAverageTime = (data: RequestData[]): string => {
    const total = data.reduce((acc, curr) => acc + parseFloat(curr.responseTimeMs), 0);
    return data.length ? (total / data.length).toFixed(2) : '0';
};

const responseTimeTracker = (req: Request, res: Response, next: NextFunction) => {
    const startHrTime = process.hrtime();

    res.on('finish', () => {
        const elapsedHrTime = process.hrtime(startHrTime);
        const elapsedTimeInMs = (elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6).toFixed(2);

        let category: 'good' | 'average' | 'tooLong';
        if (parseFloat(elapsedTimeInMs) < 10) {
            category = 'good';
        } else if (parseFloat(elapsedTimeInMs) < 100) {
            category = 'average';
        } else {
            category = 'tooLong';
        }

        const requestData: RequestData = {
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

// Fonction pour afficher le temps de réponse moyen et les données détaillées
const logAverageResponseTimes = () => {
    const goodAverage = calculateAverageTime(requestPerformanceData.good);
    const averageAverage = calculateAverageTime(requestPerformanceData.average);
    const tooLongAverage = calculateAverageTime(requestPerformanceData.tooLong);

    return {
        goodAverage, averageAverage, tooLongAverage
    };
};

export {requestPerformanceData, responseTimeTracker, logAverageResponseTimes};
