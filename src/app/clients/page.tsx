// src/app/clients/page.tsx
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/clients/firms"); // send /clients to the Firms tab
}
