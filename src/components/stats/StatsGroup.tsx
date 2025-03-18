'use client';

import { Box, Flex, SimpleGrid, Stat, StatLabel, StatNumber, useColorModeValue } from '@chakra-ui/react';

interface StatProps {
  name: string;
  value: number;
}

interface StatsGroupProps {
  stats: StatProps[];
}

export default function StatsGroup({ stats }: StatsGroupProps) {
  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 5, lg: 8 }}>
      {stats.map((stat) => (
        <StatCard key={stat.name} name={stat.name} value={stat.value} />
      ))}
    </SimpleGrid>
  );
}

function StatCard({ name, value }: StatProps) {
  const bgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Stat
      px={{ base: 4, md: 8 }}
      py={5}
      shadow="xl"
      border="1px solid"
      borderColor={useColorModeValue('gray.200', 'gray.500')}
      rounded="lg"
      bg={bgColor}
    >
      <Flex justifyContent="space-between">
        <Box pl={{ base: 2, md: 4 }}>
          <StatLabel fontWeight="medium" isTruncated color={textColor}>
            {name}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold" color={textColor}>
            {value}
          </StatNumber>
        </Box>
      </Flex>
    </Stat>
  );
} 