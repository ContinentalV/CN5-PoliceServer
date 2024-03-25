export interface Metrics {
    totalRequests: number;
    requests: {
        [key: string]: number;
    };
    statusCodes: {
        success: number;
        clientError: number;
        serverError: number;
    };
    responseTimes: number[];
    errorsEncountered: number;
    bandwidthUsage: {
        received: number;
        sent: number;
    };
    averageLatency?: number
    environment?:string;
    endpointUsage: { [endpoint: string]: number };
    activeRequests:number;
    requestCounts: {
        hourly: number[];
        daily: number[];
        weekly: number[];
        monthly: number[];
    };
    averageResponseTime: number;
    externalServices: {
        fiveM: {
            isAvailable: boolean;
            responseTime: number;
        };
        discord: {
            isAvailable: boolean;
            responseTime: number;
        };
    }
}

export  interface EmbedField {
    name: string;
    value: string;
    inline?: boolean;
}

export interface PackageJson {
    dependencies: { [key: string]: string };
}

export interface Command {
    command: string;
    count: number;
    averageTime: number;
}

export interface CommandStats {
    [commandName: string]: {
        count: number;
        totalTime: number;
    };
}

export interface Guild {
    name: string;
    commands: Command[];
}

export interface GuildCommandStats {
    [guildName: string]: CommandStats;
}

export interface RequestPerformanceData {
    good: { length: number }[];
    average: { length: number }[];
    tooLong: { length: number }[];
}