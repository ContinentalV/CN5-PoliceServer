export interface IUser {
    discordId: string;
    username: string;
    nomRP: string;
    avatar: string;
    codeMetier?: string;
    dateJoin?: Date;
    matricule?: number;
    idServeur?: string;
    roles?: string;
    grade?: {
        id: string;
        name: string;
        color: `#${string}`
    }[],
    etatMajor?: boolean;
}
