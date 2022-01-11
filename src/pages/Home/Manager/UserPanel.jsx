import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  Button,
  HStack,
  Flex,
  StackDivider,
  useDisclosure,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';

import DeleteModal from 'components/DeleteModal';
import { db } from 'utils/firebase';
import Table from 'components/Table';
import UserModal from './UserModal';
import UserReservationModal from './UserReservationModal';

const userColumns = [
  {
    Header: 'Name',
    accessor: 'name',
  },
  {
    Header: 'Email',
    accessor: 'email',
  },
  {
    Header: 'Type',
    accessor: 'type',
  },
];

const UserPanel = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenDeleteModal,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal,
  } = useDisclosure();
  const {
    isOpen: isOpenReservModal,
    onOpen: onOpenReservModal,
    onClose: onCloseReservModal,
  } = useDisclosure();
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUIndex, setSelectedUIndex] = useState(-1);
  const [selectedUser, setSelectedUser] = useState({});
  const toast = useToast();

  const getUsersData = useCallback(() => {
    setLoading(true);
    getDocs(collection(db, 'users')).then(docSnaps => {
      const arr = [];
      docSnaps.forEach(docSnap => {
        arr.push({ ...docSnap.data(), id: docSnap.id });
      });
      setUsersData(arr);
      setLoading(false);
    });
  }, []);

  const onUserClicked = index => {
    setSelectedUIndex(index);
  };

  const onCreateUser = () => {
    setSelectedUser({});
    onOpen();
  };

  const onEditUser = () => {
    if (selectedUIndex === -1) {
      toast({
        title: 'Select one user.',
        description: 'You should select one user for edit.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } else {
      setSelectedUser(usersData[selectedUIndex]);
      onOpen();
    }
  };

  const onDeleteUser = () => {
    if (selectedUIndex === -1) {
      toast({
        title: 'Select one user.',
        description: 'You should select one user for delete.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } else {
      setSelectedUser(usersData[selectedUIndex]);
      onOpenDeleteModal();
    }
  };

  const onDelete = async () => {
    await deleteDoc(doc(db, 'users', usersData[selectedUIndex].id));
    onClose();
    getUsersData();
    toast({
      title: 'User deleted.',
      description: 'User has deleted successfully.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const onReservation = () => {
    setSelectedUser(usersData[selectedUIndex]);
    onOpenReservModal();
  };

  useEffect(() => {
    getUsersData();
  }, [getUsersData]);

  return (
    <Box>
      <VStack mt={3} divider={<StackDivider borderColor="gray.200" />}>
        <Flex justifyContent="flex-end" width="100%">
          <HStack>
            <Button colorScheme="blue" onClick={onCreateUser}>
              Create
            </Button>
            <Button colorScheme="blue" onClick={onEditUser}>
              Edit
            </Button>
            <Button colorScheme="blue" onClick={onDeleteUser}>
              Delete
            </Button>
            <Button colorScheme="blue" onClick={onReservation}>
              Reservation
            </Button>
          </HStack>
        </Flex>
        <Box width="100%">
          {loading ? (
            <Spinner />
          ) : (
            <Table
              columns={userColumns}
              data={usersData}
              onRowClick={onUserClicked}
              selectedIndex={selectedUIndex}
            />
          )}
        </Box>
      </VStack>
      <UserModal
        isOpen={isOpen}
        onClose={onClose}
        getUsersData={getUsersData}
        selectedUser={selectedUser}
      />
      <DeleteModal
        label="User"
        title={selectedUser.name}
        isOpen={isOpenDeleteModal}
        onClose={onCloseDeleteModal}
        onDelete={onDelete}
      />
      <UserReservationModal
        isOpen={isOpenReservModal}
        onClose={onCloseReservModal}
        selectedUser={selectedUser}
      />
    </Box>
  );
};

export default UserPanel;
