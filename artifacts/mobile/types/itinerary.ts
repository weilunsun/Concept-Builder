export type StopType = 'food' | 'sightseeing' | 'business';
export type TransitMode = 'walking' | 'driving' | 'transit' | 'flight';

export interface Stop {
  id: string;
  type: StopType;
  name: string;
  duration: number;
  notes: string;
}

export interface Transit {
  id: string;
  mode: TransitMode;
  duration: number;
  notes: string;
}

export interface ItinerarySegment {
  stop: Stop;
  transitAfter?: Transit;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
}

export interface Itinerary {
  id: string;
  title: string;
  summary: string;
  details: string;
  pictures: string[];
  thumbsUp: number;
  thumbsDown: number;
  userVote: 'up' | 'down' | null;
  segments: ItinerarySegment[];
  basePrice: number;
  addOns: AddOn[];
  createdAt: number;
}
