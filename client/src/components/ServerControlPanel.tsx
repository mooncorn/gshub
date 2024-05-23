import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { ServerTab } from "./ServerTab";
import { InstanceTab } from "./InstanceTab";

export const ServerControlPanel = () => {
  return (
    <Tabs isLazy>
      <TabList>
        <Tab>Server</Tab>
        <Tab>Instance</Tab>
        <Tab isDisabled>Files</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <ServerTab />
        </TabPanel>
        <TabPanel>
          <InstanceTab />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};
