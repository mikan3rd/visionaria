import { api, HydrateClient } from "~/trpc/server";
import { Main } from "~/components/pages/root";

export default async function Page() {
  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <Main />
    </HydrateClient>
  );
}
