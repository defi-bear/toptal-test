import React, { useState, useEffect, useCallback } from 'react';
import { Spinner } from '@chakra-ui/react';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { db } from 'utils/firebase';
import Table from 'components/Table';
import Modal from 'components/Modal';

const columns = [
  {
    Header: 'Name',
    accessor: 'name',
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

function BikeReservationModal({ isOpen, onClose, selectedBike }) {
  const [loading, setLoading] = useState(false);
  const [reservationData, setReservationData] = useState([]);

  const getReservations = useCallback(() => {
    if (selectedBike && selectedBike.id) {
      setLoading(true);
      const q = query(
        collection(db, 'reserved'),
        where('bikeId', '==', selectedBike.id)
      );
      getDocs(q).then(querySnapshot => {
        const promises = [];
        querySnapshot.forEach(docSnapshot =>
          promises.push(
            new Promise(resolve => {
              const { userId } = docSnapshot.data();
              getDocs(
                query(collection(db, 'users'), where('uid', '==', userId))
              ).then(userSnapshot => {
                userSnapshot.forEach(userData => {
                  resolve({
                    ...userData.data(),
                    ...docSnapshot.data(),
                  });
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
  }, [selectedBike]);

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

export default BikeReservationModal;
