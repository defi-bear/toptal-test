import React from 'react';
import { Box, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';

import BikePanel from './BikePanel';
import UserPanel from './UserPanel';

const Manager = () => (
  <Box height="100%" background="white">
    <Tabs variant="enclosed" p={5}>
      <TabList>
        <Tab fontWeight="bold">Bikes</Tab>
        <Tab fontWeight="bold">Accounts</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <BikePanel />
        </TabPanel>
        <TabPanel>
          <UserPanel />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Box>
);

export default Manager;
