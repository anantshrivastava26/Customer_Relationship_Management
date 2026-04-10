export type CustomerSummary = {
  customer_id: number;
  country: string;
  orders: number;
  items: number;
  revenue: number;
  last_purchase_days: number;
  recency_score: number;
  frequency_score: number;
  monetary_score: number;
  segment: string;
};

export type DashboardSummary = {
  total_customers: number;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  segment_counts: Record<string, number>;
  top_customers: CustomerSummary[];
};

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  summary: () => request<DashboardSummary>('/api/summary'),
  customers: () => request<CustomerSummary[]>('/api/customers')
};
