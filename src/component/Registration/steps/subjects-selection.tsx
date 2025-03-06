import React, { useState, useEffect } from "react";
import { FormControlLabel, Checkbox, Typography, FormGroup, Box } from "@mui/material";

const subjects: Record<string, string[]> = {
  Mathematics: ["Basic Mathematics", "Further Mathematics", "Statistics"],
  Sciences: ["Physics", "Chemistry", "Biology"],
  Languages: ["English Language", "Literature", "French"],
  Arts: ["Fine Arts", "Music", "Drama"],
  Technical: ["Computer Science", "Technical Drawing", "Wood Work"],
  Vocational: ["Home Economics", "Agriculture", "Commerce"],
};

type SubjectCategories = "mathematics" | "sciences" | "languages" | "arts" | "technical" | "vocational";

type SubjectsSelectionProps = {
  onDataChange?: (data: Record<SubjectCategories, string[]>) => void;
  initialData?: Record<SubjectCategories, string[]>;
};

export default function SubjectsSelection({ onDataChange, initialData }: SubjectsSelectionProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<Record<SubjectCategories, string[]>>({
    mathematics: initialData?.mathematics || [],
    sciences: initialData?.sciences || [],
    languages: initialData?.languages || [],
    arts: initialData?.arts || [],
    technical: initialData?.technical || [],
    vocational: initialData?.vocational || [],
  });

  useEffect(() => {
    if (onDataChange) {
      onDataChange(selectedSubjects);
    }
  }, [selectedSubjects, onDataChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    const category = name.toLowerCase() as SubjectCategories;

    setSelectedSubjects((prev) => ({
      ...prev,
      [category]: checked
        ? [...prev[category], value]
        : prev[category].filter((subject: string) => subject !== value),
    }));
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Subjects You Can Teach
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Select all subjects that you are qualified to teach
      </Typography>

      {Object.entries(subjects).map(([category, subjectList]) => {
        const categoryKey = category.toLowerCase() as SubjectCategories;
        return (
          <Box key={category} mb={2}>
            <Typography variant="h6">{category}</Typography>
            <FormGroup>
              {subjectList.map((subject) => (
                <FormControlLabel
                  key={subject}
                  control={
                    <Checkbox
                      name={categoryKey}
                      value={subject}
                      onChange={handleChange}
                      checked={selectedSubjects[categoryKey].includes(subject)}
                    />
                  }
                  label={subject}
                />
              ))}
            </FormGroup>
          </Box>
        );
      })}
    </Box>
  );
}
