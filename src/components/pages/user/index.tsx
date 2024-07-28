import Link from "next/link";

import { api } from "~/trpc/server";

export const Index = async () => {
  const user = await api.user.getSelf();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div>
          <div>{user.name}</div>
          <div>
            {user.accounts.map((account) => {
              return (
                <div key={account.providerAccountId}>
                  <div>{account.provider}</div>
                </div>
              );
            })}
          </div>
        </div>
        <Link
          href="/"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
        >
          Top
        </Link>
      </div>
    </main>
  );
};
