import React, { useState } from 'react';
import { Button, Spinner, useToast } from '@chakra-ui/react';
import { collection, addDoc } from 'firebase/firestore';

import { useAuth } from 'hooks/useAuth';
import { db } from 'utils/firebase';
import Rating from 'components/Rating';
import Modal from 'components/Modal';

const RatingModal = ({ isOpen, onClose, bike, getBikesData }) => {
  const [rate, setRate] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  const onRate = async () => {
    if (rate) {
      setLoading(true);
      await addDoc(collection(db, 'rating'), {
        userId: user.uid,
        bikeId: bike.bikeId,
        rate,
      });
      toast({
        title: 'Rate success.',
        description: `Successfully rate ${bike.model}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
      onClose();
      getBikesData();
    } else {
      toast({
        title: 'Rate failed.',
        description: 'Please select 1-5.',
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
      label={`Rate ${bike.model}`}
      action={
        <>
          <Button onClick={onRate} mr={3} colorScheme="blue">
            Rate
            {isLoading && <Spinner ml={3} />}
          </Button>
          <Button varint="ghost" onClick={onClose}>
            Cancel
          </Button>
        </>
      }
    >
      <Rating
        size={48}
        scale={5}
        fillColor="gold"
        rating={rate}
        setRating={setRate}
      />
    </Modal>
  );
};

export default RatingModal;
