import { HydrateClient } from "~/trpc/server";
import { Index } from "~/components/user";

export default async function Page() {
  return (
    <HydrateClient>
      <Index />
    </HydrateClient>
  );
}
