"use client";

import { useState, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  status: string;
  summary: string;
  inquiryId: string;
  customerName: string | null;
  customerId: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  propertyTitle: string;
  projectTitle: string | null;
  message: string;
  inquiryStatus: string;
  createdAt: string;
};

type CustomerOption = { id: string; companyName: string };

type Props = {
  events: CalendarEvent[];
  customers: CustomerOption[];
};

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  scheduled: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  completed: { bg: "#dcfce7", border: "#22c55e", text: "#166534" },
  cancelled: { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
};

export function CalendarView({ events, customers }: Props) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterCustomer, setFilterCustomer] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (filterCustomer && e.customerId !== filterCustomer) return false;
      if (filterStatus && e.status !== filterStatus) return false;
      return true;
    });
  }, [events, filterCustomer, filterStatus]);

  const calendarEvents = useMemo(() => {
    return filteredEvents.map((e) => {
      const colors = STATUS_COLORS[e.status] ?? STATUS_COLORS.scheduled;
      return {
        id: e.id,
        title: e.title,
        start: e.start,
        end: e.end,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: colors.text,
        extendedProps: e,
      };
    });
  }, [filteredEvents]);

  function handleEventClick(info: EventClickArg) {
    setSelectedEvent(info.event.extendedProps as CalendarEvent);
  }

  return (
    <div>
      {/* Filters */}
      <div className="card" style={{ marginBottom: 20, padding: 16 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem" }}>
            <span className="muted">Customer:</span>
            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)", background: "white", fontSize: "0.9rem" }}
            >
              <option value="">All Customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem" }}>
            <span className="muted">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)", background: "white", fontSize: "0.9rem" }}
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          {(filterCustomer || filterStatus) && (
            <button
              type="button"
              onClick={() => { setFilterCustomer(""); setFilterStatus(""); }}
              style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--line)", background: "white", cursor: "pointer", fontSize: "0.85rem" }}
            >
              Clear Filters
            </button>
          )}

          <span className="muted" style={{ marginLeft: "auto", fontSize: "0.85rem" }}>
            {filteredEvents.length} appointment{filteredEvents.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Calendar */}
      <div className="card" style={{ padding: 20 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          events={calendarEvents}
          eventClick={handleEventClick}
          height="auto"
          nowIndicator
          dayMaxEvents={3}
          eventDisplay="block"
          buttonText={{
            today: "Today",
            month: "Month",
            week: "Week",
            day: "Day",
            list: "List",
          }}
        />
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="modal-backdrop" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.15rem" }}>{selectedEvent.contactName}</h2>
                <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.88rem" }}>{selectedEvent.propertyTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.3rem", color: "var(--muted)", lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <DetailItem label="Date" value={new Date(selectedEvent.start).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} />
              <DetailItem label="Time" value={new Date(selectedEvent.start).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} />
              <DetailItem label="Appointment Status">
                <StatusBadge status={selectedEvent.status} />
              </DetailItem>
              <DetailItem label="Inquiry Status">
                <StatusBadge status={selectedEvent.inquiryStatus} />
              </DetailItem>
              <DetailItem label="Email" value={selectedEvent.contactEmail} />
              <DetailItem label="Phone" value={selectedEvent.contactPhone ?? "—"} />
              {selectedEvent.customerName && (
                <DetailItem label="Customer" value={selectedEvent.customerName} />
              )}
              {selectedEvent.projectTitle && (
                <DetailItem label="Project" value={selectedEvent.projectTitle} />
              )}
            </div>

            {selectedEvent.summary && (
              <div style={{ marginBottom: 12 }}>
                <span className="muted" style={{ fontSize: "0.78rem", display: "block", marginBottom: 4 }}>Summary</span>
                <p style={{ margin: 0, fontSize: "0.92rem", background: "var(--bg)", padding: "10px 14px", borderRadius: 8 }}>{selectedEvent.summary}</p>
              </div>
            )}

            {selectedEvent.message && (
              <div style={{ marginBottom: 16 }}>
                <span className="muted" style={{ fontSize: "0.78rem", display: "block", marginBottom: 4 }}>Inquiry Message</span>
                <p style={{ margin: 0, fontSize: "0.92rem", background: "var(--bg)", padding: "10px 14px", borderRadius: 8 }}>{selectedEvent.message}</p>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <a
                href={`/admin/inquiries/${selectedEvent.inquiryId}`}
                className="button-primary"
                style={{ padding: "8px 16px", fontSize: "0.88rem", textDecoration: "none" }}
              >
                Open Inquiry
              </a>
              <button
                type="button"
                className="button-secondary"
                onClick={() => setSelectedEvent(null)}
                style={{ padding: "8px 16px", fontSize: "0.88rem" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <span className="muted" style={{ fontSize: "0.78rem", display: "block", marginBottom: 2 }}>{label}</span>
      {children ?? <span style={{ fontSize: "0.92rem", fontWeight: 500 }}>{value}</span>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    scheduled: { bg: "#dbeafe", text: "#1e40af" },
    completed: { bg: "#dcfce7", text: "#166534" },
    cancelled: { bg: "#fee2e2", text: "#991b1b" },
    new: { bg: "#f0f9ff", text: "#0369a1" },
    "in-progress": { bg: "#fef9c3", text: "#854d0e" },
    closed: { bg: "#f1f5f9", text: "#475569" },
  };
  const c = colors[status] ?? { bg: "#f1f5f9", text: "#475569" };
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 6,
      background: c.bg,
      color: c.text,
      fontSize: "0.8rem",
      fontWeight: 600,
      textTransform: "capitalize",
    }}>
      {status}
    </span>
  );
}
