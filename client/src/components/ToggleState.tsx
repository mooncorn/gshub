import { Button } from "@chakra-ui/react";
import { Power } from "lucide-react";

interface ToggleStateProps {
  onClick?: (on: boolean) => void;
  on: boolean;
  disable?: boolean;
}

export const TogglePower = ({ onClick, on, disable }: ToggleStateProps) => {
  return (
    <Button variant={"outline"} isDisabled={disable}>
      <Power
        size={20}
        color={on ? "red" : "green"}
        onClick={() => onClick && onClick(on)}
      />
    </Button>
  );
};
