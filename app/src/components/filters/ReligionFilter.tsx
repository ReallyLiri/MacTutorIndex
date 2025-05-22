import MultiSelectFilter from "./MultiSelectFilter";

interface ReligionFilterProps {
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
}

const ReligionFilter = ({ value, options, onChange }: ReligionFilterProps) => {
  return (
    <MultiSelectFilter
      value={value}
      options={options}
      onChange={onChange}
      placeholder="Search religions..."
      type="religion"
      emptyMessage="No religions found"
      title="Religions"
    />
  );
};

export default ReligionFilter;
