import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api, { API_BASE_URL } from '../services/api';

const QueueContext = createContext();

export const QueueProvider = ({ children }) => {
  const [overview, setOverview] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [counters, setCounters] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const wsRef = useRef(null);
  const pollTimerRef = useRef(null);

  // Toast notification helper
  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  }, []);

  // Fetch all primary live queue data
  const refreshQueueData = useCallback(async () => {
    try {
      const [overviewRes, tokensRes, countersRes, alertsRes] = await Promise.all([
        api.get('/api/analytics/overview'),
        api.get('/api/tokens?limit=100'),
        api.get('/api/counters'),
        api.get('/api/alerts?resolved=false&limit=20'),
      ]);

      setOverview(overviewRes.data);
      setTokens(tokensRes.data);
      setCounters(countersRes.data);
      setAlerts(alertsRes.data);
    } catch (err) {
      console.error('Error fetching queue metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize WebSocket with automatic reconnection and fallback polling
  useEffect(() => {
    refreshQueueData();

    // WebSocket URL
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const backendHost = API_BASE_URL.replace(/^http(s)?:\/\//, '');
    const wsUrl = `${wsProtocol}//${backendHost}/ws/queue`;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsConnected(true);
          // Ping keep-alive
          ws.send('ping');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event === 'pong') return;

            // React to live events
            if (data.event === 'TOKEN_CALLED') {
              addNotification(`Token ${data.token_number} called to Counter ${data.counter_number}!`, 'success');
            } else if (data.event === 'ALERT_TRIGGERED') {
              addNotification(`[${data.severity}] ${data.title}: ${data.message}`, 'warning');
            } else if (data.event === 'SIMULATION_ARRIVALS') {
              addNotification(data.message, 'info');
            }

            // Immediately synchronize data
            refreshQueueData();
          } catch (e) {
            console.error('WebSocket payload parse error:', e);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          // Schedule reconnect attempt
          setTimeout(connectWebSocket, 4000);
        };

        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch (err) {
        console.error('Failed to establish WebSocket connection:', err);
        setWsConnected(false);
      }
    };

    connectWebSocket();

    // Secondary fallback polling every 6 seconds to ensure data stays 100% synchronized
    pollTimerRef.current = setInterval(() => {
      refreshQueueData();
    }, 6000);

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [refreshQueueData, addNotification]);

  // Simulation handlers
  const simulateArrivals = async (count = 10, category = 'Random') => {
    try {
      const res = await api.post('/api/simulation/arrivals', {
        count,
        service_category: category,
      });
      addNotification(`Injected ${count} simulated arrivals!`, 'success');
      await refreshQueueData();
      return res.data;
    } catch (err) {
      addNotification('Failed to simulate arrivals', 'error');
      throw err;
    }
  };

  const simulateDelay = async (counterId = null, delayMinutes = 15.0) => {
    try {
      const res = await api.post('/api/simulation/delay', {
        counter_id: counterId,
        delay_minutes: delayMinutes,
        reason: 'Complex medical case / diagnostic delay',
      });
      addNotification(`Applied ${delayMinutes} min delay to Counter ${res.data.counter_number}`, 'warning');
      await refreshQueueData();
      return res.data;
    } catch (err) {
      addNotification('Failed to apply delay', 'error');
      throw err;
    }
  };

  const simulateCounterClosure = async (counterId = null) => {
    try {
      const res = await api.post('/api/simulation/counter-closure', {
        counter_id: counterId,
      });
      addNotification(`Counter ${res.data.closed_counter_number} closed. Tokens rerouted.`, 'warning');
      await refreshQueueData();
      return res.data;
    } catch (err) {
      addNotification('Failed to close counter', 'error');
      throw err;
    }
  };

  const resetSimulation = async () => {
    try {
      await api.post('/api/simulation/reset');
      addNotification('Simulation queue reset to baseline state.', 'info');
      await refreshQueueData();
    } catch (err) {
      addNotification('Failed to reset simulation', 'error');
      throw err;
    }
  };

  return (
    <QueueContext.Provider
      value={{
        overview,
        tokens,
        counters,
        alerts,
        loading,
        wsConnected,
        notifications,
        addNotification,
        refreshQueueData,
        simulateArrivals,
        simulateDelay,
        simulateCounterClosure,
        resetSimulation,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => useContext(QueueContext);
