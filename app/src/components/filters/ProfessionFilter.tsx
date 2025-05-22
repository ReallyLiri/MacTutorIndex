import MultiSelectFilter from "./MultiSelectFilter";

interface ProfessionFilterProps {
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
}

const ProfessionFilter = ({
  value,
  options,
  onChange,
}: ProfessionFilterProps) => {
  return (
    <MultiSelectFilter
      value={value}
      options={options}
      onChange={onChange}
      placeholder="Search professions..."
      type="profession"
      emptyMessage="No professions found"
      title="Profession"
    />
  );
};

export default ProfessionFilter;
