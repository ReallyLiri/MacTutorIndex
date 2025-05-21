import MultiSelectFilter from "./MultiSelectFilter";

interface LocationFilterProps {
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
}

const LocationFilter = ({ value, options, onChange }: LocationFilterProps) => {
  return (
    <MultiSelectFilter
      value={value}
      options={options}
      onChange={onChange}
      placeholder="Search locations..."
      type="location"
      emptyMessage="No locations found"
      title="Locations"
    />
  );
};

export default LocationFilter;