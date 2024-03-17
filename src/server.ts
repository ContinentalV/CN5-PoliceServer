import app from "./app";
import {checkTables} from "./config/dbConfig";
import 'dotenv/config';
import {logError, logInfo} from "./utils/functions";


// Convertir explicitement PORT en number si nécessaire
const PORT: number = parseInt(process.env.PORT || '8005', 10);


app.listen(PORT, async () => {


    try {

        logInfo(`API Start on ${PORT}`);
        console.log("ci c'est rebuild alors ce message s'affichera ")
    } catch (err) {
        if (err instanceof Error) {
            logError(err.message);
        } else {
            logError('An unknown error occurred');
        }
    }
});
