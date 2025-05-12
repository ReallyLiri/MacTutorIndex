import {useEffect, useState} from 'react';
import {collection, getDocs} from 'firebase/firestore';
import {db} from '../lib/firebase';
import {Filters, Mathematician} from '../types';

export const useFirestore = (filters?: Filters) => {
  const [mathematicians, setMathematicians] = useState<Mathematician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMathematicians = async () => {
      try {
        setLoading(true);
        // Default year range if not specified
        const minYear = filters?.yearRange?.[0] || 1750;
        const maxYear = filters?.yearRange?.[1] || 1800;
        
        // Create a query with filters
        let mathematiciansRef = collection(db, 'l2');
        
        // Note: Firebase doesn't support multiple array-contains queries in a single query
        // So we're still fetching based on the year range and will filter the rest client-side
        
        const querySnapshot = await getDocs(mathematiciansRef);
        let mathematiciansData = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Mathematician))
          // First filter by birth year since it's the most effective
          .filter(m => {
            const birthYear = m.born?.year;
            return birthYear !== null && birthYear >= minYear && birthYear <= maxYear;
          });
        
        // Apply additional filters on the client side if needed
        if (filters) {
          // Location filter
          if (filters.locations.length > 0) {
            mathematiciansData = mathematiciansData.filter(mathematician => {
              const allLocations = [
                ...(mathematician.lived_in || []),
                ...(mathematician.worked_in || []),
                mathematician.born?.place,
                mathematician.died?.place
              ].filter(Boolean) as string[];
              
              return filters.locations.some(location => 
                allLocations.some(loc => loc.toLowerCase().includes(location.toLowerCase()))
              );
            });
          }
          
          // Religion filter
          if (filters.religions.length > 0) {
            mathematiciansData = mathematiciansData.filter(mathematician => 
              mathematician.religions?.some(religion => filters.religions.includes(religion))
            );
          }
          
          // Institution filter
          if (filters.institutions.length > 0) {
            mathematiciansData = mathematiciansData.filter(mathematician => 
              mathematician.institution_affiliation?.some(institution => 
                filters.institutions.includes(institution)
              )
            );
          }
          
          // Specific mathematicians filter
          if (filters.mathematicians.length > 0) {
            mathematiciansData = mathematiciansData.filter(mathematician => 
              filters.mathematicians.includes(mathematician.id)
            );
          }
        }
        
        setMathematicians(mathematiciansData);
      } catch (err) {
        console.error('Error fetching mathematicians:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchMathematicians();
  }, [filters]);

  return { mathematicians, loading, error };
};