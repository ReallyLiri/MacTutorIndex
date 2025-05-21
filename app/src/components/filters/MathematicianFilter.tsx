import MultiSelectFilter from "./MultiSelectFilter";

interface MathematicianFilterProps {
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
}

const MathematicianFilter = ({ value, options, onChange }: MathematicianFilterProps) => {
  return (
    <MultiSelectFilter
      value={value}
      options={options}
      onChange={onChange}
      placeholder="Search mathematicians..."
      type="mathematician"
      emptyMessage="No mathematicians found"
      title="Mathematicians"
    />
  );
};

export default MathematicianFilter;