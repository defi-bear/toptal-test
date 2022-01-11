import React, { useState } from 'react';
import { Button, Text, useToast, Spinner } from '@chakra-ui/react';
import { deleteDoc, doc } from 'firebase/firestore';

import { db } from 'utils/firebase';
import Modal from 'components/Modal';

const CancelModel = ({ isOpen, id, onClose, getReservationData }) => {
  const toast = useToast();
  const [isLoading, setLoading] = useState(false);

  const onCancel = async () => {
    setLoading(true);
    await deleteDoc(doc(db, 'reserved', id));
    setLoading(false);
    getReservationData();
    onClose();
    toast({
      title: 'Reservation deleted.',
      description: 'Reservation has deleted successfully.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      label="Cancel Reservation"
      action={
        <Button onClick={onCancel} mr={3} colorScheme="blue">
          Cancel
          {isLoading && <Spinner ml={3} />}
        </Button>
      }
    >
      <Text>Are you sure want to cancel this reservation</Text>
    </Modal>
  );
};

export default CancelModel;
