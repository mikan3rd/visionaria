import Link from "next/link";

import { api } from "~/trpc/server";
import { Button } from "~/components/ui/button";

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

      <Button asChild>
        <Link href="/">Top</Link>
      </Button>
    </>
  );
};
