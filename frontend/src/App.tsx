import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { api, CustomerSummary, DashboardSummary } from './api';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
}

export default function App() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    async function load() {
      try {
        const [summaryData, customerData] = await Promise.all([api.summary(), api.customers()]);
        setSummary(summaryData);
        setCustomers(customerData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredCustomers = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    if (!needle) return customers;
    return customers.filter((customer) =>
      [String(customer.customer_id), customer.country, customer.segment].some((field) =>
        field.toLowerCase().includes(needle)
      )
    );
  }, [customers, deferredQuery]);

  if (loading) {
    return <main className="app shell"><div className="hero-card">Loading dashboard...</div></main>;
  }

  if (error || !summary) {
    return <main className="app shell"><div className="hero-card error">{error ?? 'Unknown error'}</div></main>;
  }

  const segments = Object.entries(summary.segment_counts);

  return (
    <main className="app">
      <section className="hero shell">
        <div>
          <p className="eyebrow">CRM Retail Intelligence</p>
          <h1>Customer relationships, value, and retention in one command center.</h1>
          <p className="lede">
            Built from your retail transaction dataset with customer-level segmentation and MLflow-backed training.
          </p>
        </div>
        <div className="hero-card accent">
          <span className="card-label">Dataset coverage</span>
          <strong>{summary.total_customers.toLocaleString()} customers</strong>
          <span>{summary.total_orders.toLocaleString()} invoices across the feed</span>
        </div>
      </section>

      <section className="stats shell">
        <Stat label="Revenue" value={formatCurrency(summary.total_revenue)} />
        <Stat label="Average order value" value={formatCurrency(summary.average_order_value)} />
        <Stat label="Segments" value={String(segments.length)} />
      </section>

      <section className="grid shell">
        <article className="panel">
          <div className="panel-header">
            <h2>Segment distribution</h2>
          </div>
          <div className="segment-list">
            {segments.map(([segment, count]) => (
              <div key={segment} className="segment-row">
                <span>{segment}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel wide">
          <div className="panel-header">
            <h2>Top customers</h2>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by customer, country, or segment"
            />
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Country</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                  <th>Segment</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.slice(0, 15).map((customer) => (
                  <tr key={customer.customer_id}>
                    <td>{customer.customer_id}</td>
                    <td>{customer.country}</td>
                    <td>{customer.orders}</td>
                    <td>{formatCurrency(customer.revenue)}</td>
                    <td><span className="badge">{customer.segment}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="shell notes">
        <article className="panel small">
          <h2>MLflow</h2>
          <p>The training job logs the segmentation run, model artifact, and derived customer segments.</p>
        </article>
        <article className="panel small">
          <h2>Delivery</h2>
          <p>GitHub Actions, Bitbucket Pipelines, and Jenkins are all wired to validate backend and frontend builds.</p>
        </article>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
