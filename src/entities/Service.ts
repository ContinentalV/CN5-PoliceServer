export interface IService {
    id: number;
    PDS: Date;           // Prise De Service
    FDS: Date;           // Fin De Service
    TEMPS_SERVICE: number;
    TOTAL: number;
    serviceIsOn: boolean;
    discordAgentId: string;
}
