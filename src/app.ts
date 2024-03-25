import express, {Request, Response} from 'express';
import timeout from 'connect-timeout';
import memberRoutes from "./routes/memberRoutes";
import ServerRoutes from "./routes/serverRoutes";
import StatsRoutes from "./routes/statsRoutes";
import serviceRoutes from "./routes/serviceRoutes";
import profileRoutes from "./routes/profileRoutes";
import {errorHandler} from './midlleware/errorMiddleware';
import statdataRoutes from "./routes/statdataRoutes";
import morgan, {TokenIndexer } from "morgan";
import discordAPIRoutes from "./routes/discordAPIRoutes";
import authRoute from "./routes/authRoute";
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import roleServeurController from "./controllers/roleServeurController";
import gradesMemberRoutes from "./routes/gradesMemberRoutes";
import chalk from "chalk";
import path from "path";
import fs from "fs";
import {requestTracker} from "./midlleware/requestTracker";
import healthRoute from "./routes/healthRoute";
dotenv.config()
const app = express();
// Configuration du format de log Morgan pour la console avec Chalk
const morganFormatConsole = (tokens:TokenIndexer<Request, Response>, req: Request, res: Response):string => {
    const http = chalk.bgHex('#00278b').whiteBright.bold('HTTP:');
    const method = chalk.bgHex('#b90000').whiteBright.bold(tokens.method(req, res));
    const url = chalk.hex('#a24e2a').bold(tokens.url(req, res));
    const arrow = chalk.hex('#ff793f')('→');
    const status = chalk.hex('#2ed573').bold(tokens.status(req, res));
    const responseTime = chalk.hex('#ccc917').bold(`${tokens['response-time'](req, res)}ms`);
    const date = chalk.bgHex('#0b0a0a').whiteBright(tokens.date(req, res, 'iso'));

    return `${date}|::|${http} ${method} ${url} ${arrow} ${status} ${responseTime} `;
};
const morganFormatFile = ':method :url :status :response-time ms - :date[iso]\n';
const morganStream = fs.createWriteStream(path.join(__dirname, '../logs/morgan.log'), { flags: 'a' });
app.use(morgan(morganFormatConsole));
app.use(morgan(morganFormatFile, { stream: morganStream }));
//app.use(networkLoggerMiddleware);
app.use(requestTracker)
app.use(express.json());
app.use(timeout('10s'));
app.use(cookieParser())
app.use('/auth', authRoute)
app.use('/discord', discordAPIRoutes);
app.use('/members', memberRoutes);
app.use('/servers', ServerRoutes);
app.use('/stats', StatsRoutes);
app.use('/service', serviceRoutes);
app.use('/profile', profileRoutes);
app.use("/perf", statdataRoutes)
app.use("/:serveurId", roleServeurController)
app.use("/roles/members", gradesMemberRoutes)
app.post("/health/bot", healthRoute)
app.use(errorHandler);





export default app;

