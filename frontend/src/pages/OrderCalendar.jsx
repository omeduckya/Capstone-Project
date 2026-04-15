import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function normalizeStatus(status) {
  return (status || "pending").toLowerCase().replace(/_/g, " ");
}

function titleCase(value) {
  return String(value || "").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function parseOrderDate(order) {
  const raw = order.deliveryDate || order.pickupDate || order.date || order.createdAt;
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toOrderViewModel(order) {
  const orderDate = parseOrderDate(order) || new Date();
  const rawStatus = normalizeStatus(order.rawStatus || order.status);

  return {
    _id: order._id,
    name: order.name || order.flavor || "Custom Cake",
    customer: order.customer || order.customerName || "Customer",
    deliveryMethod: order.deliveryMethod || "Pickup",
    deliveryTime: order.deliveryTime || "To be confirmed",
    date: orderDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    dateKey: orderDate.toISOString().slice(0, 10),
    rawStatus,
    status: titleCase(rawStatus),
    price: Number(order.price || 0),
  };
}

function buildCalendarDays(anchorDate) {
  const year = anchorDate.getFullYear();
  const month = anchorDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startOffset; i += 1) {
    cells.push({ key: `empty-${i}`, isEmpty: true });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const current = new Date(year, month, day);
    cells.push({
      key: current.toISOString().slice(0, 10),
      isEmpty: false,
      date: current,
      day,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: `tail-${cells.length}`, isEmpty: true });
  }

  return cells;
}

export default function OrderCalendar() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const bakerId = (() => {
    try {
      const stored = localStorage.getItem("bakerUser");
      const parsed = stored ? JSON.parse(stored) : {};
      return parsed?.id || parsed?._id || "";
    } catch {
      return "";
    }
  })();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError("");
    if (!bakerId) {
      setOrders([]);
      setIsLoading(false);
      return;
    }
    fetch(`${API_BASE_URL}/api/orders?bakerId=${bakerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data.map(toOrderViewModel));
        } else {
          setError("Could not load scheduled orders.");
          setOrders([]);
        }
      })
      .catch(() => {
        setError("Could not load orders from server.");
        setOrders([]);
      })
      .finally(() => setIsLoading(false));
  }, [API_BASE_URL, bakerId]);

  const statusClass = (status) => {
    const value = normalizeStatus(status);
    if (value === "accepted" || value === "completed" || value === "delivered") return "status-pill green-pill";
    if (value === "ready for pickup") return "status-pill orange-pill";
    if (value === "in progress") return "status-pill yellow-pill";
    return "status-pill blue-pill";
  };

  const scheduledOrders = useMemo(
    () => orders.filter((order) => normalizeStatus(order.rawStatus) !== "declined"),
    [orders]
  );

  const ordersByDate = useMemo(() => {
    const grouped = new Map();
    scheduledOrders.forEach((order) => {
      const current = grouped.get(order.dateKey) || [];
      current.push(order);
      grouped.set(order.dateKey, current);
    });
    return grouped;
  }, [scheduledOrders]);

  const calendarDays = useMemo(() => buildCalendarDays(calendarMonth), [calendarMonth]);
  const selectedDateOrders = selectedDateKey ? ordersByDate.get(selectedDateKey) || [] : [];
  const todayKey = new Date().toISOString().slice(0, 10);
  const summary = useMemo(
    () => ({
      total: scheduledOrders.length,
      upcoming: scheduledOrders.filter((order) => order.dateKey >= todayKey).length,
      ready: scheduledOrders.filter((order) => normalizeStatus(order.rawStatus) === "ready for pickup").length,
    }),
    [scheduledOrders, todayKey]
  );

  return (
    <div className="page">
      <header className="page-header orders-header">
        <div>
          <h1 className="page-title">Order Calendar</h1>
          <p className="page-subtitle">
            {isLoading ? "Loading calendar..." : "See your live cake schedule without declined orders cluttering it"}
          </p>
        </div>
        <div className="orders-header-actions">
          <button className="primary-btn" onClick={() => navigate("/orders")}>
            View All Orders
          </button>
        </div>
      </header>

      {error && <div className="info-box-blue" style={{ marginBottom: 12 }}>{error}</div>}
      {!error && !isLoading && scheduledOrders.length === 0 && (
        <div className="calendar-empty-banner" style={{ marginBottom: 12 }}>
          No scheduled orders yet. Your calendar will fill in as customers place orders.
        </div>
      )}

      <section className="calendar-summary-row">
        <article className="calendar-summary-card">
          <span className="calendar-summary-label">Scheduled</span>
          <strong>{summary.total}</strong>
        </article>
        <article className="calendar-summary-card">
          <span className="calendar-summary-label">Upcoming</span>
          <strong>{summary.upcoming}</strong>
        </article>
        <article className="calendar-summary-card">
          <span className="calendar-summary-label">Ready for pickup</span>
          <strong>{summary.ready}</strong>
        </article>
      </section>

      <section className="orders-calendar-shell">
        <div className="orders-calendar-card">
          <div className="orders-calendar-head">
            <div>
              <h3 className="card-title" style={{ marginBottom: 4 }}>Schedule View</h3>
              <p className="selection-subtitle" style={{ margin: 0 }}>
                Click a date to see which orders are landing that day.
              </p>
            </div>
            <div className="orders-calendar-controls">
              <button
                type="button"
                className="pill-button"
                onClick={() =>
                  setCalendarMonth(
                    (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
                  )
                }
              >
                Prev
              </button>
              <div className="orders-calendar-month">
                {MONTH_LABELS[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              </div>
              <button
                type="button"
                className="pill-button"
                onClick={() =>
                  setCalendarMonth(
                    (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
                  )
                }
              >
                Next
              </button>
            </div>
          </div>

          <div className="orders-calendar-grid">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="orders-calendar-weekday">{label}</div>
            ))}
            {calendarDays.map((cell) => {
              if (cell.isEmpty) {
                return <div key={cell.key} className="orders-calendar-cell empty" />;
              }

              const key = cell.date.toISOString().slice(0, 10);
              const dayOrders = ordersByDate.get(key) || [];
              const isSelected = selectedDateKey === key;
              const isToday = key === todayKey;

              return (
                <button
                  key={cell.key}
                  type="button"
                  className={`orders-calendar-cell ${dayOrders.length ? "has-orders" : ""} ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
                  onClick={() => setSelectedDateKey((current) => (current === key ? null : key))}
                >
                  <span className="orders-calendar-day">{cell.day}</span>
                  {dayOrders.length > 0 && (
                    <>
                      <span className="orders-calendar-count">{dayOrders.length}</span>
                      <span className="orders-calendar-dot" />
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="orders-calendar-sidecard">
          <h3 className="card-title" style={{ marginBottom: 8 }}>Day Snapshot</h3>
          {!selectedDateKey ? (
            <p className="page-subtitle" style={{ marginBottom: 0 }}>
              Pick a day on the calendar to see that day&apos;s orders.
            </p>
          ) : (
            <>
              <div className="orders-calendar-selected-date">
                {new Date(selectedDateKey).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <p className="page-subtitle" style={{ marginBottom: 16 }}>
                {selectedDateOrders.length
                  ? `${selectedDateOrders.length} order${selectedDateOrders.length === 1 ? "" : "s"} scheduled`
                  : "No orders on this date"}
              </p>
              <div className="orders-calendar-list">
                {selectedDateOrders.map((order) => (
                  <button
                    key={order._id}
                    type="button"
                    className="orders-calendar-list-item"
                    onClick={() => navigate(`/orders/${order._id}`)}
                  >
                    <div>
                      <strong>{order.name}</strong>
                      <span>{order.customer}</span>
                      <small>{order.deliveryMethod} • {order.deliveryTime}</small>
                    </div>
                    <span className={statusClass(order.rawStatus)}>{order.status}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
