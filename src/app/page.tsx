import { Index } from "~/components/pages/root";
import { HydrateClient, api } from "~/trpc/server";

export default async function Page() {
  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <Index />
    </HydrateClient>
  );
}
