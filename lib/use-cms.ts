import { useState, useEffect, useCallback } from 'react';
import { CMSSection, CMSSectionsResponse, cmsApi, CMSResponse } from './cms';

export function useCMSSections(activeOnly = true) {
  const [sections, setSections] = useState<CMSSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await cmsApi.sections.getAll();
      if (response.success && response.data.sections) {
        const filtered = activeOnly
          ? response.data.sections.filter((s) => s.status === 'active')
          : response.data.sections;
        setSections(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch CMS sections:', err);
      setError('Failed to load sections');
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  return { sections, loading, error, refetch: fetchSections };
}

export function useCMSSection(sectionKey: string) {
  const [section, setSection] = useState<CMSSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSection = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await cmsApi.sections.getByKey(sectionKey);
      if (response.success && response.data.section) {
        setSection(response.data.section);
      }
    } catch (err) {
      console.error(`Failed to fetch section ${sectionKey}:`, err);
      setError(`Failed to load section`);
    } finally {
      setLoading(false);
    }
  }, [sectionKey]);

  useEffect(() => {
    if (sectionKey) {
      fetchSection();
    }
  }, [fetchSection, sectionKey]);

  return { section, loading, error, refetch: fetchSection };
}

export function useCMSNavigation(location: string) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNavigation() {
      setLoading(true);
      setError(null);

      try {
        const response = await cmsApi.navigation.get(location);
        if (response.success && response.data.navigation) {
          setItems(response.data.navigation.items || []);
        }
      } catch (err) {
        console.error(`Failed to fetch navigation ${location}:`, err);
        setError('Failed to load navigation');
      } finally {
        setLoading(false);
      }
    }

    if (location) {
      fetchNavigation();
    }
  }, [location]);

  return { items, loading, error };
}
