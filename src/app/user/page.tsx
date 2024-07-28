import { api, HydrateClient } from "~/trpc/server";
import { Index } from "~/components/pages/user";

export default async function Page() {
  void api.user.getSelf.prefetch();

  return (
    <HydrateClient>
      <Index />
    </HydrateClient>
  );
}
