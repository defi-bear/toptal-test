import React, { useState } from 'react';
import {
  Flex,
  Heading,
  Input,
  Button,
  InputGroup,
  Stack,
  InputLeftElement,
  chakra,
  Box,
  Link,
  Avatar,
  FormControl,
  InputRightElement,
  Text,
  Spinner,
} from '@chakra-ui/react';
import { FaUserAlt, FaLock, FaRegEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';

import { useAuth } from '../../hooks/useAuth';
import { db } from '../../utils/firebase';

const CFaUserAlt = chakra(FaUserAlt);
const CFaLock = chakra(FaLock);
const CFaEnv = chakra(FaRegEnvelope);

const App = () => {
  const [fname, setFName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleShowClick = () => setShowPassword(!showPassword);

  const onSignUp = e => {
    e.preventDefault();
    setLoading(true);
    auth
      .signup(email, password, fname)
      .then(async userCredential => {
        const { uid } = userCredential;
        await addDoc(collection(db, 'users'), {
          uid,
          name: fname,
          email,
          type: '0',
        });
        setLoading(false);
        navigate('/home');
      })
      .catch(error => {
        setLoading(false);
        setErrorMsg(error.message);
      });
  };

  return (
    <Flex
      width="100wh"
      height="100vh"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        flexDir="column"
        mb="2"
        justifyContent="center"
        alignItems="center"
      >
        <Avatar bg="teal.500" />
        <Heading color="teal.400">Sign Up</Heading>
        <Box minW={{ base: '90%', md: '468px' }}>
          <form onSubmit={onSignUp}>
            <Stack
              spacing={4}
              p="1rem"
              backgroundColor="whiteAlpha.900"
              boxShadow="md"
            >
              <FormControl>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents="none"
                    children={<CFaUserAlt color="gray.300" />}
                  />
                  <Input
                    type="text"
                    placeholder="name"
                    value={fname}
                    onChange={e => setFName(e.target.value)}
                  />
                </InputGroup>
              </FormControl>
              <FormControl>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents="none"
                    children={<CFaEnv color="gray.300" />}
                  />
                  <Input
                    type="email"
                    placeholder="email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </InputGroup>
              </FormControl>
              <FormControl>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents="none"
                    color="gray.300"
                    children={<CFaLock color="gray.300" />}
                  />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleShowClick}>
                      {showPassword ? 'Hide' : 'Show'}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Button
                borderRadius={0}
                type="submit"
                variant="solid"
                colorScheme="teal"
                width="full"
              >
                Sign Up
                {isLoading && <Spinner ml={3} />}
              </Button>
              {errorMsg && <Text color="red.500">{errorMsg}</Text>}
            </Stack>
          </form>
        </Box>
      </Stack>
      <Box>
        Has account?{' '}
        <Link color="teal.500" href="/">
          Log In
        </Link>
      </Box>
    </Flex>
  );
};

export default App;
