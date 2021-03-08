export interface TrackerDatapoint {
    trackerId: string;
    price: number;
    instock: boolean;
    date: number;
}

export interface TrackerDatapointDbo {
    tracker_id: string;
    price: number;
    instock: boolean;
    date: number;
}
