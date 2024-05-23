import { createContainer } from "@/api/create-container";
import { getMinecraftVersions } from "@/api/get-minecraft-versions";
import {
  Table,
  Thead,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Select,
  Tbody,
  useToast,
  Button,
} from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useState } from "react";

interface NewMinecraftServerProps {
  instanceId: string;
}

export const NewMinecraftServer = ({ instanceId }: NewMinecraftServerProps) => {
  const router = useRouter();
  const [version, setVersion] = useState("LATEST");
  const [type, setType] = useState("VANILLA");

  const toast = useToast();
  const getMinecraftVersionsQuery = useQuery({
    queryKey: ["minecraft-versions"],
    queryFn: getMinecraftVersions,
  });

  const createContainerMutation = useMutation({
    mutationFn: createContainer,
    onSuccess: () => {
      toast({
        title: "Container created",
        status: "success",
        duration: 1000,
        isClosable: true,
      });
      router.push("/instances");
    },
    onError: () => {
      toast({
        title: "Failed to create container",
        status: "error",
        duration: 1000,
        isClosable: true,
      });
    },
  });

  const renderMinecraftVersions = () =>
    getMinecraftVersionsQuery.data?.versions
      .filter((v) => v.type === "release")
      .map((v) => (
        <option key={v.id} value={v.id}>
          {v.id}
        </option>
      ));

  return (
    <>
      <TableContainer>
        <Table variant="simple">
          <TableCaption>Minecraft Configuration</TableCaption>
          <Thead>
            <Tr>
              <Th>Key</Th>
              <Th>Description</Th>
              <Th>Value</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>TYPE</Td>
              <Td>The server type.</Td>
              <Td>
                <Select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="vanilla">Vanilla</option>
                  <option value="spigot">Spigot</option>
                </Select>
              </Td>
            </Tr>
            <Tr>
              <Td>VERSION</Td>
              <Td>The minecraft version.</Td>
              <Td>
                <Select
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                >
                  <option value="LATEST">Latest</option>
                  {renderMinecraftVersions()}
                </Select>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
      <Button
        onClick={() =>
          createContainerMutation.mutate({
            instanceId,
            image: "itzg/minecraft-server",
            ports: ["25565:25565"],
            volume: "/minecraft:/data",
            env: ["EULA=TRUE", `TYPE=${type}`, `VERSION=${version}`],
          })
        }
      >
        Create
      </Button>
    </>
  );
};
