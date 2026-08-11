import { MessagesPage } from "@/components/admin/pages/messages-page";

export const metadata = {
  title: "Message log — lafyai super admin",
  description: "Delivery log for every reminder sent across facilities.",
};

export default function Page() {
  return <MessagesPage />;
}
