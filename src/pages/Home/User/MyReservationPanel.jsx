import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Spinner,
  VStack,
  StackDivider,
  Flex,
  HStack,
  Button,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import {
  collection,
  onSnapshot,
  query,
  where,
  getDoc,
  doc,
} from 'firebase/firestore';

import Table from 'components/Table';
import { db } from 'utils/firebase';
import { useAuth } from 'hooks/useAuth';
import CancelModel from './CancelModal';
import RatingModal from './RatingModal';

const columns = [
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
  {
    Header: 'Start Date',
    accessor: 'startDate',
  },
  {
    Header: 'End Date',
    accessor: 'endDate',
  },
];

const MyReservationPanel = () => {
  const [reservationData, setReservationData] = useState([]);
  const [selectedBIndex, setSelectedBIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenRateModal,
    onOpen: onOpenRateModal,
    onClose: onCloseRateModal,
  } = useDisclosure();
  const { user } = useAuth();
  const toast = useToast();

  const getReservationData = useCallback(() => {
    if (user && user.uid) {
      setLoading(true);
      const q = query(
        collection(db, 'reserved'),
        where('userId', '==', user.uid)
      );
      onSnapshot(q, querySnapshot => {
        const promises = [];
        querySnapshot.forEach(docSnapshot =>
          promises.push(
            new Promise(resolve => {
              const { bikeId } = docSnapshot.data();
              getDoc(doc(db, 'bikes', bikeId)).then(bikeData => {
                resolve({
                  ...bikeData.data(),
                  ...docSnapshot.data(),
                  id: docSnapshot.id,
                  sum: 0,
                  count: 0,
                });
              });
            })
          )
        );

        Promise.all(promises).then(results => {
          onSnapshot(collection(db, 'rating'), ratingSnaps => {
            const ratingPromise = [];
            ratingSnaps.forEach(ratingSnap => {
              ratingPromise.push(
                new Promise(resolve => {
                  resolve({ ...ratingSnap.data() });
                })
              );
            });
            Promise.all(ratingPromise).then(ratings => {
              ratings.forEach(rating => {
                for (let i = 0; i < results.length; i += 1) {
                  if (rating.bikeId === results[i].bikeId) {
                    results[i].sum += rating.rate;
                    results[i].count += 1;
                    results[i].rate = parseFloat(
                      results[i].sum / results[i].count
                    ).toFixed(2);
                  }
                }
              });

              setReservationData(results);
              setLoading(false);
            });
          });
        });
      });
    }
  }, [user]);

  useEffect(() => {
    getReservationData();
  }, [getReservationData]);

  const onClicked = index => {
    setSelectedBIndex(index);
  };

  const onCancel = () => {
    if (selectedBIndex !== -1) {
      onOpen();
    } else {
      toast({
        title: 'Select one',
        description: 'Select one reservation.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const onRate = () => {
    if (selectedBIndex !== -1) {
      onOpenRateModal();
    } else {
      toast({
        title: 'Select a bike.',
        description: 'Please select a bike.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box height="100%" background="white">
      <VStack divider={<StackDivider borderColor="gray.200" />}>
        <Flex justifyContent="flex-end" width="100%">
          <HStack>
            <Button colorScheme="blue" onClick={onRate}>
              Rate
            </Button>
            <Button colorScheme="blue" onClick={onCancel}>
              Cancel
            </Button>
          </HStack>
        </Flex>
        <Box width="100%">
          {loading ? (
            <Spinner />
          ) : (
            <Table
              columns={columns}
              data={reservationData}
              onRowClick={onClicked}
              selectedIndex={selectedBIndex}
            />
          )}
        </Box>
      </VStack>
      <CancelModel
        isOpen={isOpen}
        onClose={onClose}
        id={
          selectedBIndex !== -1 && reservationData.length
            ? reservationData[selectedBIndex]?.id
            : ''
        }
        getReservationData={getReservationData}
      />
      <RatingModal
        isOpen={isOpenRateModal}
        onClose={onCloseRateModal}
        bike={
          selectedBIndex !== -1 && reservationData.length
            ? reservationData[selectedBIndex]
            : {}
        }
        getBikesData={getReservationData}
      />
    </Box>
  );
};

export default MyReservationPanel;
