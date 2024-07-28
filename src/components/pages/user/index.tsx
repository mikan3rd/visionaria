import { api } from "~/trpc/server";

export const Index = async () => {
  const user = await api.user.getSelf();

  return (
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
  );
};
