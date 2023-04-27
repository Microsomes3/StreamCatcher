

export type InsertAggreagateItem = {
    TableName:string,
    Item:{
        youtubeusername:string,
        isLive: boolean,
        type: string,
        updatedAt: string,
        extra: any,
        liveLink: string,
        recordRequests: number
    }
}

export type InsertLiveCheckerItem = {
    TableName:string,
    Item:{
        id: string,
        createdAt: number,
        friendlyDate: string,
        updatedAt: number,
        type: string,
        channel: string,
        status: string,
        isLive: boolean,
        liveLink: string
    }
}