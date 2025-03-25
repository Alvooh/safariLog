import axios from 'axios';
import type { TripFormData, TripSummary } from '../types/trip';

const api = axios.create({
  baseURL: 'https://safarilog.onrender.com/api',
});

export const tripService = {
  createTrip: async (data: TripFormData): Promise<TripSummary> => {
    const response = await api.post('/trips/', data);
    return response.data;
  },

  getTrips: async (): Promise<TripSummary[]> => {
    const response = await api.get('/trips/');
    return response.data;
  },

  getTrip: async (id: string): Promise<TripSummary> => {
    const response = await api.get(`/trips/${id}/`);
    return response.data;
  },
};
