export interface GetRoomsAvailableParams {
  branch_id: string;
  checkin: string;
  checkout: string;
  room_type_id?: string; 
}

export interface SearchRoomsAvailableParams {
  branch_id: string;
  checkin_at: string;
  checkout_at: string;
  room_type_id?: string;
  num_guests?: number;
  booking_type?: string;

}