import { getInstances } from "@/api/get-instances";
import { Button, Text, useToast } from "@chakra-ui/react";
import { Dot, RefreshCcw, Server } from "lucide-react";
import NextLink from "next/link";
import { TogglePower } from "./ToggleState";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { startInstance } from "@/api/start-instance";
import { stopInstance } from "@/api/stop-instance";

export const InstanceList = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const getInstancesQuery = useQuery({
    queryKey: ["instances"],
    queryFn: getInstances,
    refetchInterval: 60000, // 1 minute
    gcTime: Infinity,
  });

  const startInstanceMutation = useMutation({
    mutationFn: startInstance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instances"] });
      toast({
        title: "Instance started",
        status: "success",
        duration: 1000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: "Failed to start instance",
        status: "error",
        duration: 1000,
        isClosable: true,
      });
    },
  });

  const stopInstanceMutation = useMutation({
    mutationFn: stopInstance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instances"] });
      toast({
        title: "Instance stopped",
        status: "success",
        duration: 1000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: "Failed to stop instance",
        status: "error",
        duration: 1000,
        isClosable: true,
      });
    },
  });

  const stopAll = () => {
    getInstancesQuery.data?.forEach((instance) =>
      stopInstanceMutation.mutate({ instanceId: instance.Id })
    );
  };

  const renderInstances = () =>
    getInstancesQuery.data
      ?.filter((instance) => instance.State !== "terminated")
      .map((instance) => {
        const stateIsPending =
          instance.State === "pending" ||
          instance.State === "stopping" ||
          instance.State === "shutting-down";
        return (
          <div
            className="flex justify-between border rounded p-2"
            key={instance.Id}
          >
            <div className="flex gap-x-2 items-center">
              <Server />
              <Text>{instance.Id}</Text>

              {/* Instance status */}
              {!stateIsPending && (
                <Dot
                  strokeWidth={8}
                  color={instance.State === "stopped" ? "red" : "green"}
                />
              )}

              {stateIsPending && <Text>{instance.State}</Text>}
            </div>

            <div className="flex gap-x-2 items-center">
              {/* Access to instance control */}
              {instance.State === "running" && (
                <Button
                  variant={"outline"}
                  as={NextLink}
                  href={`/instances/${instance.Id}`}
                >
                  Control
                </Button>
              )}

              <div>
                {/* Instance status toggle */}
                <TogglePower
                  disable={
                    stateIsPending ||
                    stopInstanceMutation.isPending ||
                    startInstanceMutation.isPending
                  }
                  on={instance.State !== "stopped"}
                  onClick={(on) => {
                    if (on) {
                      stopInstanceMutation.mutate({ instanceId: instance.Id });
                    } else {
                      startInstanceMutation.mutate({ instanceId: instance.Id });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        );
      });

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center gap-x-2">
        <Button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["instances"] })
          }
        >
          <RefreshCcw size={20} />
        </Button>
        <Button as={NextLink} href={"/instances/new"}>
          New
        </Button>
        <Button onClick={stopAll}>Stop All</Button>
      </div>
      {renderInstances()}
    </div>
  );
};
