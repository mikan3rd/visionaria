import Link from "next/link";

import { api } from "~/trpc/server";

export const Index = async () => {
  const user = await api.user.getSelf();

  return (
    <>
      <div>
        <div>{user.name}</div>
        <div>
          {user.accounts.map((account) => {
            return (
              <div key={account.id}>
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
    </>
  );
};
