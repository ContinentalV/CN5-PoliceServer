import app from "./app";
import 'dotenv/config';
import cors from "cors";
import {logger} from "./syslog/logger";


const PORT: number = parseInt(process.env.PORT || '8005', 10);
app.listen(PORT, async () => {
    try {
        const corsOptions = {
            origin: process.env.CUSTOM_ENV == "production" ? 'https://police.continentalv.fr' : "http://localhost:8000",
            credentials: true,
        };
        app.set('trust proxy', true)
        app.use(cors(corsOptions));
        app.options('*', cors(corsOptions));
        logger.info(`API Start on ${PORT}`);

    } catch (err) {
        if (err instanceof Error) {
            logger.error(err.message);
        } else {
            logger.error('An unknown error occurred');
        }
    }
});
