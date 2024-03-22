import app from "./app";
import {checkTables} from "./config/dbConfig";
import 'dotenv/config';
import {logError, logInfo} from "./utils/functions";
import cors from "cors";


// Convertir explicitement PORT en number si nécessaire
const PORT: number = parseInt(process.env.PORT || '8005', 10);


app.listen(PORT, async () => {


    try {
        const corsOptions = {
            origin: 'https://police.continentalv.fr',
            credentials: true,
        };
        app.set('trust proxy', 'loopback')

        app.use(cors(corsOptions));
        app.options('*', cors(corsOptions));
        logInfo(`API Start on ${PORT}`);

    } catch (err) {
        if (err instanceof Error) {
            logError(err.message);
        } else {
            logError('An unknown error occurred');
        }
    }
});
