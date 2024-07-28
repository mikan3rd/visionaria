import { type Metadata, type ResolvingMetadata } from "next";

import { api, HydrateClient } from "~/trpc/server";
import { Index } from "~/components/pages/user";

export async function generateMetadata(
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const user = await api.user.getSelf();
  const parentTitle = (await parent).title;
  return {
    title: `My Page: ${user.name} | ${parentTitle?.absolute}`,
  };
}

export default async function Page() {
  void api.user.getSelf.prefetch();

  return (
    <HydrateClient>
      <Index />
    </HydrateClient>
  );
}
