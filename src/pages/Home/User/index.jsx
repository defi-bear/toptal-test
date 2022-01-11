import React from 'react';
import { Box, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import ReservationPanel from './ReservationPanel';
import MyReservationPanel from './MyReservationPanel';

const Manager = () => (
  <Box height="100%" background="white">
    <Tabs variant="enclosed" p={5}>
      <TabList>
        <Tab fontWeight="bold">Reservation</Tab>
        <Tab fontWeight="bold">My Reservation</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <ReservationPanel />
        </TabPanel>
        <TabPanel>
          <MyReservationPanel />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Box>
);

export default Manager;
