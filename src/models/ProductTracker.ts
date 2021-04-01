import {TrackingFrequency} from "./enums/TrackingFrequency";
import { ProductTrackerPriceData } from "./ProductTrackerPriceData";
import {TrackerDatapoint} from "./TrackerDatapoint";

export interface ProductTracker {
    id: string,
    url: string,
    title: string,
    imageUrl: string,
    priceData: ProductTrackerPriceData;
    trackingFrequency: TrackingFrequency,
    isAvailable: boolean,
    dateStartedTracking: number;
    currencyType: string;
    owner: string;
    datapoints: TrackerDatapoint[];
}

export interface ProductTrackerDbo {
    id: string,
    url: string,
    title: string,
    image_url: string,
    initial_price: number;
    current_price: number;
    tracking_frequency: TrackingFrequency,
    is_available: boolean,
    date_started_tracking: number;
    owner: string;
    currency_type: string;
}


