import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Filters, Mathematician } from "../types";

export const useFirestore = (filters?: Filters) => {
  const [mathematicians, setMathematicians] = useState<Mathematician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMathematicians = async () => {
      try {
        setLoading(true);
        const minYear = filters?.yearRange?.[0] || 1750;
        const maxYear = filters?.yearRange?.[1] || 1800;

        let mathematiciansRef = collection(db, "l2");

        const querySnapshot = await getDocs(mathematiciansRef);
        let mathematiciansData = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }) as Mathematician)
          .filter((m) => {
            const birthYear = m.born?.year;
            return (
              birthYear !== null && birthYear >= minYear && birthYear <= maxYear
            );
          });

        if (filters) {
          if (filters.locations.length > 0) {
            mathematiciansData = mathematiciansData.filter((mathematician) => {
              const allLocations = [
                ...(mathematician.lived_in || []),
                ...(mathematician.worked_in || []),
                mathematician.born?.place,
                mathematician.died?.place,
              ].filter(Boolean) as string[];

              return filters.locations.some((location) =>
                allLocations.some((loc) =>
                  loc.toLowerCase().includes(location.toLowerCase()),
                ),
              );
            });
          }

          if (filters.religions.length > 0) {
            mathematiciansData = mathematiciansData.filter((mathematician) =>
              mathematician.religions?.some((religion) =>
                filters.religions.includes(religion),
              ),
            );
          }

          if (filters.institutions.length > 0) {
            mathematiciansData = mathematiciansData.filter((mathematician) =>
              mathematician.institution_affiliation?.some((institution) =>
                filters.institutions.includes(institution),
              ),
            );
          }

          if (filters.worked_in.length > 0) {
            mathematiciansData = mathematiciansData.filter((mathematician) =>
              mathematician.worked_in?.some((place) =>
                filters.worked_in.includes(place)
              )
            );
          }
          
          if (filters.profession.length > 0) {
            mathematiciansData = mathematiciansData.filter((mathematician) =>
              mathematician.profession?.some((prof) =>
                filters.profession.includes(prof)
              )
            );
          }
        }

        setMathematicians(mathematiciansData);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMathematicians();
  }, [filters]);

  return { mathematicians, loading, error };
};
