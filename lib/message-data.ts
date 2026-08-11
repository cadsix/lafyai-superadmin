// Message log data — shared between admin messages page.
// Replace with API calls when integrating your backend.

export const MESSAGE_DELIVERY = [
  { label: "Delivered", value: 96.2 },
  { label: "Read", value: 88.4 },
  { label: "Failed", value: 1.8 },
  { label: "Opted out", value: 4.1 },
];

export const MESSAGE_VOLUME_TREND = [
  { week: "W1", sent: 3120, delivered: 3005, read: 2712 },
  { week: "W2", sent: 3480, delivered: 3348, read: 2984 },
  { week: "W3", sent: 3290, delivered: 3172, read: 2801 },
  { week: "W4", sent: 3710, delivered: 3572, read: 3186 },
];

export type MessageLogEntry = {
  id: string;
  sentAt: string;
  recipient: string;
  facility: string;
  channel: "WhatsApp" | "Voice IVR" | "SMS";
  template: string;
  status: "delivered" | "read" | "failed" | "opted_out" | "queued";
  detail: string;
};

export const MESSAGE_LOG: MessageLogEntry[] = [
  { id: "MSG-10241", sentAt: "2026-08-05 09:12", recipient: "CH-0421", facility: "Kibera Health Ctr", channel: "WhatsApp", template: "D-1 visit reminder", status: "read", detail: "Read 6 min after delivery" },
  { id: "MSG-10240", sentAt: "2026-08-05 09:10", recipient: "CH-0388", facility: "Mathare North", channel: "Voice IVR", template: "Dose due — Penta 2", status: "delivered", detail: "Call answered, 42s" },
  { id: "MSG-10239", sentAt: "2026-08-05 08:55", recipient: "CH-0512", facility: "Kawangware PHC", channel: "WhatsApp", template: "Missed dose follow-up", status: "failed", detail: "Number unreachable" },
  { id: "MSG-10238", sentAt: "2026-08-05 08:41", recipient: "CH-0177", facility: "Dandora Dispensary", channel: "SMS", template: "Outreach day notice", status: "delivered", detail: "Fallback after WhatsApp timeout" },
  { id: "MSG-10237", sentAt: "2026-08-05 08:30", recipient: "CH-0603", facility: "Korogocho HC", channel: "WhatsApp", template: "D-1 visit reminder", status: "read", detail: "Confirmed attendance" },
  { id: "MSG-10236", sentAt: "2026-08-05 08:14", recipient: "CH-0294", facility: "Mukuru Kwa Njenga", channel: "WhatsApp", template: "Safety follow-up", status: "opted_out", detail: "Caregiver replied STOP" },
  { id: "MSG-10235", sentAt: "2026-08-05 07:58", recipient: "CH-0455", facility: "Kibera Health Ctr", channel: "Voice IVR", template: "Dose due — Measles 1", status: "delivered", detail: "Voicemail left" },
  { id: "MSG-10234", sentAt: "2026-08-05 07:44", recipient: "CH-0331", facility: "Mathare North", channel: "WhatsApp", template: "Registration confirmation", status: "read", detail: "Read 2 min after delivery" },
  { id: "MSG-10233", sentAt: "2026-08-05 07:22", recipient: "CH-0126", facility: "Kawangware PHC", channel: "SMS", template: "D-1 visit reminder", status: "queued", detail: "Awaiting carrier window" },
  { id: "MSG-10232", sentAt: "2026-08-04 17:40", recipient: "CH-0587", facility: "Korogocho HC", channel: "WhatsApp", template: "Missed dose follow-up", status: "delivered", detail: "Delivered, unread" },
  { id: "MSG-10231", sentAt: "2026-08-04 17:12", recipient: "CH-0209", facility: "Dandora Dispensary", channel: "Voice IVR", template: "Dose due — OPV 3", status: "failed", detail: "No answer after 3 retries" },
  { id: "MSG-10230", sentAt: "2026-08-04 16:50", recipient: "CH-0472", facility: "Mukuru Kwa Njenga", channel: "WhatsApp", template: "D-1 visit reminder", status: "read", detail: "Confirmed attendance" },
  { id: "MSG-10229", sentAt: "2026-08-04 16:31", recipient: "CH-0355", facility: "Kibera Health Ctr", channel: "WhatsApp", template: "Outreach day notice", status: "delivered", detail: "Delivered, unread" },
  { id: "MSG-10228", sentAt: "2026-08-04 15:58", recipient: "CH-0641", facility: "Mathare North", channel: "SMS", template: "Safety follow-up", status: "delivered", detail: "Fallback channel" },
  { id: "MSG-10227", sentAt: "2026-08-04 15:20", recipient: "CH-0118", facility: "Kawangware PHC", channel: "WhatsApp", template: "Dose due — Penta 3", status: "read", detail: "Read 11 min after delivery" },
  { id: "MSG-10226", sentAt: "2026-08-04 14:47", recipient: "CH-0530", facility: "Korogocho HC", channel: "Voice IVR", template: "Missed dose follow-up", status: "delivered", detail: "Call answered, 1m 08s" },
  { id: "MSG-10225", sentAt: "2026-08-04 14:05", recipient: "CH-0263", facility: "Dandora Dispensary", channel: "WhatsApp", template: "D-1 visit reminder", status: "opted_out", detail: "Caregiver opted out" },
  { id: "MSG-10224", sentAt: "2026-08-04 13:33", recipient: "CH-0499", facility: "Mukuru Kwa Njenga", channel: "WhatsApp", template: "Registration confirmation", status: "read", detail: "Read 1 min after delivery" },
  { id: "MSG-10223", sentAt: "2026-08-04 12:58", recipient: "CH-0342", facility: "Kibera Health Ctr", channel: "SMS", template: "Dose due — Measles 2", status: "failed", detail: "Invalid number" },
  { id: "MSG-10222", sentAt: "2026-08-04 12:10", recipient: "CH-0611", facility: "Mathare North", channel: "WhatsApp", template: "Outreach day notice", status: "delivered", detail: "Delivered, unread" },
  { id: "MSG-10221", sentAt: "2026-08-04 11:36", recipient: "CH-0157", facility: "Kawangware PHC", channel: "Voice IVR", template: "D-1 visit reminder", status: "delivered", detail: "Call answered, 35s" },
  { id: "MSG-10220", sentAt: "2026-08-04 10:52", recipient: "CH-0568", facility: "Korogocho HC", channel: "WhatsApp", template: "Safety follow-up", status: "read", detail: "Read 4 min after delivery" },
  { id: "MSG-10219", sentAt: "2026-08-04 10:14", recipient: "CH-0235", facility: "Dandora Dispensary", channel: "WhatsApp", template: "Dose due — BCG", status: "delivered", detail: "Delivered, unread" },
  { id: "MSG-10218", sentAt: "2026-08-04 09:41", recipient: "CH-0487", facility: "Mukuru Kwa Njenga", channel: "SMS", template: "Missed dose follow-up", status: "queued", detail: "Awaiting carrier window" },
];
