export interface IProfile {
    // Informations de la table Users
    discordId: string;
    username: string;
    avatar?: string; // Champ facultatif
    codeMetier?: string;
    dateJoin?: Date;
    matricule?: number;
    salary?: number;

    // Supposons que vous vouliez les informations les plus récentes ou un résumé des services
    dernierPDS?: Date; // Date de la dernière prise de service
    dernierFDS?: Date; // Date de la dernière fin de service
    tempsTotalService?: number; // Temps total passé en service
    grades?: {
        id: string,
        name: string,
        color: string
    }[]

    // Autres informations potentielles
    // ... ici, vous pouvez ajouter d'autres champs provenant d'autres tables si nécessaire
}
