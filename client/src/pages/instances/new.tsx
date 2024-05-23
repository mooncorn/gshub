import { createInstance } from "@/api/create-instance";
import { NewMinecraftServer } from "@/components/NewMinecraftServer";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Heading,
  ListItem,
  Select,
  Text,
  UnorderedList,
  useToast,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useState } from "react";

interface Plan {
  name: string;
  value: string;
  enabled: boolean;
  cpu: number;
  memory: number;
  pricePerHour: number;
}

const plans: Plan[] = [
  {
    name: "Micro (testing)",
    value: "t2.micro",
    enabled: true,
    cpu: 1,
    memory: 1,
    pricePerHour: 0,
  },
  {
    name: "Small",
    value: "t3.small",
    enabled: true,
    cpu: 2,
    memory: 2,
    pricePerHour: 0.0208,
  },
  {
    name: "Medium",
    value: "t3.medium",
    enabled: true,
    cpu: 2,
    memory: 4,
    pricePerHour: 0.0416,
  },
  {
    name: "Large",
    value: "t3.large",
    enabled: true,
    cpu: 2,
    memory: 8,
    pricePerHour: 0.0928,
  },
];

export default function NewInstancePage() {
  const toast = useToast();
  const router = useRouter();
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number | null>(
    null
  );
  // const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const createInstanceMutation = useMutation({
    mutationFn: createInstance,
    onSuccess: () => {
      toast({
        title: "Instance created",
        status: "success",
        duration: 1000,
        isClosable: true,
      });
      router.push("/instances");
    },
    onError: () => {
      toast({
        title: "Failed to create instance",
        status: "error",
        duration: 1000,
        isClosable: true,
      });
    },
  });

  const renderPlans = () =>
    plans.map((plan, i) => {
      if (!plan.enabled) return;
      return (
        <Card
          key={plan.name}
          className="flex-1"
          variant={selectedPlanIndex === i ? "filled" : "outline"}
        >
          <CardBody>
            <Heading size="s" textTransform="uppercase">
              {plan.name}
            </Heading>
            <UnorderedList>
              <ListItem>{plan.cpu} vCPU</ListItem>
              <ListItem>{plan.memory} GiB Memory</ListItem>
            </UnorderedList>

            <Text color="green.600" fontSize="xl">
              {plan.pricePerHour} USD/hour
            </Text>
          </CardBody>
          <CardFooter>
            <Button
              variant="solid"
              colorScheme="green"
              onClick={() => setSelectedPlanIndex(i)}
              isDisabled={selectedPlanIndex === i}
            >
              Select
            </Button>
          </CardFooter>
        </Card>
      );
    });

  return (
    <div className="max-w-screen-lg mx-auto p-4">
      <Heading className="mb-2" size={"md"}>
        Instance Plans
      </Heading>
      <div className="flex gap-4 flex-col mb-2 sm:flex-row">
        {renderPlans()}
      </div>

      {/* <div className="mb-2">
        <Heading className="mb-2" size={"md"}>
          Game
        </Heading>
        <Select
          placeholder="Select game"
          onChange={(e) => setSelectedGame(e.target.value)}
        >
          {renderGameOptions()}
        </Select>
      </div>

      {selectedGame === "minecraft" && (
        <NewMinecraftServer instanceType={plans[selectedPlanIndex!].value} />
      )} */}
      <Button
        isDisabled={selectedPlanIndex === null}
        onClick={() => {
          toast({
            title: "Creating instance",
            status: "loading",
            duration: 1000,
            isClosable: true,
          });
          createInstanceMutation.mutate({
            instanceType: plans[selectedPlanIndex!].value,
          });
        }}
      >
        Create
      </Button>
    </div>
  );
}
