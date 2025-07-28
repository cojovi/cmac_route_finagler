
export interface Address {
  id: number;
  value: string;
  time: string;
  duration: string;
}

export interface Waypoint {
  address: string;
  estimated_arrival_time: string;
  estimated_departure_time: string;
}

export interface OptimizedRoute {
  optimized_route: Waypoint[];
  total_distance: string;
  total_time: string;
  summary: string;
}