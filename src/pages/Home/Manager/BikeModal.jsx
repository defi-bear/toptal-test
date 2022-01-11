import React, { useEffect, useState } from 'react';
import {
  Button,
  FormControl,
  Input,
  VStack,
  FormLabel,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

import { db } from 'utils/firebase';
import ColorPicker from 'components/ColorPicker';
import Modal from 'components/Modal';

function BikeModal({ isOpen, onClose, getBikesData, selectedBike }) {
  const [model, setModel] = useState(selectedBike.model || '');
  const [color, setColor] = useState(selectedBike.color || 'gray');
  const [location, setLocation] = useState(selectedBike.location || '');
  const [isLoading, setLoading] = useState(false);
  const toast = useToast();
  const mode = selectedBike.model ? 'Edit' : 'Create';

  useEffect(() => {
    if (selectedBike.model) {
      setModel(selectedBike.model);
      setColor(selectedBike.color);
      setLocation(selectedBike.location);
    } else {
      setModel('');
      setColor('gray');
      setLocation('');
    }
  }, [selectedBike]);

  const handleSubmit = async () => {
    setLoading(true);
    if (mode === 'Create') {
      await addDoc(collection(db, 'bikes'), {
        model,
        color,
        location,
      });
      onClose();
      getBikesData();
      toast({
        title: 'Bike created.',
        description: 'Bike has created successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    } else {
      const bikeRef = doc(db, 'bikes', selectedBike.id);
      await setDoc(bikeRef, {
        model,
        color,
        location,
      });
      onClose();
      getBikesData();
      toast({
        title: 'Bike edited.',
        description: 'Bike has edited successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      action={
        <>
          <Button mr={3} colorScheme="blue" onClick={handleSubmit}>
            {mode}
            {isLoading && <Spinner ml={3} />}
          </Button>
          <Button varint="ghost" onClick={onClose}>
            Cancel
          </Button>
        </>
      }
      label={`${mode} Bike`}
    >
      <VStack>
        <FormControl>
          <FormLabel htmlFor="model">Model</FormLabel>
          <Input
            id="model"
            type="text"
            placeholder="Model"
            value={model}
            onChange={e => setModel(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="color">Color</FormLabel>
          <ColorPicker color={color} setColor={setColor} />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="model">Location</FormLabel>
          <Input
            id="model"
            type="text"
            placeholder="Location"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </FormControl>
      </VStack>
    </Modal>
  );
}

export default BikeModal;
