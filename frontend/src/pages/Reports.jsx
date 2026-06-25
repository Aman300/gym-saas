import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Users, Award, Receipt } from 'lucide-react';

export const Reports = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/reports/analytics');
        if (res.success) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error('Error fetching analytics reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>Analyzing reports and aggregating databases...</p>
      </div>
    );
  }

  // Calculate highest revenue & expense to scale the bar heights dynamically
  const financials = analytics?.financials || [];
  const maxVal = Math.max(...financials.map(f => Math.max(f.revenue, f.expenses)), 100);

  // Calculate total financials
  const totalRevenue = financials.reduce((acc, f) => acc + f.revenue, 0);
  const totalExpenses = financials.reduce((acc, f) => acc + f.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;

  return (
    <div className="page-container">
      <div className="flex-between mb-4">
        <div>
          <h1 className="page-title">Analytics & Reports</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Review cash flow trends and client distributions</p>
        </div>
      </div>

      {/* Stats summaries cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '2rem' }}>
        <div className="glass-card">
          <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Aggregated Revenue</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.25rem' }}>+${totalRevenue}</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Last 6 months combined</p>
        </div>

        <div className="glass-card">
          <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Aggregated Expenses</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.25rem' }}>-${totalExpenses}</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Last 6 months combined</p>
        </div>

        <div className="glass-card">
          <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Net Yield / Savings</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: totalProfit >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: '0.25rem' }}>
            {totalProfit >= 0 ? '+' : '-'}${Math.abs(totalProfit)}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Overall efficiency rate</p>
        </div>
      </div>

      <div className="grid-2 mb-4" style={{ gridTemplateRows: 'auto' }}>
        {/* Custom 6-Month Cash Flow Bar Chart */}
        <div className="glass-card">
          <div className="flex-between mb-4">
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>6-Month Cash Flow (Revenue vs Expenses)</h3>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
              <span className="flex-align-center" style={{ gap: '0.25rem' }}><span style={{ display: 'inline-block', width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '2px' }}></span> Revenue</span>
              <span className="flex-align-center" style={{ gap: '0.25rem' }}><span style={{ display: 'inline-block', width: '10px', height: '10px', background: 'var(--danger)', borderRadius: '2px' }}></span> Expenses</span>
            </div>
          </div>

          {/* Chart visual container */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            height: '240px',
            paddingTop: '20px',
            borderBottom: '1px solid var(--border-color)',
            position: 'relative'
          }}>
            {financials.map((month, index) => {
              const revPercent = (month.revenue / maxVal) * 100;
              const expPercent = (month.expenses / maxVal) * 100;
              return (
                <div key={index} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '15%',
                  height: '100%',
                  justifyContent: 'flex-end'
                }}>
                  {/* Bars group */}
                  <div style={{ display: 'flex', gap: '4px', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'flex-end' }}>
                    {/* Revenue Bar */}
                    <div
                      style={{
                        width: '14px',
                        height: `${revPercent}%`,
                        background: 'linear-gradient(to top, var(--primary-hover), var(--primary))',
                        borderRadius: '4px 4px 0 0',
                        position: 'relative',
                        transition: 'height 0.5s ease'
                      }}
                      title={`Revenue: $${month.revenue}`}
                    ></div>
                    {/* Expense Bar */}
                    <div
                      style={{
                        width: '14px',
                        height: `${expPercent}%`,
                        background: 'linear-gradient(to top, #dc2626, var(--danger))',
                        borderRadius: '4px 4px 0 0',
                        position: 'relative',
                        transition: 'height 0.5s ease'
                      }}
                      title={`Expenses: $${month.expenses}`}
                    ></div>
                  </div>
                  {/* Label */}
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    {month.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7-Day Attendance Trend Chart */}
        <div className="glass-card">
          <div className="flex-between mb-4">
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>7-Day Attendance Logs Trend</h3>
            <Calendar size={18} className="text-secondary" />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            height: '240px',
            paddingTop: '20px',
            borderBottom: '1px solid var(--border-color)'
          }}>
            {(analytics?.dailyAttendance || []).map((day, index) => {
              const maxAttendance = Math.max(...(analytics.dailyAttendance.map(d => d.count)), 5);
              const heightPercent = (day.count / maxAttendance) * 100;
              return (
                <div key={index} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '12%',
                  height: '100%',
                  justifyContent: 'flex-end'
                }}>
                  <div
                    style={{
                      width: '20px',
                      height: `${heightPercent}%`,
                      background: 'linear-gradient(to top, var(--info), #06b6d4)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.5s ease'
                    }}
                    title={`${day.count} check-ins`}
                  ></div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.5rem', whiteSpace: 'nowrap' }}>
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Expenses by Category Breakdown */}
        <div className="glass-card">
          <div className="flex-align-center mb-4">
            <Receipt size={18} className="text-danger" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Operational Expenses Split</h3>
          </div>
          
          {(analytics?.expensesByCategory || []).length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-tertiary)' }}>No expense entries to divide</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(analytics.expensesByCategory).map((item, idx) => {
                const totalExpensesSum = analytics.expensesByCategory.reduce((sum, e) => sum + e.amount, 0);
                const percent = totalExpensesSum > 0 ? ((item.amount / totalExpensesSum) * 100).toFixed(0) : 0;
                return (
                  <div key={idx}>
                    <div className="flex-between mb-1" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      <span style={{ textTransform: 'capitalize' }}>{item.category}</span>
                      <span>${item.amount} ({percent}%)</span>
                    </div>
                    {/* Progress line */}
                    <div style={{ width: '100%', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: 'var(--danger)', borderRadius: '3px' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Member Subscription Share */}
        <div className="glass-card">
          <div className="flex-align-center mb-4">
            <Users size={18} className="text-success" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Members Distribution By Plan</h3>
          </div>

          {(analytics?.membersByPlan || []).length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-tertiary)' }}>No active client plans found</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(analytics.membersByPlan).map((item, idx) => {
                const totalMembersCount = analytics.membersByPlan.reduce((sum, p) => sum + p.count, 0);
                const percent = totalMembersCount > 0 ? ((item.count / totalMembersCount) * 100).toFixed(0) : 0;
                return (
                  <div key={idx}>
                    <div className="flex-between mb-1" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      <span>{item.planName}</span>
                      <span>{item.count} {item.count === 1 ? 'member' : 'members'} ({percent}%)</span>
                    </div>
                    {/* Progress line */}
                    <div style={{ width: '100%', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: 'var(--success)', borderRadius: '3px' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
