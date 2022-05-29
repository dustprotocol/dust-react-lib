import { useEffect, useState } from 'react';
import { DataProgress, DataWithProgress } from '../utils/dataWithProgress';
import { retrieveDustCoingeckoPrice } from '../api/prices';

export const useDustPriceInterval = (
  intervalMs: number,
): DataWithProgress<number> => {
  const [dustPrice, setDustPrice] = useState<DataWithProgress<number>>(
    DataProgress.LOADING,
  );
  useEffect(() => {
    const getPrice = async (): Promise<void> => {
      let price: number | DataProgress = DataProgress.NO_DATA;
      try {
        price = await retrieveDustCoingeckoPrice();
      } catch (e) {}
      setDustPrice(price);
    };
    const interval = setInterval(getPrice, intervalMs);
    getPrice();
    return () => {
      clearInterval(interval);
    };
  }, []);
  return dustPrice;
};
