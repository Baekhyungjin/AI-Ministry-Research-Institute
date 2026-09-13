'use client';

import { useEffect, useState } from 'react';
import { CollectionName, StoredRecord, subscribeRecords } from './repository';

export function useRecords<T extends StoredRecord>(name: CollectionName, seed: T[], publishedOnly = false, selectedFields = '*') {
  const [records, setRecords] = useState<T[]>(seed);
  const [loading, setLoading] = useState(false);

  useEffect(() => subscribeRecords(name, seed, (next) => {
    setRecords(next);
    setLoading(false);
  }, publishedOnly, selectedFields), [name, seed, publishedOnly, selectedFields]);

  return { records, loading };
}
