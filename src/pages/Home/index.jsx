import React, { useEffect, useState } from 'react';
import { Text, Box, Button, Flex, Spinner } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import Manager from './Manager';
import User from './User';

const Home = () => {
  const [type, setType] = useState(-1);
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.user && auth.user.type) {
      setType(auth.user.type);
    } else if (!auth.isLoading) {
      navigate('/');
    }
  }, [auth, navigate]);

  const handleLogOut = () => {
    auth.signout().then(() => {
      navigate('/');
    });
  };

  return (
    <Flex flexDirection="column" height="100%">
      <Box p={5} backgroundColor="teal.400" width="100%">
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontSize={20} fontWeight="bold" textColor="white">
            Bike Rentals
          </Text>
          <Button onClick={handleLogOut} colorScheme="blue">
            Log Out
          </Button>
        </Flex>
      </Box>
      <Box width="100%" height="100%">
        {(() => {
          if (type === -1) return <Spinner />;
          if (type === '1') return <Manager />;
          if (type === '0') return <User />;
          return null;
        })()}
      </Box>
    </Flex>
  );
};

export default Home;
