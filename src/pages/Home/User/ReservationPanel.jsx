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
  Text,
  Select,
  useToast,
  Input,
} from '@chakra-ui/react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { RangeDatepicker } from 'chakra-dayzed-datepicker';
import _ from 'lodash';

import Table from 'components/Table';
import { db } from 'utils/firebase';
import ReserveModal from './ReserveModal';

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

const ReservationPanel = () => {
  const [bikesData, setBikesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [reservationList, setReservationList] = useState([]);
  const [selectedBIndex, setSelectedBIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [selectedDates, setSelectedDates] = useState([new Date(), new Date()]);
  const [modelList, setModelList] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [colorList, setColorList] = useState([]);
  const [selectedColor, setSelectedColor] = useState('');
  const [locationList, setLocationList] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [startRate, setStartRate] = useState('');
  const [endRate, setEndRate] = useState('');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const applyFilter = useCallback(
    (arr, rList) => {
      const tmp = [];
      arr.forEach(item => {
        if (
          (!selectedModel || selectedModel === item.model) &&
          (!selectedColor || selectedColor === item.color) &&
          (!selectedLocation || selectedLocation === item.location) &&
          ((!startRate && !endRate) ||
            (!startRate && endRate && item.rate <= parseFloat(endRate, 10)) ||
            (startRate && !endRate && item.rate >= parseFloat(startRate, 10)) ||
            (startRate &&
              endRate &&
              item.rate >= parseFloat(startRate, 10) &&
              item.rate <= parseFloat(endRate, 10)))
        ) {
          let flag = true;
          for (let i = 0; i < rList.length; i += 1) {
            if (
              rList[i].bikeId === item.id &&
              selectedDates[0] &&
              selectedDates[1]
            ) {
              if (
                rList[i].startDate.seconds * 1000 >
                selectedDates[0].getTime()
              ) {
                if (
                  selectedDates[1].getTime() >
                  rList[i].startDate.seconds * 1000
                ) {
                  flag = false;
                }
              } else if (
                selectedDates[0].getTime() <
                rList[i].endDate.seconds * 1000
              ) {
                flag = false;
              }
            }
          }
          if (flag) {
            tmp.push(item);
          }
        }
      });
      setSelectedBIndex(-1);
      setFilteredData(tmp);
    },
    [
      selectedModel,
      selectedColor,
      selectedLocation,
      selectedDates,
      startRate,
      endRate,
    ]
  );

  const getBikesData = useCallback(() => {
    setLoading(true);
    onSnapshot(collection(db, 'reserved'), reservationSnaps => {
      const reservationPromise = [];
      reservationSnaps.forEach(reservationSnap => {
        reservationPromise.push(
          new Promise(resolve => {
            resolve(reservationSnap.data());
          })
        );
      });
      Promise.all(reservationPromise).then(reservations => {
        getDocs(collection(db, 'bikes')).then(docSnaps => {
          const arr = [];
          docSnaps.forEach(docSnap => {
            arr.push({
              ...docSnap.data(),
              id: docSnap.id,
            });
          });
          setModelList(_.uniq(arr.map(item => item.model)));
          setColorList(_.uniq(arr.map(item => item.color)));
          setLocationList(_.uniq(arr.map(item => item.location)));

          onSnapshot(collection(db, 'rating'), ratingSnaps => {
            const ratingPromise = [];
            for (let i = 0; i < arr.length; i += 1) {
              arr[i] = { ...arr[i], rate: 0, sum: 0, count: 0 };
            }
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
                    arr[i].rate = parseFloat(arr[i].sum / arr[i].count).toFixed(
                      2
                    );
                  }
                }
              });
              setReservationList(reservations);
              setBikesData(arr);
              setLoading(false);
            });
          });
        });
      });
    });
  }, []);

  useEffect(() => {
    getBikesData();
  }, [getBikesData]);

  useEffect(() => {
    applyFilter(bikesData, reservationList);
  }, [bikesData, applyFilter, reservationList]);

  const onBikeClicked = index => {
    setSelectedBIndex(index);
  };

  const onReserve = () => {
    if (selectedBIndex !== -1) {
      onOpen();
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

  const onStartRateChange = e => {
    if (
      e.target.value >= 0 &&
      e.target.value <= 5 &&
      (!endRate || e.target.value <= endRate)
    ) {
      setStartRate(e.target.value);
    }
  };

  const onEndRateChange = e => {
    if (
      e.target.value >= 0 &&
      e.target.value <= 5 &&
      (!startRate || e.target.value >= startRate)
    ) {
      setEndRate(e.target.value);
    }
  };

  return (
    <Box height="100%" background="white">
      <VStack divider={<StackDivider borderColor="gray.200" />}>
        <Flex justifyContent="space-between" width="100%">
          <HStack spacing={5}>
            <HStack width="275px">
              <Text>Range:</Text>
              <RangeDatepicker
                selectedDates={selectedDates}
                onDateChange={setSelectedDates}
              />
            </HStack>
            <HStack>
              <Text>Model:</Text>
              <Select
                placeholder="Model"
                onChange={e => setSelectedModel(e.target.value)}
              >
                {modelList.map(model => (
                  <option value={model} key={model}>
                    {model}
                  </option>
                ))}
              </Select>
            </HStack>
            <HStack>
              <Text>Color:</Text>
              <Select
                placeholder="Color"
                onChange={e => setSelectedColor(e.target.value)}
              >
                {colorList.map(color => (
                  <option value={color} key={color}>
                    {color}
                  </option>
                ))}
              </Select>
            </HStack>
            <HStack>
              <Text>Location:</Text>
              <Select
                placeholder="Location"
                onChange={e => setSelectedLocation(e.target.value)}
              >
                {locationList.map(location => (
                  <option value={location} key={location}>
                    {location}
                  </option>
                ))}
              </Select>
            </HStack>
            <HStack>
              <Text>Rate:</Text>
              <Input
                value={startRate}
                onChange={onStartRateChange}
                width={65}
              />
              <Text>-</Text>
              <Input value={endRate} onChange={onEndRateChange} width={65} />
            </HStack>
          </HStack>
          <HStack>
            <Button colorScheme="blue" onClick={onReserve}>
              Reserve
            </Button>
          </HStack>
        </Flex>
        <Box width="100%">
          {loading ? (
            <Spinner />
          ) : (
            <Table
              columns={bikeColumns}
              data={filteredData}
              onRowClick={onBikeClicked}
              selectedIndex={selectedBIndex}
            />
          )}
        </Box>
      </VStack>
      <ReserveModal
        isOpen={isOpen}
        onClose={onClose}
        bike={selectedBIndex !== -1 ? filteredData[selectedBIndex] : {}}
        getBikesData={getBikesData}
      />
    </Box>
  );
};

export default ReservationPanel;
