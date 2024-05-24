import { getInstance } from "@/api/get-instance";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from "@chakra-ui/react";

export const InstanceTab = () => {
  const router = useRouter();
  const instanceId = String(router.query.id);

  const getInstanceQuery = useQuery({
    queryKey: ["instance"],
    queryFn: () => getInstance({ instanceId }),
  });

  return (
    <TableContainer>
      <Table variant="simple">
        <TableCaption>Instance configuration</TableCaption>
        <Thead>
          <Tr>
            <Th>Key</Th>
            <Th>Description</Th>
            <Th>Value</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>Type</Td>
            <Td>Instance type.</Td>
            <Td>{getInstanceQuery.data?.Type}</Td>
          </Tr>
          <Tr>
            <Td>Launch Time</Td>
            <Td>Time the instance launched.</Td>
            <Td>{getInstanceQuery.data?.LaunchTime.toString()}</Td>
          </Tr>
          <Tr>
            <Td>Public Ip</Td>
            <Td>IP Address used to connect.</Td>
            <Td>{getInstanceQuery.data?.PublicIp}</Td>
          </Tr>
          <Tr>
            <Td>State</Td>
            <Td>Current state of the instance.</Td>
            <Td>{getInstanceQuery.data?.State}</Td>
          </Tr>
        </Tbody>
      </Table>
    </TableContainer>
  );
};
