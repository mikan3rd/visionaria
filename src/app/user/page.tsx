import type { Metadata, ResolvingMetadata } from "next";

import { Index } from "~/components/pages/user";
import { HydrateClient, api } from "~/trpc/server";

export async function generateMetadata(
  parent: ResolvingMetadata,
): Promise<Metadata> {
  /*
   * FIXME:
   * generateMetadata と Server Component で同じfetchを使用しているので
   * 2回目はcacheから取得される想定だが、2回fetchが発生してしまっている
   */
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
