import app from "./app";
import 'dotenv/config';
import cors from "cors";
import { mainLogger, errorLogger } from "./syslog/logger"; // Assurez-vous d'importer correctement
import { v4 as uuidv4 } from 'uuid'
const PORT: number = parseInt(process.env.PORT || '8005', 10);

const corsOptions = {
    origin: process.env.CUSTOM_ENV === "production" ? 'https://police.continentalv.fr' : "http://localhost:8000",
    credentials: true,
};
console.log(corsOptions)

app.set('trust proxy', true);
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

const server = app.listen(PORT, () => {
    mainLogger.info(`API démarrée sur le port ${PORT}`);
});

// Gestionnaire d'erreurs pour le serveur
server.on('error', (error: Error) => {
    errorLogger.error({
        message: `Erreur lors du démarrage du serveur sur le port ${PORT}: ${error.message}`,
        errorId: uuidv4()
    });
});
