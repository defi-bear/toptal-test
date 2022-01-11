import React from 'react';
import { Text, Button } from '@chakra-ui/react';

import Modal from '../Modal';

const DeleteModal = ({ title, label, isOpen, onDelete, onClose }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    action={
      <>
        <Button onClick={onDelete} mr={3} colorScheme="blue">
          Delete
        </Button>
        <Button varint="ghost" onClick={onClose}>
          Cancel
        </Button>
      </>
    }
    label={`Delete ${label}`}
  >
    <Text>{`Are you sure want to delete this ${title} ${label.toLowerCase()}`}</Text>
  </Modal>
);

export default DeleteModal;
