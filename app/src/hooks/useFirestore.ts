import { useEffect, useState, useCallback } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Filters, Mathematician } from "../types";

const AVERAGE_LIFESPAN = 50;

const COLLECTION_NAME = "l2";

export const useFirestore = (filters: Filters | null) => {
  const [mathematicians, setMathematicians] = useState<Mathematician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getMathematicianById = useCallback(async (id: string) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching mathematician:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!filters) {
      return;
    }
    const fetchMathematicians = async () => {
      try {
        setLoading(true);
        const minYear = filters.yearRange[0];
        const maxYear = filters.yearRange[1];

        const mathematiciansRef = collection(db, COLLECTION_NAME);

        const birthInRangeQuery = query(
          mathematiciansRef,
          where("born.year", ">=", minYear),
          where("born.year", "<=", maxYear),
        );

        const birthInRangeSnapshot = await getDocs(birthInRangeQuery);
        const birthInRangeData = birthInRangeSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Mathematician,
        );

        let mathematiciansData = [...birthInRangeData];

        let additionalData: Mathematician[] = [];

        const estimatedBirthMinYear = minYear + AVERAGE_LIFESPAN;
        const estimatedBirthMaxYear = maxYear + AVERAGE_LIFESPAN;

        const deathYearQuery = query(
          mathematiciansRef,
          where("born.year", "==", null),
          where("died.year", ">=", estimatedBirthMinYear),
          where("died.year", "<=", estimatedBirthMaxYear),
        );

        const deathYearSnapshot = await getDocs(deathYearQuery);
        const deathYearData = deathYearSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }) as Mathematician)
          .filter((m) => {
            const deathYear = m.died?.year;
            if (deathYear !== null) {
              const estimatedBirthYear = deathYear - AVERAGE_LIFESPAN;
              return (
                estimatedBirthYear >= minYear && estimatedBirthYear <= maxYear
              );
            }
            return false;
          });

        additionalData = [...deathYearData];

        if (filters.includeUnknown) {
          const unknownQuery = query(
            mathematiciansRef,
            where("born.year", "==", null),
            where("died.year", "==", null),
          );

          const unknownSnapshot = await getDocs(unknownQuery);
          const unknownData = unknownSnapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as Mathematician,
          );

          additionalData = [...additionalData, ...unknownData];
        }

        mathematiciansData = [...mathematiciansData, ...additionalData];

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
                allLocations.some((loc) => {
                  const locParts = loc
                    .split(/,\s*/)
                    .map((part) =>
                      part.trim().replace(/[()]/g, "").toLowerCase(),
                    );
                  const locationParts = location
                    .split(/,\s*/)
                    .map((part) =>
                      part.trim().replace(/[()]/g, "").toLowerCase(),
                    );

                  return (
                    loc === location ||
                    locParts.some((locPart) =>
                      locationParts.includes(locPart),
                    ) ||
                    locationParts.some((locPart) => locParts.includes(locPart))
                  );
                }),
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
                filters.worked_in.includes(place),
              ),
            );
          }

          if (filters.profession.length > 0) {
            mathematiciansData = mathematiciansData.filter((mathematician) =>
              mathematician.profession?.some((prof) =>
                filters.profession.includes(prof),
              ),
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

  return { mathematicians, loading, error, getMathematicianById };
};
