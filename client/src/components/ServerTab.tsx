import { getContainer } from "@/api/get-container";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";

export const ServerTab = () => {
  const router = useRouter();
  const instanceId = String(router.query.id);

  const getContainerQuery = useQuery({
    queryKey: ["container"],
    queryFn: () => getContainer({ instanceId }),
  });

  return (
    <div>
      <div></div>
      <div></div>
    </div>
  );
};
