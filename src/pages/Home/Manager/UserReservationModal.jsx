import React, { useState, useEffect, useCallback } from 'react';
import { Spinner } from '@chakra-ui/react';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from 'firebase/firestore';

import { db } from 'utils/firebase';
import Table from 'components/Table';
import Modal from 'components/Modal';

const columns = [
  {
    Header: 'Model',
    accessor: 'model',
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

function UserReservationModal({ isOpen, onClose, selectedUser }) {
  const [loading, setLoading] = useState(false);
  const [reservationData, setReservationData] = useState([]);

  const getReservations = useCallback(() => {
    if (selectedUser && selectedUser.uid) {
      setLoading(true);
      const q = query(
        collection(db, 'reserved'),
        where('userId', '==', selectedUser.uid)
      );
      getDocs(q).then(querySnapshot => {
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
                });
              });
            })
          )
        );

        Promise.all(promises).then(results => {
          setReservationData(results);
          setLoading(false);
        });
      });
    }
  }, [selectedUser]);

  useEffect(() => {
    getReservations();
  }, [getReservations]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} label="Reservation">
      {loading ? (
        <Spinner />
      ) : (
        <Table columns={columns} data={reservationData} />
      )}
    </Modal>
  );
}

export default UserReservationModal;
