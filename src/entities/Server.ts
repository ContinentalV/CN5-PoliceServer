export interface IServer {
    serverId: string;
    serverName: string;
    owner: string;
    totalUsers: number;
    creationDate: Date;
    defaultChannelId: string;
    iconUrl: string;
    inviteUrl: string;
    listRole: {
        id: string,
        name: string,
        color: string
    }[]


}

