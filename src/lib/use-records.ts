'use client';

import { useEffect, useState } from 'react';
import { CollectionName, StoredRecord, subscribeRecords } from './repository';

export function useRecords<T extends StoredRecord>(name: CollectionName, seed: T[], publishedOnly = false) {
  const [records, setRecords] = useState<T[]>(seed);
  const [loading, setLoading] = useState(true);

  useEffect(() => subscribeRecords(name, seed, (next) => {
    setRecords(next);
    setLoading(false);
  }, publishedOnly), [name, seed, publishedOnly]);

  return { records, loading };
}
