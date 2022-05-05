import { gql, useQuery } from "@apollo/client";

// Data interfaces
interface Supply {
  total_supply: number;
  supply: number;
}
interface Volume {
  amount_1: number;
  amount_2: number;
}
interface Fee {
  fee_1: number;
  fee_2: number;
}

interface Reserves {
  reserved_1: number;
  reserved_2: number;
  total_supply: number;
}

interface ContractData {
  symbol: string;
  name: string;
  decimals: number;
}

interface Pool {
  address: string;
  supply: Supply[];
  symbol_1: string;
  symbol_2: string;
  decimal_1: number;
  decimal_2: number;
  volume_aggregate: { aggregate: { sum: Volume } };
}

interface PoolData {
  id: number;
  address: string;
  token_contract_1: {
    address: string;
    verified_contract: null | {
      contract_data: ContractData;
    };
  };
  token_contract_2: {
    address: string;
    verified_contract: null | {
      contract_data: ContractData;
    };
  };
}

interface PoolCount {
  verified_pool_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

// Query result interfaces
type VolumeQuery = {
  pool_hour_volume_aggregate: { aggregate: { sum: Volume } };
};
type SupplyQuery = { pool_minute_supply: Supply[] };
type FeeQuery = {
  pool_hour_fee_aggregate: {
    aggregate: {
      sum: Fee;
    };
  };
};

type PoolQuery = { pool: PoolData[] };
type PoolsQuery = { verified_pool: Pool[] };
type ReservesQuery = { pool_event: Reserves[] };

// Query variable interfaces
interface FromVar {
  fromTime: string;
}

interface AddressVar {
  address: string;
}

interface FeeVar extends FromVar, AddressVar {}
interface VolumeVar extends FeeVar {
  toTime: string;
}
interface PoolVar extends FromVar {
  offset: number;
  search: { _ilike?: string };
}

// Graphql statements
const POOL_SUPPLY_GQL = gql`
  query pool_supply($address: String!) {
    pool_minute_supply(
      where: { pool: { address: { _ilike: $address } } }
      order_by: { timeframe: desc }
      limit: 1
    ) {
      total_supply
      supply
      timeframe
    }
  }
`;

const POOL_VOLUME_GQL = gql`
  query pool_volume(
    $address: String!
    $fromTime: timestamptz!
    $toTime: timestamptz!
  ) {
    pool_hour_volume_aggregate(
      where: {
        _and: [
          { pool: { address: { _ilike: $address } } }
          { timeframe: { _gte: $fromTime } }
          { timeframe: { _lt: $toTime } }
        ]
      }
    ) {
      aggregate {
        sum {
          amount_1
          amount_2
        }
      }
    }
  }
`;

const POOL_FEES_GQL = gql`
  query pool_fee($address: String!, $fromTime: timestamptz!) {
    pool_hour_fee_aggregate(
      where: {
        pool: { address: { _ilike: $address } }
        timeframe: { _gte: $fromTime }
      }
    ) {
      aggregate {
        sum {
          fee_1
          fee_2
        }
      }
    }
  }
`;

const POOL_GQL = gql`
  query pool($address: String!) {
    pool(where: { address: { _ilike: $address } }) {
      id
      address
      token_contract_1 {
        verified_contract {
          contract_data
        }
        address
      }
      token_contract_2 {
        verified_contract {
          contract_data
        }
        address
      }
    }
  }
`;

const POOL_CURRENT_RESERVES_GQL = gql`
  query pool_event($address: String!) {
    pool_event(
      where: { pool: { address: { _ilike: $address } }, type: { _eq: "Sync" } }
      order_by: { timestamp: desc }
      limit: 1
    ) {
      reserved_1
      reserved_2
    }
  }
`;

const POOLS_GQL = gql`
  query pool(
    $offset: Int!
    $search: String_comparison_exp!
    $fromTime: timestamptz!
  ) {
    verified_pool(
      where: {
        _or: [
          { name_1: $search }
          { name_2: $search }
          { address: $search }
          { symbol_1: $search }
          { symbol_2: $search }
        ]
      }
      order_by: { supply_aggregate: { sum: { supply: desc } } }
      limit: 10
      offset: $offset
    ) {
      address
      supply(limit: 1, order_by: { timeframe: desc }) {
        total_supply
        supply
      }
      volume_aggregate(where: { timeframe: { _gte: $fromTime } }) {
        aggregate {
          sum {
            amount_1
            amount_2
          }
        }
      }
      symbol_1
      symbol_2
      decimal_1
      decimal_2
    }
  }
`;

const POOL_COUNT_GQL = gql`
  query pool_count($search: String_comparison_exp!) {
    verified_pool_aggregate(
      where: {
        _or: [
          { name_1: $search }
          { name_2: $search }
          { address: $search }
          { symbol_1: $search }
          { symbol_2: $search }
        ]
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

// Intermediat query hooks
export const useDayVolume = (
  address: string,
  fromTime: string,
  toTime: string
) =>
  useQuery<VolumeQuery, VolumeVar>(POOL_VOLUME_GQL, {
    variables: {
      address,
      fromTime,
      toTime,
    },
  });
export const useCurrentPoolSupply = (address: string) =>
  useQuery<SupplyQuery, AddressVar>(POOL_SUPPLY_GQL, {
    variables: { address },
  });
export const useDayFee = (address: string, fromTime: string) =>
  useQuery<FeeQuery, FeeVar>(POOL_FEES_GQL, {
    variables: { address, fromTime },
  });
export const usePoolQuery = (address: string) =>
  useQuery<PoolQuery, AddressVar>(POOL_GQL, {
    variables: { address },
  });

export const useCurrentPoolReserve = (address: string) =>
  useQuery<ReservesQuery, AddressVar>(POOL_CURRENT_RESERVES_GQL, {
    variables: { address },
  });

export const usePools = (fromTime: string, offset: number, search?: string) =>
  useQuery<PoolsQuery, PoolVar>(POOLS_GQL, {
    variables: {
      fromTime,
      offset,
      search: search ? { _ilike: `${search}%` } : {},
    },
  });
export const usePoolCount = () => useQuery<PoolCount>(POOL_COUNT_GQL);