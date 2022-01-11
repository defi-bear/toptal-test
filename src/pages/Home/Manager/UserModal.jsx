import React, { useEffect, useState } from 'react';
import {
  Button,
  FormControl,
  Input,
  VStack,
  FormLabel,
  useToast,
  RadioGroup,
  Stack,
  Radio,
  InputGroup,
  InputRightElement,
  Spinner,
} from '@chakra-ui/react';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

import { db } from 'utils/firebase';
import Modal from 'components/Modal';

function UserModal({ isOpen, onClose, getUsersData, selectedUser }) {
  const [name, setName] = useState(selectedUser.name || '');
  const [email, setEmail] = useState(selectedUser.email || '');
  const [type, setType] = useState(selectedUser.type || '');
  const [password, setPassword] = useState('');
  const [showPassword, handleShowClick] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const toast = useToast();
  const mode = selectedUser.name ? 'Edit' : 'Create';

  useEffect(() => {
    if (selectedUser.name) {
      setName(selectedUser.name);
      setEmail(selectedUser.email);
      setType(selectedUser.type);
    } else {
      setName('');
      setEmail('');
      setType('');
    }
  }, [selectedUser]);

  const handleSubmit = async () => {
    setLoading(true);
    if (mode === 'Create') {
      const auth = getAuth();
      createUserWithEmailAndPassword(auth, email, password).then(
        async userCredential => {
          const { user } = userCredential;
          await addDoc(collection(db, 'users'), {
            uid: user.uid,
            name,
            email,
            type,
          });
          setLoading(false);
          onClose();
          getUsersData();
          toast({
            title: 'User created.',
            description: 'User has created successfully.',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
      );
    } else {
      const userRef = doc(db, 'users', selectedUser.id);
      await setDoc(userRef, {
        name,
        email,
        type,
      });
      setLoading(false);
      onClose();
      getUsersData();
      toast({
        title: 'User edited.',
        description: 'User has edited successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      label={`${mode} User`}
      action={
        <>
          <Button onClick={handleSubmit} mr={3} colorScheme="blue">
            {mode}
            {isLoading && <Spinner ml={3} />}
          </Button>
          <Button varint="ghost" onClick={onClose}>
            Cancel
          </Button>
        </>
      }
    >
      <VStack>
        <FormControl>
          <FormLabel htmlFor="model">Name</FormLabel>
          <Input
            id="model"
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="email">Email</FormLabel>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </FormControl>
        {mode === 'Create' ? (
          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <InputGroup>
              <Input
                id="password"
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
        ) : null}
        <FormControl>
          <FormLabel htmlFor="model">Type</FormLabel>
          <RadioGroup onChange={setType} value={type.toString()}>
            <Stack direction="row">
              <Radio value="0">User</Radio>
              <Radio value="1">Manager</Radio>
            </Stack>
          </RadioGroup>
        </FormControl>
      </VStack>
    </Modal>
  );
}

export default UserModal;
