import React from 'react';
import { Box, Stack, Text } from '@chakra-ui/react';
import { FaStar } from 'react-icons/fa';

const Rating = ({ size, scale, fillColor, rating, setRating }) => {
  const buttons = [];

  const onClick = idx => {
    if (idx) {
      if (rating === 1 && idx === 1) {
        setRating(0);
      } else {
        setRating(idx);
      }
    }
  };

  const RatingIcon = React.memo(({ fill }) => (
    <FaStar
      size={`${size}px`}
      color={fillColor}
      onClick={onClick}
      fillOpacity={fill ? '100%' : '30%'}
    />
  ));

  const RatingButton = React.memo(({ idx, fill }) => (
    <Box
      as="button"
      aria-label={`Rate ${idx}`}
      height={`${size}px`}
      width={`${size}px`}
      variant="unstyled"
      mx={1}
      onClick={() => onClick(idx)}
      _focus={{ outline: 0 }}
    >
      <RatingIcon fill={fill} />
    </Box>
  ));

  for (let i = 1; i <= scale; i += 1) {
    buttons.push(<RatingButton key={i} idx={i} fill={i <= rating} />);
  }

  return (
    <Stack isInline mt={8} justify="center">
      <input name="rating" type="hidden" value={rating} />
      {buttons}
      <Box width={`${size * 1.5}px`} textAlign="center">
        <Text fontSize="sm" textTransform="uppercase">
          Rating
        </Text>
        <Text fontSize="2xl" fontWeight="semibold" lineHeight="1.2em">
          {rating}
        </Text>
      </Box>
    </Stack>
  );
};

export default Rating;
