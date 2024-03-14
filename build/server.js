"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dbConfig_1 = require("./config/dbConfig");
require("dotenv/config");
const functions_1 = require("./utils/functions");
// Convertir explicitement PORT en number si nécessaire
const PORT = parseInt(process.env.PORT || '8005', 10);
app_1.default.listen(PORT, async () => {
    try {
        (0, functions_1.logInfo)(`API Start on ${PORT}`);
        await (0, dbConfig_1.checkTables)();
        // setInterval(monitorPerformance, 10000);
        //await monitorPerformance();
    }
    catch (err) {
        if (err instanceof Error) {
            (0, functions_1.logError)(err.message);
        }
        else {
            (0, functions_1.logError)('An unknown error occurred');
        }
    }
});
