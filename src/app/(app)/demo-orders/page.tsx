import { redirect } from "next/navigation";

export default function DemoOrdersPage(): never {
  redirect("/account/orders");
}
