import { getContainer } from "@/api/get-container";
import { getInstance } from "@/api/get-instance";
import { startInstance } from "@/api/start-instance";
import { Container, Instance } from "@/api/types";
import { Button, Spinner, useToast } from "@chakra-ui/react";
import { AxiosError } from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function InstancePage() {
  const router = useRouter();
  const toast = useToast();
  const [container, setContainer] = useState<Container | null>(null);
  const [instance, setInstance] = useState<Instance | null>(null);
  const [fetching, setFetching] = useState<boolean>(true);

  if (typeof router.query.id !== "string") router.push("/");
  const instanceId = String(router.query.id);

  const startInstanceRequest = async () => {
    try {
      await startInstance({ instanceId });
    } catch (e) {
      if (e instanceof AxiosError) {
        toast({
          title: "Request failed",
          description: "Cannot start instance.",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    }
  };

  useEffect(() => {
    const fetchInstance = async () => {
      try {
        const { data } = await getInstance({ instanceId });
        setFetching(false);
        setInstance(data);
      } catch (e) {
        if (e instanceof AxiosError) {
          setFetching(false);
          toast({
            title: "Request failed",
            description: "Cannot fetch instance.",
            status: "error",
            duration: 2000,
            isClosable: true,
          });
        }
      }
    };
    const fetchContainer = async () => {
      try {
        const res = await getContainer({ instanceId: String(router.query.id) });
        setContainer(res.data);
      } catch (e) {
        if (e instanceof AxiosError) {
          // toast({
          //   title: "Request failed",
          //   description: "Cannot fetch container.",
          //   status: "error",
          //   duration: 2000,
          //   isClosable: true,
          // });
        }
      }
    };

    fetchInstance();
    fetchContainer();
  }, []);

  // If the instance is being fetched, return a spinner.
  if (fetching)
    return (
      <div className="flex max-w-screen-lg justify-center">
        <Spinner className="m-4" />
      </div>
    );

  // If the instance is stopped, display a button to start it.
  if (instance?.State === "stopped") {
    return (
      <div className="flex max-w-screen-lg justify-center">
        <Button className="m-4" onClick={startInstanceRequest}>
          Start Instance
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto p-4">
      {router.query.id}
      <>{container?.Env[0]}</>
    </div>
  );
}
