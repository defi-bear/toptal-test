import React, { useState } from 'react';
import { Button, Text, useToast, Spinner } from '@chakra-ui/react';
import { RangeDatepicker } from 'chakra-dayzed-datepicker';
import { collection, addDoc } from 'firebase/firestore';

import { useAuth } from 'hooks/useAuth';
import { db } from 'utils/firebase';
import Modal from 'components/Modal';

const ReserveModal = ({ isOpen, onClose, bike, getBikesData }) => {
  const [selectedDates, setSelectedDates] = useState([new Date(), new Date()]);
  const [isLoading, setLoading] = useState(false);

  const { user } = useAuth();
  const toast = useToast();

  const onReserve = async () => {
    setLoading(true);
    if (selectedDates[0] && selectedDates[1]) {
      await addDoc(collection(db, 'reserved'), {
        userId: user.uid,
        bikeId: bike.id,
        startDate: selectedDates[0],
        endDate: selectedDates[1],
      });
      setLoading(false);
      getBikesData();
      onClose();
      toast({
        title: 'Reservation success.',
        description: 'Reservation has made successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } else {
      setLoading(false);
      toast({
        title: 'Error.',
        description: 'Please select both start date and end date.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      label="Reserve Bike"
      action={
        <>
          <Button onClick={onReserve} mr={3} colorScheme="blue">
            Reserve
            {isLoading && <Spinner ml={3} />}
          </Button>
          <Button varint="ghost" onClick={onClose}>
            Cancel
          </Button>
        </>
      }
    >
      <Text
        mb={3}
      >{`Select the period of date that you need to reserve this ${bike.model}`}</Text>

      <RangeDatepicker
        selectedDates={selectedDates}
        onDateChange={setSelectedDates}
      />
    </Modal>
  );
};

export default ReserveModal;
