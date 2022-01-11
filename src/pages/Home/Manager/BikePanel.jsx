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
import BikeModal from './BikeModal';
import BikeReservationModal from './BikeReservationModal';

const bikeColumns = [
  {
    Header: 'Model',
    accessor: 'model',
  },
  {
    Header: 'Color',
    accessor: 'color',
  },
  {
    Header: 'Location',
    accessor: 'location',
  },
  {
    Header: 'Rate',
    accessor: 'rate',
  },
];

const BikePanel = () => {
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
  const [bikesData, setBikesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBIndex, setSelectedBIndex] = useState(-1);
  const [selectedBike, setSelectedBike] = useState({});
  const toast = useToast();

  const getBikesData = useCallback(() => {
    setLoading(true);
    getDocs(collection(db, 'bikes')).then(docSnaps => {
      const arr = [];
      docSnaps.forEach(docSnap => {
        arr.push({
          ...docSnap.data(),
          id: docSnap.id,
          rate: 0,
          sum: 0,
          count: 0,
        });
      });

      const ratingPromise = [];
      getDocs(collection(db, 'rating')).then(ratingSnaps => {
        ratingSnaps.forEach(ratingSnap => {
          ratingPromise.push(
            new Promise(resolve => {
              resolve(ratingSnap.data());
            })
          );
        });
        Promise.all(ratingPromise).then(ratings => {
          ratings.forEach(rating => {
            for (let i = 0; i < arr.length; i += 1) {
              if (rating.bikeId === arr[i].id) {
                arr[i].sum += rating.rate;
                arr[i].count += 1;
                arr[i].rate = arr[i].sum / arr[i].count;
              }
            }
          });
          setBikesData(arr);
          setLoading(false);
        });
      });
    });
  }, []);

  const onBikeClicked = index => {
    setSelectedBIndex(index);
  };

  const onCreateBike = () => {
    setSelectedBike({});
    onOpen();
  };

  const onEditBike = () => {
    if (selectedBIndex === -1) {
      toast({
        title: 'Select one bike.',
        description: 'You should select one bike for edit.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } else {
      setSelectedBike(bikesData[selectedBIndex]);
      onOpen();
    }
  };

  const onDeleteBike = () => {
    if (selectedBIndex === -1) {
      toast({
        title: 'Select one bike.',
        description: 'You should select one bike for delete.',
        status: +-+-+'error',
        duration: 5000,
        isClosable: true,
      });
    } else {
      onOpenDeleteModal();
    }
  };

  const onDelete = async () => {
    await deleteDoc(doc(db, 'bikes', bikesData[selectedBIndex].id));
    onClose();
    getBikesData();
    toast({
      title: 'Bike deleted.',
      description: 'Bike has deleted successfully.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const onReservation = () => {
    setSelectedBike(bikesData[selectedBIndex]);
    onOpenReservModal();
  };

  useEffect(() => {
    getBikesData();
  }, [getBikesData]);

  return (
    <Box>
      <VStack mt={3} divider={<StackDivider borderColor="gray.200" />}>
        <Flex justifyContent="flex-end" width="100%">
          <HStack>
            <Button colorScheme="blue" onClick={onCreateBike}>
              Create
            </Button>
            <Button colorScheme="blue" onClick={onEditBike}>
              Edit
            </Button>
            <Button colorScheme="blue" onClick={onDeleteBike}>
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
              columns={bikeColumns}
              data={bikesData}
              onRowClick={onBikeClicked}
              selectedIndex={selectedBIndex}
            />
          )}
        </Box>
      </VStack>
      <BikeModal
        isOpen={isOpen}
        onClose={onClose}
        getBikesData={getBikesData}
        selectedBike={selectedBike}
      />
      <DeleteModal
        label="Bike"
        title={selectedBIndex !== -1 && bikesData[selectedBIndex].model}
        isOpen={isOpenDeleteModal}
        onClose={onCloseDeleteModal}
        onDelete={onDelete}
      />
      <BikeReservationModal
        isOpen={isOpenReservModal}
        onClose={onCloseReservModal}
        selectedBike={selectedBike}
      />
    </Box>
  );
};

export default BikePanel;
