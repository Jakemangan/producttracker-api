import {TrackingFrequency} from "./enums/TrackingFrequency";

export interface ProductTracker {
    id: string,
    url: string,
    title: string,
    imageUrl: string,
    initialPrice: number;
    prettyPrice: string;
    trackingFrequency: TrackingFrequency,
    initialInstock: boolean,
    dateStartedTracking: number;
    currencyType: string;
    owner: string;
}

export interface ProductTrackerDbo {
    id: string,
    url: string,
    title: string,
    image_url: string,
    initial_price: number;
    tracking_frequency: TrackingFrequency,
    initial_instock: boolean,
    date_started_tracking: number;
    owner: string;
    currency_type: string;
}


