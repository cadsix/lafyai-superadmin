import { api } from "@/lib/api";
import { MessagesPage } from "@/components/admin/pages/messages-page";
import type { MessageLogMetrics, MessageLogEntry } from "@/lib/types";

export const metadata = { title: "Message log — GetVaxxed super admin" };

type MessagesResponse = {
  metrics: MessageLogMetrics;
  data: MessageLogEntry[];
  pagination: unknown;
};

export default async function Page() {
  const data = await api
    .get<MessagesResponse>("/admin/messages?page=1&limit=100")
    .catch(() => null);

  return (
    <MessagesPage
      metrics={data?.metrics ?? null}
      messages={data?.data ?? []}
    />
  );
}
