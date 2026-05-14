export type TripStatus = 'saved' | 'booked';

export interface UserTrip {
  id: string;
  itineraryId: string;
  accountId: string;
  status: TripStatus;
  createdAt: number;
}
