import React from 'react';
import { ChakraProvider, theme, Box } from '@chakra-ui/react';

import MainRouters from 'routers';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Box width="100wh" height="100vh" backgroundColor="gray.200">
        <MainRouters />
      </Box>
    </ChakraProvider>
  );
}

export default App;
