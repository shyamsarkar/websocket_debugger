import { useState, useEffect, useRef } from 'react';
import { createConsumer } from '@rails/actioncable';
import './index.css'; // Use index.css for all styles

function App() {
  const [url, setUrl] = useState('ws://localhost:3000/cable');
  const [channel, setChannel] = useState('CustomerSupportChannel');
  const [params, setParams] = useState('{ "auth_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0aW1lc3RhbXAiOiIyMDI2LTA1LTA1VDEyOjU3OjQ2LjY2MyswMDowMCIsImVtYWlsIjoic2h5YW0uc0BhcHBsb2N1bS5vcmcifQ.gRYvMxu9OvorsMQ1JxfA4n3udcCvB09o3Xbajlc6ZHc" }');

  const [status, setStatus] = useState('Disconnected');
  const [messages, setMessages] = useState([]);

  const consumerRef = useRef(null);
  const subscriptionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const connect = () => {
    if (consumerRef.current) {
      consumerRef.current.disconnect();
    }

    setStatus('Connecting...');
    const consumer = createConsumer(url);
    consumerRef.current = consumer;

    let parsedParams = {};
    try {
      if (params.trim() !== '') {
        parsedParams = JSON.parse(params);
      }
    } catch (e) {
      alert("Invalid JSON parameters");
      setStatus('Disconnected');
      return;
    }

    const channelParams = { channel: channel, ...parsedParams };

    subscriptionRef.current = consumer.subscriptions.create(channelParams, {
      connected() {
        setStatus('Connected');
        addMessage({ type: 'system', text: `Connected to ${channel}` });
      },
      disconnected() {
        setStatus('Disconnected');
        addMessage({ type: 'system', text: `Disconnected from ${channel}` });
      },
      rejected() {
        setStatus('Rejected');
        addMessage({ type: 'error', text: `Subscription rejected to ${channel}` });
      },
      received(data) {
        addMessage({ type: 'data', payload: data });
      }
    });
  };

  const disconnect = () => {
    if (consumerRef.current) {
      consumerRef.current.disconnect();
      consumerRef.current = null;
      subscriptionRef.current = null;
      setStatus('Disconnected');
      addMessage({ type: 'system', text: `Disconnected from ${channel} (Manual)` });
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const addMessage = (msg) => {
    setMessages(prev => [...prev, { ...msg, timestamp: new Date().toLocaleTimeString(), id: Date.now() + Math.random() }]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendData = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const dataString = formData.get('messageData');
    if (dataString && subscriptionRef.current && status === 'Connected') {
      try {
        const parsedData = JSON.parse(dataString);
        subscriptionRef.current.send(parsedData);
        addMessage({ type: 'sent', payload: parsedData });
        e.target.reset();
      } catch (err) {
        alert("Invalid JSON data to send. Make sure it is valid JSON.");
      }
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h1>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12h4l3-9 5 18 3-9h5" />
          </svg>
          Action Cable Tester
        </h1>

        <div className={`status-badge ${status.toLowerCase().replace('...', '')}`}>
          <div className="status-dot"></div>
          {status}
        </div>

        <div className="form-group">
          <label>WebSocket URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={status === 'Connected' || status === 'Connecting...'}
          />
        </div>

        <div className="form-group">
          <label>Channel Name</label>
          <input
            type="text"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            disabled={status === 'Connected' || status === 'Connecting...'}
          />
        </div>

        <div className="form-group">
          <label>Additional Parameters (JSON)</label>
          <textarea
            value={params}
            onChange={(e) => setParams(e.target.value)}
            disabled={status === 'Connected' || status === 'Connecting...'}
            placeholder='{"room_id": 1}'
          />
        </div>

        <div className="button-group">
          {status === 'Connected' || status === 'Connecting...' ? (
            <button className="btn-danger" onClick={disconnect}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="15"></line>
                <line x1="15" y1="9" x2="9" y2="15"></line>
              </svg>
              Disconnect
            </button>
          ) : (
            <button className="btn-primary" onClick={connect}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Connect
            </button>
          )}
        </div>
      </div>

      <div className="main-content">
        <div className="messages-header">
          <h2>Data Stream</h2>
          <button className="btn-danger" style={{ flex: 'none', padding: '6px 12px', fontSize: '12px' }} onClick={clearMessages}>
            Clear Log
          </button>
        </div>

        <div className="messages-container">
          {messages.length === 0 && (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>
              No messages yet. Connect to a channel to start receiving data.
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className="message">
              <div className="message-header">
                <span className={`message-type type-${msg.type}`}>{msg.type}</span>
                <span>{msg.timestamp}</span>
              </div>
              {msg.text ? (
                <div className="message-content">{msg.text}</div>
              ) : (
                <pre className="message-content">{JSON.stringify(msg.payload, null, 2)}</pre>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="send-form" onSubmit={sendData}>
          <input
            type="text"
            name="messageData"
            placeholder='Send JSON data (e.g. {"action": "speak", "message": "hello"})'
            disabled={status !== 'Connected'}
          />
          <button type="submit" className="btn-primary" disabled={status !== 'Connected'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
