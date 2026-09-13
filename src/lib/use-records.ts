'use client';

import { useEffect, useState } from 'react';
import { CollectionName, StoredRecord, subscribeRecords } from './repository';

export function useRecords<T extends StoredRecord>(name: CollectionName, seed: T[], publishedOnly = false, selectedFields = '*') {
  const [records, setRecords] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => subscribeRecords(name, seed, (next) => {
    setRecords(next);
    setLoading(false);
  }, publishedOnly, selectedFields, setError), [name, seed, publishedOnly, selectedFields]);

  return { records, loading, error };
}
