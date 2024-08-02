import { ReloadIcon } from "@radix-ui/react-icons";

import { Button } from "~/components/ui/button";

type Props = {
  isLoading?: boolean;
} & React.ComponentProps<typeof Button>;

export function ButtonLoading(props: Props) {
  const { disabled, isLoading, children } = props;
  return (
    <Button disabled={disabled ?? isLoading}>
      {isLoading === true && (
        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
      )}
      {children}
    </Button>
  );
}
