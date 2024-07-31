import { api } from "~/trpc/server";
import { Index } from "~/components/pages/root";

export default async function Page() {
  void api.post.getLatest.prefetch();

  return <Index />;
}
