import MultiSelectFilter from "./MultiSelectFilter";

interface WorkedInFilterProps {
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
}

const WorkedInFilter = ({ value, options, onChange }: WorkedInFilterProps) => {
  return (
    <MultiSelectFilter
      value={value}
      options={options}
      onChange={onChange}
      placeholder="Search workplaces..."
      type="worked-in"
      emptyMessage="No workplaces found"
      title="Worked In"
    />
  );
};

export default WorkedInFilter;
