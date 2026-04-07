"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  updateInquiryStatus,
  addInquiryNote,
  addAppointment,
  updateAppointmentStatus,
  sendInquiryEmail,
} from "@/lib/actions";

type Note = { id: string; content: string; createdBy: string | null; createdAt: string };
type Apt = { id: string; dateTime: string; summary: string; status: string; createdAt: string };
type Email = { id: string; subject: string; body: string; sentTo: string; sentAt: string };

type Inquiry = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  createdAt: string;
  property: { title: string; slug: string };
  project: { title: string; slug: string } | null;
  notes: Note[];
  appointments: Apt[];
  emails: Email[];
};

type Props = { inquiry: Inquiry };

const STATUSES = ["new", "in-progress", "closed"];

export function InquiryCrm({ inquiry }: Props) {
  const router = useRouter();
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState("");

  // Email form
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // Appointment form
  const [aptDateTime, setAptDateTime] = useState("");
  const [aptSummary, setAptSummary] = useState("");

  async function handleStatusChange(status: string) {
    setSaving("status");
    await updateInquiryStatus(inquiry.id, status);
    setSaving("");
    router.refresh();
  }

  async function handleAddNote() {
    if (!noteText.trim()) return;
    setSaving("note");
    await addInquiryNote(inquiry.id, noteText.trim());
    setNoteText("");
    setSaving("");
    router.refresh();
  }

  async function handleAddAppointment() {
    if (!aptDateTime || !aptSummary.trim()) return;
    setSaving("apt");
    await addAppointment(inquiry.id, aptDateTime, aptSummary.trim());
    setAptDateTime("");
    setAptSummary("");
    setSaving("");
    router.refresh();
  }

  async function handleAptStatus(id: string, status: string) {
    await updateAppointmentStatus(id, status);
    router.refresh();
  }

  async function handleSendEmail() {
    if (!emailSubject.trim() || !emailBody.trim()) return;
    setSaving("email");
    const result = await sendInquiryEmail(inquiry.id, emailSubject.trim(), emailBody.trim());
    if (!result.success) {
      alert(result.error ?? "Failed to send email");
    }
    setEmailSubject("");
    setEmailBody("");
    setSaving("");
    router.refresh();
  }

  // Build timeline from all activities
  const timeline = [
    ...inquiry.notes.map((n) => ({ type: "note" as const, date: n.createdAt, data: n })),
    ...inquiry.appointments.map((a) => ({ type: "appointment" as const, date: a.createdAt, data: a })),
    ...inquiry.emails.map((e) => ({ type: "email" as const, date: e.sentAt, data: e })),
    { type: "inquiry" as const, date: inquiry.createdAt, data: { message: inquiry.message } },
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div>
          <Link href="/admin/inquiries" className="muted" style={{ fontSize: "0.85rem" }}>← Back to inquiries</Link>
          <h1 style={{ margin: "8px 0 4px" }}>{inquiry.fullName}</h1>
          <p className="muted">
            {inquiry.email} {inquiry.phone && `· ${inquiry.phone}`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`publish-badge ${inquiry.status === s ? "publish-badge-on" : "publish-badge-off"}`}
              onClick={() => handleStatusChange(s)}
              disabled={saving === "status"}
              style={{ cursor: "pointer" }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Context */}
      <div className="card" style={{ display: "flex", gap: 20 }}>
        <div>
          <p className="eyebrow">Property</p>
          <Link href={`/properties/${inquiry.property.slug}`} style={{ color: "var(--accent)" }}>{inquiry.property.title}</Link>
        </div>
        {inquiry.project && (
          <div>
            <p className="eyebrow">Project</p>
            <Link href={`/projects/${inquiry.project.slug}`} style={{ color: "var(--accent)" }}>{inquiry.project.title}</Link>
          </div>
        )}
        <div>
          <p className="eyebrow">Received</p>
          <span>{new Date(inquiry.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)", gap: 20 }}>
        {/* Left: Actions */}
        <div style={{ display: "grid", gap: 16 }}>
          {/* Add Note */}
          <div className="card" style={{ display: "grid", gap: 10 }}>
            <p className="eyebrow">Add Note</p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Type a note about this inquiry..."
              rows={3}
              className="inquiry-input"
            />
            <button type="button" className="button-primary" onClick={handleAddNote} disabled={!noteText.trim() || saving === "note"} style={{ justifySelf: "start" }}>
              {saving === "note" ? "Saving..." : "Save Note"}
            </button>
          </div>

          {/* Schedule Appointment */}
          <div className="card" style={{ display: "grid", gap: 10 }}>
            <p className="eyebrow">Schedule Appointment</p>
            <input
              type="datetime-local"
              value={aptDateTime}
              onChange={(e) => setAptDateTime(e.target.value)}
              className="inquiry-input"
            />
            <input
              value={aptSummary}
              onChange={(e) => setAptSummary(e.target.value)}
              placeholder="Appointment summary..."
              className="inquiry-input"
            />
            <button type="button" className="button-primary" onClick={handleAddAppointment} disabled={!aptDateTime || !aptSummary.trim() || saving === "apt"} style={{ justifySelf: "start" }}>
              {saving === "apt" ? "Scheduling..." : "Schedule"}
            </button>
          </div>

          {/* Send Email */}
          <div className="card" style={{ display: "grid", gap: 10 }}>
            <p className="eyebrow">Send Email to {inquiry.email}</p>
            <input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Subject"
              className="inquiry-input"
            />
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Email body..."
              rows={4}
              className="inquiry-input"
            />
            <button type="button" className="button-primary" onClick={handleSendEmail} disabled={!emailSubject.trim() || !emailBody.trim() || saving === "email"} style={{ justifySelf: "start" }}>
              {saving === "email" ? "Sending..." : "Send Email"}
            </button>
          </div>
        </div>

        {/* Right: Timeline */}
        <div className="card" style={{ maxHeight: 700, overflowY: "auto" }}>
          <p className="eyebrow">Activity Timeline</p>

          {timeline.length === 0 && <p className="muted">No activity yet.</p>}

          <div className="crm-timeline">
            {timeline.map((item, i) => (
              <div key={i} className="crm-timeline-item">
                <div className={`crm-dot crm-dot-${item.type}`} />
                <div className="crm-timeline-content">
                  <div className="crm-timeline-meta">
                    <span className={`api-badge api-badge-${item.type === "inquiry" ? "off" : "on"}`}>
                      {item.type === "inquiry" ? "Initial" : item.type === "note" ? "Note" : item.type === "appointment" ? "Appt" : "Email"}
                    </span>
                    <span className="muted" style={{ fontSize: "0.8rem" }}>
                      {new Date(item.date).toLocaleString()}
                    </span>
                  </div>

                  {item.type === "inquiry" && (
                    <p style={{ margin: "6px 0 0" }}>{item.data.message}</p>
                  )}
                  {item.type === "note" && (
                    <p style={{ margin: "6px 0 0" }}>{(item.data as Note).content}</p>
                  )}
                  {item.type === "appointment" && (
                    <div style={{ margin: "6px 0 0" }}>
                      <p><strong>{(item.data as Apt).summary}</strong></p>
                      <p className="muted">{new Date((item.data as Apt).dateTime).toLocaleString()}</p>
                      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                        {["scheduled", "completed", "cancelled"].map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={`api-badge ${(item.data as Apt).status === s ? "api-badge-on" : "api-badge-off"}`}
                            onClick={() => handleAptStatus((item.data as Apt).id, s)}
                            style={{ cursor: "pointer", fontSize: "0.7rem" }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {item.type === "email" && (
                    <div style={{ margin: "6px 0 0" }}>
                      <p><strong>{(item.data as Email).subject}</strong></p>
                      <p className="muted" style={{ whiteSpace: "pre-wrap" }}>{(item.data as Email).body}</p>
                      <p className="muted" style={{ fontSize: "0.8rem" }}>To: {(item.data as Email).sentTo}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
