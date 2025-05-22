import MultiSelectFilter from "./MultiSelectFilter";

interface InstitutionFilterProps {
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
}

const InstitutionFilter = ({
  value,
  options,
  onChange,
}: InstitutionFilterProps) => {
  return (
    <MultiSelectFilter
      value={value}
      options={options}
      onChange={onChange}
      placeholder="Search institutions..."
      type="institution"
      emptyMessage="No institutions found"
      title="Institutions"
    />
  );
};

export default InstitutionFilter;
