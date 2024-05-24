import { getContainer } from "@/api/get-container";
import { getInstance } from "@/api/get-instance";
import { NewMinecraftServer } from "@/components/NewMinecraftServer";
import { ServerControlPanel } from "@/components/ServerControlPanel";
import { Button, Heading, Select, Spinner, useToast } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

interface ErrorResponse {
  message: string;
}

const gameOptions = [
  {
    value: "minecraft",
    displayName: "Minecraft",
  },
  {
    value: "valheim",
    displayName: "Valheim",
  },
  {
    value: "palworld",
    displayName: "Palworld",
  },
];

export default function InstancePage() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();
  const instanceId = String(router.query.id);

  let containerState: "found" | "not-found" | null = null;
  let instanceState: "found" | "not-found" | "not-ready" | null = null;

  const getInstanceQuery = useQuery({
    queryKey: ["instance"],
    queryFn: () => getInstance({ instanceId }),
    gcTime: Infinity,
    retry: false,
  });

  const getContainerQuery = useQuery({
    queryKey: ["container"],
    queryFn: () => getContainer({ instanceId }),
    gcTime: Infinity,
    retry: false,
  });

  if (getInstanceQuery.isSuccess) {
    instanceState = "found";
  } else if (getInstanceQuery.isError) {
    instanceState = "not-found";
  }

  if (getContainerQuery.isSuccess) {
    containerState = "found";
  } else if (getContainerQuery.isError) {
    const error = getContainerQuery.error as AxiosError<ErrorResponse>;
    const errorMessage = error.response?.data?.message!;

    if (errorMessage.includes("container not found")) {
      containerState = "not-found";
    } else if (errorMessage.includes("not in a valid state")) {
      instanceState = "not-ready";
    } else if (errorMessage.includes("failed to wait")) {
      getContainerQuery.refetch();
    }
  }

  const renderInstanceNotFound = () => (
    <div className="text-center mt-4">
      <Heading className="mb-2" size={"md"}>
        Instance not found
      </Heading>
    </div>
  );

  const renderCheckingForServer = () => (
    <div className="text-center mt-4">
      <Heading className="mb-2" size={"md"}>
        Checking for the server...
      </Heading>
      <Spinner />
    </div>
  );

  const renderCreateServerForm = (game: string) => {
    switch (game) {
      case "minecraft":
        return (
          <NewMinecraftServer instanceId={String(getInstanceQuery.data?.Id)} />
        );
    }
  };

  const renderGameOptions = () =>
    gameOptions.map((game, i) => (
      <option key={game.value} value={game.value}>
        {game.displayName}
      </option>
    ));

  const renderSelectGameOptions = () => (
    <>
      <div className="mb-2">
        <Heading className="mb-2" size={"md"}>
          Create Server
        </Heading>
        <Select
          placeholder="Select game"
          onChange={(e) => setSelectedGame(e.target.value)}
        >
          {renderGameOptions()}
        </Select>
      </div>
      {selectedGame && renderCreateServerForm(selectedGame)}
    </>
  );

  const renderInstanceNotReady = () => (
    <div className="text-center mt-4">
      <Heading size={"md"} className="mb-2">
        Instance initializing...
      </Heading>
      <Button onClick={() => getContainerQuery.refetch()}>
        <RefreshCcw />
      </Button>
    </div>
  );

  const renderServer = () => <ServerControlPanel />;

  const renderContent = () => {
    switch (instanceState) {
      case null:
        return renderCheckingForServer();
      case "not-found":
        return renderInstanceNotFound();
      case "not-ready":
        return renderInstanceNotReady();
    }

    switch (containerState) {
      case null:
        return renderCheckingForServer();
      case "found":
        return renderServer();
      case "not-found":
        return renderSelectGameOptions();
    }
  };

  return <div className="max-w-screen-lg mx-auto p-4">{renderContent()}</div>;
}
